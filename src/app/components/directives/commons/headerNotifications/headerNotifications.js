(function () {
    'use strict';
    angular.module(
        'qaobee.headerNotifications', [
            'qaobee.eventbus',
            'notificationsRestAPI'
        ])
        .directive('headerNotifications', function (qeventbus, $rootScope, $sce, notificationsRestAPI,
                                                    EnvironmentConfig, webNotifications) {
            return {
                restrict: 'AE',
                scope: {
                    user: '=?'
                },
                controller: function ($scope) {
                    $scope.notifications = [];
                    $scope.hasnotif = false;
                    $scope.notifDisplayed = [];
                    $scope.notificationOptions = {
                        icon: "/assets/images/qaobee-logoRouge.png",
                        timeout: 5000
                    };

                    $scope.$watch('user', function (newUser, oldUser) {
                        if (oldUser || !angular.equals(newUser, oldUser)) {
                            getNotifications();
                            var eb = new vertx.EventBus(EnvironmentConfig.apiEndPoint + '/eventbus');
                            eb.onopen = function () {
                                eb.registerHandler('qaobee.notification.' + $scope.user, function (message) {
                                    if (!!message.title) {
                                        toastr.info(message.content.stripTags().truncate(30), message.title);
                                    }
                                    qeventbus.prepForBroadcast('notifications', message);
                                    getNotifications();
                                });
                                eb.registerHandler('qaobee.notification.' + $rootScope.meta.sandbox._id, function (message) {
                                    if (!!message.title) {
                                        toastr.info(message.content.stripTags().truncate(30), message.title);
                                    }
                                    qeventbus.prepForBroadcast('notifications', message);
                                    getNotifications();
                                });
                            };
                            eb.onclose = function () {
                                eb = null;
                            };
                        }
                    });

                    /**
                     * Render html
                     * @param html_code
                     * @returns {*}
                     */
                    function renderHTML(html_code) {
                        var decoded = angular.element('<textarea />').html(html_code).text();
                        return $sce.trustAsHtml(decoded);
                    }

                    /**
                     * Fetch notifications
                     */
                    function getNotifications() {
                        if (!$scope.user) {
                            return;
                        }
                        notificationsRestAPI.getUserNotifications().then(function (data) {
                            if (!!data.data && !data.data.error) {
                                $scope.notifications = data.data.filter(function (n) {
                                    return !n.read;
                                });
                                $scope.notifications.forEach(function (n) {
                                    n.content = n.content.stripTags().truncate(30);
                                    if ($scope.notifDisplayed.findIndex(n._id) === -1) {
                                        $scope.notifDisplayed.push(n._id);
                                        $scope.notificationOptions.body = renderHTML(n.content);
                                        webNotifications.create(renderHTML(n.title), $scope.notificationOptions);
                                    }
                                });
                                $scope.hasnotif = ($scope.notifications.length > 0);
                            }
                        });
                    }

                    /**
                     * Mark notification as read
                     * @param id
                     * @returns {boolean}
                     */
                    $scope.markAsRead = function (id) {
                        notificationsRestAPI.markAsRead(id).then(function (data) {
                            if (data.data.status) {
                                getNotifications();
                            }
                        });
                        return false;
                    };

                    /**
                     * Delete notification
                     * @param id
                     * @returns {boolean}
                     */
                    $scope.deleteNotification = function (id) {
                        notificationsRestAPI.del(id).then(function (data) {
                            if (data.data.status) {
                                getNotifications();
                            }
                        });
                        return false;
                    };

                    /**
                     * Return avatar url
                     * @param avatar
                     * @returns {string}
                     */
                    $scope.getAvatar = function (avatar) {
                        return (avatar) ? EnvironmentConfig.apiEndPoint + '/file/SB_Person/' + avatar : 'assets/images/user.png';
                    };

                    $scope.$on('qeventbus:notifications', function () {
                        getNotifications();
                    });
                },
                templateUrl: 'app/components/directives/commons/headerNotifications/headerNotifications.html'
            };
        });
})();