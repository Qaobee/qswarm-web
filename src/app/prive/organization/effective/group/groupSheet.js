/**
 * Module that shows the group
 * 
 * @author Christophe Kervella / Xavier Marin
 * @class qaobee.prive.organization.group
 * @namespace qaobee.prive.organization.group
 * 
 * @copyright <b>QaoBee</b>.
 */
angular.module('groupSheetMod', [ 'labelsAPI', 'structureCfgRestAPI', 'effectiveRestAPI', 'personRestAPI', 'userMetaAPI', 'groupAPI', 'labelsAPI', 'ui.utils', 'activityCfgRestAPI' ])

.config(function($routeProvider, metaDatasProvider) {
    'use strict';
    $routeProvider.when('/private/groupSheet/add/:categoryAgeCode', {
        controller : 'GroupSheetCtrlAdd',
        resolve : {
            user : metaDatasProvider.checkUser,
            meta : metaDatasProvider.getMeta
        },
        templateUrl : 'templates/prive/organization/effective/group/groupSheet.html'
    }).when('/private/groupSheet/:id', {
        controller : 'GroupSheetCtrl',
        resolve : {
            user : metaDatasProvider.checkUser,
            meta : metaDatasProvider.getMeta
        },
        templateUrl : 'templates/prive/organization/effective/group/groupSheet.html'
    });
})

/**
 * @class qaobee.prive.organization.effective.GroupCtrl
 * @description Controller of templates/prive/organization/effective/group.html
 */
.controller(
        'GroupSheetCtrlAdd',
        function($log, $window, $scope, $routeParams, BoardService, $route, $rootScope, $modal, structureCfgRestAPI, activityCfgRestAPI, personRestAPI, effectiveRestAPI, eventbus, groupAPI, $q, $filter, $location,
                $translatePartialLoader, user, meta, $q) {

            var lastRoute = $route.current;
            $scope.user = user;
            $scope.meta = meta;
            
            $translatePartialLoader.addPart('effective');
            $translatePartialLoader.addPart('stats');
            $translatePartialLoader.addPart('group');

            $scope.$watch(function() {
                return $filter('translate')('group.dashboard.maintitle');
            }, function(newval) {
                eventbus.prepForBroadcast("title", newval);
            });

            // return button
            $scope.doTheBack = function() {
                $window.history.back();
            };

            // initialize variables
            var categoryAgeCode = $routeParams.categoryAgeCode;
            $scope.groups = [];
            $scope.listMemberIdAnotherGroup = [];
            $scope.gameLevels = [];
            $scope.effective = [];
            $scope.currentGroup = {
                    startDate : moment().valueOf(),
                    endDate : "7258028400000",
                    label : "",
                    categoryAge : null,
                    levelGame : null,
                    structureId: $scope.meta.structure._id,
                    members : []
            };
            
            getLevelGameList();

            /* retrieve levelGame */
            function getLevelGameList() {
                activityCfgRestAPI.getLevelGameList(moment().valueOf(), meta.activity.code, meta.structure.country._id).success(function(gameLevels) {
                    $scope.gameLevels = gameLevels;
                    getCategory (categoryAgeCode);
                });
            }
            
            /* retrieve the current category */
            function getCategory(categoryAgeCode) {
                activityCfgRestAPI.getCategoryAge(moment().valueOf(), meta.activity.code, meta.structure.country._id, categoryAgeCode).success(function(data) {
                    $scope.category = data;
                    $scope.currentGroup.categoryAge = data;
                    getAllMemberGroups(categoryAgeCode);
                });
            }
            
            /* Retrieve group list for one category */
            function getAllMemberGroups(category) {
                $scope.listMemberIdAnotherGroup = [];

                /* retrieve all active group for one category */
                groupAPI.getActiveGroupsCategory($scope.meta.structure._id, category).success(function(groups) {
                    
                    if(groups === null) return;
                    groups.forEach(function(g) {
                        $scope.listMemberIdAnotherGroup.add(g.members);
                    });
                    getEffectiveCategory();
                });
            }
            
            /* Retrieve members of effective*/
            function getEffectiveCategory() {
                effectiveRestAPI.getListMemberEffective($scope.meta.season.code, $scope.meta.structure._id, $scope.category.code).success(function (data) {
                    
                    var listId = [];
                    data.forEach(function (a) {
                        listId = a.members;
                        /* Remove member already in group */
                        $scope.listMemberIdAnotherGroup.forEach(function (b) {
                            listId.remove(b);
                        });
                    });
                    
                    var listField = new Array("_id", "name", "firstname", "avatar", "status");
                    
                    /* retrieve person information */
                    personRestAPI.getListPerson(listId, listField).success(function (data) {
                        data.forEach(function (e) {
                            if (angular.isDefined(e.status.positionType)) {
                                e.positionType = $filter('translate')('stat.positionType.value.' + e.status.positionType);
                            } else {
                                e.positionType = '';
                            }
                        });
                        
                        generateGroups(data);
                    });
                });
            }

            /* Retrieve group list for one category */
            function generateGroups(data) {
                $scope.groups = [];
                var groupAll = {
                        startDate : moment().valueOf(),
                        endDate : "7258028400000",
                        label : $scope.category.label,
                        categoryAge : null,
                        levelGame : null,
                        members : null
                };
                
                groupAll.persons = data;
                $scope.groups.push(groupAll);
                $scope.groups.push($scope.currentGroup);
                
                generateView();
            }

            /* drag and drop */
            function generateView() {
                var boardData = Board("Group management", $scope.groups.length);
                var columnsGroups = [];
                var columnName = $filter('translate')('group.form.columName');

                $scope.groups.forEach(function(e) {
                    var column = null;
                    if(e.label === ""){
                        column = new Column( columnName);
                    } else {
                        column = new Column( e.label);
                    }
                    
                    column.cards = [];
                    
                    if(angular.isDefined(e.persons)){
                        e.persons.forEach(function(m) {
                            var card = new Card(m._id, m.firstname, m.name, m.positionType, m.avatar);
                            column.cards.push(card);
                        });
                    } else {
                        var label = $filter('translate')('group.form.defaultCard');
                        var card = new Card("BIDON",label,"","","");
                        column.cards.push(card);
                    }
                    
                    columnsGroups.push(column);
                });
                boardData.columns = columnsGroups;

                $scope.groupBoard = BoardService.groupBoard(boardData);

                $scope.groupSortOptions = {
                    itemMoved : function(event) {
                        event.source.itemScope.modelValue.status = event.dest.sortableScope.$parent.column.name;
                        var card = event.dest.sortableScope.modelValue[event.dest.index];
                        
                        if(event.dest.sortableScope.$parent.column.name===columnName){
                            if(event.dest.sortableScope.modelValue[0].personId==="BIDON"){
                                $scope.removeCard(event.dest.sortableScope.column, event.dest.sortableScope.modelValue[0]);
                            }
                            $scope.currentGroup.members.push(card.personId);
                        }else{
                            $scope.currentGroup.members.remove(card.personId);
                        }
                    },
                    orderChanged : function(event) {
                    },
                    containment : '#board'
                };
            }

            $scope.removeCard = function(column, card) {
                BoardService.removeCard($scope.groupBoard, column, card);
            };

            $scope.addNewCard = function(column) {
                BoardService.addNewCard($scope.groupBoard, column);
            };
            
            /* Function action button form*/
            $scope.addGroup = function() {
                groupAPI.addGroup($scope.currentGroup).success(function(data) {
                    $scope.currentGroup = data;
                    $window.history.back();
                });
            };
            
            $scope.cancel = function() {
                $window.history.back();
            };

})

