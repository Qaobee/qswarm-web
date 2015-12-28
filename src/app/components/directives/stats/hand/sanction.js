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

    .directive('statsSanction', function ($translatePartialLoader, $log, $q, $filter, statsRestAPI, statsSrv, qeventbus) {
        return {
            restrict: 'E',
            
            controller: function ($scope) {
                $translatePartialLoader.addPart('stats');

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
                var getStats = function (ownersId, startDate, endDate, values) {
                    var deferred = $q.defer(); 
                    var search = {};
                    var result = {
                        nbYellowCard : 0,
                        nbExclTmp : 0,
                        nbRedCard : 0
                    };
                    
                    var indicators =  Array.create('yellowCard', 'exclTmp', 'redCard');
                    var listFieldsGroupBy = Array.create('owner', 'code');

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
                            data.forEach(function(a){
                                if(a._id.code === 'yellowCard'){
                                    result.nbYellowCard = a.value;
                                }
                                if(a._id.code === 'exclTmp'){
                                    result.nbExclTmp = a.value;
                                }
                                if(a._id.code === 'redCard'){
                                    result.nbRedCard = a.value;
                                }
                            });
                            deferred.resolve(result);  
                        } else {
                            deferred.reject('getStats -> problem for : ' + search);
                        }
                    })

                    return deferred.promise;
                }; 
                
                var buildWidget= function (){
                    $scope.nbYellowCard = 0;
                    $scope.nbExclTmp = 0;
                    $scope.nbRedCard = 0;
                    
                    $scope.title = 'stats.resumeTab.'+$scope.label;
                    
                    getStats($scope.ownersId, $scope.startDate, $scope.endDate, $scope.values).then(function (result) {
                        $scope.nbYellowCard = result.nbYellowCard;
                        $scope.nbExclTmp = result.nbExclTmp;
                        $scope.nbRedCard = result.nbRedCard;
                    });
                }
            },
            templateUrl: 'app/components/directives/stats/hand/sanction.html'
        };
    });
}());