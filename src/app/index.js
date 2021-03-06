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
            'vTabs',
            'ngFileSaver',
            'vcRecaptcha',
            'angular.chips',
            'webNotifications',
            'slideWrapper',
            'angular-intro',
            'angular-timeline',
            '720kb.socialshare',

            /* qaobee shared services */
            'qaobee.utils',
            'qaobee.commonsConfig',
            'qaobee.config',
            'qaobee.eventbus',
            'qaobee.httpModule',

            //* qaobee widget */
            'qaobee.widgets.collecte',
            'qaobee.filterCalendar',
            'qaobee.commonsDirectives',
            'qaobee.headerMenu',
            'qaobee.avatar',
            'qaobee.radar',
            'qaobee.stat.detail.modal',
            'eventCard',
            'qaobee.titlePageBar',
            'qaobee.widgets.agenda',
            'qaobee.widgets.efficiencyPlayer',
            'qaobee.widgets.efficiencyGoalkeeper',
            'qaobee.widgets.podium',
            'qaobee.widgets.notifications',
            'qaobee.widgets.goalHeatMap',
            'statsEfficiency',
            'ui.dashboard',
            'angularPayments',

            /* qaobee modules */
            'qaobee.cnil',
            'qaobee.cnil.module',
            'qaobee.public',
            'qaobee.home',
            'qaobee.effective',
            'qaobee.teams',
            'qaobee.players',
            'qaobee.agenda',
            'qaobee.eventStats',
            'qaobee.widget.statsSanction',
            'qaobee.widget.statsGoals',
            'qaobee.widget.statsPlayerUse',
            'qaobee.widget.timelineShoot',
            'qaobee.user.mainProfile',
            'qaobee.notifications',
            'qaobee.user.billing.pay',
            'qaobee.user.billing',
            'qaobee.user.sso',
            'qaobee.cms'
        ])


        .config(function ($translateProvider, $translatePartialLoaderProvider, $httpProvider, vcRecaptchaServiceProvider,
                          $logProvider, EnvironmentConfig, tmhDynamicLocaleProvider, ChartJsProvider, socialshareConfProvider) {
            tmhDynamicLocaleProvider.localeLocationPattern('../bower_components/angular-i18n/angular-locale_{{locale}}.js');
            $translateProvider.useLoader('$translatePartialLoader', {
                urlTemplate: 'app/components/i18n/{part}/{lang}.json'
            });
            $translateProvider.useLoaderCache(EnvironmentConfig.useLoaderCache);
            $translateProvider.useSanitizeValueStrategy('escapeParameters');
            $logProvider.debugEnabled(EnvironmentConfig.debugEnabled);
            $translateProvider.registerAvailableLanguageKeys(['fr', 'en'], {
                'fr_*': 'fr',
                'en_*': 'en',
                '*': 'en'
            });
            $translateProvider.determinePreferredLanguage().fallbackLanguage('en');
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
                maintainAspectRatio: false
            });

            socialshareConfProvider.configure([
                {
                    'provider': 'twitter',
                    'conf': {
                        'popupHeight': 480,
                        'popupWidth': 640
                    }
                },
                {
                    'provider': 'facebook',
                    'conf': {
                        'popupHeight': 480,
                        'popupWidth': 640
                    }
                }
            ]);
        })
        .run(function ($rootScope, $translate, $log, $locale, tmhDynamicLocale, $window, $location) {
            console.debug('run')
            $locale.id = $translate.proposedLanguage();
            tmhDynamicLocale.set($locale.id);
            moment.locale($locale.id);
            $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
                $translate.refresh();
                moment.locale($locale.id);
            });
            $rootScope.$on('$locationChangeSuccess', function () {
                /* MODE GRATUIT, A DECOMMENTER SI REACTIVATION PAYANT */
                //if ($rootScope.user && !$location.path().match(/\/private\/billing.*/) && !$location.path().match(/\/sso/)) {
                //    $log.debug('qswarmWeb index - run - $locationChangeSuccess', $rootScope.user.account.status);
                //    switch ($rootScope.user.account.status) {
                //        case 'NOT_PAID':
                //            $location.path('/private/billing');
                //            break;
                //        case 'TRIAL_ENDED':
                //            $location.path('/private/billing');
                //            break;
                //        default:
                //            break;
                //    }
                //}
                $window.ga('send', 'pageview', $location.path());
            });
            if (top.location.href !== self.location.href) {
                top.location.href = self.location.href;
            }
            $rootScope.isMobile = $window.outerWidth <= 600;
        })

        /**
         * @class qaobee.qswarmweb
         * @description Main controller
         */
        .controller('MainCtrl', function ($rootScope, $scope, $window, $translatePartialLoader, qeventbus, $timeout,
                                          EnvironmentConfig, $templateRequest, $sce, $compile) {
            $translatePartialLoader.addPart('public').addPart('feedback');
            $scope.loaded = false;
            $scope.feedbackOptions = {
                ajaxURL: EnvironmentConfig.apiEndPoint + '/api/1/commons/feedback/send',
                initButtonText: 'Feedback',
                postHTML: false,
                tpl: {
                    description: 'app/components/feedback/description.html',
                    highlighter: 'app/components/feedback/highlighter.html',
                    overview: 'app/components/feedback/overview.html',
                    submitSuccess: 'app/components/feedback/submitSuccess.html',
                    submitError: 'app/components/feedback/submitError.html'
                }
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