/**
 * @class qaobee.prive.organization.effective.GroupCtrl
 * @description Controller of templates/prive/organization/effective/group.html
 */
.controller(
        'GroupSheetCtrl',
        function($log, $window, $scope, $routeParams, BoardService, $route, $rootScope, $modal, structureCfgRestAPI, activityCfgRestAPI, personRestAPI, effectiveRestAPI, eventbus, groupAPI, $q, $filter, $location,
                $translatePartialLoader, user, meta, $q) {

            var idGroup = $routeParams.id;
            $scope.currentGroup = null;
            
            var lastRoute = $route.current;
            $scope.user = user;
            $scope.meta = meta;
            
            $translatePartialLoader.addPart('effective');
            $translatePartialLoader.addPart('stats');
            $translatePartialLoader.addPart('group');

            $scope.$watch(function() {
                return $filter('translate')('group.dashboard.maintitle');
            }, function(newval) {
                eventbus.prepForBroadcast("title", newval);
            });

            // return button
            $scope.doTheBack = function() {
                $window.history.back();
            };

            // initialize variables
            $scope.groups = [];
            $scope.gameLevels = [];

            /* retrieve all category for structure */
            function getLevelGameList() {
                activityCfgRestAPI.getLevelGameList(moment().valueOf(), meta.activity.code, meta.structure.country._id).success(function(gameLevels) {
                    $scope.gameLevels = gameLevels;
                    retrieveGroup ();
                });
            }
            getLevelGameList();
            
            /* retrieve group by id*/
            function retrieveGroup () {
                groupAPI.getGroup(idGroup).success(function(group) {
            
                    $scope.currentGroup = group;
                    getAllGroups($scope.currentGroup.categoryAge.code);
                
                    $scope.gameLevels.forEach(function(g) {
                       if(g.code === $scope.currentGroup.levelGame.code){
                           $scope.currentGroup.LevelGame = g;
                           
                           $log.log($scope.currentGroup.LevelGame==g);
                           
                       } 
                    });
                });
            }

            /* Retrieve group list for one category */
            function getAllGroups(category) {
                $scope.groups = [];

                /* retrieve all active group for one category */
                groupAPI.getActiveGroupsCategory($scope.meta.structure._id, category).success(function(groups) {
                    var listId = [];
                    if(groups === null) return;
                    groups.forEach(function(g) {
                        
                        listId.add(g.members);
                        $scope.groups.push(g);
                    });
                   
                    var listField = new Array("_id", "name", "firstname", "avatar", "status");
                    /* retrieve person information */
                    personRestAPI.getListPerson(listId, listField).success(function(data) {
                        var userById = {};

                        data.forEach(function(e) {
                            if (angular.isDefined(e.status.positionType)) {
                                e.positionType = $filter('translate')('stat.positionType.value.' + e.status.positionType);
                            } else {
                                e.positionType = '';
                            }
                            e.birthdate = $filter('date')(e.birthdate, 'yyyy');
                            e.age = moment().format("YYYY") - e.birthdate;
                            e.weight = e.status.weight;
                            e.height = e.status.height;
                            // deferred.resolve(e);
                            userById[e._id] = e;
                        });

                        $scope.groups.forEach(function(g) {
                            g.persons = [];
                            g.members.forEach(function(m){
                                this.push(userById[m]);
                            }, g.persons);
                        });
                       
                        generateView();
                    });
                });
            }
            

            /* drag and drop */
            function generateView() {
                var boardData = Board("Group management", $scope.groups.length);
                var columnsGroups = [];

                $scope.groups.forEach(function(e) {
                    var column = new Column( e.label);
                    column.cards = [];
 
                    e.persons.forEach(function(m) {
                        var card = new Card(m._id, m.firstname, m.name, m.positionType, m.avatar);
                        column.cards.push(card);
                    });
                    
                    columnsGroups.push(column);
                });
                boardData.columns = columnsGroups;

                $scope.groupBoard = BoardService.groupBoard(boardData);

                $scope.groupSortOptions = {

                    // restrict move across columns. move only within column.
                    /*
                     * accept: function (sourceItemHandleScope,
                     * destSortableScope) { return
                     * sourceItemHandleScope.itemScope.sortableScope.$id !==
                     * destSortableScope.$id; },
                     */
                    itemMoved : function(event) {
                        $log.log(event);
                        $log.log(event.source.itemScope.modelValue.status);
                        $log.log(event.dest.sortableScope.$parent.column.name);
                        event.source.itemScope.modelValue.status = event.dest.sortableScope.$parent.column.name;
                    },
                    orderChanged : function(event) {
                    },
                    containment : '#board'
                };
            }

            $scope.removeCard = function(column, card) {
                BoardService.removeCard($scope.groupBoard, column, card);
            };

            $scope.addNewCard = function(column) {
                BoardService.addNewCard($scope.groupBoard, column);
            };
            
            /* Function action button form*/
            $scope.updateGroup = function() {
                $log.log($scope.currentGroup);
                groupAPI.addGroup($scope.currentGroup).success(function(data) {
                    $scope.currentGroup = data;
                    $window.history.back();
                });
            };
            
            $scope.cancel = function() {
                $window.history.back();
            };

})    
.service('BoardService', [ '$modal', 'BoardManipulator', function($modal, BoardManipulator) {
    return {
        removeCard : function(board, column, card) {
            BoardManipulator.removeCardFromColumn(board, column, card);
        },

        addNewCard : function(board, column) {
            var modalInstance = $modal.open({
                templateUrl : 'views/partials/newCard.html',
                controller : 'NewCardController',
                backdrop : 'static',
                resolve : {
                    column : function() {
                        return column;
                    }
                }
            });
            modalInstance.result.then(function(cardDetails) {
                if (cardDetails) {
                    BoardManipulator.addCardToColumn(board, cardDetails.column, cardDetails.title, cardDetails.details);
                }
            });
        },
        groupBoard : function(board) {
            var groupBoard = new Board(board.name, board.numberOfColumns);
            angular.forEach(board.columns, function(column) {
                BoardManipulator.addColumn(groupBoard, column.name);
                angular.forEach(column.cards, function(card) {
                    BoardManipulator.addCardToColumn(groupBoard, column, card);
                });
            });
            return groupBoard;
        },

    };
} ])

.factory('BoardManipulator', function() {
    return {

        addColumn : function(board, columnName) {
            board.columns.push(new Column(columnName));
        },

        addCardToColumn : function(board, column, card) {
            angular.forEach(board.columns, function(col) {
                if (col.name === column.name) {
                    col.cards.push(card);
                }
            });
        },
        removeCardFromColumn : function(board, column, card) {
            angular.forEach(board.columns, function(col) {
                if (col.name === column.name) {
                    col.cards.splice(col.cards.indexOf(card), 1);
                }
            });
        },
        addBacklog : function(board, backlogName) {
            board.backlogs.push(new Backlog(backlogName));
        },

        addPhaseToBacklog : function(board, backlogName, phase) {
            angular.forEach(board.backlogs, function(backlog) {
                if (backlog.name === backlogName) {
                    backlog.phases.push(new Phase(phase.name));
                }
            });
        },

        addCardToBacklog : function(board, backlogName, phaseName, task) {
            angular.forEach(board.backlogs, function(backlog) {
                if (backlog.name === backlogName) {
                    angular.forEach(backlog.phases, function(phase) {
                        if (phase.name === phaseName) {
                            phase.cards.push(new Card(task.title, task.status, task.details));
                        }
                    });
                }
            });
        }
    };
});
