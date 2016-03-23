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

                    $scope.$on('qeventbus', function () {
                        if ('notifications' === qeventbus.message) {
                            getNotifications();
                        }
                    });
                    /**
                     *
                     */
                    function getNotifications() {
                        notificationsRestAPI.getUserNotifications().then(function (data) {
                            $scope.notifications = data.data;
                            $log.debug($scope.notifications);
                        });
                    }

                    /**
                     *
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
                     *
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
                    $scope.getAvatar = function (avatar) {
                        return (avatar) ? EnvironmentConfig.apiEndPoint + '/file/' + $scope.collection + '/' + avatar : 'assets/images/user.png';
                    };
                    getNotifications();
                },
                templateUrl: 'app/components/directives/widgets/notifications/notifications.html'
            };
        });
})();