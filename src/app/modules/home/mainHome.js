(function () {
    'use strict';
    /**
     * Module Gérant la partie publique du site
     *
     * @class qaobee.modules.home.mainHome
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     * @requires {@link https://docs.angularjs.org/api/ngRoute|ngRoute}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     * @requires {@link qaobee.components.widgets.event.widget.nextEvent|qaobee.components.widgets.event.widget.nextEvent}
     */
    angular.module('qaobee.home', [
        /* qaobee services */
        'effectifSRV',
        /* qaobee Rest API */
        'userRestAPI'])

        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private', {
                controller: 'HomeControler',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/home/mainHome.html'

            });
        })
        /**
         * @class qaobee.modules.home.HomeControler
         */
        .controller('HomeControler', function ($scope, $translatePartialLoader, user, meta, effectiveSrv, effectiveRestAPI, 
                                               sandboxRestAPI, qeventbus, filterCalendarSrv, $timeout) {
            $translatePartialLoader.addPart('home').addPart('stats').addPart('agenda').addPart('effective');
            $scope.user = user;
            $scope.meta = meta;
            $scope.activeTabIndex = 0;
            $scope.listId = [];
        
            $scope.CompletedEvent = function () {
        console.log("Completed Event called");
    };

    $scope.ExitEvent = function () {
        console.log("Exit Event called");
    };

    $scope.ChangeEvent = function (targetElement) {
        console.log("Change Event called");
        console.log(targetElement);
    };

    $scope.BeforeChangeEvent = function (targetElement) {
        console.log("Before Change Event called");
        console.log(targetElement);
    };

    $scope.AfterChangeEvent = function (targetElement) {
        console.log("After Change Event called");
        console.log(targetElement);
    };

    $scope.IntroOptions = {
        steps:[
        {
            element: document.querySelector('#step1'),
            intro: '<h3 class="primary-color center">Bienvenu dans votre espace de travail<h3> <h5 class="accent-color center">Bienvenu dans votre espace de travail<h5>'
        },
        {
            element: document.querySelectorAll('#step2')[0],
            intro: "<strong>You</strong> can also <em>include</em> HTML",
            position: 'bottom'
        },
        {
            element: '#step3',
            intro: 'More features, more fun.',
            position: 'bottom'
        },
        {
            element: '#step4',
            intro: '<h3 class="primary-color center">Bienvenu dans votre espace de travail<h3> <h5 class="accent-color center">Bienvenu dans votre espace de travail<h5>',
            position: 'bottom'
        },
        {
            element: '#step5',
            intro: 'Get it, use it.'
        }
        ],
        showStepNumbers: true,
        showBullets: true,
        exitOnOverlayClick: true,
        exitOnEsc:true,
        nextLabel: '<strong>NEXT!</strong>',
        prevLabel: '<span style="color:green">Previous</span>',
        skipLabel: 'Exit',
        doneLabel: 'Thanks'
    };


            $scope.getEffective = function (id) {
                effectiveSrv.getEffective(id).then(function (data) {
                    effectiveSrv.getListId(data, 'player').then(function (listId) {
                        $scope.listId = listId.union($scope.listId);
                        qeventbus.prepForBroadcast('ownersId', {
                            ownersId: $scope.listId
                        });
                        qeventbus.prepForBroadcast('periodicityActive', {
                            periodicityActive: $scope.periodicityActive,
                            periodicity: $scope.periodicity,
                            self: 'HomeControler'
                        });
                    });
                });
            };
            $timeout(function () {
                if (angular.isDefined(filterCalendarSrv.getValue())) {
                    $scope.periodicityActive = filterCalendarSrv.getValue().periodicityActive;
                    $scope.periodicity = filterCalendarSrv.getValue().periodicity;
                    $scope.getEffective($scope.meta.sandbox.effectiveDefault);
                }
            });
        });
}());