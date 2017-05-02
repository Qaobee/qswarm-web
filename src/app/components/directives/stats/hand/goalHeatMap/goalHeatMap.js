(function () {
    'use strict';
    angular.module('qaobee.widgets.goalHeatMap', ['statsRestAPI'])

        .directive('sbLoad', ['$parse', function ($parse) {
            return {
                restrict: 'A',
                link: function ($scope, elem, attrs) {
                    var fn = $parse(attrs.sbLoad);
                    elem.on('load', function (event) {
                        if (!$scope.$$phase) {
                            $scope.$apply(function () {
                                fn($scope, {$event: event});
                            });
                        }
                    });
                }
            };
        }])

        .directive('goalHeatMap', function ($translatePartialLoader, statsRestAPI, $q, filterCalendarSrv, $timeout, qeventbus, qaobeeUtils, $log, $http) {
            return {
                restrict: 'E',
                scope: {
                    meta: '=',
                    ownersId: '=',
                    datas: '@'
                },
                link: function ($scope) {
                    var nbImgs = 0;

                    $scope.onImgLoad = function () {
                        if (angular.isDefined(filterCalendarSrv.getValue())) {
                            $scope.periodicityActive = filterCalendarSrv.getValue().periodicityActive;
                            $scope.dimsGoal = $scope.getElementDimensions(angular.element('#goal img'));
                            $scope.dimsGround = $scope.getElementDimensions(angular.element('#ground img'));
                            //  angular.element(angular.element('#goal').children(2)[1]).attr('id', $scope.goalUid);
                            //angular.element('#goal img').attr('usemap', '#goalMap');
                            $scope.goalMap = [
                                {coords: [445, 39, 497, 287], description: 'outside-right'},
                                {coords: [1, 39, 53, 289], description: 'outside-left'},
                                {coords: [0, 1, 497, 36], description: 'outside-top'},
                                {coords: [55, 38, 442, 77], description: 'top-pole'},
                                {coords: [393, 81, 442, 285], description: 'right-pole'},
                                {coords: [56, 81, 105, 287], description: 'left-pole'},
                                {coords: [299, 220, 389, 286], description: 'RDOWN'},
                                {coords: [202, 218, 295, 287], description: 'CDOWN'},
                                {coords: [108, 220, 198, 286], description: 'LDOWN'},
                                {coords: [298, 148, 390, 216], description: 'RMIDDLE'},
                                {coords: [202, 148, 295, 217], description: 'CMIDDLE'},
                                {coords: [108, 147, 198, 216], description: 'LMIDDLE'},
                                {coords: [298, 79, 390, 146], description: 'RUP'},
                                {coords: [202, 79, 295, 146], description: 'CUP'},
                                {coords: [108, 79, 199, 145], description: 'LUP'}
                            ];
                            angular.element('#goalHeat').attr('style', 'width:' + $scope.dimsGoal.width + 'px;height:' + $scope.dimsGoal.height + 'px');
                            angular.element('#goal img').attr('style', 'width:' + $scope.dimsGoal.width + 'px;height:' + $scope.dimsGoal.height + 'px');
                            imageMapResize();
                            $scope.hGoal = new Heatmap({
                                element: 'goalHeat',
                                size: 200,
                                opacity: 1,
                                gradient: 'classic',
                                shadow: 'large',
                                zIndex: 1
                            });
                            $scope.groundUid = qaobeeUtils.guid();
                            angular.element(angular.element('#ground').children(2)[1]).attr('id', $scope.groundUid);
                            angular.element('#' + $scope.groundUid).attr('style', 'width:' + $scope.dimsGround.width + 'px;height:' + $scope.dimsGround.height + 'px');
                            $scope.hGround = new Heatmap({
                                element: $scope.groundUid,
                                size: 400,
                                opacity: 1,
                                gradient: 'classic',
                                shadow: 'large',
                                zIndex: 10
                            });
                            nbImgs++;
                            if (nbImgs === 2) {
                                $scope.buildAll();
                                imageMapResize('#goalMap');
                            }
                        }
                    };
                },

                controller: function ($scope) {
                    $scope.heightGoal = 200;
                    $scope.heightGround = 200;
                    $scope.activityId = $scope.meta.sandbox.activity._id;
                    $scope.goalUid = qaobeeUtils.guid();
                    $scope.succeededGoals = true;
                    $scope.stopedGoals = true;
                    $scope.goalMap = [];
                    $scope.indicator = {
                        impactShoot: 'impactShootAtt',
                        stopGK: 'stopGKAtt',
                        originShoot: 'originShootAtt',
                        goalType: 'goalScored'
                    };
                    var deferred = $q.defer();
                    var promise = deferred.promise;
                    $http.get('assets/map.json').success(function (data) {
                        deferred.resolve(data);
                    });
                    promise.then(function (data) {
                        $scope.coordinates = data;
                    });

                    $scope.getElementDimensions = function (target) {
                        return {
                            height: target.height(),
                            width: target.width()
                        };
                    };

                    $scope.buildAll = function () {
                        if (angular.isUndefined($scope.periodicityActive) || angular.isUndefined($scope.ownersId) || angular.isUndefined($scope.hGoal) || angular.isUndefined($scope.hGround) || $scope.ownersId.length === 0) {
                            return;
                        }

                        if (!!$scope.hGoal) $scope.hGoal.clear();
                        if (!!$scope.hGround) $scope.hGround.clear();
                        $scope.sequence = {};
                        var search = {
                            listIndicators: [$scope.indicator.impactShoot, $scope.indicator.originShoot, $scope.indicator.stopGK, $scope.indicator.goalType, 'pole'],
                            listOwners: $scope.ownersId,
                            startDate: $scope.periodicityActive.startDate.valueOf(),
                            endDate: $scope.periodicityActive.endDate.valueOf(),
                            aggregat: 'COUNT',
                            listFieldsGroupBy: ['owner', 'code', 'shootSeqId', 'value']
                        };
                        statsRestAPI.getStatGroupBy(search).success(function (dataOri) {
                            if (dataOri && dataOri.length) {
                                dataOri.forEach(function (s) {
                                    if (!$scope.sequence.hasOwnProperty(s._id.shootSeqId)) {
                                        $scope.sequence[s._id.shootSeqId] = [];
                                    }
                                    $scope.sequence[s._id.shootSeqId].push(s._id);
                                });
                                $scope.goalSerie = {};
                                $scope.groundSerie = {};

                                Object.keys($scope.sequence).forEach(function (k) {
                                    var toAdd = false;
                                    var sequence = $scope.sequence[k];
                                    sequence.forEach(function (s) {
                                        if ($scope.succeededGoals && s.code === $scope.indicator.goalType) {
                                            toAdd = true;
                                        }
                                        if ($scope.stopedGoals && s.code === $scope.indicator.stopGK) {
                                            toAdd = true;
                                        }
                                    });
                                    if (toAdd) {
                                        sequence.forEach(function (s) {
                                            $scope.goalSerie = $scope.build(s, 'goal', $scope.goalSerie);
                                            $scope.groundSerie = $scope.build(s, 'ground', $scope.groundSerie);
                                        });
                                    }
                                });
                                Object.keys($scope.goalSerie).forEach(function (k) {
                                    $scope.hGoal.add.Point($scope.goalSerie[k].x * $scope.dimsGoal.width / 24, $scope.goalSerie[k].y * $scope.dimsGoal.height / 18, $scope.goalSerie[k].count);
                                });
                                Object.keys($scope.groundSerie).forEach(function (k) {
                                    $scope.hGround.add.Point($scope.groundSerie[k].x * $scope.dimsGround.width / 24, $scope.groundSerie[k].y * $scope.dimsGround.height / 18, $scope.groundSerie[k].count);
                                });
                                /*Object.keys($scope.coordinates[$scope.activityId]['goal']).forEach(function (k) {
                                 console.log(k, $scope.coordinates[$scope.activityId]['goal'][k].x * $scope.dimsGoal.width / 24,
                                 $scope.coordinates[$scope.activityId]['goal'][k].y * $scope.dimsGoal.height / 18)
                                 $scope.hGoal.add.Point($scope.coordinates[$scope.activityId]['goal'][k].x * $scope.dimsGoal.width / 24,
                                 $scope.coordinates[$scope.activityId]['goal'][k].y * $scope.dimsGoal.height / 18,
                                 Math.random()*10);
                                 });*/
                            }
                        });
                    };

                    $scope.displayBubbleGoal = function (count) {
                        console.log(count)
                    }


                    $scope.build = function (e, type, serie) {
                        if (serie[e.value]) {
                            serie[e.value].count = serie[e.value].count + 1;
                        } else if ($scope.coordinates[$scope.activityId][type][e.value]) {
                            serie[e.value] = {
                                x: $scope.coordinates[$scope.activityId][type][e.value].x,
                                y: $scope.coordinates[$scope.activityId][type][e.value].y,
                                count: 1
                            };
                        }
                        return serie;
                    };

                    /* Refresh widget on periodicity change */
                    $scope.$on('qeventbus:periodicityActive', function () {
                        if (angular.isUndefined($scope.periodicityActive) || !angular.equals($scope.periodicityActive, qeventbus.data.periodicityActive)) {
                            $scope.periodicityActive = qeventbus.data.periodicityActive;
                            $scope.buildAll();
                        }
                    });
                    $scope.$on('qeventbus:ownersId', function () {
                        $scope.ownersId = qeventbus.data.ownersId;
                        $scope.buildAll();
                    });
                },
                templateUrl: 'app/components/directives/stats/hand/goalHeatMap/goalHeatMap.html'
            };
        });
}());