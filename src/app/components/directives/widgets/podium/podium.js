(function () {
    'use strict';
    /**
     * Created by cke on 20/03/16.
     *
     * podium directive<br />
     *
     * @author christophe Kervella
     * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
     *
     */

    angular.module('qaobee.widgets.podium', ['effectifSRV', 'statsRestAPI', 'qaobee.eventbus'])

        .directive('widgetPodium', function ($translatePartialLoader, $log, $q, $filter, statsRestAPI, effectiveSrv, qeventbus) {
            return {
                restrict: 'AE',
                scope: {
                    user: '=',
                    meta: '=',
                    indicator: '@',
                    nbitem: '@',
                    stataggregat: '@'
                },
                controller: function ($scope) {
                    $translatePartialLoader.addPart('stats');

                    /* Refresh widget on periodicity change */
                    $scope.$on('qeventbus', function () {
                        if ("periodicityActive" === qeventbus.message) {
                            buildWidget();
                        }
                    });

                    /* getStats */
                    var getStats = function (ownersId, startDate, endDate) {
                        var deferred = $q.defer();
                        var result = [];

                        /* Stats Count by indicator */
                        var indicators = [];
                        indicators.push($scope.indicator);

                        var listFieldsGroupBy = Array.create('owner');
                        
                        var search = {
                            listIndicators: indicators,
                            listOwners: ownersId,
                            startDate: startDate.valueOf(),
                            endDate: endDate.valueOf(),
                            aggregat: $scope.stataggregat,
                            listFieldsGroupBy: listFieldsGroupBy
                        };
                        
                        /* Appel stats API */
                        statsRestAPI.getStatGroupBy(search).success(function (data) {
                            data = data.sortBy(function (n) {
                                return n.value;
                            },true);
                            
                            if (angular.isArray(data) && data.length > 0) {
                                if (data.length > $scope.nbitem) {
                                    deferred.resolve(data.removeAt($scope.nbitem,data.length));
                                } else {
                                    deferred.resolve(data);
                                }
                            } else {
                                deferred.reject('widgetTopStriker -> problem for : ' + search);
                            }
                        });
                        return deferred.promise;
                    };

                    /* Retrieve list player */
                    $scope.getEffective = function () {
                        effectiveSrv.getEffective($scope.user.effectiveDefault).then(function (data) {
                            $scope.currentEffective = data;
                            
                            effectiveSrv.getListId($scope.currentEffective, 'player').then(function (listId) {
                                $scope.ownersId = listId;
                                
                                getStats($scope.ownersId, $scope.startDate, $scope.endDate).then(function (result) {
                                    result.forEach(function (e) {
                                        var player = {
                                            _id: e._id.owner[4],
                                            value: e.value
                                        };
                                        $scope.getInfosPlayer(player);
                                    });
                                });
                            });
                        });
                    };

                    $scope.getInfosPlayer = function (player) {
                        var listField = Array.create('_id', 'name', 'firstname', 'avatar', 'status');
                        var listId = [];
                        listId.push(player._id);
                        
                        effectiveSrv.getPersons(listId, listField).then(function (result) {
                            result.forEach(function (e) {
                                player._id = e._id;
                                player.name = e.name;
                                player.firstname = e.firstname;
                                player.avatar = e.avatar;
                                player.status = e.status;
                                if (angular.isDefined(e.status.positionType)) {
                                    player.positionType = $filter('translate')('stats.positionType.value.' + e.status.positionType);
                                } else {
                                    player.positionType = '';
                                }
                                
                                $scope.players.push(player);
                            });
                        });
                    }

                    var buildWidget = function () {
                        $scope.players = [];
                        $scope.title = 'stats.resumeTab.' + $scope.label;
                        
                        if (!$scope.user.periodicity) {
                            $scope.periodicity = 'season';
                            $scope.startDate =  moment($scope.meta.season.startDate);
                            $scope.endDate = moment($scope.meta.season.endDate);
                        } else {
                            $scope.startDate = $scope.user.periodicityActive.startDate;
                            $scope.endDate = $scope.user.periodicityActive.endDate;
                            $scope.ownersId = $scope.user.periodicityActive.ownersId;
                        }
                        
                        if (!$scope.ownersId) {
                            $scope.getEffective();
                        } else {
                            getStats($scope.ownersId, $scope.startDate, $scope.endDate).then(function (result) {
                                result.forEach(function (e) {
                                    var player = {
                                        _id: e._id,
                                        nbGoal: e.value
                                    };
                                    $scope.getInfosPlayer(player);
                                });
                            });
                        }

                        
                    };

                    buildWidget();
                },
                templateUrl: 'app/components/directives/widgets/podium/podium.html'
            };
        });
}());