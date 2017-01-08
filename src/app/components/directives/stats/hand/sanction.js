(function () {
    'use strict';
    /**
     * Created by cke on 22/12/15.
     *
     * statsGoals directive<br />
     *
     * @author christophe Kervella
     * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
     *
     */

    angular.module('statsSanction', ['statsSRV', 'statsRestAPI', 'qaobee.eventbus'])

        .directive('statsSanction', function ($translatePartialLoader, statsRestAPI, statsSrv, qeventbus, $q, $timeout, filterCalendarSrv) {
            return {
                restrict: 'E',

                controller: function ($scope) {
                    $translatePartialLoader.addPart('stats');
                    $scope.noStat = false;

                    /* getStats */
                    var getStats = function (ownersId, startDate, endDate) {
                        var deferred = $q.defer();
                        var result = {
                            nbYellowCard: 0,
                            nbExclTmp: 0,
                            nbRedCard: 0
                        };

                        var indicators = ['yellowCard', 'exclTmp', 'redCard'];
                        var listFieldsGroupBy = ['owner', 'code'];

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
                                $scope.noStat = true;
                                data.forEach(function (a) {
                                    if (a._id.code === 'yellowCard') {
                                        result.nbYellowCard = a.value;
                                    }
                                    if (a._id.code === 'exclTmp') {
                                        result.nbExclTmp = a.value;
                                    }
                                    if (a._id.code === 'redCard') {
                                        result.nbRedCard = a.value;
                                    }
                                });
                                deferred.resolve(result);
                            } else {
                                $scope.noStat = false;
                                deferred.reject('getStats -> problem for : ' + search);
                            }
                        });

                        return deferred.promise;
                    };

                    var buildWidget = function () {
                        if (angular.isUndefined($scope.periodicityActive) || angular.isUndefined($scope.ownersId)) {
                            return;
                        }
                        $scope.nbYellowCard = 0;
                        $scope.nbExclTmp = 0;
                        $scope.nbRedCard = 0;

                        $scope.title = 'stats.resumeTab.' + $scope.label;

                        getStats($scope.ownersId, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate).then(function (result) {
                            $scope.nbYellowCard = result.nbYellowCard;
                            $scope.nbExclTmp = result.nbExclTmp;
                            $scope.nbRedCard = result.nbRedCard;
                        });
                    };

                    $scope.$on('qeventbus:ownersId', function () {
                        $scope.ownersId = qeventbus.data.ownersId;
                        buildWidget();
                    });
                    $scope.$on('qeventbus:periodicityActive', function () {
                        if (!angular.equals($scope.periodicityActive, qeventbus.data.periodicityActive)) {
                            $scope.noStat = false;
                            $scope.periodicityActive = qeventbus.data.periodicityActive;
                            buildWidget();
                        }
                    });

                    $timeout(function () {
                        if (angular.isDefined(filterCalendarSrv.getValue())) {
                            $scope.periodicityActive = filterCalendarSrv.getValue().periodicityActive;
                            buildWidget();
                        }
                    });

                },
                templateUrl: 'app/components/directives/stats/hand/sanction.html'
            };
        });
}());