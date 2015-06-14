/**
 * Unavailable effective directive<br />
 *
 * @author Xavier MARIN
 * @class qaobee.directives.widget.unavailableEffective
 * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
 *
 */

angular.module('unavailableEffectiveWidget', ['structureCfgRestAPI', 'userMetaAPI', 'statAPI', 'ngTable'])

    .directive("unavailableEffective", function ($translatePartialLoader, structureCfgRestAPI, $log, userMetaAPI, ngTableParams, $filter, statAPI, $location) {
        return {
            restrict: 'E',
            scope: {
                effective: "=",
                meta: "="
            },
            controller: function ($scope) {
                $translatePartialLoader.addPart('stats');
                $translatePartialLoader.addPart('widgets');
                $scope.effectiveData = [];

                $scope.tableIndispo = new ngTableParams({
                    page: 1,            // show first page
                    count: 3,          // count per page
                    filter: {},
                    sorting: {
                        name: 'asc'     // initial sorting
                    }
                }, {
                    total: function () {
                        return $scope.effectiveData.length;
                    },
                    getData: function ($defer, params) {
                        params.total($scope.effectiveData.length);
                        var orderedData = params.sorting() ? $filter('orderBy')($scope.effectiveData, params.orderBy()) : $scope.effectiveData;
                        $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                    }
                });
                $scope.$watch('effective', function (newValue, oldValue) {
                        if (!angular.equals(newValue, oldValue)) {
                            $scope.effectiveData = [];
                            newValue.forEach(function (a) {
                                if (angular.isUndefined(a.status)) {
                                    userMetaAPI.getUserById(a._id).success(function (data) {
                                        if (data.status.availability.value === "unavailable") {
                                            $scope.effectiveData.push(data);
                                            $scope.tableIndispo.reload();
                                        }
                                    });
                                } else {
                                    if (a.status.availability.value === "unavailable") {
                                        $scope.effectiveData.push(a);
                                    }
                                }
                            });
                            $scope.tableIndispo.reload();
                        }
                    }
                );
                $scope.displayPlayerSheet = function (id) {
                    $location.path('/private/playersheet/' + id);
                };
            },
            templateUrl: 'app/components/widgets/unavailableEffective/unavailableEffective.html'
        };
    });