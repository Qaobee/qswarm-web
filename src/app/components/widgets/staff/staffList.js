/**
 * Created by b3605 on 31/10/14.
 */
/**
 * Staff list directive<br />
 *
 * @author Xavier MARIN
 * @class qaobee.directives.widget.staffListWidget
 * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
 *
 */
angular.module('staffListWidget', ['structureCfgRestAPI', 'userMetaAPI', 'ngTable'])

    .directive("staffListWidget", ['structureCfgRestAPI', '$rootScope', '$log', 'userMetaAPI', 'ngTableParams', '$filter', '$q', function (structureCfgRestAPI, $rootScope, $log, userMetaAPI, NgTableParams, $filter, $q) {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                category: "=",
                group: "=",
                color: '=?',
                height: '=?'
            },
            controller: function ($scope, $element, $location) {
                var statCell = $element.children(1).children(1).children(1).children(1).children(1);
                var statPanel = $element.children(1).children(1).children(1).children(1);
                var staffprom = $q.defer();
                $scope.staffprom = staffprom.promise;
                $scope.staff = [];
                $scope.flipped = false;
                $scope.color = $scope.color || 'muted';
                $scope.height = $scope.height || Math.min(statCell.outerHeight(), 120);
                $scope.toggle = function () {
                    $scope.flipped = !$scope.flipped;
                };

                $scope.flipFront = function () {
                    $scope.flipped = false;
                };

                $scope.flipBack = function () {
                    $scope.flipped = true;
                };

                $scope.tableParams = new NgTableParams({
                    page: 1,            // show first page
                    count: 10,          // count per page
                    filter: {}
                }, {
                    total: function () {
                        return $scope.staff.length;
                    },
                    counts: [],
                    getData: function ($defer, params) {
                        var filteredData = $scope.staff;
                        var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
                        $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                    }
                });

                $scope.$watch('category', function (newValue, oldValue) {
                    if (angular.isDefined($scope.category)) {
                        $scope.staff = [];
                        $scope.category.listStaffMember.forEach(function (value) {
                            if (value.personId !== null) {
                                $scope.staff.push(value);
                                userMetaAPI.getUserById(value.personId).success(function (data) {
                                    value.user = data;
                                    value.roleLabel = value.role.label;
                                    value.firstname = data.firstname;
                                    value.name = data.name;
                                    angular.element('.flip').height(angular.element('.stat-panel').outerHeight());
                                    $element.children(1).height(statPanel.outerHeight());
                                });
                            }
                        });
                        $scope.tableParams.reload();
                    }
                });
                $scope.$watch('group', function (newValue, oldValue) {
                    if (!angular.equals(newValue, oldValue)) {
                        if (angular.isDefined($scope.group.listStaffMember)) {
                            $scope.staff = [];
                            $scope.group.listStaffMember.forEach(function (value) {
                                if (value.personId !== null) {
                                    $scope.staff.push(value);
                                    userMetaAPI.getUserById(value.personId).success(function (data) {
                                        value.user = data;
                                        value.firstname = data.firstname;
                                        value.name = data.name;
                                        value.roleLabel = value.role.label;
                                        angular.element('.flip').height(angular.element('.stat-panel').outerHeight());
                                        $scope.tableParams.reload();
                                        $element.children(1).height(statPanel.outerHeight());
                                    });
                                }
                            });
                            $scope.tableParams.reload();
                        }
                        
                    }
                });

                $scope.displayPlayerSheet = function (id) {
                    $location.path('/private/playersheet/' + id);
                };
            },
            templateUrl: 'templates/directives/widgets/staffList.html'
        };
    }]);