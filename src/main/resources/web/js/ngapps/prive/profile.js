/**
 * user profile
 *
 * @author Xavier MARIN
 * @class qaobee.prive.profile
 * @requires {@link qaobee.rest.public.userInfosAPI|qaobee.rest.public.userInfosAPI}
 * @requires {@link qaobee.rest.prive.profileRestAPI|qaobee.rest.prive.profileRestAPI}
 * @requires {@link qaobee.rest.public.userMetaAPI|qaobee.rest.public.userMetaAPI}
 * @requires {@link qaobee.tools.locationAPI|qaobee.tools.locationAPI}
 * @copyright <b>QaoBee</b>.
 */
angular.module('profile', ['profileRestAPI', 'userInfosAPI', 'structureCfgRestAPI', 'locationAPI', 'userMetaAPI', 'statAPI', 'chart.js'])

    .config(function ($routeProvider, metaDatasProvider) {
        'use strict';
        $routeProvider.when('/private/profil', {
            controller: 'ProfileCtrl',
            resolve: {
                user: metaDatasProvider.checkUser,
                meta: metaDatasProvider.getMeta
            },
            templateUrl: 'templates/prive/profil.html'
        });
    })
/**
 * @class qaobee.prive.profile.ProfileCtrl
 * @description Main controller of templates/prive/profil.html
 */
    .controller('ProfileCtrl', function ($scope, eventbus, profileRestAPI, userInfosAPI, userMetaAPI, statAPI, $filter, structureCfgRestAPI, $translatePartialLoader, $rootScope, $location, $window, locationAPI, $log, user, meta) {
        'use strict';
        $translatePartialLoader.addPart('profile');
        $translatePartialLoader.addPart('stats');
        $translatePartialLoader.addPart('format');
        $translatePartialLoader.addPart('effective');
        $translatePartialLoader.addPart('data');
        $scope.season = meta.season;
        $scope.activity = meta.activity;
        $scope.structure = meta.structure;
        $scope.user = user;
        $scope.birthdate = moment().format($filter('translate')('date.format'));
        $scope.pdfUrl = '/rest/prive/profile/pdf?token=' + $window.sessionStorage.qaobeesession;
        $scope.billPdfUrl = '/rest/prive/profile/billpdf?token=' + $window.sessionStorage.qaobeesession;
        $scope.dateOption = {
            minDate: new Date(1900, 0, 1, 1, 0, 1),
            maxDate: new Date()
        };

        $scope.attendance = {
            options: {
                scaleLineColor: '#fff',
                scaleFontSize: 10,
                scaleFontColor: '#fff',
                tooltipFontSize: 10,
                tooltipTitleFontSize: 10,
                maintainAspectRatio: false,
                animationEasing: "easeOutQuart",
                percentageInnerCutout: 85,
                legendTemplate: ""
            },
            data: {
                labels: [],
                series: [],
                datasets: [[]]
            }
        };


        $scope.$on('$destroy', function () {
            delete $scope.user;
            delete $scope.pdfUrl;
            delete $scope.billPdfUrl;
            delete $scope.dateOption;
            delete $scope.birthdate;
        });


        $scope.birthdate = moment(user.birthdate).format($filter('translate')('date.format'));
        var search = {
            listIndicators: Array.create('attendance'),
            listOwners: Array.create(user._id),
            startDate: meta.season.startDate,
            endDate: meta.season.endDate,
            value: $filter('translate')('stat.attendance.val'),
            aggregat: "AVG",
            listFieldsGroupBy: ['code']
        };
        statAPI.getStatGroupBy(search).success(function (data) {
            if (angular.isArray(data) && data.length > 0) {
                var labels = [];
                var datasets = [];
                labels.push($filter('translate')('stat.attendance.value.present'));
                labels.push($filter('translate')('stat.attendance.value.absent'));

                datasets.push(parseInt($filter('number')(data[0].value * 100, 2)));
                datasets.push(parseInt($filter('number')((1 - data[0].value) * 100, 2)));
                $scope.attendance.data = {
                    labels: labels,
                    datasets: datasets
                };
            }
        });
        // Fetch user's stats
        $scope.technicalRadar = {
            datasets: [[]],
            series: [$filter('translate')('playerSheet.rubrics.technical.title')],
            labels: []
        };
        $scope.physicalRadar = {
            datasets: [[]],
            series: [$filter('translate')('playerSheet.rubrics.physical.title')],
            labels: []
        };
        $scope.mentalRadar = {
            datasets: [[]],
            series: [$filter('translate')('playerSheet.rubrics.mental.title')],
            labels: []
        };
        $scope.ownersId = Array.create(user._id);
        if(angular.isDefined($scope.user.technicalFolder) && $scope.user.technicalFolder !== null) {
            $scope.user.technicalFolder.forEach(function (a) {
                $scope.technicalRadar.labels.push($filter('translate')('playerSheet.rubrics.technical.label.' + a.key));
                $scope.technicalRadar.datasets[0].push(a.value);
            });
        }
        if(angular.isDefined($scope.user.physicalFolder) && $scope.user.physicalFolder !== null) {
            $scope.user.physicalFolder.forEach(function (a) {
                $scope.physicalRadar.labels.push($filter('translate')('playerSheet.rubrics.physical.label.' + a.key));
                $scope.physicalRadar.datasets[0].push(a.value);
            });
        }
        if(angular.isDefined($scope.user.mentalFolder) && $scope.user.mentalFolder !== null) {
            $scope.user.mentalFolder.forEach(function (a) {
                $scope.mentalRadar.labels.push($filter('translate')('playerSheet.rubrics.mental.label.' + a.key));
                $scope.mentalRadar.datasets[0].push(a.value);
            });
        }
        /**
         * @name $scope.updateUser
         * @function
         * @param profileForm
         *            the form
         * @memberOf qaobee.prive.profile.ProfileCtrl
         * @description update the current user
         */
        $scope.updateUser = function (profileForm) {
            if (profileForm.$valid) {
                var updUser = {};
                angular.copy($scope.user, updUser);
                updUser.birthdate = $scope.dateOption.val;
                delete updUser.isAdmin;
                // address management
                if (angular.isDefined(updUser.address.formatedAddress) && updUser.address.formatedAddress !== '') {
                    locationAPI.get(updUser.address.formatedAddress).then(function (adr) {
                            updUser.address.lat = adr.data.results[0].geometry.location.lat;
                            updUser.address.lng = adr.data.results[0].geometry.location.lng;
                            // parsing infos
                            angular.forEach(adr.data.results[0].address_components, function (item) {
                                if (item.types.count('street_number') > 0) {
                                    updUser.address.place = item.long_name + ' ';
                                }
                                if (item.types.count('route') > 0) {
                                    updUser.address.place += item.long_name;
                                }
                                if (item.types.count('locality') > 0) {
                                    updUser.address.city = item.long_name;
                                }
                                if (item.types.count('postal_code') > 0) {
                                    updUser.address.zipcode = item.long_name;
                                }
                                if (item.types.count('country') > 0) {
                                    updUser.address.country = item.long_name;
                                }
                            });
                            updUser.birthdate = $scope.dateOption.val;
                            profileRestAPI.update(updUser).success(function (data) {
                                toastr.success(data.firstname + " " + data.name + $filter('translate')('popup.success.updated'));
                                eventbus.prepForBroadcast("refreshUser", data);
                            });
                        }
                    );
                } else {
                    profileRestAPI.update(updUser).success(function (data) {
                        toastr.success(data.firstname + " " + data.name + $filter('translate')('popup.success.updated'));
                        eventbus.prepForBroadcast("refreshUser", data);
                    });
                }

            }
        };


        /**
         * @name $scope.getLocation
         * @function
         * @memberOf qaobee.prive.profile.ProfileCtrl
         * @description Fetch address with Google API
         * @see {@link https://developers.google.com/maps/documentation/geocoding/}
         */
        $scope.getLocation = function (val) {
            return locationAPI.get(val).then(function (res) {
                var addresses = [];
                angular.forEach(res.data.results, function (item) {
                    addresses.push(item.formatted_address);
                });
                return addresses;
            });
        };
    })
;
