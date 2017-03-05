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
            }).when('/concept', {
                controller: 'HowCtrl',
                templateUrl: 'app/modules/public/how.html'
            }).when('/legals', {
                controller: 'MentionslegalesCtrl',
                templateUrl: 'app/modules/public/legal.html'
            }).when('/contact', {
                controller: 'ContactCtrl',
                templateUrl: 'app/modules/public/contact.html'
            }).when('/pricing', {
                controller: 'PricingCtrl',
                templateUrl: 'app/modules/public/pricing.html'
            }).when('/about', {
                controller: 'AboutCtrl',
                templateUrl: 'app/modules/public/aboutUs.html'
            });
        })

        .controller('HowCtrl', function () {

        })

        /**
         * @class qaobee.public.public.PublicCtrl
         * @description Contrôleur de la page d'accueil publique
         */
        .controller('PublicCtrl', function ($scope, $rootScope, $translatePartialLoader, $location, qeventbus) {
            $translatePartialLoader.addPart('public');
            $translatePartialLoader.addPart('commons');
            // asu = Allow SignUp
            $rootScope.signupAvailable = true;
            delete $rootScope.user;
            qeventbus.prepForBroadcast('menuItem', 'home');

            /**
             * @description initialization materialize components
             */
            $rootScope.$on('$viewContentLoaded', function () {
                angular.element('.modal').modal({
                    dismissible: true,
                    opacity: 0.7,
                    in_duration: 600,
                    out_duration: 200
                });
            });
            /**
             *
             * @returns {boolean}
             */
            $scope.openSignup = function () {
                $location.path('/signupStart');
                return false;
            };
        })

        /**
         * @class qaobee.public.public.AboutCtrl
         * @description Contrôleur de la page "à propos"
         */
        .controller('AboutCtrl', function ($scope) {
            $scope.crew = ['pascal', 'mathieu', 'christophe', 'xavier', 'jerome', 'you'];
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
        })

        /**
         * @class qaobee.public.public.ContactCtrl
         * @description Contrôleur de la page "contactez nous"
         */
        .controller('ContactCtrl', function ($scope, publicRestAPI, $filter, $translatePartialLoader) {
            $translatePartialLoader.addPart('landing');
            $scope.subjects = [];
            $scope.subjects.push({
                id: 'service',
                label: $filter('translate')('contact.ph.subject.line2')
            });
            $scope.subjects.push({
                id: 'suggestions',
                label: $filter('translate')('contact.ph.subject.line3')
            });
            $scope.subjects.push({
                id: 'product',
                label: $filter('translate')('contact.ph.subject.line4')
            });

            $scope.contact = {};
            /**
             * @name $scope.validate
             * @function
             * @memberOf qaobee.public.public.ContactCtrl
             * @description Envoi un email
             */
            $scope.validate = function () {
                publicRestAPI.sendMail($scope.contact).success(function () {
                    $scope.contact = {};
                    toastr.success($filter('translate')('content.contact.label.success'));
                });
            };
            $scope.$on('$destroy', function () {
                delete $scope.subjects;
                delete $scope.contact;
            });
        });
}());