angular.module('widget.structure', ['angular-flip', 'leaflet-directive'])

    .directive('widgetStructure', function ($rootScope) {
        'use strict';
        return {
            restrict: 'AE',
            scope: {
                structure: '=',
                height: '=?',
                user: '='
            },
            controller: function ($scope, $element) {
                $scope.flipped = false;
                $scope.loc = {lat: 40, lon: -73};
                $scope.markers = {
                    mainMarker: {
                        zoom: 12
                    }
                };
                var statCell = $element.children(1).children(1).children(1).children(1).children(1);
                var statPanel = $element.children(1).children(1).children(1).children(1);

                $scope.height = $scope.height || Math.min(statCell.outerHeight(), 120);

                $scope.selectStructure = function (structure) {
                    $scope.actualStructure = structure;
                    if (structure.addressStr.formatedAddress === null) {
                        structure.addressStr.formatedAddress = structure.addressStr.place + ' ' + structure.addressStr.zipcode + ' ' +
                        structure.addressStr.city + ' ' + structure.addressStr.country;
                    }
                    $scope.height = statPanel.outerHeight();
                    $element.children(1).height(statPanel.outerHeight());
                    $scope.flipFront();
                    $scope.geoCode(structure.addressStr.formatedAddress);
                };

                $scope.gotoLocation = function (lat, lon) {
                    if ($scope.lat !== lat || $scope.lon !== lon) {
                        $scope.loc = {lat: lat, lon: lon};
                        $scope.markers = {
                            mainMarker: {
                                lat: lat,
                                lng: lon,
                                zoom: 12
                            }, markers: {
                                mainMarker: {
                                    focus: true,
                                    message: $scope.structure.label,
                                    lat: lat,
                                    lng: lon
                                }
                            }
                        };
                    }
                };
                $scope.geoCode = function (address) {
                    if (!this.geocoder) {
                        this.geocoder = new google.maps.Geocoder();
                    }
                    this.geocoder.geocode({'address': address}, function (results, status) {
                        if (status === google.maps.GeocoderStatus.OK) {
                            var loc = results[0].geometry.location;
                            $scope.search = results[0].formatted_address;
                            $scope.gotoLocation(loc.lat(), loc.lng());
                        }
                    });
                };
                $scope.structure.then(function (structure) {
                    $scope.actualStructure = structure;
                    if (structure.addressStr.formatedAddress === null) {
                        structure.addressStr.formatedAddress = structure.addressStr.place + ' ' + structure.addressStr.zipcode + ' ' +
                        structure.addressStr.city + ' ' + structure.addressStr.country;
                    }
                    $scope.height = statPanel.outerHeight();
                    $element.children(1).height(statPanel.outerHeight());
                    $scope.flipFront();
                    $scope.geoCode(structure.addressStr.formatedAddress);
                });
                $scope.toggle = function () {
                    $scope.flipped = !$scope.flipped;
                };

                $scope.flipFront = function () {
                    $scope.flipped = false;
                };

                $scope.flipBack = function () {
                    $scope.flipped = true;
                };
            },
            templateUrl: 'app/components/widgets/structure/structure.html'
        };
    });
function JSON_CALLBACK() { // Nothing
}
