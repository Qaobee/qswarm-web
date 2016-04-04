(function () {
    'use strict';
    /**
     * Module gérant les appels synchrones
     *
     * @class qaobee.components.services.httpModule
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     * @requires {@link https://github.com/chieffancypants/angular-loading-bar|chieffancypants.loadingBar}
     * @requires {@link https://docs.angularjs.org/api/ngAnimate|ngAnimate}
     */
    angular.module(
        'qaobee.httpModule', [

            /* qaobee services */
            'qaobee.eventbus',

            /* angular module */
            'chieffancypants.loadingBar',
            'ngAnimate'
        ])
        .config(function (cfpLoadingBarProvider) {
            cfpLoadingBarProvider.includeSpinner = true;
        })

        .factory('httpInterceptor', function ($q, $rootScope, qeventbus, $window, EnvironmentConfig, $log) {
            return {
                // Everytime a request starts
                request: function (config) {
                    if (config.url.startsWith('/api')) {
                        config.headers.token = $window.sessionStorage.qaobeesession;
                        config.headers['Content-Type'] = 'application/json';
                        if (!config.headers['Accept']) {
                            config.responseType = 'json';
                        }
                    //    $log.debug(config);
                    }
                    if (!config.url.startsWith('app')
                        && !config.url.startsWith('http')
                        && !config.url.startsWith('isteven-multi-select')
                        && !config.url.startsWith('ng-table')) {
                        if (config.url.startsWith('/')) {
                            config.url = EnvironmentConfig.apiEndPoint + config.url;
                        } else {
                            config.url = EnvironmentConfig.apiEndPoint + '/' + config.url;
                        }
                    }
                    return config || $q.when(config);
                },
                // When a request ends
                response: function (response) {
                 //   $log.debug(response);
                    return response || $q.when(response);
                },
                // When a request fails
                responseError: function (response) {
                    $log.error(response);
                    if (!!response.data) {
                        if (!!response.data.message && ['CAPTCHA_EXCEPTION', 'NON_ACTIVE'].findIndex(response.data.code) > 1) {
                            toastr.error(response.data.message);
                        }
                        if ('NOT_LOGGED' === response.data.code) {
                            // TODO avoir un liste de messages sans doublons avec toastr
                            if ($rootScope.notLogged === false) {
                                toastr.error(response.data.message);
                                $rootScope.notLogged = true;
                            }
                            qeventbus.prepForBroadcast('logoff', '');
                        }
                    }
                    return $q.reject(response);
                }
            };
        })
//
    ;
}());