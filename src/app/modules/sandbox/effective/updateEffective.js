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
        $scope.members = [];
        $scope.listCategory = [];
        $scope.persons = [];
        
        /* Retrieve list of categoryAge */
        activityCfgRestAPI.getParamFieldList(moment().valueOf(), $scope.meta.activity._id, $scope.meta.structure.country._id, 'listCategoryAge').success(function (data) {
            $scope.listCategory = data;
            $log.log($scope.listCategory);
        });
            
        /* get SB_Person */
        personRestAPI.getListPersonSandbox($scope.meta.sandbox._id).success(function (data) {
            data.forEach(function (e) {
                if (angular.isDefined(e.status.positionType)) {
                    e.positionType = $filter('translate')('stat.positionType.value.' + e.status.positionType);
                } else {
                    e.positionType = '';
                }
                e.ticket = false;
            });
            $scope.persons = data;
        });
        
        /* get SB_Effective */
        effectiveRestAPI.getEffective($scope.effectiveId).success(function (data) {
            $scope.effective = data;
            $log.log($scope.effective);
            
            var listId = [];
            
            $scope.effective.members.forEach(function (b) {
                if (b.role.code==='player') {
                    listId.push(b.personId);
                }    
            });

            var listField = ['_id', 'name', 'firstname', 'avatar', 'status.positionType'];

            /* retrieve person information */
            personRestAPI.getListPerson(listId, listField).success(function (persons) {

                persons.forEach(function (e) {
                    if (angular.isDefined(e.status.positionType)) {
                        e.positionType = $filter('translate')('stat.positionType.value.' + e.status.positionType);
                    } else {
                        e.positionType = '';
                    }
                    e.ticked = true;
                });

                $scope.members = persons;
            });
        });
        
        $scope.loadPerson = function($query) {
            return $scope.persons.filter(function(person) {
                return person.name.toLowerCase().indexOf($query.toLowerCase()) != -1;
            });
        };
        
        /* update effective */
        $scope.writeEffective = function () {
            
            $log.debug($scope.effective);
            var category = {};
            $scope.listCategory.forEach(function (c) {
                if (c.code===$scope.effective.categoryAge.code) {
                    category = c;
                }    
            });
            
            $scope.effective.categoryAge = category;
            effectiveRestAPI.update($scope.effective).success(function (person) {
                toastr.success($filter('translate')('updateEffective.toastSuccess', {
                    effective: $scope.effective.categoryAge.label
                }));

                $location.path('private/effective');
            });
        };
    })
    //
    ;
}());
