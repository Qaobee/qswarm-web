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
        'qaobee.eventbus',
        
        /* qaobee Rest API */
        'personRestAPI',
        'statsRestAPI',
        'teamRestAPI',
        'userRestAPI'
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
                                            teamRestAPI, personRestAPI, statsRestAPI, statsSrv, userRestAPI, qeventbus) {
        $translatePartialLoader.addPart('home');
        $translatePartialLoader.addPart('stats');
        $translatePartialLoader.addPart('agenda');

        $scope.user = user;
        $scope.meta = meta;
        $scope.ownersId = [];
        $scope.ownersId.push($routeParams.teamId);
        
        $scope.periodicity = 'season';
        $scope.periodicityActive = {
            label: "",
            startDate: moment(new Date()),
            endDate: moment(new Date()),
            ownersId : []
        };
        
        // return button
        $scope.doTheBack = function() {
            $window.history.back();
        };
        
        //Initialization event
        $scope.initStats = function() {
            $scope.collectes = [];
        
            $scope.defenseCol = [{"id": "Positive", "index":0 ,"type": 'donut', "color": '#9ccc65'},
                                    {"id": "Negative", "index":1 ,"type": 'donut', "color": '#ef5350'}];
            $scope.defenseData = [{"Positive":0}, {"Negative":0}];

            $scope.attackCol = [{"id": "Positive", "index":0 ,"type": 'donut', "color": '#9ccc65'},
                               {"id": "Negative", "index":1 ,"type": 'donut', "color": '#ef5350'}];
            $scope.attackData = [{"Positive":0}, {"Negative":0}];
        };
        
        /* watch if periodicity change */
        $scope.$watch('periodicityActive', function (newValue, oldValue) {
            if (angular.isDefined(newValue) && !angular.equals(newValue, oldValue)) {
                qeventbus.prepForBroadcast("periodicityActive", $scope.periodicityActive);
            }
        });
        
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
                    data.forEach(function (e) {
                        e.eventRef.startDate = moment(e.eventRef.startDate).format('LLLL');
                        $scope.collectes.push(e);
                    });    
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
        };

        /* generate calendar by month */
        $scope.getCurrentMonth = function () {
            $scope.periodicity = 'month';
            var start = moment('01/' + moment().format('MM/YYYY'), 'DD/MM/YYYY');
            var end = moment(start).add(1, 'months').subtract(1, 'ms');

            $scope.periodicityActive = {
                label: moment(start, 'DD/MM/YYYY').format('MMMM YYYY'),
                startDate: start,
                endDate: end,
                ownersId : $scope.ownersId
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
                ownersId : $scope.ownersId
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
                ownersId : $scope.ownersId
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
                        startDate: moment('01/01/' + year, 'DD/MM/YYYY'),
                        endDate: moment('/01/04/' + year, 'DD/MM/YYYY').subtract(1, 'ms'),
                        ownersId : $scope.ownersId
                    };
                    break;
                case 2:
                    quarter = {
                        label: moment('01/04/' + year, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment('/01/07/' + year, 'DD/MM/YYYY').subtract(1, 'ms').format('MMMM YYYY'),
                        startDate: moment('/01/04/' + year, 'DD/MM/YYYY'),
                        endDate: moment('/01/07/' + year, 'DD/MM/YYYY').subtract(1, 'ms'),
                        ownersId : $scope.ownersId
                    };
                    break;
                case 3:
                    quarter = {
                        label: moment('/01/07/' + year, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment('/01/10/' + year, 'DD/MM/YYYY').subtract(1, 'ms').format('MMMM YYYY'),
                        startDate: moment('/01/07/' + year, 'DD/MM/YYYY'),
                        endDate: moment('/01/10/' + year, 'DD/MM/YYYY').subtract(1, 'ms'),
                        ownersId : $scope.ownersId
                    };
                    break;
                case 4:
                    quarter = {
                        label: moment('/01/10/' + year, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment('/01/01/' + (year + 1), 'DD/MM/YYYY').subtract(1, 'ms').format('MMMM YYYY'),
                        startDate: moment('/01/10/' + year, 'DD/MM/YYYY'),
                        endDate: moment('/01/01/' + (year + 1), 'DD/MM/YYYY').subtract(1, 'ms'),
                        ownersId : $scope.ownersId
                    };
                    break;
                default:
                    quarter = {
                        label: moment('01/01/' + year, 'DD/MM/YYYY').format('MMMM YYYY') + ' - ' + moment('01/04/' + year, 'DD/MM/YYYY').subtract(1, 'ms').format('MMMM YYYY'),
                        startDate: moment('01/01/' + year, 'DD/MM/YYYY'),
                        endDate: moment('/01/04/' + year, 'DD/MM/YYYY').subtract(1, 'ms'),
                        ownersId : $scope.ownersId
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
                ownersId : $scope.ownersId
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
                ownersId : $scope.ownersId
            };

            $scope.getStats($scope.ownersId, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
        };

        /* generate calendar by season */
        $scope.getCurrentSeason = function () {
            $scope.periodicity = 'season';
            $scope.periodicityActive = {
                label: moment($scope.meta.season.startDate).format('MMMM YYYY') + ' - ' + moment($scope.meta.season.endDate).format('MMMM YYYY'),
                startDate: moment($scope.meta.season.startDate),
                endDate: moment($scope.meta.season.endDate),
                ownersId : $scope.ownersId
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
                ownersId : $scope.ownersId
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
                ownersId : $scope.ownersId
            };

            $scope.getStats($scope.ownersId, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
        };
        
        /* check user connected */
        $scope.checkUserConnected = function () {
            
            userRestAPI.getUserById(user._id).success(function (data) {
                $scope.periodicityActive = {
                    label: moment($scope.meta.season.startDate).format('MMMM YYYY') + ' - ' + moment($scope.meta.season.endDate).format('MMMM YYYY'),
                    startDate: moment($scope.meta.season.startDate),
                    endDate: moment($scope.meta.season.endDate),
                    ownersId : $scope.ownersId
                };
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