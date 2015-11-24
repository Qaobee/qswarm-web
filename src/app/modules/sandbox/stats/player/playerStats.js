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
        $scope.doTheBack = function() {
            $window.history.back();
        };
        
        //Initialization owner Object
        $scope.player = {};
        
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
            
            var search = {
                listIndicators: ['goalScored', 'originShootAtt'],
                listOwners: ownersId,
                startDate: startDate.valueOf(),
                endDate: endDate.valueOf(),
                aggregat: 'COUNT',
                listFieldsGroupBy: ['owner', 'code']
            };

            statsRestAPI.getStatGroupBy(search).success(function (data) {
                if (angular.isDefined(data[0]) && data !== null) {
                    $scope.efficaciteGlobal = (data[0].value/data[1].value)*100;
                    
                } else {
                    $scope.efficaciteGlobal = O;
                }
                $log.debug($scope.efficaciteGlobal);
            });
        };
        
        
        /* generate calendar by month */
        $scope.getCurrentMonth = function () {
            $scope.periodicity = 'month';
            var start = moment('01/'+moment().format('MM/YYYY'),'DD/MM/YYYY');
            var end = moment(start).add(1,'months').subtract(1, 'ms');
            
            $scope.periodicityActive = {
                label: moment(start,'DD/MM/YYYY').format('MMMM YYYY'),
                startDate: start,
                endDate: end,
            };
            
            $scope.getStats($scope.player._id, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
        };
        
        /* Previous month */
        $scope.previousMonth = function (index) {
            $scope.periodicity = 'month';
            var start = moment($scope.periodicityActive.startDate,'DD/MM/YYYY').subtract(1, 'month');
            var end = moment($scope.periodicityActive.endDate,'DD/MM/YYYY').subtract(1, 'month');
            
            $scope.periodicityActive = {
                label: moment(start,'DD/MM/YYYY').format('MMMM YYYY'),
                startDate: start,
                endDate: end,
            };
            
            $scope.getStats($scope.player._id, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
        };
        
        /* Next month */
        $scope.nextMonth = function (index) {
            $scope.periodicity = 'month';
            var start = moment($scope.periodicityActive.startDate,'DD/MM/YYYY').add(1,'month');
            var end = moment($scope.periodicityActive.endDate,'DD/MM/YYYY').add(1,'month');
            
            $scope.periodicityActive = {
                label: moment(start,'DD/MM/YYYY').format('MMMM YYYY'),
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
            
            switch(currentQuarter) {
                case 1:
                    quarter = {
                        label: moment('01/01/'+year,'DD/MM/YYYY').format('MMMM YYYY') +' - ' +moment('01/04/'+year,'DD/MM/YYYY').subtract(1, 'ms').format('MMMM YYYY'),
                        startDate: moment('01/01/'+year,'DD/MM/YYYY').format('MMMM YYYY'),
                        endDate: moment('/01/04/'+year,'DD/MM/YYYY').subtract(1, 'ms')
                    };
                    break;
                case 2:
                    quarter = {
                        label: moment('01/04/'+year,'DD/MM/YYYY').format('MMMM YYYY') +' - ' +moment('/01/07/'+year,'DD/MM/YYYY').subtract(1, 'ms').format('MMMM YYYY'),
                        startDate: moment('/01/04/'+year,'DD/MM/YYYY'),
                        endDate: moment('/01/07/'+year,'DD/MM/YYYY').subtract(1, 'ms')
                    };
                    break;
                case 3:
                    quarter = {
                        label: moment('/01/07/'+year,'DD/MM/YYYY').format('MMMM YYYY') +' - ' +moment('/01/10/'+year,'DD/MM/YYYY').subtract(1, 'ms').format('MMMM YYYY'),
                        startDate: moment('/01/07/'+year,'DD/MM/YYYY'),
                        endDate: moment('/01/10/'+year,'DD/MM/YYYY').subtract(1, 'ms')
                    };
                    break;
                case 4:
                    quarter = {
                        label: moment('/01/10/'+year,'DD/MM/YYYY').format('MMMM YYYY') +' - ' +moment('/01/01/'+(year+1),'DD/MM/YYYY').subtract(1, 'ms').format('MMMM YYYY'),
                        startDate: moment('/01/10/'+year,'DD/MM/YYYY'),
                        endDate: moment('/01/01/'+(year+1),'DD/MM/YYYY').subtract(1, 'ms')
                    };
                    break;
                default:
                    quarter = {
                        label: moment('01/01/'+year,'DD/MM/YYYY').format('MMMM YYYY') +' - ' +moment('01/04/'+year,'DD/MM/YYYY').subtract(1, 'ms').format('MMMM YYYY'),
                        startDate: moment('01/01/'+year,'DD/MM/YYYY'),
                        endDate: moment('/01/04/'+year,'DD/MM/YYYY').subtract(1, 'ms')
                    };
            }
            
            /* Current quarter */
            $scope.periodicityActive = quarter;
            
            $scope.getStats($scope.player._id, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
        };
        
        /* Previous quarter */
        $scope.previousQuarter = function () {
            $scope.periodicity = 'quarter';
            var start = moment($scope.periodicityActive.startDate,'DD/MM/YYYY').subtract(3,'month');
            var end = moment($scope.periodicityActive.endDate,'DD/MM/YYYY').subtract(3,'month');
            
            $scope.periodicityActive = {
                label: moment(start,'DD/MM/YYYY').format('MMMM YYYY')+' - ' +moment(end,'DD/MM/YYYY').format('MMMM YYYY'),
                startDate: start,
                endDate: end,
            };
            
            $scope.getStats($scope.player._id, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
        };
        
        /* Next quarter */
        $scope.nextQuarter = function () {
            $scope.periodicity = 'quarter';
            var start = moment($scope.periodicityActive.startDate,'DD/MM/YYYY').add(3,'month');
            var end = moment($scope.periodicityActive.endDate,'DD/MM/YYYY').add(3,'month');
            
            $scope.periodicityActive = {
                label: moment(start,'DD/MM/YYYY').format('MMMM YYYY')+' - ' +moment(end,'DD/MM/YYYY').format('MMMM YYYY'),
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
                label: moment($scope.meta.season.startDate).format('MMMM YYYY') +' - '+ moment($scope.meta.season.endDate).format('MMMM YYYY'),
                startDate: moment($scope.meta.season.startDate),
                endDate: moment($scope.meta.season.endDate)                   
            };
            
            $scope.getStats($scope.player._id, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
        };
        
        /* Previous season */
        $scope.previousSeason = function () {
            $scope.periodicity = 'season';
            var start = moment($scope.periodicityActive.startDate,'DD/MM/YYYY').subtract(1,'year');
            var end = moment($scope.periodicityActive.endDate,'DD/MM/YYYY').subtract(1,'year');
            
            $scope.periodicityActive = {
                label: moment(start,'DD/MM/YYYY').format('MMMM YYYY') +' - '+ moment(end,'DD/MM/YYYY').format('MMMM YYYY'),
                startDate: start,
                endDate: end,
            };        
            
            $scope.getStats($scope.player._id, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
        };
        
        /* Next season */
        $scope.nextSeason = function () {
            $scope.periodicity = 'season';
            var start = moment($scope.periodicityActive.startDate,'DD/MM/YYYY').add(1,'year');
            var end = moment($scope.periodicityActive.endDate,'DD/MM/YYYY').add(1,'year');
            
            $scope.periodicityActive = {
                label: moment(start,'DD/MM/YYYY').format('MMMM YYYY') +' - '+ moment(end,'DD/MM/YYYY').format('MMMM YYYY'),
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