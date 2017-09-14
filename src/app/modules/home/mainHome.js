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
            element: '#step1',
            intro: '<div class="row"><div class="card col s12"><div class="card-title dark-primary-color center-align"><b>Bienvenue sur Qaobee !</b></div><div class="card-title center"><br> <i class="fa fa-fw fa-star fa-2x accent-text-color"></i><br>Prenons quelques instants pour découvrir les principales fonctionnalités de l\'application.<br>&nbsp;</div></div></div>'
        },
        {
            element: '#step2',
            intro: '<div class="row"><div class="card col s12"><div class="card-title dark-primary-color center-align"><b>Restez à l\'affût</b> </span></div><div class="card-title center"><br><i class="fa fa-bell fa-2x accent-text-color"></i> <br>Les notifications .... <br>&nbsp;</div></div></div>',
            position: 'bottom'
        },
        {
            element: '#step3',
            intro: '<div class="row"><div class="card col s12"><div class="card-title dark-primary-color center-align"><b>Planifiez vos matchs !</b></span></div><div class="card-title center"><br> <i class="fa fa-fw fa-calendar fa-2x accent-text-color"></i> <br>Les événements .... <br>&nbsp;</div></div></div>',
            position: 'bottom'
        },
        {
            element: '#step4',
            intro: '<div class="row"><div class="card col s12"><div class="card-title dark-primary-color center-align"><b>Consultez vos stats !</b> </span></div><div class="card-title center"><br><i class="fa fa-fw fa-bar-chart fa-2x accent-text-color"></i> <br>Les collectes .... <br>&nbsp;</div></div></div>',
            position: 'bottom'
        },
        {
            element: '#step5',
            intro: '<div class="row"><div class="card col s12"><div class="card-title dark-primary-color center-align"><b>Félicitations !</b></span></div><div class="card-title center"><br> <i class="fa fa-fw fa-star fa-2x accent-text-color"></i> <br>Bientôt vous serez incollable sur les stats de vos joueurs <br>&nbsp;</div><div class="card-title center"><br> Rendez-vous sur Google play store et téléchargez notre application de collecte pour tablette ou smartphone.<br><a href="https://play.google.com/store/apps/details?id=com.qaobee.hand" target="_blank" class="light-text-color" rel="noopener"> <img src="assets/images/googleplay.png" class="responsive-img" style="width: 15rem;" alt="play store logo"/></a><br>&nbsp;</div></div></div>'
        }
        ],
        showStepNumbers: false,
        showBullets: false,
        exitOnOverlayClick: true,
        exitOnEsc:true,
        showProgress:true,
        nextLabel: '<span>Suivant</span>',
        prevLabel: '<span>Précédent</span>',
        skipLabel: 'Annuler',
        doneLabel: 'Merci'
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