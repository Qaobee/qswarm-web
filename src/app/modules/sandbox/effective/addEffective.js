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
        'personRestAPI'])


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
        .controller('AddEffectiveControler', function ($log, $scope, $routeParams, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, 
                                                        activityCfgRestAPI, effectiveRestAPI, personRestAPI) {

        $translatePartialLoader.addPart('commons');
        $translatePartialLoader.addPart('effective');
        $translatePartialLoader.addPart('stats');
        
        $scope.sandBoxCfgId = $routeParams.sandBoxCfgId;

        $scope.user = user;
        $scope.meta = meta;
        $scope.effective = {};
        $scope.members = [];
        $scope.listCategory = [];
        $scope.positionsType = [];
        $scope.persons = [];
        
        $scope.addEffectiveTitle = true;
        
        /* Retrieve list of categoryAge */
        activityCfgRestAPI.getParamFieldList(moment().valueOf(), $scope.meta.activity._id, $scope.meta.structure.country._id, 'listCategoryAge').success(function (data) {
            $scope.listCategory = data;
        });
        
        /* Retrieve list of positions type */
        activityCfgRestAPI.getParamFieldList(moment().valueOf(), $scope.meta.activity._id, $scope.meta.structure.country._id, 'listPositionType').success(function (data) {
            $scope.positionsType = data.sortBy(function(n) {
              return n.order; 
            });
        });
            
        /* get SB_Person */
        personRestAPI.getListPersonSandbox($scope.meta.sandbox._id).success(function (data) {
            var listP = data.groupBy(function(a) {
              return a.status.positionType; 
            });
            
            $scope.positionsType.forEach(function (a) {
                $scope.persons.add({
                    name: '<span class=" row red lighten-1 white-text">'+a.label+'</span>',
                    msGroup: true
                });
                var membres = listP[a.code];
                membres.forEach(function (b) {
                    $scope.persons.add({
                        name: b.name,
                        firstname: b.firstname,
                        ticked: false
                    });
                });
            });
        });
        
        $scope.loadPerson = function($query) {
            return $scope.persons.filter(function(person) {
                return person.name.toLowerCase().indexOf($query.toLowerCase()) != -1;
            });
        };
        
        /* add effective */
        $scope.writeEffective = function () {
            
            var category = {};
            $scope.listCategory.forEach(function (c) {
                if (c.code===$scope.effective.categoryAge.code) {
                    category = c;
                }    
            });
            
            $scope.effective.categoryAge = category;
            $scope.effective.sandBoxCfgId = $scope.sandBoxCfgId;
            effectiveRestAPI.add($scope.effective).success(function (person) {
                toastr.success($filter('translate')('addEffective.toastSuccess', {
                    effective: $scope.effective.categoryAge.label
                }));

                $location.path('private/effective');
            });
        };


    })
    //
    ;
}());
