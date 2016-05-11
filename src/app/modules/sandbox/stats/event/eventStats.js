(function () {
    'use strict';
    /**
     * Module statistic
     *
     * @class qaobee.modules.stats.eventStats
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     * @requires {@link https://docs.angularjs.org/api/ngRoute|ngRoute}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     */
    angular.module('qaobee.eventStats', [
        /* qaobee services */
        'effectifSRV',
        'statsSRV',
        'qaobee.eventbus',
        /* qaobee Rest API */
        'collecteRestAPI',
        'personRestAPI',
        'statsRestAPI',
        'userRestAPI'
    ])

        .config(function ($routeProvider, metaDatasProvider) {
            $routeProvider.when('/private/eventStats/:collecteId', {
                controller: 'EventStats',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/sandbox/stats/event/eventStats.html'
            });
        })
        /**
         * @class qaobee.modules.home.HomeControler
         */
        .controller('EventStats', function ($log, $scope, $routeParams, $window, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta,
                                            collecteRestAPI, personRestAPI, statsRestAPI, effectiveSrv, statsSrv, userRestAPI, qeventbus) {
            $translatePartialLoader.addPart('home');
            $translatePartialLoader.addPart('stats');

            $scope.user = user;
            $scope.meta = meta;
            $scope.ownersId = [];
            $scope.teamHome = false;
            $scope.teamVisitor = true;
            $scope.collecte = {
                event: {},
                players: [],
                startDate: 0,
                endDate: 0,
                startDateLabel: "",
                endDateLabel: ""
            };

            $scope.periodicityActive = {
                startDate: moment(new Date()),
                endDate: moment(new Date()),
                ownersId: []
            };

            $scope.players = [];

            // return button
            $scope.doTheBack = function () {
                $window.history.back();
            };

            /* watch if periodicity change */
            $scope.$watch('periodicityActive', function (newValue, oldValue) {
                if (angular.isDefined(newValue) && !angular.equals(newValue, oldValue)) {
                    qeventbus.prepForBroadcast("periodicityActive", $scope.periodicityActive);
                }
            });

            /* get collect */
            $scope.getCollecte = function () {
                /* get collect */
                collecteRestAPI.getCollecte($routeParams.collecteId).success(function (data) {
                    if (angular.isDefined(data)) {
                        $scope.collecte.event = data.eventRef;

                        $scope.collecte.startDate = data.startDate;
                        $scope.collecte.endDate = data.endDate;
                        $scope.collecte.startDateLabel = moment(data.startDate).format('LLLL');
                        $scope.collecte.endDateLabel = moment(data.endDate).format('LLLL');

                        if ($scope.collecte.event.owner.teamId === $scope.collecte.event.participants.teamHome.id) {
                            $scope.teamHome = true;
                            $scope.teamVisitor = false;
                        } else {
                            $scope.teamHome = false;
                            $scope.teamVisitor = true;
                        }

                        var listField = Array.create('_id', 'name', 'firstname', 'avatar', 'status');
                        $scope.stats = [];
                        effectiveSrv.getPersons(data.players, listField).then(function (players) {
                            $scope.players = players;

                            $scope.players.forEach(function (player) {
                                if (angular.isDefined(player.status.positionType)) {
                                    player.positionType = $filter('translate')('stats.positionType.value.' + player.status.positionType);
                                } else {
                                    player.positionType = '';
                                }
                                player.stats = {
                                    originShootAtt: 0,
                                    originShootDef: 0,
                                    goalScored: 0,
                                    goalConceded: 0,
                                    yellowCard: 0,
                                    exclTmp: 0,
                                    redCard: 0
                                };
                            });

                            var listFieldsGroupBy = Array.create('owner', 'code');
                            var indicators = Array.create('originShootAtt', 'goalScored', 'yellowCard',
                                'exclTmp', 'redCard', 'originShootDef', 'goalConceded',
                                'actDefPos', 'actDefNeg', 'actAttPos', 'actAttNeg');

                            var search = {
                                listIndicators: indicators,
                                listOwners: data.players,
                                startDate: data.startDate.valueOf(),
                                endDate: data.endDate.valueOf(),
                                aggregat: 'COUNT',
                                listFieldsGroupBy: listFieldsGroupBy
                            };

                            /* Appel stats API */
                            statsRestAPI.getStatGroupBy(search).success(function (dataShoot) {
                                if (angular.isArray(dataShoot) && dataShoot.length > 0) {

                                    dataShoot.forEach(function (a) {
                                        var i = -1;
                                        a._id.owner.forEach(function (b) {
                                            i = $scope.players.findIndex(function (n) {
                                                return n._id === b;
                                            });
                                        });

                                        if (a._id.code === 'originShootAtt') {
                                            $scope.players[i].stats.originShootAtt = a.value;
                                        }
                                        if (a._id.code === 'originShootDef') {
                                            $scope.players[i].stats.originShootDef = a.value;
                                        }
                                        if (a._id.code === 'goalScored') {
                                            $scope.players[i].stats.goalScored = a.value;
                                        }
                                        if (a._id.code === 'goalConceded') {
                                            $scope.players[i].stats.goalConceded = a.value;
                                        }
                                        if (a._id.code === 'yellowCard') {
                                            $scope.players[i].stats.yellowCard = a.value;
                                        }
                                        if (a._id.code === 'exclTmp') {
                                            $scope.players[i].stats.exclTmp = a.value;
                                        }
                                        if (a._id.code === 'redCard') {
                                            $scope.players[i].stats.redCard = a.value;
                                        }
                                    });
                                }
                            });

                            /* ALL PERS-ACT-DEF-POS */
                            indicators = Array.create('neutralization', 'forceDef', 'contre', 'interceptionOk');
                            search = {
                                listIndicators: indicators,
                                listOwners: data.players,
                                startDate: data.startDate.valueOf(),
                                endDate: data.endDate.valueOf(),
                                aggregat: 'COUNT',
                                listFieldsGroupBy: listFieldsGroupBy
                            };
                            statsRestAPI.getStatGroupBy(search).success(function (dataActDefPos) {
                                if (angular.isArray(dataActDefPos) && dataActDefPos.length > 0) {

                                    dataActDefPos.forEach(function (a) {
                                        var i = -1;
                                        a._id.owner.forEach(function (b) {
                                            i = $scope.players.findIndex(function (n) {
                                                return n._id === b;
                                            });
                                        });
                                        $scope.players[i].stats.actDefPos = a.value;
                                    });
                                }
                            });

                            /* ALL PERS-ACT-DEF-NEG */
                            indicators = Array.create('penaltyConceded', 'interceptionKo', 'duelLoose', 'badPosition');
                            search = {
                                listIndicators: indicators,
                                listOwners: data.players,
                                startDate: data.startDate.valueOf(),
                                endDate: data.endDate.valueOf(),
                                aggregat: 'COUNT',
                                listFieldsGroupBy: listFieldsGroupBy
                            };
                            statsRestAPI.getStatGroupBy(search).success(function (dataActDefNeg) {
                                if (angular.isArray(dataActDefNeg) && dataActDefNeg.length > 0) {

                                    dataActDefNeg.forEach(function (a) {
                                        var i = -1;
                                        a._id.owner.forEach(function (b) {
                                            i = $scope.players.findIndex(function (n) {
                                                return n._id === b;
                                            });
                                        });
                                        $scope.players[i].stats.actDefNeg = a.value;
                                    });
                                }
                            });

                            /* ALL PERS-ACT-OFF-POS */
                            indicators = Array.create('penaltyObtained', 'exclTmpObtained', 'shift', 'duelWon', 'passDec');
                            search = {
                                listIndicators: indicators,
                                listOwners: data.players,
                                startDate: data.startDate.valueOf(),
                                endDate: data.endDate.valueOf(),
                                aggregat: 'COUNT',
                                listFieldsGroupBy: listFieldsGroupBy
                            };
                            statsRestAPI.getStatGroupBy(search).success(function (dataActAttPos) {
                                if (angular.isArray(dataActAttPos) && dataActAttPos.length > 0) {

                                    dataActAttPos.forEach(function (a) {
                                        var i = -1;
                                        a._id.owner.forEach(function (b) {
                                            i = $scope.players.findIndex(function (n) {
                                                return n._id === b;
                                            });
                                        });
                                        $scope.players[i].stats.actAttPos = a.value;
                                    });
                                }
                            });

                            /* ALL PERS-ACT-OFF-NEG */
                            indicators = Array.create('forceAtt', 'marcher', 'doubleDribble', 'looseball', 'foot', 'zone', 'stopGKAtt');
                            search = {
                                listIndicators: indicators,
                                listOwners: data.players,
                                startDate: data.startDate.valueOf(),
                                endDate: data.endDate.valueOf(),
                                aggregat: 'COUNT',
                                listFieldsGroupBy: listFieldsGroupBy
                            };
                            statsRestAPI.getStatGroupBy(search).success(function (dataActAttNeg) {
                                if (angular.isArray(dataActAttNeg) && dataActAttNeg.length > 0) {

                                    dataActAttNeg.forEach(function (a) {
                                        var i = -1;
                                        a._id.owner.forEach(function (b) {
                                            i = $scope.players.findIndex(function (n) {
                                                return n._id === b;
                                            });
                                        });
                                        $scope.players[i].stats.actAttNeg = a.value;
                                    });
                                }
                            });

                            $scope.players = $scope.players.sortBy(function (n) {
                                return n.positionType;
                            });
                            $log.debug('$scope.players', $scope.players);
                        });

                        $scope.ownersId.push(data.eventRef._id);
                        $scope.periodicityActive = {
                            startDate: data.startDate,
                            endDate: data.endDate,
                            ownersId: $scope.ownersId
                        };
                    }
                });
            };

            /* check user connected */
            $scope.checkUserConnected = function () {
                userRestAPI.getUserById(user._id).success(function () {
                    $scope.getCollecte();
                }).error(function () {
                    $log.error('EventStats : User not Connected');
                });
            };
            /* Primary, check if user connected */
            $scope.checkUserConnected();
        });
}());