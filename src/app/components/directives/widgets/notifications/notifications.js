(function () {
    'use strict';
    /**
     * Created by xavier on 09/07/14.
     */
    angular.module('qaobee.widgets.notifications', [])

        .directive('widgetNotifications', function (qeventbus, $translatePartialLoader, EnvironmentConfig, notificationsRestAPI, $log) {
            return {
                restrict: 'AE',
                scope: {
                    user: '=',
                    meta: '='
                },
                controller: function ($scope) {
                    $translatePartialLoader.addPart('home');
                    $scope.notifications = [];
                    /**
                     *
                     */
                    $scope.getNotifications = function () {
                        notificationsRestAPI.getUserNotifications().then(function (data) {
                            if(!!data.data && !data.data.error) {
                                $scope.notifications = data.data;
                                $scope.notifications.forEach(function (n) {
                                    n.content = n.content.stripTags().truncate(30);
                                });
                            }
                        });
                    };

                    /**
                     *
                     * @param id
                     * @returns {boolean}
                     */
                    $scope.markAsRead = function (id) {
                        notificationsRestAPI.markAsRead(id).then(function (data) {
                            if (data.data.status) {
                                $scope.getNotifications();
                            }
                        });
                        return false;
                    };

                    /**
                     *
                     * @param id
                     * @returns {boolean}
                     */
                    $scope.deleteNotification = function (id) {
                        notificationsRestAPI.del(id).then(function (data) {
                            if (data.data.status) {
                                $scope.getNotifications();
                            }
                        });
                        return false;
                    };
                    /**
                     *
                     * @param avatar
                     * @returns {string}
                     */
                    $scope.getAvatar = function (avatar) {
                        return (avatar) ? EnvironmentConfig.apiEndPoint + '/file/' + $scope.collection + '/' + avatar : 'assets/images/user.png';
                    };
                    $scope.$on('qeventbus', function () {
                        if ('notifications' === qeventbus.message) {
                            $scope.getNotifications();
                        }
                    });
                },
                link: function ($scope) {

                    $scope.getNotifications();
                },
                templateUrl: 'app/components/directives/widgets/notifications/notifications.html'
            };
        });
})();