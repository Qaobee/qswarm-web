(function () {
    'use strict';
    /**
     * Created by cke on 15/01/16.
     *
     * event card directive<br />
     *
     * @author christophe Kervella
     * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
     *
     */

    angular.module('eventCard', ['collecteRestAPI'])

        .directive('eventCard', function ($translatePartialLoader, $document, $log, $q, $filter, collecteRestAPI) {
            return {
                restrict: 'E',
                scope: {
                    event: "="
                },
                controller: function ($scope) {
                    $translatePartialLoader.addPart('commons');
                    $translatePartialLoader.addPart('agenda');
                    
                    $scope.isCollected = false;
                    $scope.mapShow = false;
                    
                    $scope.icon ='';
                    $scope.color1 ='';
                    $scope.color2 ='';
                    $scope.textColor1 ='white-text';
                    $scope.textColor2 ='white-text';
                    $scope.title ='';
                    
                    if($scope.event.link.type==='cup'){
                        $scope.icon ='album';
                        $scope.color1 ='red lighten-2';
                        $scope.color2 ='red lighten-1';
                        $scope.title ='mainAgenda.eventType.cup';
                    }
                    
                    if($scope.event.link.type==='friendlyGame'){
                        $scope.icon ='flare';
                        $scope.color1 ='light-green lighten-2';
                        $scope.color2 ='light-green lighten-1';
                        $scope.title ='mainAgenda.eventType.friendlyGame';
                    }
                    
                    if($scope.event.link.type==='championship'){
                        $scope.icon ='stars';
                        $scope.color1 ='white';
                        $scope.color2 ='blue-grey lighten-1';
                        $scope.title ='mainAgenda.eventType.championship';
                        $scope.textColor1 ='blue-grey-text text-darken-2';
                    }
                    
                    if($scope.event.link.type==='training'){
                        $scope.icon ='timer';
                        $scope.color1 ='light-blue lighten-3';
                        $scope.color2 ='light-blue lighten-1';
                        $scope.title ='mainAgenda.eventType.training';
                    }
                    
                    if($scope.event.link.type==='other'){
                        $scope.icon ='timer';
                        $scope.color1 ='orange lighten-2';
                        $scope.color2 ='orange lighten-1';
                        $scope.title ='';
                    }
                    
                    /* startDate event can be different to startDate Collect */
                    var start = new Date('January 1, 1970, 00:00:00');
                    var requestCollecte = {
                        startDate : start.valueOf(),
                        endDate : moment().valueOf(),
                        sandboxId : $scope.event.owner.sandboxId,
                        eventId : $scope.event._id
                    };

                    collecteRestAPI.getListCollectes(requestCollecte).success(function (data) {
                        if(data && data.length>0){
                            $scope.isCollected = true;
                            $scope.collectId = data[0]._id;
                        }
                    });
                    
                    if(angular.isDefined($scope.event.address.formatedAddress)) {
                        $scope.mapShow = true;
                    }
                    
                    $scope.openMap = function () {
                        $log.debug('$scope.map',$scope.map);
                        var myLatLng = new google.maps.LatLng($scope.event.address.lat,$scope.event.address.lng);
                        var myOptions = {
                            zoom: 16,
                            center: myLatLng,
                            mapTypeId: google.maps.MapTypeId.ROADMAP
                        };
                        $scope.map = ($document.find('#mapEvent-'+$scope.event._id))[0];
                        $scope.map = new google.maps.Map($scope.map, myOptions);
                        google.maps.event.trigger($scope.map, 'resize');
                        /*
                        var marker = new google.maps.Marker({
                            position: myLatLng,
                            map: map,
                            title: $scope.event.address.formatedAddress
                        });
                        */

                        $('#modalEvent-'+$scope.event._id).openModal();    
                    };
                },
                templateUrl: 'app/components/directives/agenda/eventCard.html'
            };
        });
}());