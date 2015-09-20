(function () {
    'use strict';
    /**
     * Module dashboard effective
     *
     * @author Christophe Kervella
     * @class qaobee.modules.sandbox.effective.mainEffective
     * @namespace qaobee.modules.sandbox.effective
     *
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     * @requires {@link qaobee.modules.sandbox.effective.addEffective|qaobee.modules.sandbox.effective.addEffective}
     * @requires {@link qaobee.modules.sandbox.effective.updateEffective|qaobee.modules.sandbox.effective.updateEffective}
     * @requires {@link qaobee.modules.sandbox.effective.players.addPlayer|qaobee.modules.sandbox.effective.players.addPlayer}
     * @requires {@link qaobee.modules.sandbox.effective.players.updatePlayer|qaobee.modules.sandbox.effective.players.updatePlayer}
     * @requires {@link qaobee.modules.sandbox.effective.players.viewPlayer|qaobee.modules.sandbox.effective.players.viewPlayer}
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.effective', [
        /* angular qaobee */
        'ngAutocomplete',
        
        /* qaobee modules */
        'qaobee.addEffective',
        'qaobee.updateEffective',
        'qaobee.addPlayer',
        'qaobee.updatePlayer',
        'qaobee.viewPlayer',
        'qaobee.addTeam',
        'qaobee.updateTeam',
        
        /* qaobee Rest API */
        'effectiveRestAPI', 
        'personRestAPI',
        'teamRestAPI',
        'userRestAPI'])


        .config(function ($routeProvider, metaDatasProvider) {
        
            $('.dropdown-button').dropdown();

            $routeProvider.when('/private/effective/:effectiveId', {
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
        .controller('MainEffectiveControler', function ($log, $scope, $routeParams, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, 
                                                         effectiveRestAPI, personRestAPI, teamRestAPI, userRestAPI) {

        $translatePartialLoader.addPart('effective');
        $translatePartialLoader.addPart('stats');
        $translatePartialLoader.addPart('commons');
        
        $scope.effectiveId = $routeParams.effectiveId;
        $scope.user.effectiveDefault = $scope.effectiveId;

        $scope.user = user;
        $scope.meta = meta;
        $scope.players = [];
        $scope.effectives = [];
        $scope.currentEffective = {};
        $scope.currentCategory = null;
        $scope.listEventType = {};
        $scope.listTeamHome = {};
        
        /* Retrieve list of team of effective */
        $scope.getListTeamHome = function () {
            teamRestAPI.getListTeam($scope.meta.sandbox._id, $scope.effectiveId, 'all', 'false').success(function (data) {
                $scope.listTeamHome = data.sortBy(function(n) {
                        return n.label; 
                    });
            });
        }; 
        
        /* Retrieve list of adversary of effective */
        $scope.getListTeamAdversary = function () {
            teamRestAPI.getListTeam($scope.meta.sandbox._id, $scope.effectiveId, 'all', 'true').success(function (data) {
                $scope.listTeamAdversary = data.sortBy(function(n) {
                    return n.label; 
                });
            });
        }; 
        
        /* Retrieve list effective */
        $scope.getEffectives = function () {
            
            effectiveRestAPI.getListMemberEffective($scope.meta._id, $scope.currentCategory).success(function (data) {
                $scope.effectives = data.sortBy(function(n) {
                    return n.label; 
                });
                
                /* retrieve the current effective */ 
                data.forEach(function (a) {
                    if(a._id===$scope.effectiveId) {
                        $scope.currentEffective = a;
                    } 
                });
                
                $scope.getEffective();
            });
        };                                                                                                

        /* Retrieve current effective and list player */
        $scope.getEffective = function () {
                
            if(angular.isDefined($scope.currentCategory)) {
                /* build list id for request API person */   
                var listId = [];
                
                $scope.currentEffective.members.forEach(function (b) {
                    if (b.role.code==='player') {
                        listId.push(b.personId);
                    }    
                });

                var listField = ['_id', 'name', 'firstname', 'avatar', 'status', 'birthdate', 'contact'];

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

                    $scope.players = data;
                });
            }
        };
        
        /* check user connected */
        $scope.checkUserConnected = function () {
            
            userRestAPI.getUserById(user._id).success(function (data) {
                $scope.getEffectives();
                $scope.getListTeamHome();
                $scope.getListTeamAdversary();
            }).error(function (data) {
                $log.error('MainEffectiveControler : User not Connected')
            });
        }; 
        
        /* Primary, check if user connected */
        $scope.checkUserConnected();
        
        
    })
    //
    ;
}());

