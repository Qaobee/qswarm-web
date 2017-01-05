(function () {
    'use strict';
    angular.module('qaobee.playerInfos', [])

        .directive('playerInfos', function ($filter, $timeout) {
            return {
                restrict: 'E',
                scope: {
                    player: "="
                },
                controller: function ($scope) {
                    $scope.mapShow = false;
                    $scope.openMap = function () {
                        $timeout(function () {
                            var myLatLng = new google.maps.LatLng($scope.player.address.lat, $scope.player.address.lng);
                            var myOptions = {
                                zoom: 16,
                                center: myLatLng,
                                mapTypeId: google.maps.MapTypeId.ROADMAP
                            };
                            $scope.map = ($document.find('#ngMapPlayer'))[0];
                            $scope.map = new google.maps.Map($scope.map, myOptions);
                            google.maps.event.trigger($scope.map, 'resize');
                        }, 0);

                        angular.element('#mapPlayer').modal('open');
                    };

                    $scope.$watch('player', function (newValue, oldValue) {
                        if (angular.isDefined(oldValue) || !angular.equals(oldValue, newValue)) {
                            if (angular.isDefined($scope.player.status.positionType)) {
                                $scope.player.positionType = $filter('translate')('stats.positionType.value.' + $scope.player.status.positionType);
                            } else {
                                $scope.player.positionType = '';
                            }

                            if (angular.isDefined($scope.player.status.stateForm)) {
                                $scope.player.stateForm = $filter('translate')('stats.stateForm.value.' + $scope.player.status.stateForm);
                            } else {
                                $scope.player.stateForm = '';
                            }

                            if (angular.isDefined($scope.player.address)) {
                                $scope.mapShow = true;
                            }
                            $scope.player.age = moment().year() - moment($scope.player.birthdate).year();
                        }
                    });
                },
                templateUrl: 'app/components/directives/sandbox/playerInfos/playerInfos.html'
            };
        });
}());