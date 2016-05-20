(function () {
    'use strict';
    angular.module('qaobee.notifications', [])

        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/notifications/:id', {
                controller: 'NotificationControler',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/home/notifications/notifications.html'

            }).when('/notifications/', {
                controller: 'NotificationControler',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/home/notifications/notifications.html'

            });
        })
        /**
         * @class qaobee.modules.home.notifications.NotificationControler
         */
        .controller('NotificationControler', function ($log, $scope, $translatePartialLoader, $routeParams, EnvironmentConfig, notificationsRestAPI, qeventbus) {
            $translatePartialLoader.addPart('home');
            $scope.notifications = [];
            $scope.id = $routeParams.id;
            /**
             *
             */
            $scope.getNotifications = function () {
                notificationsRestAPI.getUserNotifications().then(function (data) {
                    if(!!data.data && !data.data.error) {
                        $scope.notifications = data.data;
                        $scope.notifications.forEach(function (n) {
                            n.exerp = n.content.stripTags();
                            if (!!$scope.id && n._id === $scope.id) {
                                $scope.notif = n;
                            }
                        });
                    }
                });
            };
            /**
             *
             * @param id
             */
            $scope.show = function (id) {
                $scope.id = id;
                $scope.notifications.forEach(function (n) {
                    if (!!$scope.id && n._id === $scope.id) {
                        $scope.notif = n;
                    }
                });
            };

            /**
             *
             */
            $scope.close = function () {
                delete $scope.id;
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
            $scope.getNotifications();

        });
}());