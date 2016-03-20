(function () {
    'use strict';
    /**
     * Created by cke on 20/03/16.
     *
     * topStriker directive<br />
     *
     * @author christophe Kervella
     * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
     *
     */

    angular.module('qaobee.widgets.topStriker', ['effectifSRV', 'statsRestAPI', 'qaobee.eventbus'])

        .directive('widgetTopStriker', function ($translatePartialLoader, $log, $q, $filter, statsRestAPI, effectiveSrv, qeventbus) {
            return {
                restrict: 'AE',
                scope: {
                    user: '=',
                    meta: '='
                },
                controller: function ($scope) {
                    $translatePartialLoader.addPart('stats');
                    $log.debug('widgetTopStriker', 'coucou');

                    if (!$scope.user.periodicity) {
                        $scope.periodicity = 'season';
                        $scope.periodicityActive = {
                            startDate: moment().valueOf(),
                            endDate: moment($scope.meta.season.endDate),
                            ownersId: $scope.ownersId
                        };
                    } else {
                        $scope.periodicityActive = $scope.user.periodicityActive;
                    }

                    /* Refresh widget on periodicity change */
                    $scope.$on('qeventbus', function () {
                        if ("periodicityActive" === qeventbus.message) {
                            $scope.startDate = qeventbus.data.startDate;
                            $scope.endDate = qeventbus.data.endDate;
                            $scope.ownersId = qeventbus.data.ownersId;
                            buildWidget();
                        }
                    });

                    /* getStats */
                    var getStats = function (ownersId, startDate, endDate) {
                        var deferred = $q.defer();
                        var result = [];

                        /* Stats Count by indicator */
                        var indicators = [];
                        indicators.push('goalScored');

                        var listFieldsGroupBy = Array.create('code');

                        var search = {
                            listIndicators: indicators,
                            listOwners: ownersId,
                            startDate: startDate.valueOf(),
                            endDate: endDate.valueOf(),
                            aggregat: 'COUNT',
                            listFieldsGroupBy: listFieldsGroupBy
                        };

                        /* Appel stats API */
                        statsRestAPI.getStatGroupBy(search).success(function (data) {
                            if (angular.isArray(data) && data.length > 0) {
                                deferred.resolve(result);
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
                            });
                        });
                    };

                    $scope.getInfosPlayer = function (player) {
                        var listField = Array.create('_id', 'name', 'firstname', 'avatar', 'status');

                        effectiveSrv.getPersons(player._id, listField).then(function (players) {
                            $scope.players.forEach(function (e) {
                                player._id = e._id;
                                player.name = e.nome;
                                player.firstname = e.firstname;
                                player.avatar = e.avatar;
                                player.status = e.status;
                                if (angular.isDefined(e.status.positionType)) {
                                    player.positionType = $filter('translate')('stats.positionType.value.' + e.status.positionType);
                                } else {
                                    player.positionType = '';
                                }
                            });
                        });
                    }

                    var buildWidget = function () {
                        $scope.players = [];
                        $scope.title = 'stats.resumeTab.' + $scope.label;

                        if (!$scope.ownersId && $scope.ownersId.length === 0) {
                            $scope.getEffective();
                        }

                        getStats($scope.ownersId, $scope.startDate, $scope.endDate).then(function (result) {
                            result.forEach(function (e) {
                                var player = {
                                    _id: e._id,
                                    nbGoal: e.value
                                };
                                $scope.getInfosPlayer(player);
                                $scope.players.push(player);
                            });
                        });
                    };

                    buildWidget();
                },
                templateUrl: 'app/components/directives/widgets/podium/topStriker.html'
            };
        });
}());