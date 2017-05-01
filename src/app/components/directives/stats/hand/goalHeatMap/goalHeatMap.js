(function () {
    'use strict';
    angular.module('qaobee.widgets.goalHeatMap', ['statsRestAPI'])
        .directive('sbLoad', ['$parse', function ($parse) {
            return {
                restrict: 'A',
                link: function (scope, elem, attrs) {
                    var fn = $parse(attrs.sbLoad);
                    elem.on('load', function (event) {
                        scope.$apply(function () {
                            fn(scope, {$event: event});
                        });
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
                link: function ($scope, $elem) {
                    var nbImgs = 0;
                    $scope.onImgLoad = function (event) {
                        if (angular.isDefined(filterCalendarSrv.getValue())) {
                            $scope.periodicityActive = filterCalendarSrv.getValue().periodicityActive;
                            $scope.dimsGoal = $scope.getElementDimensions(angular.element('#goal img.heatmap-image'));
                            $scope.dimsGround = $scope.getElementDimensions(angular.element('#ground img.heatmap-image'));
                            angular.element(angular.element('#goal').children(2)[1]).attr('id', $scope.goalUid);
                            angular.element('#' + $scope.goalUid).attr('style', 'width:' + $scope.dimsGoal.width + 'px;height:' + $scope.dimsGoal.height + 'px');
                            $scope.hGoal = new Heatmap({
                                element: $scope.goalUid,
                                size: 150,
                                opacity: 1,
                                gradient: 'classic',
                                shadow: 'large',
                                zIndex: 10
                            });
                            $scope.groundUid = qaobeeUtils.guid();
                            angular.element(angular.element('#ground').children(2)[1]).attr('id', $scope.groundUid);
                            angular.element('#' + $scope.groundUid).attr('style', 'width:' + $scope.dimsGround.width + 'px;height:' + $scope.dimsGround.height + 'px');
                            $scope.hGround = new Heatmap({
                                element: $scope.groundUid,
                                size: 150,
                                opacity: 1,
                                gradient: 'classic',
                                shadow: 'large',
                                zIndex: 10
                            });

                            console.log('build from image', nbImgs)
                            nbImgs++;
                            if(nbImgs == 2) {
                                $scope.buildAll();
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
                                            $scope.build(s, 'goal', $scope.hGoal, $scope.dimsGoal);
                                            $scope.build(s, 'ground', $scope.hGround, $scope.dimsGround);
                                        });
                                    }
                                });
                            }
                        });
                    };

                    $scope.build = function (e, type, target, dims) {
                        var serie = {};
                        if (serie[e.value]) {
                            serie[e.value].count = serie[e.value].count + 1;
                        } else if ($scope.coordinates[$scope.activityId][type][e.value]) {
                            serie[e.value] = {
                                x: $scope.coordinates[$scope.activityId][type][e.value].x,
                                y: $scope.coordinates[$scope.activityId][type][e.value].y,
                                count: 1
                            };
                        }
                        Object.keys(serie).forEach(function (k) {
                            target.add.Point(serie[k].x * dims.width / 24, serie[k].y * dims.height / 18, serie[k].count);
                        });
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