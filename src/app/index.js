(function () {
    'use strict';
    /**
     * Module Principal
     *
     * @class qaobee.QaobeeSwarnApp
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     *
     */
    angular.module(
        'qswarmWeb',
        ['ngRoute', 'commonsDirectives', 'qaobee.config', 'prive', 'public', 'headerMenu', 'eventbus', 'playerList',
            'ngSanitize', 'ngCookies', 'pascalprecht.translate', 'reCAPTCHA', 'ngAudio', 'httpModule', 'tmh.dynamicLocale'])

        .config(function ($translateProvider, $translatePartialLoaderProvider, reCAPTCHAProvider, $httpProvider, $logProvider, EnvironmentConfig, tmhDynamicLocaleProvider) {
            tmhDynamicLocaleProvider.localeLocationPattern('js/libs/angular-i18n/angular-locale_{{locale}}.js');
            $translateProvider.useLoader('$translatePartialLoader', {
                urlTemplate: 'app/i18n/{part}/{lang}.json'
            });
            $translateProvider.useLoaderCache(EnvironmentConfig.useLoaderCache);
            $logProvider.debugEnabled(EnvironmentConfig.debugEnabled);
            $translateProvider.registerAvailableLanguageKeys(['fr', 'en', 'de'], {
                'fr_FR': 'fr',
                'en_US': 'en',
                'en_UK': 'en',
                'de_DE': 'de',
                'de_CH': 'de'
            });
            $translateProvider.determinePreferredLanguage();
            reCAPTCHAProvider.setPublicKey('6LdoTvMSAAAAAP4NTyay0WljN19Aq4Cl5pZELvIe');
            reCAPTCHAProvider.setOptions({
                theme: 'clean'
            });
            $httpProvider.defaults.useXDomain = true;
            delete $httpProvider.defaults.headers.common['X-Requested-With'];
            $httpProvider.interceptors.push('httpInterceptor');
            toastr.options = {
                closeButton: true,
                debug: false,
                newestOnTop: true,
                progressBar: true,
                positionClass: 'toast-top-right',
                preventDuplicates: false,
                onclick: null,
                showDuration: 300,
                hideDuration: 1000,
                timeOut: 5000,
                extendedTimeOut: 1000,
                showEasing: 'swing',
                hideEasing: 'linear',
                showMethod: 'fadeIn',
                hideMethod: 'fadeOut'
            };

        })
        .run(function ($rootScope, $translate, $log, $locale, tmhDynamicLocale) {
            $locale.id = $translate.proposedLanguage();
            tmhDynamicLocale.set($locale.id);
            $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
                $translate.refresh();
            });
        })

    /**
     * @class qaobee.QaobeeSwarnApp.MainCtrl
     * @description Contrôleur principal
     */
        .controller('MainCtrl', function ($rootScope, $scope, $translatePartialLoader, eventbus) {
            $translatePartialLoader.addPart('legacy');
            $scope.$on('eventbus', function () {
                if ('logoff' === eventbus.message) {
                    delete  $scope.user;
                }  if ('bg-color' === eventbus.message) {
                    $scope.bgColor = eventbus.data;
                } else if ('login' === eventbus.message) {
                    $scope.user = eventbus.data;
                }
            });
        });
}());