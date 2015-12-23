(function () {
    'use strict';
    /**
     * Module statistic
     *
     * @class qaobee.modules.stats.teamStats
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     * @requires {@link https://docs.angularjs.org/api/ngRoute|ngRoute}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     */
    angular.module('qaobee.teamStats', [
        
        /* qaobee services */
        'statsSRV',
        
        /* qaobee Rest API */
        'personRestAPI',
        'statsRestAPI',
        'teamRestAPI',
        'userRestAPI',
        
        /* qaobee widget */
    ])

    .config(function ($routeProvider, metaDatasProvider) {
        $routeProvider.when('/private/teamStats/:teamId', {
            controller: 'TeamStats',
            resolve: {
                user: metaDatasProvider.checkUser,
                meta: metaDatasProvider.getMeta
            },
            templateUrl: 'app/modules/sandbox/stats/team/teamStats.html'

        });
    })
/**
 * @class qaobee.modules.home.HomeControler
 */
    .controller('TeamStats', function ($log, $scope, $routeParams, $window, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, 
                                            teamRestAPI, personRestAPI, statsRestAPI, statsSrv, userRestAPI) {
        $translatePartialLoader.addPart('home');
        $translatePartialLoader.addPart('stats');
        $translatePartialLoader.addPart('agenda');

        $scope.user = user;
        $scope.meta = meta;
        $scope.ownersId = [];
        $scope.ownersId.push($routeParams.teamId);
        
        $scope.periodicity = 'season';
        $scope.periodicityActive = {
            index: 1,
            label: moment($scope.meta.season.startDate).format('MMMM YYYY') + ' - ' + moment($scope.meta.season.endDate).format('MMMM YYYY'),
            startDate: moment($scope.meta.season.startDate),
            endDate: moment($scope.meta.season.endDate)
        };
        
        // return button
        $scope.doTheBack = function() {
            $window.history.back();
        };
        
        //Initialization event
        $scope.initStats = function() {
            $scope.stats = {};
            $scope.teamCollecte = {
                nbGame:0,
                players: [{}],
                totalTime:0
            };
            $scope.collectes = [];
        
            $scope.values9m =  ['BACKLEFT9', 'CENTER9', 'BACKRIGHT9'];
            $scope.values6m =  ['BACKLEFT6', 'CENTER6', 'BACKRIGHT6', 'LWING', 'RWING'];
            $scope.values7m =  ['PENALTY'];

            $scope.defenseCol = [{"id": "Positive", "index":0 ,"type": 'donut', "color": '#9ccc65'},
                                    {"id": "Negative", "index":1 ,"type": 'donut', "color": '#ef5350'}];
            $scope.defenseData = [{"Positive":0}, {"Negative":0}];

            $scope.attackCol = [{"id": "Positive", "index":0 ,"type": 'donut', "color": '#9ccc65'},
                               {"id": "Negative", "index":1 ,"type": 'donut', "color": '#ef5350'}];
            $scope.attackData = [{"Positive":0}, {"Negative":0}];
        };
        
        /* get team */
        $scope.getTeam = function () {
            
            /* get team */
            teamRestAPI.getTeam($routeParams.teamId).success(function (team) {
                $scope.team = team;
                $scope.getCurrentSeason();
            });
        };
        
        /* get statistic for one player */
        $scope.getStats = function (ownersId, startDate, endDate) {
            
            $scope.initStats();

            /* get nbCollecte */
            statsSrv.getMatchsTeams(startDate, endDate, $scope.meta.sandbox._id, $routeParams.teamId).then(function (data) {
                if (angular.isArray(data) && data.length > 0) {
                    $scope.teamCollecte.nbGame = data.length;
                    var totalTime = 0;
                    
                    data.forEach(function (e) {
                        totalTime += (e.parametersGame.periodDuration * e.parametersGame.nbPeriod);
                        e.eventRef.startDate = moment(e.eventRef.startDate).format('LLLL');
                        $scope.collectes.push(e);
                    });    
                    $scope.teamCollecte.totalTime = totalTime;
                }
            })
            
            var listFieldsGroupBy = Array.create('owner');

            /* ALL PERS-ACT-DEF-POS */
            var indicators =  Array.create('neutralization', 'forceDef', 'contre', 'interceptionOk');
            statsSrv.countAllInstanceIndicators(indicators, ownersId, startDate, endDate, listFieldsGroupBy).then(function (result) {
                $scope.defenseData.push({"Positive": result});
                $scope.defenseCol.push({"id": "Positive", "index":0 ,"type": 'donut', "color": '#9ccc65'});
            });

            /* ALL PERS-ACT-DEF-NEG */
            var indicators =  Array.create('penaltyConceded', 'interceptionKo', 'duelLoose', 'badPosition');
            statsSrv.countAllInstanceIndicators(indicators, ownersId, startDate, endDate, listFieldsGroupBy).then(function (result) {
                $scope.defenseData.push({"Negative": result});
                $scope.defenseCol.push({"id": "Negative", "index":1 ,"type": 'donut', "color": '#ef5350'});
            });

            /* ALL PERS-ACT-OFF-POS */
            var indicators =  Array.create('penaltyObtained', 'exclTmpObtained', 'shift', 'duelWon', 'passDec');
            statsSrv.countAllInstanceIndicators(indicators, ownersId, startDate, endDate, listFieldsGroupBy).then(function (result) {
                $scope.attackData.push({"Positive": result});
                $scope.attackCol.push({"id": "Positive", "index":0 ,"type": 'donut', "color": '#9ccc65'});
            });

            /* ALL PERS-ACT-OFF-NEG */
            var indicators =  Array.create('forceAtt', 'marcher', 'doubleDribble', 'looseball', 'foot', 'zone', 'stopGKAtt');
            statsSrv.countAllInstanceIndicators(indicators, ownersId, startDate, endDate, listFieldsGroupBy).then(function (result) {
                $scope.attackData.push({"Negative": result});
                $scope.attackCol.push({"id": "Negative", "index":1 ,"type": 'donut', "color": '#ef5350'});
            });

            /* Stats Count by indicator */
            var indicators =  Array.create('yellowCard', 'exclTmp', 'redCard', 'originShootAtt', 'goalScored', 'holder', 'substitue', 'goalConceded');
            listFieldsGroupBy = Array.create('code');

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

            /* Stats SUM by indicator */
            var indicators =  Array.create('playTime');
            listFieldsGroupBy = Array.create('code');

            angular.forEach(indicators, function (value) {
                $scope.stats[value] = {sum: 0, avg: 0, count: 0, freq: 0};
            });

            var search = {
                listIndicators: indicators,
                listOwners: ownersId,
                startDate: startDate.valueOf(),
                endDate: endDate.valueOf(),
                aggregat: 'SUM',
                listFieldsGroupBy: listFieldsGroupBy
            };

            /* Appel stats API */
            statsRestAPI.getStatGroupBy(search).success(function (data) {
                if (angular.isArray(data) && data.length > 0) {
                    data.forEach(function(a){
                        $scope.stats[a._id.code].sum = a.value;
                    });
                }
            })

            /* Stats AVG by indicator */
            var indicators =  Array.create('playTime');
            listFieldsGroupBy = Array.create('code');

            angular.forEach(indicators, function (value) {
                $scope.stats[value] = {sum: 0, avg: 0, count: 0, freq: 0};
            });

            var search = {
                listIndicators: indicators,
                listOwners: ownersId,
                startDate: startDate.valueOf(),
                endDate: endDate.valueOf(),
                aggregat: 'AVG',
                listFieldsGroupBy: listFieldsGroupBy
            };

            /* Appel stats API */
            statsRestAPI.getStatGroupBy(search).success(function (data) {
                if (angular.isArray(data) && data.length > 0) {
                    data.forEach(function(a){
                        $scope.stats[a._id.code].avg = a.value;
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

            $scope.getStats($scope.ownersId, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
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

            $scope.getStats($scope.ownersId, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
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

            $scope.getStats($scope.ownersId, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
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

            $scope.getStats($scope.ownersId, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
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

            $scope.getStats($scope.ownersId, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
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

            $scope.getStats($scope.ownersId, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
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

            $scope.getStats($scope.ownersId, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
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

            $scope.getStats($scope.ownersId, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
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

            $scope.getStats($scope.ownersId, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
        };
        
        /* check user connected */
        $scope.checkUserConnected = function () {
            
            userRestAPI.getUserById(user._id).success(function (data) {
                $scope.getTeam();
            }).error(function (data) {
                $log.error('TeamStats : User not Connected');
            });
        }; 
        
        /* Primary, check if user connected */
        $scope.checkUserConnected();
        $scope.initStats();
    });
}());