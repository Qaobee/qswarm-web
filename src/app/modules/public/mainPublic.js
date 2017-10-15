(function () {
    'use strict';
    /**
     * Module Gérant la partie publique du site
     *
     * @class qaobee.public.public
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.public', [
        /* angular module */
        'ngRoute',
        /* qaobee shared directives */
        'qaobee.headerMenu',
        'ezfb',
        'paramsRestAPI'
    ])

        .config(function ($routeProvider, ezfbProvider) {
            $routeProvider.when('/', {
                controller: 'PublicCtrl',
                templateUrl: 'app/modules/public/mainPublic.html'
            }).when('/!', {
                controller: 'PublicCtrl',
                templateUrl: 'app/modules/public/mainPublic.html'
            }).when('/legals', {
                controller: 'MentionslegalesCtrl',
                templateUrl: 'app/modules/public/legal.html'
            }).when('/pricing', {
                controller: 'PricingCtrl',
                templateUrl: 'app/modules/public/pricing.html'
            }).when('/about', {
                controller: 'AboutCtrl',
                templateUrl: 'app/modules/public/aboutUs.html'
            }).when('/contact', {
                controller: 'ContactCtrl',
                templateUrl: 'app/modules/public/contact.html'
            }).when('/news', {
                controller: 'NewsCtrl',
                templateUrl: 'app/modules/public/news.html'
            });
            ezfbProvider.setInitParams({
                appId: '239177912791979', version: 'v2.3'
            });
        })

        /**
         * @class qaobee.public.public.PublicCtrl
         * @description Contrôleur de la page d'accueil publique
         */
        .controller('PublicCtrl', function ($scope, $rootScope, $translatePartialLoader, $location, qeventbus,
                                            $window, $log, $timeout, anchorSmoothScroll) {
            $translatePartialLoader.addPart('public');
            $translatePartialLoader.addPart('commons');

            $scope.parts = ['01', '02', '04', '03', '05', '06', '07', '08'];
            $scope.toTop = false;
            // asu = Allow SignUp
            $rootScope.signupAvailable = true;
            delete $rootScope.user;

            $scope.gotoAnchor = function (x) {
                try {
                    $location.hash(x);
                    $scope.menuItem = x;
                    qeventbus.prepForBroadcast('menuItem', x);
                    anchorSmoothScroll.scrollTo(x, 60);
                } catch (e) {
                    $log.debug(e);
                }
            };

            /**
             *
             * @returns {boolean}
             */
            $scope.openSignup = function () {
                $location.path('/signup');
                return false;
            };

            $timeout(function () {
                angular.element($window).scroll(function () {
                    $scope.toTop = this.pageYOffset >= angular.element($window).height() / 2;
                });
            }, 1);
        })

        /**
         * @class qaobee.public.public.AboutCtrl
         * @description About page controller
         */
        .controller('AboutCtrl', function ($translatePartialLoader) {
            $translatePartialLoader.addPart('public');
        })
        /**
         * @class qaobee.public.public.NewsCtrl
         * @description News page controller
         */
        .controller('NewsCtrl', function ($translatePartialLoader) {
            $translatePartialLoader.addPart('public');
        })

        /**
         * @class qaobee.public.public.AboutCtrl
         * @description Contact page controller
         */
        .controller('ContactCtrl', function () {

        })

        /**
         * @class qaobee.public.public.PricingCtrl
         * @description Contrôleur de la page "nos tarifs"
         */
        .controller('PricingCtrl', function ($scope, qeventbus, $translatePartialLoader, paramsRestAPI, $log) {
            $translatePartialLoader.addPart('public');
            qeventbus.prepForBroadcast('menuItem', 'pricing');
            $scope.params = {
                FREEMIUM: {
                    color: 'default-primary-color',
                    icon: 'fa-user',
                    link: '/#/signupStartCoach'
                },
                TEAMS: {
                    color: 'dark-primary-color',
                    icon: 'fa-user-plus',
                    link: '/#/signupStartTeam/TEAMS'
                },
                TEAMM: {
                    color: 'secondary-color',
                    icon: 'fa-user-times',
                    link: '/#/signupStartTeam/TEAMM'
                },
                TEAMXL: {
                    color: 'accent-color',
                    icon: 'fa-users',
                    link: '/#/signupStartTeam/TEAMXL'
                }

            };

            $scope.getPlanView = function (p) {
                if ($scope.params.hasOwnProperty(p)) {
                    return $scope.params[p];
                } else {
                    return {
                        color: '',
                        icon: '',
                        link: ''
                    };
                }
            };
            paramsRestAPI.getParams().success(function (data) {
                $log.debug('[PricingCtrl] - retrieve params', data);
                $scope.plans = data.plan;
            }).error(function (err) {
                $log.error('[PricingCtrl] - retrieve params : ', err);
            });

        })

        /**
         * @class qaobee.public.public.MentionslegalesCtrl
         * @description Contrôleur de la page "mentions légales"
         */
        .controller('MentionslegalesCtrl', function (qeventbus) {
            qeventbus.prepForBroadcast('menuItem', 'legal');
        });
}());