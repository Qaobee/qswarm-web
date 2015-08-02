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
        'effectiveRestAPI', 
        'personRestAPI'])


        .config(function ($routeProvider, metaDatasProvider) {

            $routeProvider.when('/private/updateEffective/:effectiveId', {
                controller: 'UpdateEffectiveControler',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/sandbox/effective/updateEffective.html'

            });
        })

    /**
     * @class qaobee.modules.sandbox.effective.UpdateEffectiveControler
     * @description Main controller for view updateEffective.html
     */
        .controller('UpdateEffectiveControler', function ($log, $scope, $routeParams, $http, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, effectiveRestAPI, personRestAPI) {

        $translatePartialLoader.addPart('commons');
        $translatePartialLoader.addPart('effective');
        $translatePartialLoader.addPart('stats');

        $scope.effectiveId = $routeParams.effectiveId;
        
        $scope.user = user;
        $scope.meta = meta;
        $scope.effective = {};
        $scope.members = [];
        $scope.currentCategory = {};
        $scope.persons = [];
            
        /* get SB_Person */
        personRestAPI.getListPersonSandbox($scope.meta.sandbox._id).success(function (data) {
            $scope.persons = data;
        });
        
        /* get SB_Effective */
        effectiveRestAPI.getEffective($scope.effectiveId).success(function (data) {
            $scope.effective = data;
            var listId = [];
            
            $scope.currentCategory = $scope.effective.categoryAge;
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
                });

                $scope.members = persons;
                $log.log($scope.members);
            });
        });
        
        $scope.loadPerson = function($query) {
            return $scope.persons.filter(function(person) {
                return person.name.toLowerCase().indexOf($query.toLowerCase()) != -1;
            });
        };
    })
    //
    ;
}());
