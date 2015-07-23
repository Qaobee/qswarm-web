(function () {
    'use strict';
    /**
     * Module dashboard effective
     *
     * @author Christophe Kervella
     * @class qaobee.modules.sandbox.effective.mainEffective
     * @namespace qaobee.prive.sandbox.effective
     *
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.effective', [
        
        /* qaobee Rest API */
        'effectiveRestAPI', 
        'personRestAPI'])


        .config(function ($routeProvider, metaDatasProvider) {

            $routeProvider.when('/private/effective', {
                controller: 'MainEffectiveControler',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/sandbox/effective/mainEffective.html'

            });
        })

    /**
     * @class qaobee.modules.sandbox.effective.MainEffectiveControler
     * @description Main controller for view mainEffective.html
     */
        .controller('MainEffectiveControler', function ($log, $scope, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, effectiveRestAPI, personRestAPI) {

        $translatePartialLoader.addPart('main');
        $translatePartialLoader.addPart('players');
        $translatePartialLoader.addPart('stats');

        $scope.user = user;
        $scope.meta = meta;
        $scope.effective = [];
        $scope.currentCategory = {};

        $('.collapsible').collapsible({accordion : false});


        /* Retrieve list player */
        $scope.getEffective = function () {

            effectiveRestAPI.getListMemberEffective($scope.meta._id, $scope.currentCategory.code).success(function (data) {
                
                /* build list id for request API person */   
                var listId = [];
                data.forEach(function (a) {
                    a.members.forEach(function (b) {
                        if (b.role.code==='player') {
                            listId.push(b.personId);
                        }    
                    });
                });

                var listField = ['_id', 'name', 'firstname', 'avatar', 'status', 'birthdate'];

                /* retrieve person information */
                personRestAPI.getListPerson(listId, listField).success(function (data) {

                    data.forEach(function (e) {
                        if (angular.isDefined(e.status.positionType)) {
                            e.positionType = $filter('translate')('stat.positionType.value.' + e.status.positionType);
                        } else {
                            e.positionType = '';
                        }

                        if (angular.isDefined(e.status.stateForm)) {
                            e.stateForm = $filter('translate')('stat.stateForm.value.' + e.status.stateForm);
                        } else {
                            e.stateForm = '';
                        }

                        e.birthdate = $filter('date')(e.birthdate, 'yyyy');
                        e.age = moment().format("YYYY") - e.birthdate;
                    });

                    $scope.effective = data;
                });
            });

        };
        
        $scope.getEffective();
    })
    //
    ;
}());

