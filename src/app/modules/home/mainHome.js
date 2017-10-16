(function () {
    'use strict';
    /**
     * Main page module
     *
     * @class qaobee.modules.home.mainHome
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     * @requires {@link https://docs.angularjs.org/api/ngRoute|ngRoute}
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
        .controller('HomeControler', function ($scope, $rootScope, $translatePartialLoader, user, meta, effectiveSrv,
                                               effectiveRestAPI, profileRestAPI, sandboxRestAPI, qeventbus, $filter,
                                               filterCalendarSrv, $timeout, $log) {
            $translatePartialLoader.addPart('home').addPart('stats').addPart('agenda').addPart('effective');
            $scope.user = user;
            $scope.meta = meta;
            $scope.activeTabIndex = 0;
            $scope.listId = [];

            $scope.CompletedEvent = function () {
                $log.debug('[qaobee.home] - Completed Event called');
                var user = angular.copy($scope.user);
                user.account.firstConnexion = false;
                profileRestAPI.update(user).success(function (data) {
                    $log.debug('[HomeControler] - launchIntoJs - update', data);
                    $rootScope.user = user;
                    $scope.user = user;
                });
            };

            $scope.ExitEvent = function () {
                $log.debug('[qaobee.home] - Exit Event called');
            };

            $scope.ChangeEvent = function (targetElement) {
                $log.debug('[qaobee.home] - Change Event called', targetElement);
            };

            $scope.BeforeChangeEvent = function (targetElement) {
                $log.debug('[qaobee.home] - Before Change Event called', targetElement);
            };

            $scope.AfterChangeEvent = function (targetElement) {
                $log.debug('[qaobee.home] - After Change Event called', targetElement);
            };

            $scope.IntroOptions = {
                steps: [
                    {
                        element: '#step1',
                        intro: '<div class="row"><div class="card col s12"><div class="card-title dark-primary-color center-align"><b>' +
                        $filter('translate')('intro.step1.title') +
                        '</b></div><div class="card-title center"><br><i class="fa fa-fw fa-star fa-2x accent-text-color"></i><br>' +
                        $filter('translate')('intro.step1.desc') + '<br>&nbsp;</div></div></div>'
                    },
                    {
                        element: '#step2',
                        intro: '<div class="row"><div class="card col s12"><div class="card-title dark-primary-color center-align"><b>' +
                        $filter('translate')('intro.step2.title') +
                        '</b></span></div><div class="card-title center"><br><i class="fa fa-bell fa-2x accent-text-color"></i><br>' +
                        $filter('translate')('intro.step2.desc') + '<br>&nbsp;</div></div></div>',
                        position: 'bottom'
                    },
                    {
                        element: '#step3',
                        intro: '<div class="row"><div class="card col s12"><div class="card-title dark-primary-color center-align"><b>' +
                        $filter('translate')('intro.step3.title') +
                        '</b></span></div><div class="card-title center"><br><i class="fa fa-fw fa-calendar fa-2x accent-text-color"></i><br>' +
                        $filter('translate')('intro.step3.desc') + '<br>&nbsp;</div></div></div>',
                        position: 'bottom'
                    },
                    {
                        element: '#step4',
                        intro: '<div class="row"><div class="card col s12"><div class="card-title dark-primary-color center-align"><b>' +
                        $filter('translate')('intro.step4.title') +
                        '</b></span></div><div class="card-title center"><br><i class="fa fa-fw fa-bar-chart fa-2x accent-text-color"></i><br>' +
                        $filter('translate')('intro.step4.desc') + '<br>&nbsp;</div></div></div>',
                        position: 'bottom'
                    },
                    {
                        element: '#step5',
                        intro: '<div class="row"><div class="card col s12"><div class="card-title dark-primary-color center-align"><b>' +
                        $filter('translate')('intro.step5.title') +
                        '</b></span></div><div class="card-title center"><br><i class="fa fa-fw fa-star fa-2x accent-text-color"></i><br>' +
                        $filter('translate')('intro.step5.desc') +
                        '<br>&nbsp;</div><div class="card-title center"><br>' +
                        $filter('translate')('intro.step5.desc2') +
                        '<br><a href="https://play.google.com/store/apps/details?id=com.qaobee.hand" target="_blank" class="light-text-color" rel="noopener">' +
                        '<img src="assets/images/googleplay.png" class="responsive-img" style="width: 15rem;" alt="play store logo"/></a>' +
                        '<br>&nbsp;</div></div></div>'
                    }
                ],
                showStepNumbers: false,
                showBullets: false,
                exitOnOverlayClick: true,
                exitOnEsc: true,
                showProgress: true,
                nextLabel: '<span>Suivant</span>',
                prevLabel: '<span>Précédent</span>',
                skipLabel: 'Annuler',
                doneLabel: 'Merci'
            };

            /**
             * Test if we have to launch introjs
             *
             * @returns {boolean}
             */
            $scope.launchIntroJs = function () {
                return $scope.user.account.firstConnexion;
            };
            /**
             * Get effective
             *
             * @param id
             */
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
            }, 0);
        });
}());