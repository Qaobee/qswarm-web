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
            'angularFileUpload',
            'ui.mask',
            'selectionModel',
            'ui.materialize',
            'ng.deviceDetector',
            
            //* qaobee widget */
            'qaobee.filterCalendar',
            'qaobee.commonsDirectives',
            'qaobee.headerMenu',
            'qaobee.avatar',
            'eventCard',
            
            /* qaobee shared services */
            'qaobee.commonsConfig',
            'qaobee.config', 
            'qaobee.eventbus',
            'qaobee.httpModule',
            
            /* qaobee modules */ 
            'qaobee.public',
            'qaobee.home',
            'qaobee.effective',
            'qaobee.agenda',
            'qaobee.stats',
            'qaobee.user'
            
            /* A SUPPRIMER */
            ,'qaobee.test'
        ])

        .config(function ($translateProvider, $translatePartialLoaderProvider, reCAPTCHAProvider, $httpProvider, $logProvider, EnvironmentConfig, tmhDynamicLocaleProvider) {
            tmhDynamicLocaleProvider.localeLocationPattern('i18n/angular-locale_{{locale}}.js');
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
                theme: 'custom',
                custom_theme_widget: 'custom_recaptcha_widget'
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
        .controller('MainCtrl', function ($rootScope, $scope, $window, $translatePartialLoader, qeventbus) {
            /* i18n pour les formats de date, voir changement de la locale dans index.html */
            moment.locale($window.navigator.language);
            
            $translatePartialLoader.addPart('public');
            
            $scope.$on('qeventbus', function () {
                if ('logoff' === qeventbus.message) {
                    delete  $scope.user;
                    delete $rootScope.user;
                    delete $rootScope.meta;
                    delete $window.sessionStorage.qaobeesession;
                }  if ('bg-color' === qeventbus.message) {
                    $scope.bgColor = qeventbus.data;
                } else if ('login' === qeventbus.message) {
                    $scope.user = qeventbus.data;
                }
            });
        });
}());