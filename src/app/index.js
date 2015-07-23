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
        'qswarmWeb', [
            /* angular module */
            'ngRoute', 
            'ngSanitize', 
            'ngCookies', 
            'ngAudio',
            'pascalprecht.translate', 
            'reCAPTCHA',  
            'tmh.dynamicLocale',
            
            /* qaobee shared directives */
            'qaobee.commonsDirectives',
            'qaobee.headerMenu',
            
            /* qaobee shared services */
            'qaobee.commonsConfig',
            'qaobee.config', 
            'qaobee.eventbus',
            'qaobee.httpModule',
            
            /* qaobee modules */ 
            'qaobee.public',
            'qaobee.home'
        ])

        .config(function ($translateProvider, $translatePartialLoaderProvider, reCAPTCHAProvider, $httpProvider, $logProvider, EnvironmentConfig, tmhDynamicLocaleProvider) {
            tmhDynamicLocaleProvider.localeLocationPattern('js/libs/angular-i18n/angular-locale_{{locale}}.js');
            $translateProvider.useLoader('$translatePartialLoader', {
                urlTemplate: 'app/components/i18n/{part}/{lang}.json'
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
     * @class qaobee.qswarmweb
     * @description Contrôleur principal
     */
        .controller('MainCtrl', function ($rootScope, $scope, $translatePartialLoader, qeventbus) {
            $translatePartialLoader.addPart('legacy');
            $translatePartialLoader.addPart('landing');
            $scope.$on('qeventbus', function () {
                if ('logoff' === qeventbus.message) {
                    delete  $scope.user;
                }  if ('bg-color' === qeventbus.message) {
                    $scope.bgColor = qeventbus.data;
                } else if ('login' === qeventbus.message) {
                    $scope.user = qeventbus.data;
                }
            });
        });
}());