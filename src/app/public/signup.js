(function () {
    'use strict';
    /**
     * Signup module
     *
     * @class qaobee.public.publicSignup
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     * @requires {@link qaobee.rest.public.userInfosAPI|qaobee.rest.public.userInfosAPI}
     * @requires {@link qaobee.rest.public.paymentAPI|qaobee.rest.public.paymentAPI}
     */
    angular.module('qaobee.signup', ['paymentRestAPI', 'userInfosRestAPI', 'locationAPI', 'publicRestAPI'])

        .config(function ($routeProvider) {
            $routeProvider.when('/signup/:plan?', {
                controller: 'SignupCtrl',
                templateUrl: 'public/signup/signup.html'
            }).when('/signup/coach/cancel', {
                controller: 'SignupCancelCtrl',
                templateUrl: 'public/signup/signupCancel.html'
            }).when('/signup/coach/end/:id/:pid', {
                controller: 'SignupEndCtrl',
                templateUrl: 'public/signup/signupEnd.html'
            });
        })

    /**
     * @class qaobee.public.publicSignup.SignupEndCtrl
     * @description End of the registring process
     */
        .controller('SignupEndCtrl', function ($scope, $filter, $routeParams, paymentAPI) {
            $scope.billinfo = {};
            toastr.success($filter('translate')('popup.success.added'));
            /**
             * @name $scope.loadUser
             * @function
             * @memberOf qaobee.public.publicSignup.SignupEndCtrl
             * @description Get user's detail with his id
             */
            $scope.loadUser = function () {
                paymentAPI.getDetail($routeParams.id, $routeParams.pid).success(function (data) {
                    $scope.curuser = data.person;
                    $scope.billinfo = data.plan;
                });
            };
            $scope.loadUser();
            $scope.$on('$destroy', function () {
                delete $scope.curuser;
                delete $scope.billinfo;
            });
        })

    /**
     * @class qaobee.public.publicSignup.SignupCtrl
     * @description Begining of the registration process
     */
        .controller('SignupCtrl', function ($scope, $http, eventbus, userInfosAPI, paymentAPI, $routeParams, $filter, $location, reCAPTCHA, $window, $log, locationAPI, publicRestAPI) {
            $scope.signup = {
                address: {}
            };
            $scope.plan = {
                levelPlan: $routeParams.plan
            };
            $scope.activities = Array.create();
            $scope.showSpinner = false;
            $scope.dateOption = {
                minDate: new Date(1900, 0, 1, 1, 0, 1),
                maxDate: new Date()
            };
            $scope.phoneFormat = $filter('translate')('phone.format');

            publicRestAPI.getActivities().success(function (data) {
                $log.debug(data);
                $scope.activities = data;
                $('select').selectpicker({
                    style: 'btn-info'
                });
            });

            /**
             * @name $scope.registerUser
             * @function
             * @memberOf qaobee.public.publicSignup.SignupCtrl
             * @description register user
             */
            $scope.registerUser = function () {
                userInfosAPI.registerUser($scope.signup).success(function (data) {
                    $log.debug(data);
                    paymentAPI.getPaymentURL(data.planId, data.person._id).success(function (data) {
                        $window.location.href = data.url;
                    });
                }).error(function (error) {
                    $scope.showSpinner = false;
                    if (error) {
                        if (error.code && error.code === 'CAPTCHA_EXCEPTION') {
                            $window.Recaptcha.reload();
                            toastr.error($filter('translate')('popup.error.' + error.code));
                        } else {
                            toastr.error(error.message);
                        }
                    }
                    $log.error(error);
                });
            };
            /**
             * @name $scope.prepareUser
             * @function
             * @memberOf qaobee.public.publicSignup.SignupCtrl
             * @description prepare a new person for register
             */
            $scope.prepareUser = function () {
                $scope.showSpinner = true;
                $scope.signup.birthdate = $scope.dateOption.val;
                $scope.signup.plan = $scope.plan;
                if (angular.isDefined($scope.signup.address.formatedAddress) && !$scope.signup.address.formatedAddress.isBlank()) {
                    locationAPI.get($scope.signup.address.formatedAddress).then(function (adr) {
                        $scope.signup.address.lat = adr.data.results[0].geometry.location.lat;
                        $scope.signup.address.lng = adr.data.results[0].geometry.location.lng;
                        // parsing des infos
                        angular.forEach(adr.data.results[0].address_components, function (item) {
                            if (item.types.count('street_number') > 0) {
                                $scope.signup.address.place = item.long_name + ' ';
                            }
                            if (item.types.count('route') > 0) {
                                $scope.signup.address.place += item.long_name;
                            }
                            if (item.types.count('locality') > 0) {
                                $scope.signup.address.city = item.long_name;
                            }
                            if (item.types.count('postal_code') > 0) {
                                $scope.signup.address.zipcode = item.long_name;
                            }
                            if (item.types.count('country') > 0) {
                                $scope.signup.address.country = item.long_name;
                            }
                        });
                        $scope.registerUser();
                    });
                } else {
                    $scope.registerUser();
                }
            };
            /**
             * @name $searchStructure
             * @function
             * @memberOf qaobee.public.publicSignup.SignupCtrl
             * @description Fetch structures with a regexp
             */
            $scope.searchStructure = function (val) {
                $log.debug($scope.plan);
                return publicRestAPI.searchStructure(val, $scope.plan.activity.code).then(function (res) {
                    $log.debug(res.data);
                    return res.data;
                });
            };
            /**
             * @name $scope.getLocation
             * @function
             * @memberOf qaobee.public.publicSignup.SignupCtrl
             * @description Get formated address from Google
             * @see {@link https://developers.google.com/maps/documentation/geocoding/}
             */
            $scope.getLocation = function (val) {
                return locationAPI.get(val).then(function (res) {
                    var addresses = Array.create();
                    angular.forEach(res.data.results, function (item) {
                        addresses.push(item.formatted_address);
                    });
                    return addresses;
                });
            };

            $scope.$on('$destroy', function () {
                delete $scope.signup;
                delete $scope.showSpinner;
                delete $scope.dateOption;
                delete $scope.birthdate;
                delete $scope.passwd;
                delete $scope.activities;
                delete $scope.plan;
            });
        })

//
    ;
}());