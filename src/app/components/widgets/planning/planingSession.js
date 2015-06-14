/**.
 * Created by mohamed .
 */
/**
 * Planing session directive<br />
 * 
 * @author Mohamed EL MARZGIOUI
 * @class qaobee.directives.widget.planingSession
 * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
 * 
 */
angular.module('planingSessionWidget', ['sessionRestAPI'])

.directive('planing', function($translatePartialLoader, structureCfgRestAPI, $log, sessionRestAPI, ngTableParams, $filter, statAPI, $rootScope, $location) {
  return {
   
          restrict: 'E',
          scope: {
              customerInfo: '=info'
            },
          controller: function($scope) {
              $scope.planingData =[];
              $scope.tablePlaning = new ngTableParams({
                  page: 1,            // show first page
                  count: 3,          // count per page
                  filter: {},
                  sorting: {
                      name: 'asc'     // initial sorting
                  }
              }, {
                  total: function () {
                      return $scope.planingData.length;
                  },
                  getData: function ($defer, params) {
                      params.total($scope.planingData.length);
                      var orderedData = params.sorting() ? $filter('orderBy')($scope.planingData, params.orderBy()) : $scope.planingData;
                      $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                  }
              });
              sessionRestAPI.getListSession("U19","EL MARZGIOUI").success(function (data) {
                  
                    $scope.planingData.push(data);

              }); 
      
              
          },
     
      templateUrl: 'templates/directives/widgets/planingSession.html'
  };
});
