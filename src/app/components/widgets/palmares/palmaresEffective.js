/**
 * Created by xavier on 03/11/14.
 */
/**
 * palmares effective directive<br />
 *
 * @author Xavier MARIN
 * @class qaobee.directives.widget.palmaresEffective
 * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
 *
 */

angular.module('palmaresEffectiveWidget', ['structureCfgRestAPI', 'personRestAPI', 'statAPI', 'ngTable'])

    .directive('palmaresEffective', function ($translatePartialLoader, structureCfgRestAPI, $log, personRestAPI, ngTableParams, $filter, statAPI, $location) {
        return {
            restrict: 'E',
            scope: {
                effective: "=",
                meta: "="
            },
            controller: function ($scope) {
                $translatePartialLoader.addPart('stats');
                $translatePartialLoader.addPart('widgets');
                
                $scope.goalscored = { title : 'palmaresEffective.stat.goalscored'};
                $scope.playtime = {title : 'palmaresEffective.stat.playtime'};
                $scope.attendance = {title : 'palmaresEffective.stat.attendance'};
                $scope.eventNotePerson = {title : 'palmaresEffective.stat.eventNotePerson'};
                
                $scope.stats = Array.create($scope.goalscored, $scope.playtime, $scope.attendance, $scope.eventNotePerson);

                $scope.$watch('effective', function (newValue, oldValue) {
                        if (!angular.equals(newValue, oldValue)) {
                            var ownersId = $scope.effective.map(function(n) {
                                return n._id;
                            });
                            
                            /* goalscored */
                            var indicators = Array.create('goalscored');
                            var search = {
                                listIndicators: indicators,
                                listOwners: ownersId,
                                startDate: $scope.meta.season.startDate,
                                endDate: $scope.meta.season.endDate,
                                aggregat: "SUM",
                                listFieldsGroupBy: ['code', 'owner'],
                                listFieldsSortBy: [{"fieldName": "value", "sortOrder": -1}],
                                limitResult : 1
                            };
                            
                            statAPI.getStatGroupBy(search).success(function (data) {
                                
                                data.forEach(function (a) {
                                    personRestAPI.getPerson(a._id.owner).success(function (data) {
                                        Object.merge($scope.goalscored, {
                                            owner : data,
                                            value : a.value
                                        });
                                    });
                                });
                            });
                            
                            /* playtime */
                            indicators = Array.create('playtime');
                            search = {
                                listIndicators: indicators,
                                listOwners: ownersId,
                                startDate: $scope.meta.season.startDate,
                                endDate: $scope.meta.season.endDate,
                                aggregat: "SUM",
                                listFieldsGroupBy: ['code', 'owner'],
                                listFieldsSortBy: [{"fieldName": "value", "sortOrder": -1}],
                                limitResult : 1
                            };
                            
                            statAPI.getStatGroupBy(search).success(function (data) {
                                
                                data.forEach(function (a) {
                                    personRestAPI.getPerson(a._id.owner).success(function (data) {
                                        Object.merge($scope.playtime, {
                                            owner : data,
                                            value : a.value + "'"
                                        });
                                    });
                                });
                            });
                            
                            /* eventNotePerson */
                            indicators = Array.create('eventNotePerson');
                            search = {
                                listIndicators: indicators,
                                listOwners: ownersId,
                                startDate: $scope.meta.season.startDate,
                                endDate: $scope.meta.season.endDate,
                                aggregat: "AVG",
                                listFieldsGroupBy: ['code', 'owner'],
                                listFieldsSortBy: [{"fieldName": "value", "sortOrder": -1}],
                                limitResult : 1
                            };
                            
                            statAPI.getStatGroupBy(search).success(function (data) {
                                
                                data.forEach(function (a) {
                                    personRestAPI.getPerson(a._id.owner).success(function (data) {
                                        Object.merge($scope.eventNotePerson, {
                                            owner : data,
                                            value : ((a.value.isInteger())? a.value:$filter('number')(a.value, 2))
                                        });
                                    });
                                });
                            });
                                
                            /* eventNotePerson */
                            indicators = Array.create('attendance');
                            search = {
                                listIndicators: indicators,
                                listOwners: ownersId,
                                startDate: $scope.meta.season.startDate,
                                endDate: $scope.meta.season.endDate,
                                aggregat: "AVG",
                                listFieldsGroupBy: ['code', 'owner'],
                                listFieldsSortBy: [{"fieldName": "value", "sortOrder": -1}],
                                limitResult : 1
                            };
                            
                            statAPI.getStatGroupBy(search).success(function (data) {
                                data.forEach(function (a) {
                                    personRestAPI.getPerson(a._id.owner).success(function (data) {
                                        Object.merge($scope.attendance, {
                                            owner : data,
                                            value : (a.value*100) + " %"
                                        });
                                    });
                                });
                            });
                        }
                    }
                );
                $scope.displayPlayerSheet = function (id) {
                    $location.path('/private/playersheet/' + id);
                };
            },
            templateUrl: 'templates/directives/widgets/palmaresEffective.html'
        };
    });