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
            'ngAnimate',
            'pascalprecht.translate',
            'tmh.dynamicLocale',
            'angularFileUpload',
            'ui.mask',
            'selectionModel',
            'ui.materialize',
            'ng.deviceDetector',
            'angular-send-feedback',
            'angular-google-analytics',
            'vTabs',
            'ngFileSaver',
            'vcRecaptcha',
            'angular.chips',
            
            //* qaobee widget */
            'qaobee.filterCalendar',
            'qaobee.commonsDirectives',
            'qaobee.headerMenu',
            'qaobee.avatar',
            'qaobee.radar',
            'qaobee.stat.detail.modal',
            'eventCard',
            'qaobee.titlePageBar',

            /* qaobee shared services */
            'qaobee.utils',
            'qaobee.commonsConfig',
            'qaobee.config',
            'qaobee.eventbus',
            'qaobee.httpModule',
            'qaobee.widgets.dashboard.home',
            'qaobee.widgets.dashboard.mainPlayer',
            'qaobee.widgets.dashboard.mainTeam',
            'qaobee.widgets.dashboard.statsPlayer',
            'qaobee.downloadService',
            'ui.dashboard',
            /* qaobee modules */
            'qaobee.cnil',
            'qaobee.cnil.module',
            'qaobee.public',
            'qaobee.home',
            'qaobee.effective',
            'qaobee.teams',
            'qaobee.players',
            'qaobee.agenda',
            'qaobee.stats',
            'qaobee.user.mainProfile',
            'qaobee.notifications'
        ])

        .config(function ($translateProvider, $translatePartialLoaderProvider, $httpProvider, vcRecaptchaServiceProvider,
                          $logProvider, EnvironmentConfig, tmhDynamicLocaleProvider, AnalyticsProvider, ChartJsProvider) {
            AnalyticsProvider
                .setAccount(EnvironmentConfig.uaid)
                .useDisplayFeatures(true)
                .trackUrlParams(true)
                .useEnhancedLinkAttribution(true)
            ;
            if ('development' === EnvironmentConfig.name) {
                tmhDynamicLocaleProvider.localeLocationPattern('../bower_components/angular-i18n/angular-locale_{{locale}}.js');
            } else {
                tmhDynamicLocaleProvider.localeLocationPattern('i18n/angular-locale_{{locale}}.js');
            }
            $translateProvider.useLoader('$translatePartialLoader', {
                urlTemplate: 'app/components/i18n/{part}/{lang}.json'
            });
            $translateProvider.useLoaderCache(EnvironmentConfig.useLoaderCache);
            $translateProvider.useSanitizeValueStrategy('escapeParameters');
            $logProvider.debugEnabled(EnvironmentConfig.debugEnabled);
            $translateProvider.registerAvailableLanguageKeys(['fr', 'en', 'de'], {
                'fr_FR': 'fr',
                'en_US': 'en',
                'en_UK': 'en',
                'de_DE': 'de',
                'de_CH': 'de'
            });
            $translateProvider.determinePreferredLanguage();
            vcRecaptchaServiceProvider.setSiteKey(EnvironmentConfig.captchaKey);
            vcRecaptchaServiceProvider.setTheme('light');
            vcRecaptchaServiceProvider.setType('image');
            $httpProvider.defaults.useXDomain = true;
            delete $httpProvider.defaults.headers.common['X-Requested-With'];
            $httpProvider.interceptors.push('httpInterceptor');
            toastr.options = {
                closeButton: true,
                debug: false,
                newestOnTop: false,
                progressBar: false,
                positionClass: 'toast-top-left',
                preventDuplicates: false,
                onclick: null,
                showDuration: 300,
                hideDuration: 1000,
                timeOut: 5000,
                extendedTimeOut: 1000,
                showEasing: 'linear',
                hideEasing: 'linear',
                showMethod: 'fadeIn',
                hideMethod: 'fadeOut'
            };
            Chart.defaults.global.responsive = true;
            ChartJsProvider.setOptions({
                responsive: true,
                maintainAspectRatio: false,
                colours: ['#03a9f4', '#0f9d58', '#ff5722', '#803690', '#FDB45C', '#949FB1', '#4D5360']
            });
        })
        .run(function ($rootScope, $translate, $log, $locale, tmhDynamicLocale) {
            $locale.id = $translate.proposedLanguage();
            tmhDynamicLocale.set($locale.id);
            $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
                $translate.refresh();
            });
            if (top.location.href !== self.location.href) {
                top.location.href = self.location.href;
            }
        })

        /**
         * @class qaobee.qswarmweb
         * @description Contrôleur principal
         */
        .controller('MainCtrl', function ($rootScope, $scope, $window, $translatePartialLoader, qeventbus, $timeout,
                                          EnvironmentConfig, $templateRequest, $sce, $compile) {
            $translatePartialLoader.addPart('public');
            $translatePartialLoader.addPart('feedback');
            moment.locale($window.navigator.language);
            $scope.loaded = false;
            $scope.feedbackOptions = {
                ajaxURL: EnvironmentConfig.apiEndPoint + '/api/1/commons/feedback/send',
                initButtonText: 'Feedback',
                postHTML: false,
                tpl: {}
            };
            ['description', 'highlighter', 'overview', 'submitSuccess', 'submitError'].forEach(function (i) {
                $templateRequest($sce.getTrustedResourceUrl('app/components/feedback/' + i + '.html')).then(function (tpl) {
                    var res = $compile(tpl)($scope)[0];
                    $timeout(function () {
                        $scope.feedbackOptions.tpl[i] = res.outerHTML;
                    });
                });
            });
            $scope.meta = {};
            $scope.$on('qeventbus:logoff', function () {
                delete $scope.user;
                delete $rootScope.user;
                delete $rootScope.meta;
                delete $window.sessionStorage.qaobeesession;
            });
            $scope.$on('qeventbus:bg-color', function () {
                $scope.bgColor = qeventbus.data;
            });
            $scope.$on('qeventbus:login', function () {
                $scope.user = qeventbus.data;
                $scope.meta.user = $scope.user;
            });
            $scope.loaded = true;
        });
}());