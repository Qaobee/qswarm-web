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

        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private', {
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                }

            });
        })
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
                    $translatePartialLoader.addPart('home');
                    $scope.noStat = false;
                    $scope.loading = true; 

                    /* getStats */
                    var getStats = function (ownersId, startDate, endDate) {
                        var deferred = $q.defer();
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
                            }, true);
                            
                            if (angular.isArray(data) && data.length > 0) {
                                $scope.noStat = true;
                                if (data.length > $scope.nbitem) {
                                    deferred.resolve(data.removeAt($scope.nbitem, data.length));
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
                        effectiveSrv.getEffective($scope.meta.sandbox.effectiveDefault).then(function (data) {
                            $scope.currentEffective = data;

                            effectiveSrv.getListId($scope.currentEffective, 'player').then(function (listId) {
                                $scope.ownersId = listId;
                                getStats($scope.ownersId, $scope.startDate, $scope.endDate).then(function (result) {
                                    result.forEach(function (e) {
                                        var player = {
                                            _id: e._id.owner[4],
                                            value: e.value
                                        };
                                        $scope.players.push(player);
                                    });

                                    $scope.getInfosPlayer();
                                });
                                $scope.loading = false;
                            });
                        });
                    };

                    $scope.getInfosPlayer = function () {
                        var listField = Array.create('_id', 'name', 'firstname', 'avatar', 'status');
                        var listId = [];

                        $scope.players.forEach(function (e) {
                            listId.push(e._id);
                        });

                        effectiveSrv.getPersons(listId, listField).then(function (result) {
                            result.forEach(function (e) {
                                $scope.players.forEach(function (player) {
                                    if (player._id === e._id) {
                                        player.name = e.name;
                                        player.firstname = e.firstname;
                                        player.avatar = e.avatar;
                                        player.status = e.status;
                                        if (angular.isDefined(e.status.positionType)) {
                                            player.positionType = $filter('translate')('stats.positionType.value.' + e.status.positionType);
                                        } else {
                                            player.positionType = '';
                                        }
                                    }
                                });
                            });
                        });
                    };

                    var buildWidget = function () {
                        $scope.players = [];
                        $scope.title = 'stats.resumeTab.' + $scope.label;

                        if (!$scope.user.periodicity) {
                            $scope.periodicity = 'season';
                            $scope.startDate = moment($scope.meta.season.startDate);
                            $scope.endDate = moment($scope.meta.season.endDate);
                        } else {
                            $scope.startDate = $scope.user.periodicityActive.startDate;
                            $scope.endDate = $scope.user.periodicityActive.endDate;
                            $scope.ownersId = $scope.user.periodicityActive.ownersId;
                        }

                        $scope.getEffective();
                    };
                    /* Refresh widget on periodicity change */
                    $scope.$on('qeventbus', function () {
                        if ("periodicityActive" === qeventbus.message) {
                            $scope.noStat = false;
                            buildWidget();
                        }
                    });

                },
                templateUrl: 'app/components/directives/widgets/podium/podium.html'
            };
        });
}());