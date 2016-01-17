(function () {
    'use strict';
    /**
     * Module add player
     *
     * @author Christophe Kervella
     * @class qaobee.modules.sandbox.effective.player.viewPlayer
     * @namespace qaobee.modules.sandbox.effective.player
     *
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.viewPlayer', [
        
        /* qaobee Rest API */
        'effectiveRestAPI', 
        'personRestAPI',
        'userRestAPI'])


        .config(function ($routeProvider, metaDatasProvider) {

            $routeProvider.when('/private/viewPlayer/:playerId', {
                controller: 'ViewPlayerControler',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/sandbox/effective/players/viewPlayer.html'

            });
        })

    /**
     * @class qaobee.modules.sandbox.effective.ViewPlayerControler
     * @description Main controller for view viewPlayer.html
     */
        .controller('ViewPlayerControler', function ($log, $scope, $document, $timeout, $routeParams, $window, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, 
                                                      effectiveRestAPI, personRestAPI, userRestAPI) {

        $translatePartialLoader.addPart('commons');
        $translatePartialLoader.addPart('effective');
        $translatePartialLoader.addPart('stats');
        
        $scope.playerId = $routeParams.playerId;

        $scope.user = user;
        $scope.meta = meta;
        $scope.player = {};
        $scope.mapShow = false;
        
        
        
        
        // return button
        $scope.doTheBack = function() {
            $window.history.back();
        };
        
        $scope.openMap = function () {
            $timeout(function () {
                var myLatLng = new google.maps.LatLng($scope.player.address.lat,$scope.player.address.lng);
                var myOptions = {
                    zoom: 16,
                    center: myLatLng,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                $scope.map = ($document.find('#ngMapPlayer'))[0];
                $scope.map = new google.maps.Map($scope.map, myOptions);
                google.maps.event.trigger($scope.map, 'resize');
                /*
                var marker = new google.maps.Marker({
                    position: myLatLng,
                    map: map,
                    title: $scope.player.address.formatedAddress
                });
                */
            }, 0);
            
            $('#mapPlayer').openModal();    
        };
        
        /* get person */
        $scope.getPerson = function () {
            personRestAPI.getPerson($scope.playerId).success(function (person) {
                $scope.player = person;

                if (angular.isDefined($scope.player.status.positionType)) {
                        $scope.player.positionType = $filter('translate')('stats.positionType.value.' + $scope.player.status.positionType);
                } else {
                    $scope.player.positionType = '';
                }

                if (angular.isDefined($scope.player.status.stateForm)) {
                    $scope.player.stateForm = $filter('translate')('stats.stateForm.value.' + $scope.player.status.stateForm);
                } else {
                    $scope.player.stateForm = '';
                }
                
                if(angular.isDefined($scope.player.address)) {
                    $scope.mapShow = true;
                }

                //$scope.player.birthdate = $filter('date')($scope.player.birthdate, 'yyyy');
                $scope.player.age = moment().format('YYYY') - moment($scope.player.birthdate).format('YYYY');
            });
        };
        
        /* check user connected */
        $scope.checkUserConnected = function () {
            
            userRestAPI.getUserById(user._id).success(function (data) {
                $scope.getPerson();
            }).error(function (data) {
                $log.error('ViewPlayerControler : User not Connected');
            });
        }; 
        
        /* Primary, check if user connected */
        $scope.checkUserConnected();
    })
    //
    ;
}());
