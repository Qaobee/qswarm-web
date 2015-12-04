(function () {
    'use strict';
    /**
     * Module statistic
     *
     * @class qaobee.modules.stats.playerStats
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     * @requires {@link https://docs.angularjs.org/api/ngRoute|ngRoute}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     */
    angular.module('qaobee.playerStats', [
        
            /* qaobee services */
            'statsSRV',

            /* qaobee Rest API */
            'effectiveRestAPI',
            'eventsRestAPI',
            'personRestAPI',
            'statsRestAPI',
            'userRestAPI',

            /* qaobee widget */
        ])

        .config(function ($routeProvider, metaDatasProvider) {
            $routeProvider.when('/private/playerStats/:playerId', {
                controller: 'PlayerStats',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/sandbox/stats/player/playerStats.html'

            });
        })
        /**
         * @class qaobee.modules.home.HomeControler
         */
        .controller('PlayerStats', function ($timeout, $log, $scope, $routeParams, $window, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta,
                                             effectiveRestAPI, statsRestAPI, personRestAPI, eventsRestAPI, statsSrv, userRestAPI) {
            $translatePartialLoader.addPart('home');
            $translatePartialLoader.addPart('stats');
            $scope.user = user;
            $scope.meta = meta;
            $scope.playerId = $routeParams.playerId;
            $scope.periodicity = 'month';
            $scope.periodicityActive = {};
            
            // return button
            $scope.doTheBack = function () {
                $window.history.back();
            };

            //Initialization owner Object
            $scope.player = {};
            $scope.stats = {};
        
            $scope.efficientlyGlobalCol = [{id: 'data', type: 'gauge', color: '#42a5f5'}];
            $scope.efficientlyGlobalData = [{data:0}];
            $scope.nbShootGlobal = 0;
            $scope.nbGoalGlobal = 0;
        
            $scope.efficiently9mCol = [{id: 'data', type: 'gauge', color: '#42a5f5'}];
            $scope.efficiently9mData = [{data:0}];
            $scope.nbShoot9m = 0;
            $scope.nbGoal9m = 0;
        
            $scope.efficiently6mCol = [{id: 'data', type: 'gauge', color: '#42a5f5'}];
            $scope.efficiently6mData = [{data:0}];
            $scope.nbShoot6m = 0;
            $scope.nbGoal6m = 0;
        
            $scope.efficiently7mCol = [{id: 'data', type: 'gauge', color: '#42a5f5'}];
            $scope.efficiently7mData = [{data:0}];
            $scope.nbShoot7m = 0;
            $scope.nbGoal7m = 0;

            /* get player */
            $scope.getPlayer = function () {
                personRestAPI.getPerson($scope.playerId).success(function (person) {
                    $scope.player = person;
                    $scope.player.birthdate = new Date(moment($scope.player.birthdate));

                    $scope.getCurrentMonth();
                });
            };

            /* get statistic for one player */
            $scope.getStats = function (ownerId, startDate, endDate) {
                
                var ownersId = [];
                ownersId.push(ownerId);
                
                /* Search parameters Efficiently Global */
                $scope.efficientlyGlobalCol = [{id: 'data', type: 'gauge', color: '#42a5f5'}];
                $scope.efficientlyGlobalData = [{data:0}];
                
                statsSrv.getEfficiently(ownersId, startDate, endDate).then(function (result) {
                    $scope.nbShootGlobal = result.nbShoot;
                    $scope.nbGoalGlobal = result.nbGoal;
                    $scope.efficientlyGlobalData.push({data : result.efficiently});
                    statsSrv.getColorGauge(result.efficiently).then(function (color) {
                        $scope.efficientlyGlobalCol[0].color = color;
                    });
                });
                
                /* Search parameters Efficiently 9m */
                var values =  ['BACKLEFT9', 'CENTER9', 'BACKRIGHT9'];
                $scope.efficiently9mCol = [{id: 'data', type: 'gauge', color: '#42a5f5'}];
                $scope.efficiently9mData = [{data:0}];
                
                statsSrv.getEfficiently(ownersId, startDate, endDate, values).then(function (result) {
                    $scope.nbShoot9m = result.nbShoot;
                    $scope.nbGoal9m = result.nbGoal;
                    $scope.efficiently9mData.push({data : result.efficiently});
                    statsSrv.getColorGauge(result.efficiently).then(function (color) {
                        $scope.efficiently9mCol[0].color = color;
                    });
                });
                
                /* Search parameters Efficiently 6m */
                var values =  ['BACKLEFT6', 'CENTER6', 'BACKRIGHT6', 'LWING', 'RWING'];
                $scope.efficiently6mCol = [{id: 'data', type: 'gauge', color: '#42a5f5'}];
                $scope.efficiently6mData = [{data:0}];
                
                statsSrv.getEfficiently(ownersId, startDate, endDate, values).then(function (result) {
                    $scope.nbShoot6m = result.nbShoot;
                    $scope.nbGoal6m = result.nbGoal;
                    $scope.efficiently6mData.push({data : result.efficiently});
                    statsSrv.getColorGauge(result.efficiently).then(function (color) {
                        $scope.efficiently6mCol[0].color = color;
                    });
                });
                
                /* Search parameters Efficiently 7m */
                var values =  ['PENALTY'];
                $scope.efficiently7mCol = [{id: 'data', type: 'gauge', color: '#42a5f5'}];
                $scope.efficiently7mData = [{data:0}];
                
                statsSrv.getEfficiently(ownersId, startDate, endDate, values).then(function (result) {
                    $scope.nbShoot7m = result.nbShoot;
                    $scope.nbGoal7m = result.nbGoal;
                    $scope.efficiently7mData.push({data : result.efficiently});
                    statsSrv.getColorGauge(result.efficiently).then(function (color) {
                        $scope.efficiently7mCol[0].color = color;
                    });
                });
                
                /* Stats Count */
                var indicators =  Array.create('yellowCard', 'exclTmp', 'redCard', 'originShootAtt', 'goalScored', 'holder', 'substitue');
                var listFieldsGroupBy = Array.create('owner', 'code');
                
                angular.forEach(indicators, function (value) {
                    $scope.stats[value] = {sum: 0, avg: 0, count: 0, freq: 0};
                });
                
                var search = {
                    listIndicators: indicators,
                    listOwners: ownersId,
                    startDate: startDate.valueOf(),
                    endDate: endDate.valueOf(),
                    aggregat: 'COUNT',
                    listFieldsGroupBy: listFieldsGroupBy
                };
                
                /* Appel stats API */
                statsRestAPI.getStatGroupBy(search).success(function (data) {
                    if (angular.isArray(data) && data.length > 0) {
                        data.forEach(function(a){
                            $scope.stats[a._id.code].count = a.value;
                        });
                    }
                })
            };

            /* generate calendar by month */
            $scope.getCurrentMonth = function () {
                $scope.periodicity = 'month';
                var start = moment('01/' + moment().format('MM/YYYY'), 'DD/MM/YYYY');
                var end = moment(start).add(1, 'months').subtract(1, 'ms');

                $scope.periodicityActive = {
                    label: moment(start, 'DD/MM/YYYY').format('MMMM YYYY'),
                    startDate: start,
                    endDate: end
                };

                $scope.getStats($scope.player._id, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
            };

            /* Previous month */
            $scope.previousMonth = function (index) {
                $scope.periodicity = 'month';
                var start = moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').subtract(1, 'month');
                var end = moment($scope.periodicityActive.endDate, 'DD/MM/YYYY').subtract(1, 'month');

                $scope.periodicityActive = {
                    label: moment(start, 'DD/MM/YYYY').format('MMMM YYYY'),
                    startDate: start,
                    endDate: end,
                };

                $scope.getStats($scope.player._id, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
            };

            /* Next month */
            $scope.nextMonth = function (index) {
                $scope.periodicity = 'month';
                var start = moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').add(1, 'month');
                var end = moment($scope.periodicityActive.endDate, 'DD/MM/YYYY').add(1, 'month');

                $scope.periodicityActive = {
                    label: moment(start, 'DD/MM/YYYY').format('MMMM YYYY'),
                    startDate: start,
                    endDate: end,
                };

                $scope.getStats($scope.player._id, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
            };

            /* generate calendar by quarter */
            $scope.getCurrentQuarter = function () {
                $scope.periodicity = 'quarter';
                var quarter = {};
                var currentQuarter = moment().quarter();
                var year = moment().year();

                switch (currentQuarter) {
                    case 1:
                        quarter = {
                            label: moment('01/01/' + year, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment('01/04/' + year, 'DD/MM/YYYY').subtract(1, 'ms').format('MMMM YYYY'),
                            startDate: moment('01/01/' + year, 'DD/MM/YYYY').format('MMMM YYYY'),
                            endDate: moment('/01/04/' + year, 'DD/MM/YYYY').subtract(1, 'ms')
                        };
                        break;
                    case 2:
                        quarter = {
                            label: moment('01/04/' + year, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment('/01/07/' + year, 'DD/MM/YYYY').subtract(1, 'ms').format('MMMM YYYY'),
                            startDate: moment('/01/04/' + year, 'DD/MM/YYYY'),
                            endDate: moment('/01/07/' + year, 'DD/MM/YYYY').subtract(1, 'ms')
                        };
                        break;
                    case 3:
                        quarter = {
                            label: moment('/01/07/' + year, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment('/01/10/' + year, 'DD/MM/YYYY').subtract(1, 'ms').format('MMMM YYYY'),
                            startDate: moment('/01/07/' + year, 'DD/MM/YYYY'),
                            endDate: moment('/01/10/' + year, 'DD/MM/YYYY').subtract(1, 'ms')
                        };
                        break;
                    case 4:
                        quarter = {
                            label: moment('/01/10/' + year, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment('/01/01/' + (year + 1), 'DD/MM/YYYY').subtract(1, 'ms').format('MMMM YYYY'),
                            startDate: moment('/01/10/' + year, 'DD/MM/YYYY'),
                            endDate: moment('/01/01/' + (year + 1), 'DD/MM/YYYY').subtract(1, 'ms')
                        };
                        break;
                    default:
                        quarter = {
                            label: moment('01/01/' + year, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment('01/04/' + year, 'DD/MM/YYYY').subtract(1, 'ms').format('MMMM YYYY'),
                            startDate: moment('01/01/' + year, 'DD/MM/YYYY'),
                            endDate: moment('/01/04/' + year, 'DD/MM/YYYY').subtract(1, 'ms')
                        };
                }

                /* Current quarter */
                $scope.periodicityActive = quarter;

                $scope.getStats($scope.player._id, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
            };

            /* Previous quarter */
            $scope.previousQuarter = function () {
                $scope.periodicity = 'quarter';
                var start = moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').subtract(3, 'month');
                var end = moment($scope.periodicityActive.endDate, 'DD/MM/YYYY').subtract(3, 'month');

                $scope.periodicityActive = {
                    label: moment(start, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment(end, 'DD/MM/YYYY').format('MMMM YYYY'),
                    startDate: start,
                    endDate: end,
                };

                $scope.getStats($scope.player._id, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
            };

            /* Next quarter */
            $scope.nextQuarter = function () {
                $scope.periodicity = 'quarter';
                var start = moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').add(3, 'month');
                var end = moment($scope.periodicityActive.endDate, 'DD/MM/YYYY').add(3, 'month');

                $scope.periodicityActive = {
                    label: moment(start, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment(end, 'DD/MM/YYYY').format('MMMM YYYY'),
                    startDate: start,
                    endDate: end,
                };

                $scope.getStats($scope.player._id, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
            };

            /* generate calendar by season */
            $scope.getCurrentSeason = function () {
                $scope.periodicity = 'season';
                $scope.periodicityActive = {
                    index: 1,
                    label: moment($scope.meta.season.startDate).format('MMMM YYYY') + ' - ' + moment($scope.meta.season.endDate).format('MMMM YYYY'),
                    startDate: moment($scope.meta.season.startDate),
                    endDate: moment($scope.meta.season.endDate)
                };

                $scope.getStats($scope.player._id, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
            };

            /* Previous season */
            $scope.previousSeason = function () {
                $scope.periodicity = 'season';
                var start = moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').subtract(1, 'year');
                var end = moment($scope.periodicityActive.endDate, 'DD/MM/YYYY').subtract(1, 'year');

                $scope.periodicityActive = {
                    label: moment(start, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment(end, 'DD/MM/YYYY').format('MMMM YYYY'),
                    startDate: start,
                    endDate: end,
                };

                $scope.getStats($scope.player._id, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
            };

            /* Next season */
            $scope.nextSeason = function () {
                $scope.periodicity = 'season';
                var start = moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').add(1, 'year');
                var end = moment($scope.periodicityActive.endDate, 'DD/MM/YYYY').add(1, 'year');

                $scope.periodicityActive = {
                    label: moment(start, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment(end, 'DD/MM/YYYY').format('MMMM YYYY'),
                    startDate: start,
                    endDate: end,
                };

                $scope.getStats($scope.player._id, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
            };


            /* check user connected */
            $scope.checkUserConnected = function () {

                userRestAPI.getUserById(user._id).success(function (data) {
                    $scope.getPlayer();
                }).error(function (data) {
                    $log.error('PlayerStats : User not Connected');
                });
            };

            /* Primary, check if user connected */
            $scope.checkUserConnected();
        });
}());