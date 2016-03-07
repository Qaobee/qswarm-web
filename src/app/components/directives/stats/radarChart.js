(function () {
  'use strict';
  angular.module('qaobee.radar', [
      'chart.js',
      'statsRestAPI'
    ])

    .directive('qaobeeRadarChart', function (statsRestAPI, $log, $q, $filter, $translatePartialLoader) {
      return {
        restrict: 'E',
        scope: {
          indicators: '=',
          owners: '=',
          startDate: '=',
          endDate: '=',
          title: '@'
        },
        controller : function($scope) {
          $translatePartialLoader.addPart('stats');
          $scope.rgbaColors = Array.create({
            fillColor: "rgba(3, 169, 244, 0.2)",
            strokeColor: "rgba(3, 169, 244, 1)",
            pointColor: "rgba(3, 169, 244, 1)",

            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(3, 169, 244, 0.8)"
          }, {
            fillColor: "rgba(15, 157, 88, 0.2)",
            strokeColor: "rgba(15, 157, 88, 1)",
            pointColor: "rgba(15, 157, 88, 1)",

            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(15, 157, 88, 0.8)"
          }, {
            fillColor: "rgba(255, 87, 34, 0.2)",
            strokeColor: "rgba(255, 87, 34, 1)",
            pointColor: "rgba(255, 87, 34, 1)",

            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(255, 87, 34, 0.8)"
          });
        },
        link: function ($scope) {
          $scope.$watchGroup(['indicators', 'owners', 'startDate', 'endDate', 'title'], function (n, o, scope) {
            if (!!$scope.startDate && !!$scope.endDate) {
              scope.buildDatas();
            }
          });
          $scope.stats = {};

          $scope.buildDatas = function () {
            $scope.loading = true;
            $scope.data = [];
            $scope.dataTmp = [];
            $scope.series = $scope.owners.map(function (p) {
              return p.firstname + ' ' + p.name;
            });
            $scope.labels = $scope.indicators.map(function(i) {
              return $filter('translate')('stats.label.'+ i);
            });
            var search = {
              listIndicators: $scope.indicators,
              listOwners: $scope.owners.map(function (p) {
                return p._id;
              }),
              startDate: $scope.startDate.valueOf(),
              endDate: $scope.endDate.valueOf(),
              aggregat: "COUNT",
              listFieldsGroupBy: ['code']
            };
            var promises = [];
            $scope.owners.forEach(function (p) {
              var tSearch = angular.copy(search);
              tSearch.listOwners = Array.create(p._id);
              $scope.stats[p._id] = {};
              promises.push(statsRestAPI.getStatGroupBy(tSearch).success(function (data, status, headers, config) {
                if (angular.isArray(data) && data.length > 0) {
                  angular.forEach(data, function (value) {
                    $scope.stats[config.data.listOwners[0]][value._id.code] = value.value;
                  });
                }
              }));
            });

            $q.all(promises).then(function () {
              $scope.owners.map(function (p) {
                return p._id;
              }).forEach(function(id) {
                var datas = [];
                $scope.indicators.forEach(function (i) {
                  if (!$scope.stats[id]) {
                    datas.push(0);
                  } else {
                    if (!$scope.stats[id][i]) {
                      datas.push(0);
                    } else {
                      datas.push($scope.stats[id][i]);
                    }
                  }

                });
                $scope.data.push(datas);
              });
              $scope.loading = false;
            });
          };
        },
        templateUrl: 'app/components/directives/stats/radarChart.html'
      };
    });
})();