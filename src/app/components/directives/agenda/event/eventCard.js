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

        .directive('eventCard', function (
            $translatePartialLoader, collecteRestAPI, eventsRestAPI, qeventbus, $document, $timeout, $log, $filter) {
            return {
                restrict: 'E',
                scope: {
                    event: "=",
                    hasCompare: '=?'
                },
                controller: function ($scope) {
                    $translatePartialLoader.addPart('commons').addPart('agenda');
                    $scope.compareList = {};
                    $scope.isCollected = false;
                    $scope.mapShow = false;
                    $scope.icon = '';
                    $scope.color1 = '';
                    $scope.color2 = '';
                    $scope.textColor1 = 'colorMain-text';
                    $scope.textColor2 = 'white-text';
                    $scope.title = '';

                    if ($scope.event.link.type === 'cup') {
                        $scope.icon = 'album';
                        $scope.color1 = 'white';
                        $scope.color2 = 'accent-color';
                        $scope.title = 'mainAgenda.eventType.cup';
                    }

                    if ($scope.event.link.type === 'friendlyGame') {
                        $scope.icon = 'flare';
                        $scope.color1 = 'white';
                        $scope.color2 = 'secondary-color';
                        $scope.title = 'mainAgenda.eventType.friendlyGame';
                    }

                    if ($scope.event.link.type === 'championship') {
                        $scope.icon = 'stars';
                        $scope.color1 = 'white';
                        $scope.color2 = 'dark-primary-color';
                        $scope.title = 'mainAgenda.eventType.championship';
                    }

                    if ($scope.event.link.type === 'training') {
                        $scope.icon = 'timer';
                        $scope.color1 = 'white';
                        $scope.color2 = 'light-blue lighten-1';
                        $scope.title = 'mainAgenda.eventType.training';
                    }

                    if ($scope.event.link.type === 'other') {
                        $scope.icon = 'timer';
                        $scope.color1 = 'white';
                        $scope.color2 = 'orange lighten-1';
                        $scope.title = '';
                    }

                    /* startDate event can be different to startDate Collect */
                    var start = new Date('January 1, 1970, 00:00:00');
                    var requestCollecte = {
                        startDate: start.valueOf(),
                        endDate: moment().valueOf(),
                        sandboxId: $scope.event.owner.sandboxId,
                        eventId: $scope.event._id
                    };

                    collecteRestAPI.getListCollectes(requestCollecte).success(function (data) {
                        if (data && data.length > 0) {
                            $log.debug('getListCollectes', requestCollecte, data);
                            $scope.isCollected = true;
                            $scope.collectId = data[0]._id;
                        }
                    });

                    if (angular.isDefined($scope.event.address) && angular.isDefined($scope.event.address.formatedAddress)) {
                        $scope.mapShow = true;
                    }
                    $scope.updateEventToCompare = function (id) {
                        qeventbus.prepForBroadcast('event.compare', {id: id, value: $scope.compareList[id]});
                    };
                    $scope.openMap = function () {
                        $timeout(function () {
                            var myLatLng = new google.maps.LatLng($scope.event.address.lat, $scope.event.address.lng);
                            var myOptions = {
                                zoom: 16,
                                center: myLatLng,
                                mapTypeId: google.maps.MapTypeId.ROADMAP
                            };
                            $scope.map = ($document.find('#mapEvent-' + $scope.event._id))[0];
                            $scope.map = new google.maps.Map($scope.map, myOptions);
                            new google.maps.Marker({// NOSONAR
                                position: myLatLng,
                                map: $scope.map,
                                title: $scope.event.address.formatedAddress
                            });
                            google.maps.event.trigger($scope.map, 'resize');
                        }, 0);
                        angular.element('#modalEvent-' + $scope.event._id).modal('open');
                    };

                    $scope.delCollect = function (id) {
                        collecteRestAPI.deleteCollect(id).success(function (data) {
                            $log.debug('delCollect', data);
                            qeventbus.prepForBroadcast('event.reload', {});
                            toastr.success($filter('translate')('eventDetail.confirmPopup.toastSuccess'));
                            angular.element('#modalConfirmDelete').modal('close');
                        });
                    };

                    $scope.delEvent = function (id) {
                        eventsRestAPI.deleteEvent(id).success(function (data) {
                            $log.debug('deleteEvent', data);
                            qeventbus.prepForBroadcast('event.reload', {});
                            toastr.success($filter('translate')('eventDetail.confirmPopup.toastSuccess'));
                            angular.element('#modalConfirmDelete').modal('close');
                        });
                    };

                    $scope.delete = function () {
                        angular.element('#modalConfirmDelete-' + $scope.event._id).modal('open');
                    };

                    $scope.closeConfimModale = function () {
                        angular.element('#modalConfirmDelete').modal('close');
                    }

                }, link: function () {
                    angular.element('.modal').modal();
                },
                templateUrl: 'app/components/directives/agenda/event/eventCard.html'
            };
        });
}());