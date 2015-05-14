/**
 * First connection wizard
 *
 * @author Xavier MARIN
 * @class qaobee.prive.firtsConnectWizzard
 * @requires {@link qaobee.tools.eventbus|qaobee.tools.eventbus}
 * @requires {@link qaobee.rest.prive.organization.structure.StructureCfgRestAPI|qaobee.rest.prive.organization.structure.StructureCfgRestAPI}
 * @requires {@link qaobee.rest.public.userMetaAPI|qaobee.rest.public.userMetaAPI}
 *
 * @copyright <b>QaoBee</b>.
 */
angular.module('firstConnectWizzard', ['widget.structure', 'structureCfgRestAPI', 'userMetaAPI' ])

    .config(function ($routeProvider) {
        $routeProvider.when('/firstconnection', {
            controller: 'FirstConnectCtrl',
            templateUrl: 'templates/prive/wizards/firstConnexion.html'
        });
    })

    .controller('FirstConnectCtrl', function ($scope, $location, eventbus, $rootScope, $log, WizardHandler, structureCfgRestAPI, userMetaAPI) {
        $scope.categories = Array.create();
        $scope.selectedPlan = {};
        $scope.user = {};

        $rootScope.$watch(function () {
            return $rootScope.user;
        }, function (newValue, oldValue) {
            if (angular.isDefined(newValue)) {
                $scope.user = newValue;
            }
        });

        $scope.selectPlan = function (plan) {
            $scope.selectedPlan = plan;
            $scope.season = $rootScope.season;
            structureCfgRestAPI.getCategoriesAgeStrList($rootScope.season.code,  $scope.selectedPlan.structure._id).success(function (data) {
                $scope.categories = data;
            });
            WizardHandler.wizard().next();
        };

        $scope.selectCat = function(cat) {
            $scope.selectedCat = cat;
            angular.forEach( $scope.selectedCat.listStaffMember, function(member, key) {
                userMetaAPI.getUserById(member.personId).success(function (data) {
                    $scope.selectedCat.listStaffMember[key].member = data;
                });
            });
            WizardHandler.wizard().next();
        };

        $scope.$on('$destroy', function () {
            delete $scope.user;
            delete $scope.selectedPlan;
            delete $scope.categories;
            delete $scope.selectedCat;
        });
    })
//
;
