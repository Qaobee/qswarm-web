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
     * @requires {@link https://github.com/mllrsohn/angular-re-captcha|reCAPTCHA}
     */
    angular.module('qaobee.public', [
        /* angular module */
        'ngRoute',
        'reCAPTCHA',
        
        /* qaobee shared directives */
        'qaobee.headerMenu',
    
        /* qaobee modules */ 
            
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
            }).when('/how', {
                controller: 'HowCtrl',
                templateUrl: 'app/modules/public/how.html'
            }).when('/legals', {
                controller: 'MentionslegalesCtrl',
                templateUrl: 'app/modules/public/legal.html'
            }).when('/contact', {
                controller: 'ContactCtrl',
                templateUrl: 'app/modules/public/contact.html'
            }).when('/blog', {
                controller: 'BlogCtrl',
                templateUrl: 'app/modules/public/blog.html'
            }).when('/pricing', {
                controller: 'PricingCtrl',
                templateUrl: 'app/modules/public/pricing.html'
            }).when('/features', {
                controller: 'FeaturesCtrl',
                templateUrl: 'app/modules/public/features.html'
            }).when('/offer/DISCOVERY', {
                controller: 'DiscoveryOfferCtrl',
                templateUrl: 'app/modules/public/offers/discovery.html'
            }).when('/offer/PREMIUM', {
                controller: 'PremiumOfferCtrl',
                templateUrl: 'app/modules/public/offers/premium.html'
            }).when('/offer/TEAM_PLUS', {
                controller: 'TeamPlusOfferCtrl',
                templateUrl: 'app/modules/public/offers/teamplus.html'
            });
        })

        .controller('FeaturesCtrl', function () {

        })
        .controller('HowCtrl', function () {

        })
        .controller('DiscoveryOfferCtrl', function () {

        })

        .controller('PremiumOfferCtrl', function () {

        })

        .controller('TeamPlusOfferCtrl', function () {

        })

    /**
     * @class qaobee.public.public.PublicCtrl
     * @description Contrôleur de la page d'accueil publique
     */
        .controller('PublicCtrl', function ($scope, $rootScope, $translatePartialLoader, $log, $routeParams) {
            $translatePartialLoader.addPart('public');
            $translatePartialLoader.addPart('commons');
            // asu = Allow SignUp
            $rootScope.signupAvailable=($routeParams.asu==='true');
            delete $rootScope.user;

            /**
             * @description initialization materialize components
             */
            $rootScope.$on('$viewContentLoaded', function () {
                angular.element('.modal-trigger').leanModal({
                    dismissible: true,
                    opacity: 0.7,
                    in_duration: 600,
                    out_duration: 200
                });
            });
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
        .controller('PricingCtrl', function ($scope, qeventbus) {
            qeventbus.prepForBroadcast('menuItem', 'pricing');
        })

    /**
     * @class qaobee.public.public.MentionslegalesCtrl
     * @description Contrôleur de la page "mentions légales"
     */
        .controller('MentionslegalesCtrl', function () {

        })

    /**
     * @class qaobee.public.public.ContactCtrl
     * @description Contrôleur de la page "contactez nous"
     */
        .controller('ContactCtrl', function ($scope, publicRestAPI, $filter, $translatePartialLoader) {
            $translatePartialLoader.addPart('landing');
            $scope.subjects = Array.create();
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
        })

    /**
     * @class qaobee.public.public.BlogCtrl
     * @description Contrôleur de la page "Blog"
     */
        .controller('BlogCtrl', function ($scope, publicRestAPI) {
            $scope.blogs = Array.create();
            // récupération de la liste des blogs
            publicRestAPI.getBlogs().success(function (data) {
                data.each(function (n) {
                    n.color = $scope.getRandomColor();
                });
                $scope.blogs = data;
            });
            /**
             * @name $scope.getRandomColor
             * @function
             * @memberOf qaobee.public.public.BlogCtrl
             * @description retourne une couleur aléatoire pour la puce de la timeline
             */
            $scope.getRandomColor = function () {
                var i = Math.floor(Math.random() * 6 + 1);
                switch (i) {
                    case 1:
                        return 'bg-success';
                    case 2:
                        return 'bg-secondary';
                    case 3:
                        return 'bg-info';
                    case 4:
                        return 'bg-warning';
                    case 5:
                        return 'bg-danger';
                    case 6:
                        return 'bg-primary';
                    default:
                        break;
                }
            };
            $scope.$on('$destroy', function () {
                delete $scope.blogs;
            });

        });
}());