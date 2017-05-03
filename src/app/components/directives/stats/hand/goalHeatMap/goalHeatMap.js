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
                    datas: '@',
                    startDate: '=',
                    endDate: '=',
                    instance: '='
                },
                link: function ($scope) {
                    var nbImgs = 0;
                    $translatePartialLoader.addPart('stats');
                    $scope.internalControl = $scope.instance || {};
                    $scope.internalControl.refresh = function () {
                        $scope.buildAll();
                    };
                    $scope.onImgLoad = function () {
                        $scope.dimsGoal = $scope.getElementDimensions(angular.element('#bgGoal'));
                        $scope.dimsGround = $scope.getElementDimensions(angular.element('#bgGround'));
                        angular.element('#goalHeat').attr('style', 'width:' + $scope.dimsGoal.width + 'px;height:' + $scope.dimsGoal.height + 'px');
                        $scope.hGoal = new Heatmap({
                            element: 'goalHeat',
                            size: 200,
                            opacity: 1,
                            gradient: 'classic',
                            shadow: 'large',
                            zIndex: -1
                        });
                        angular.element('#groundHeat').attr('style', 'width:' + $scope.dimsGround.width + 'px;height:' + $scope.dimsGround.height + 'px');
                        $scope.hGround = new Heatmap({
                            element: 'groundHeat',
                            size: 400,
                            opacity: 1,
                            gradient: 'classic',
                            shadow: 'large',
                            zIndex: -1
                        });
                        nbImgs++;
                        if (nbImgs === 2) {
                            $scope.buildAll();
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
                    $scope.val = {
                        goal: 0,
                        ground: 0
                    };
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
                        $scope.goalMap = $scope.coordinates[$scope.activityId].goalMap;
                        $scope.groundMap = $scope.coordinates[$scope.activityId].groundMap;
                    });

                    $scope.getElementDimensions = function (target) {
                        return {
                            height: target.height(),
                            width: target.width()
                        };
                    };

                    $scope.buildAll = function () {
                        if (angular.isUndefined($scope.ownersId) || angular.isUndefined($scope.hGoal) || angular.isUndefined($scope.hGround) || $scope.ownersId.length === 0) {
                            return;
                        }
                        angular.element('#goalTooltip').attr('style', 'visibility: hidden;');
                        angular.element('#groundTooltip').attr('style', 'visibility: hidden;');
                        if (!!$scope.hGoal) $scope.hGoal.clear();
                        if (!!$scope.hGround) $scope.hGround.clear();
                        $scope.sequence = {};
                        var search = {
                            listIndicators: [$scope.indicator.impactShoot, $scope.indicator.originShoot, $scope.indicator.stopGK, $scope.indicator.goalType, 'pole'],
                            listOwners: $scope.ownersId,
                            startDate: $scope.startDate.valueOf(),
                            endDate: $scope.endDate.valueOf(),
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

                                imageMapResize();
                            }
                        });
                    };

                    $scope.displayBubbleGoal = function (count, $event) {
                        $scope.val.goal = 0;
                        if (!$scope.dimsGoal) return;
                        if ($scope.goalSerie && $scope.goalSerie[count]) {
                            $scope.val.goal = $scope.goalSerie[count].count;
                        }
                        var tooltipSpan = angular.element('#goalTooltip');
                        var tooltipDims = $scope.getElementDimensions(tooltipSpan);
                        var x = $event.originalEvent.offsetX - tooltipDims.width / 2;
                        var y = $event.originalEvent.offsetY + $scope.dimsGoal.height - tooltipDims.height - 20;
                        tooltipSpan.attr('style', 'top: ' + y + 'px; left: ' + x + 'px; visibility: visible;');
                    };

                    $scope.displayBubbleGround = function (count, $event) {
                        $scope.val.ground = 0;
                        if (!$scope.dimsGround) return;
                        if ($scope.groundSerie && $scope.groundSerie[count]) {
                            $scope.val.ground = $scope.groundSerie[count].count;
                        }
                        var tooltipSpan = angular.element('#groundTooltip');
                        var tooltipDims = $scope.getElementDimensions(tooltipSpan);
                        var x = $event.originalEvent.offsetX - tooltipDims.width / 2;
                        var y = $event.originalEvent.offsetY + $scope.dimsGround.height - tooltipDims.height - 20;
                        tooltipSpan.attr('style', 'top: ' + y + 'px; left: ' + x + 'px; visibility: visible;');
                    };

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

                    $scope.$on('qeventbus:ownersId', function () {
                        $scope.ownersId = qeventbus.data.ownersId;
                        $scope.buildAll();
                    });
                },
                templateUrl: 'app/components/directives/stats/hand/goalHeatMap/goalHeatMap.html'
            };
        });
}());