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
           /* }).when('/concept', {
                controller: 'HowCtrl',
                templateUrl: 'app/modules/public/how.html'*/
            }).when('/legals', {
                controller: 'MentionslegalesCtrl',
                templateUrl: 'app/modules/public/legal.html'
         /*   }).when('/contact', {
                controller: 'ContactCtrl',
                templateUrl: 'app/modules/public/contact.html'*/
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
            $scope.animateElementIn = function($el) {
                $el.removeClass('hidden');
                $el.addClass('animated fadeInLeft'); // this example leverages animate.css classes
            };

            $scope.animateElementOut = function($el) {
                $el.addClass('hidden');
                $el.removeClass('animated fadeInLeft'); // this example leverages animate.css classes
            };
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
        .controller('ContactCtrl', function ($scope, publicRestAPI, $filter, $translatePartialLoader, qeventbus, $timeout) {
            qeventbus.prepForBroadcast('menuItem', 'contact');
            $translatePartialLoader.addPart('public');
            var address = '20, rue Cuirassé Bretagne, 29200 BREST';

            function initialize() {
                var geocoder = new google.maps.Geocoder();
                var latlng = new google.maps.LatLng(-34.397, 150.644);
                var myOptions = {
                    zoom: 16,
                    center: latlng,
                    mapTypeControl: false,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                var map = new google.maps.Map(document.getElementById("ngMap"), myOptions);

                if (geocoder) {
                    geocoder.geocode({'address': address}, function (results, status) {
                        if (status === google.maps.GeocoderStatus.OK) {
                            if (status !== google.maps.GeocoderStatus.ZERO_RESULTS) {
                                map.setCenter(results[0].geometry.location);
                                console.log(results)

                                var infowindow = new google.maps.InfoWindow({
                                    content: '<b>Qaobee</b><br />' + address,
                                    size: new google.maps.Size(150, 50)
                                });

                                var marker = new google.maps.Marker({
                                    position: results[0].geometry.location,
                                    map: map,
                                    title: 'Qaobee'
                                });
                                google.maps.event.addListener(marker, 'click', function () {
                                    infowindow.open(map, marker);
                                });
                            }
                        }
                    });
                }
            }
            $timeout(function () {
                initialize();
            }, 0);


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