(function () {
    'use strict';
    /**
     * Module dashboard effective
     *
     * @author Christophe Kervella
     * @class qaobee.modules.sandbox.effective.addEffective
     * @namespace qaobee.modules.sandbox.effective
     *
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.addEffective', [
        
        /* qaobee Rest API */
        'activityCfgRestAPI',
        'effectiveRestAPI', 
        'personRestAPI',
        'userRestAPI'])


        .config(function ($routeProvider, metaDatasProvider) {

            $routeProvider.when('/private/addEffective/:sandBoxCfgId', {
                controller: 'AddEffectiveControler',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/sandbox/effective/writeEffective.html'

            });
        })

    /**
     * @class qaobee.modules.sandbox.effective.AddEffectiveControler
     * @description Main controller for view addEffective.html
     */
        .controller('AddEffectiveControler', function ($log, $scope, $window, $routeParams, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, 
                                                        activityCfgRestAPI, effectiveRestAPI, personRestAPI, userRestAPI) {

        $translatePartialLoader.addPart('commons');
        $translatePartialLoader.addPart('effective');
        $translatePartialLoader.addPart('stats');
        
        $scope.sandBoxCfgId = $routeParams.sandBoxCfgId;

        $scope.user = user;
        $scope.meta = meta;
        $scope.effective = {};
        if(user.newEffective){
            $scope.effective = user.newEffective;
        }
        $scope.listCategory = [];
        $scope.persons = [];
        $scope.selectedPlayers = []; 
        
        $scope.addEffectiveTitle = true;
        // return button
        $scope.doTheBack = function() {
            if(user.newEffective){
                delete user.newEffective;
                user.effectiveDefault = user.previousEffectiveDefault;
                delete user.previousEffectiveDefault;
            }
            $window.history.back();
        };
        
        /* Retrieve list of categoryAge */
        $scope.getListCategoryAge = function () {
            activityCfgRestAPI.getParamFieldList(moment().valueOf(), $scope.meta.activity._id, $scope.meta.structure.country._id, 'listCategoryAge').success(function (data) {
                $scope.listCategory = data.sortBy(function(n) {
                        return n.order; 
                    });
            });
        };
            
        /* get SB_Person */
        $scope.getListPersonSandbox = function () {
            personRestAPI.getListPersonSandbox($scope.meta.sandbox._id).success(function (data) {
                data.forEach(function (e) {
                    if (angular.isDefined(e.status.positionType)) {
                        e.positionType = $filter('translate')('stats.positionType.value.' + e.status.positionType);
                    } else {
                        e.positionType = '';
                    }
                    e.ticket = false;
                });
                $scope.persons = data;
            }); 
        };
        
        /* Add player  */
        $scope.onClickAddPlayer = function () {
            if(!$scope.effectiveCaracterSection.$valid) { 
                $scope.effectiveCaracterSection.effectiveLabel.$setDirty();
                $scope.effectiveCaracterSection.effectiveCategoryAge.$setDirty();
            } else {
                user.newEffective = $scope.effective;
                user.previousEffectiveDefault = user.effectiveDefault;
                user.effectiveDefault = 'EFFECTIVE-TEMPO';
                $location.path('private/addPlayer/'+meta._id);
            }
        }
            
        /* add effective */
        $scope.writeEffective = function () {
            
            if(user.newEffective){
                delete user.newEffective;
                delete user.previousEffectiveDefault;
            }
            
            var category = {};
            $scope.listCategory.forEach(function (c) {
                if (c.code===$scope.effective.categoryAge.code) {
                    category = c;
                }    
            });
            
            $scope.effective.categoryAge = category;
            $scope.effective.sandBoxCfgId = $scope.sandBoxCfgId;
            effectiveRestAPI.add($scope.effective).success(function (effective) {
                toastr.success($filter('translate')('addEffective.toastSuccess', {
                    effective: $scope.effective.categoryAge.label
                }));
                
                $location.path('private/effective/'+effective._id);
            });
        };
        
        /* Update effective list member*/
        $scope.changed = function(item) {
            if (!angular.isDefined($scope.effective.members)) {
               $scope.effective.members = [];
            }
            if(item.checked) {
                var roleMember = {code : 'player', label: 'Joueur'};
                var member = {personId : item._id, role: roleMember};
                $scope.effective.members.push(member);
            } else {
                $scope.effective.members.remove(function(n) {
                    return n.personId === item._id; 
                });
            }
        };
        
        /* check user connected */
        $scope.checkUserConnected = function () {
            
            userRestAPI.getUserById(user._id).success(function (data) {
                $scope.getListCategoryAge();
                $scope.getListPersonSandbox();
            }).error(function (data) {
                $log.error('AddEffectiveControler : User not Connected');
            });
        }; 
        
        /* Primary, check if user connected */
        $scope.checkUserConnected();
    })
    //
    ;
}());
