(function () {
    'use strict';

    angular.module(
        'qaobee.commonsConfig', [
            /* qaobee services */
            'qaobee.eventbus',
            /* qaobee Rest API */
            'userRestAPI'])

        .provider('metaDatas', function () {
            this.$get = function () {
                return this;
            };
            /**
             *
             * @param data
             * @returns {*}
             */
            function loadAdmin(data) {
                data.isAdmin = false;
                if (angular.isDefined(data.account) && data.account.habilitations !== null) {
                    data.account.habilitations.forEach(function (a) {
                        if (a.key === 'admin_qaobee') {
                            data.isAdmin = true;
                        }
                    });
                }
                return data;
            }

            /**
             *
             * @param $rootScope
             * @param userRestAPI
             * @param qeventbus
             * @param $location
             * @param $q
             * @param $window
             * @returns {*}
             */
            this.checkUser = function ($rootScope, userRestAPI, qeventbus, $location, $q, $window) {
                var deferred = $q.defer();
                if (angular.isDefined($rootScope.user)) {
                    deferred.resolve($rootScope.user);
                } else {

                    var token = $window.sessionStorage.qaobeesession;

                    if (token !== null && angular.isDefined(token)) {
                        userRestAPI.getCurrentUser().success(function (data) {
                            $rootScope.user = loadAdmin(data);
                            qeventbus.prepForBroadcast('login', $rootScope.user);
                            deferred.resolve($rootScope.user);
                        });
                    } else {
                        $location.path('/');
                    }
                }
                return deferred.promise;
            };

            /**
             *
             * @param $rootScope
             * @param userRestAPI
             * @param $location
             * @param $q
             * @param $window
             * @returns {*}
             */
            this.getMeta = function ($rootScope, userRestAPI, $location, $q, $window) {
                var deferred = $q.defer();
                if (angular.isDefined($rootScope.meta)) {
                    deferred.resolve($rootScope.meta);
                } else {

                    var token = $window.sessionStorage.qaobeesession;

                    if (token !== null && angular.isDefined(token)) {
                        userRestAPI.getMetas().success(function (data) {
                            if (angular.isDefined(data) && data !== null) {
                                deferred.resolve(data);
                            }
                        });
                    } else {
                        $location.path('/');
                    }
                }
                return deferred.promise;
            };
        });
}());