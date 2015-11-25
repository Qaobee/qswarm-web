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
                                             effectiveRestAPI, personRestAPI, eventsRestAPI, statsRestAPI, userRestAPI) {
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
            $scope.efficaciteGlobalCol = [{id: 'data', type: 'gauge', color:'#42a5f5'}];
            $scope.efficaciteGlobalData = [{data:0}];
            
            $scope.efficacite9mCol = [{id: 'data', type: 'gauge', color:'#42a5f5'}];
            $scope.efficacite9mData = [{data:0}];
        
            $scope.efficacite7mCol = [{id: 'data', type: 'gauge', color:'#42a5f5'}];
            $scope.efficacite7mData = [{data:0}];
        
            $scope.efficacite6mCol = [{id: 'data', type: 'gauge', color:'#42a5f5'}];
            $scope.efficacite6mData = [{data:0}];


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

                //Efficiently global
                var search = {
                    listIndicators: ['goalScored', 'originShootAtt'],
                    listOwners: ownersId,
                    startDate: startDate.valueOf(),
                    endDate: endDate.valueOf(),
                    aggregat: 'COUNT',
                    listFieldsGroupBy: ['owner', 'code']
                };

                statsRestAPI.getStatGroupBy(search).success(function (data) {
                    var efficaciteGlobal = 0;
                    $scope.efficaciteGlobalCol = [{id: 'data', type: 'gauge', color: '#42a5f5'}];
                    $scope.efficaciteGlobalData = [{data:0}];
                    
                    if (angular.isDefined(data[0]) && data !== null) {
                        efficaciteGlobal = (data[0].value / data[1].value) * 100;
                        $log.debug('global', efficaciteGlobal);
                        if (efficaciteGlobal<25) {
                            $scope.efficaciteGlobalCol[0].color = '#ef5350';
                        } else if(efficaciteGlobal>=25 && efficaciteGlobal<50) {
                            $scope.efficaciteGlobalCol[0].color = '#ffb74d';
                        } else if(efficaciteGlobal>=50 && efficaciteGlobal<75) {
                            $scope.efficaciteGlobalCol[0].color = '#42a5f5';
                        } else if(efficaciteGlobal>75) {
                            $scope.efficaciteGlobalCol[0].color = '#66bb6a';
                        }
                            
                        $scope.efficaciteGlobalData.push({data : efficaciteGlobal});
                    }
                });
                
                //Efficiently 9m
                //TODO : CKE : Virer le code en dur
                var search = {
                    listIndicators: ['originShootAtt'],
                    listOwners: ownersId,
                    startDate: startDate.valueOf(),
                    endDate: endDate.valueOf(),
                    values: ['bottom-right', 'bottom-center', 'bottom-left'],
                    aggregat: 'COUNT',
                    listFieldsGroupBy: ['owner', 'code']
                };

                statsRestAPI.getStatGroupBy(search).success(function (data) {
                    var efficacite9m = 0;
                    $scope.efficacite9mCol = [{id: 'data', type: 'gauge', color: '#42a5f5'}];
                    $scope.efficacite9mData = [{data:0}];
                    
                    if (angular.isDefined(data[0]) && data !== null) {
                        efficacite9m = (data[0].value / 10) * 100;
                        $log.debug('9m', efficacite9m);
                        if (efficacite9m<25) {
                            $scope.efficacite9mCol[0].color = '#ef5350';
                        } else if(efficacite9m>=25 && efficacite9m<50) {
                            $scope.efficacite9mCol[0].color = '#ffb74d';
                        } else if(efficacite9m>=50 && efficacite9m<75) {
                            $scope.efficacite9mCol[0].color = '#42a5f5';
                        } else if(efficacite9m>75) {
                            $scope.efficacite9mCol[0].color = '#66bb6a';
                        }
                            
                        $scope.efficacite9mData.push({data : efficacite9m});
                    }
                });
                
                //Efficiently 6m
                //TODO : CKE : Virer le code en dur
                var search = {
                    listIndicators: ['originShootAtt'],
                    listOwners: ownersId,
                    startDate: startDate.valueOf(),
                    endDate: endDate.valueOf(),
                    values: ['top-right', 'top-center', 'top-left'],
                    aggregat: 'COUNT',
                    listFieldsGroupBy: ['owner', 'code']
                };

                statsRestAPI.getStatGroupBy(search).success(function (data) {
                    var efficacite6m = 0;
                    $scope.efficacite6mCol = [{id: 'data', type: 'gauge', color: '#42a5f5'}];
                    $scope.efficacite6mData = [{data:0}];
                    
                    if (angular.isDefined(data[0]) && data !== null) {
                        efficacite6m = (data[0].value / 10) * 100;
                        $log.debug('6m', efficacite6m);
                        if (efficacite6m<25) {
                            $scope.efficacite6mCol[0].color = '#ef5350';
                        } else if(efficacite6m>=25 && efficacite6m<50) {
                            $scope.efficacite6mCol[0].color = '#ffb74d';
                        } else if(efficacite6m>=50 && efficacite6m<75) {
                            $scope.efficacite6mCol[0].color = '#42a5f5';
                        } else if(efficacite6m>75) {
                            $scope.efficacite6mCol[0].color = '#66bb6a';
                        }
                            
                        $scope.efficacite6mData.push({data : efficacite6m});
                    }
                });
                
                //Efficiently 7m
                //TODO : CKE : Virer le code en dur
                var search = {
                    listIndicators: ['originShootAtt'],
                    listOwners: ownersId,
                    startDate: startDate.valueOf(),
                    endDate: endDate.valueOf(),
                    values: ['PENALTY'],
                    aggregat: 'COUNT',
                    listFieldsGroupBy: ['owner', 'code']
                };

                statsRestAPI.getStatGroupBy(search).success(function (data) {
                    var efficacite7m = 0;
                    $scope.efficacite7mCol = [{id: 'data', type: 'gauge', color: '#42a5f5'}];
                    $scope.efficacite7mData = [{data:0}];
                    
                    if (angular.isDefined(data[0]) && data !== null) {
                        efficacite7m = (data[0].value / 10) * 100;
                        $log.debug('7m', efficacite7m);
                        if (efficacite7m<25) {
                            $scope.efficacite7mCol[0].color = '#ef5350';
                        } else if(efficacite7m>=25 && efficacite7m<50) {
                            $scope.efficacite7mCol[0].color = '#ffb74d';
                        } else if(efficacite7m>=50 && efficacite7m<75) {
                            $scope.efficacite7mCol[0].color = '#42a5f5';
                        } else if(efficacite7m>75) {
                            $scope.efficacite7mCol[0].color = '#66bb6a';
                        }
                            
                        $scope.efficacite7mData.push({data : efficacite7m});
                    }
                });
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