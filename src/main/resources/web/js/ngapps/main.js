/**
 * Module Principal
 *
 * @class qaobee.QaobeeSwarnApp
 * @author Xavier MARIN
 * @copyright <b>QaoBee</b>.
 *
 */
try { angular.module("templates-main"); } catch(err) { /* failed to require */
angular.module('templates-main', []);}
angular.module(
    'QaobeeSwarnApp',
    ['ngRoute', 'commonsDirectives', 'config', 'public', 'headerMenu', 'eventbus', 'ngSanitize', 'ngCookies', 'pascalprecht.translate', 'reCAPTCHA', 'ngAudio', 'templates-main', 'httpModule',
     'tmh.dynamicLocale'])

    .config(function ($translateProvider, $translatePartialLoaderProvider, reCAPTCHAProvider, $httpProvider, $logProvider, ENV, tmhDynamicLocaleProvider) {
        'use strict';
        tmhDynamicLocaleProvider.localeLocationPattern('js/libs/angular-i18n/angular-locale_{{locale}}.js');
        $translateProvider.useLoader('$translatePartialLoader', {
            urlTemplate: 'js/i18n/{part}/{lang}.json'
        });
        $translateProvider.useLoaderCache(ENV.useLoaderCache);
        $logProvider.debugEnabled(ENV.debugEnabled);
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



    })
    .run(function ($rootScope, $translate, $log, $locale, tmhDynamicLocale) {
        'use strict';
        $locale.id = $translate.proposedLanguage();
        tmhDynamicLocale.set($locale.id);
        $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
            $translate.refresh();
        });
        $rootScope.$on('$viewContentLoaded', function () {
            $('.button-collapse').sideNav();
            $('.parallax').parallax();
        //    $.material.init();
        //    $("select").dropdown();
        });
    })

/**
 * @class qaobee.QaobeeSwarnApp.MainCtrl
 * @description Contrôleur principal
 */
    .controller('MainCtrl', function ($scope, $translatePartialLoader, eventbus) {
        'use strict';
        $translatePartialLoader.addPart('legacy');
        
        $scope.$on('eventbus', function () {
            if ("logoff" === eventbus.message) {
                delete  $scope.user;
            } else if ("login" === eventbus.message) {
                $scope.user = eventbus.data;
            }
        });

    });
