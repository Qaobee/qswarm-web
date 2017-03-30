(function () {
    'use strict';
    /**
     * Module Gérant la partie publique du site
     *
     * @class qaobee.public.public
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     * @requires {@link https://docs.angularjs.org/api/ngRoute|ngRoute}
     * @requires {@link qaobee.public.publicSignup|qaobee.public.publicSignup}
     * @requires {@link qaobee.rest.public.publicRestAPI|qaobee.rest.public.publicRestAPI}
     */
    angular.module('qaobee.public', [
        /* angular module */
        'ngRoute',
        /* qaobee shared directives */
        'qaobee.headerMenu',
        /* qaobee Rest API */
        'publicRestAPI'
    ])

        .config(function ($routeProvider) {
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

            $scope.parts = ['01', '02', '04', '03', '05', '06', '07','08'];
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
                $location.path('/signupStart');
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
         * @description Contrôleur de la page "à propos"
         */
        .controller('AboutCtrl', function ($scope, $rootScope, $translatePartialLoader) {
            
            $translatePartialLoader.addPart('public');
        })

        /**
         * @class qaobee.public.public.AboutCtrl
         * @description Contrôleur de la page "à propos"
         */
        .controller('ContactCtrl', function () {

        })

        /**
         * @class qaobee.public.public.PricingCtrl
         * @description Contrôleur de la page "nos tarifs"
         */
        .controller('PricingCtrl', function ($scope, qeventbus, $translatePartialLoader) {
            $translatePartialLoader.addPart('public');
            qeventbus.prepForBroadcast('menuItem', 'pricing');
        })

        /**
         * @class qaobee.public.public.MentionslegalesCtrl
         * @description Contrôleur de la page "mentions légales"
         */
        .controller('MentionslegalesCtrl', function (qeventbus) {
            qeventbus.prepForBroadcast('menuItem', 'legal');
        });
}());