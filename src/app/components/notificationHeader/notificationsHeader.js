(function () {
    'use strict';
    /**
     * Directive notifications pour la navbar<br />
     *
     * Usage :
     *
     * <pre>
     * &lt;header-notifications /&gt;
     * @author Xavier MARIN
     * @class qaobee.directives.notifications
     * @requires {@link qaobee.rest.prive.notificationsRestAPI|qaobee.rest.prive.notificationsRestAPI}
     * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
     *
     */
    angular.module('header.notifications', ['notificationsRestAPI', 'eventbus'])

        .directive('headerNotifications', function ($modal, $rootScope, $interval, ngAudio, notificationsRestAPI, eventbus, $timeout, $window, $filter, $log) {
            return {
                restrict: 'AE',
                controller: function ($scope) {
                    $scope.notifications = [];
                    $scope.unreadNum = 0;

                    /**
                     * @name $scope.getNotifications
                     * @function
                     * @memberOf qaobee.directives.notifications.headerNotifications
                     * @description Récupère les notifications d'un user
                     */
                    $scope.getNotifications = function () {
                        if (angular.isDefined($rootScope.user) && $window.sessionStorage.qaobeesession !== null && angular.isDefined($window.sessionStorage.qaobeesession)) {
                            var timeoutObj;
                            notificationsRestAPI.getuserNotifications(5).success(function (data) {
                                if (angular.isUndefined(data) || data === null) {
                                    return;
                                }
                                var newCount = data.count(function (n) {
                                    return n.read === false;
                                });

                                if (newCount > $scope.unreadNum) {
                                    ngAudio.play('audio/notification.mp3');
                                    var elem = $('[header-notifications]');
                                    elem.popover({
                                        html: true,
                                        content: $filter('translate')('content.notification.new : ' + newCount),
                                        placement: 'bottom',
                                        animation: true,
                                        trigger: 'manual',
                                        template: '<div class="popover" onmouseover="clearTimeout(timeoutObj);$(this).mouseleave(function() {$(this).hide();});"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class="popover-content" style="text-align: center;"><p></p></div></div></div>'
                                    })
                                        .mouseleave(function (e) {
                                            $log.error(e);
                                            var ref = $(this);
                                            timeoutObj = setTimeout(function () {
                                                ref.popover('hide');
                                            }, 50);
                                        });
                                    elem.popover('show');
                                    $timeout(function () {
                                        elem.popover('hide');
                                    }, 2000);
                                }
                                $scope.unreadNum = newCount;
                                $scope.notifications = data;
                            });
                        }
                    };

                    $scope.$on('eventbus', function () {
                        if ('login' === eventbus.message) {
                            $scope.getNotifications();
                        } else if ('refreshNotifications' === eventbus.message) {
                            $scope.getNotifications();
                        }
                    });

                    var stopNotificationPooler = $interval(function () {
                        $scope.getNotifications();
                    }, 60000);
                    $scope.$on('$destroy', function () {
                        $interval.cancel(stopNotificationPooler);
                        delete $scope.notifications;
                        delete $scope.unreadNum;
                    });

                    /**
                     * @class qaobee.directives.notifications.headerNotifications.ModalInstanceNotifCtrl
                     * @description notifications popup controller
                     * @param {Object} $scope scope
                     * @param {Object} $modalInstance $modalInstance
                     * @param {Object} notifications notifications
                     * @param {String} id id
                     * @param {Object} $filter $filter
                     */
                    var ModalInstanceNotifCtrl = function ($scope, $modalInstance, notifications, id, $filter) {
                        /**
                         * @name $scope.cancel
                         * @function
                         * @memberOf qaobee.directives.notifications.headerNotifications.ModalInstanceNotifCtrl
                         * @description Close popup
                         */
                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };

                        $scope.n = notifications.find(function (n) {
                            return n._id === id;
                        });
                        /**
                         * @name $scope.markRead
                         * @function
                         * @param {String} id notification id
                         * @memberOf qaobee.directives.notifications.headerNotifications.ModalInstanceNotifCtrl
                         * @description Mark notification as read
                         */
                        $scope.markRead = function (id) {
                            notificationsRestAPI.markAsRead(id).success(function () {
                                $scope.n.read = !$scope.n.read;
                                $scope.cancel();
                                eventbus.prepForBroadcast('refreshNotifications', '');
                            });
                        };
                        /**
                         * @name $scope.del
                         * @function
                         * @param {String} id notification id
                         * @memberOf qaobee.directives.notifications.headerNotifications.ModalInstanceNotifCtrl
                         * @description Delete notification
                         */
                        $scope.del = function (id) {
                            modalConfirm($filter('translate')('popup.title.delete.notification'), $filter('translate')('popup.message.delete') + '.<br />' + $filter('translate')('popup.confirm.ask'), function () {
                                notificationsRestAPI.del(id).success(function (data) {
                                    notifications.remove($scope.n);
                                    eventbus.prepForBroadcast('refreshNotifications', data);
                                    $scope.cancel();
                                    toastr.success($scope.n.title + $filter('translate')('popup.success.delete'));
                                });
                            });
                        };

                        /**
                         * @name $scope.openNotifModal
                         * @function
                         * @memberOf qaobee.directives.notifications.headerNotifications
                         * @param {String} size Modal size
                         * @param {String} id notification id
                         * @description Open notification modal
                         */
                        $scope.openNotifModal = function (size, id) {
                            $modal.open({
                                templateUrl: 'templates/directives/notificationDetail.html',
                                controller: ModalInstanceNotifCtrl,
                                size: size,
                                resolve: {
                                    notifications: function () {
                                        return $scope.notifications;
                                    },
                                    id: function () {
                                        return id;
                                    }
                                }
                            });
                        };
                    };
                },
                templateUrl: 'components/notificationHeader/headerNotifications.html'
            };
        });
}());