(function () {
    'use strict';
    /**
     * Module dashboard effective
     *
     * @author Christophe Kervella
     * @class qaobee.modules.sandbox.effective.updateEffective
     * @namespace qaobee.modules.sandbox.effective
     *
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.updateEffective', [
        
        /* qaobee Rest API */
        'activityCfgRestAPI',
        'effectiveRestAPI', 
        'personRestAPI'])


        .config(function ($routeProvider, metaDatasProvider) {

            $routeProvider.when('/private/updateEffective/:effectiveId', {
                controller: 'UpdateEffectiveControler',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/sandbox/effective/writeEffective.html'

            });
        })

    /**
     * @class qaobee.modules.sandbox.effective.UpdateEffectiveControler
     * @description Main controller for view updateEffective.html
     */
        .controller('UpdateEffectiveControler', function ($log, $scope, $routeParams, $http, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, 
                                                           activityCfgRestAPI, effectiveRestAPI, personRestAPI) {

        $translatePartialLoader.addPart('commons');
        $translatePartialLoader.addPart('effective');
        $translatePartialLoader.addPart('stats');

        $scope.effectiveId = $routeParams.effectiveId;
        $scope.addEffectiveTitle = false;
        
        $scope.user = user;
        $scope.meta = meta;
        $scope.effective = {};
        $scope.listCategory = [];
        $scope.persons = [];
        $scope.selectedPlayers = []; 
        
        /* get SB_Effective */
        effectiveRestAPI.getEffective($scope.effectiveId).success(function (data) {
            $scope.effective = data;
            $scope.getPersonSandBox();
        });
        
        /* Retrieve list of categoryAge */
        activityCfgRestAPI.getParamFieldList(moment().valueOf(), $scope.meta.activity._id, $scope.meta.structure.country._id, 'listCategoryAge').success(function (data) {
            $scope.listCategory = data;
        });
            
        /* get SB_Person */
        $scope.getPersonSandBox = function () {
            personRestAPI.getListPersonSandbox($scope.meta.sandbox._id).success(function (data) {
                data.forEach(function (a) {
                    if (angular.isDefined(a.status.positionType)) {
                        a.positionType = $filter('translate')('stat.positionType.value.' + a.status.positionType);
                    } else {
                        a.positionType = '';
                    }

                    a.checked=false;
                    var trouve = $scope.effective.members.find(function(n) {
                        return n['personId'] == a._id; 
                    });
                    
                    if(angular.isDefined(trouve)) {
                        a.checked=true;
                    }
                });
                $scope.persons = data.sortBy(function(n) {
                    return n.name; 
                });
            });            
        };

        /* update effective */
        $scope.writeEffective = function () {
            $scope.listCategory.forEach(function (c) {
                if (c.code===$scope.effective.categoryAge.code) {
                    $scope.effective.categoryAge =  c;
                }    
            });
            
            effectiveRestAPI.update($scope.effective).success(function (person) {
                toastr.success($filter('translate')('updateEffective.toastSuccess', {
                    effective: $scope.effective.categoryAge.label
                }));

                $location.path('private/effective/'+$scope.user.effectiveDefault);
            });
        };
        
        /* Update effective list member*/
        $scope.changed = function(item) {
            if(item.checked) {
                var roleMember = {code : 'player', label: 'Joueur'};
                var member = {personId : item._id, role: roleMember};
                $scope.effective.members.push(member);
            } else {
                $scope.effective.members.remove(function(n) {
                    return n['personId'] == item._id; 
                });
            }
        };
    })
    //
    ;
}());
