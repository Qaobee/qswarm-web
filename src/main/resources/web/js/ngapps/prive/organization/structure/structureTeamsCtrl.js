/**
 * Teams module
 */
var structureTeamsMod = angular.module('structureTeamsMod', ['structureCfgRestAPI', 'personRestAPI', 'activityCfgRestAPI', 'seasonsAPI', 'ngTable', 'ngTableExport', 'xeditable']);

structureTeamsMod.config(function ($routeProvider, metaDatasProvider) {
    $routeProvider
        .when('/private/structureTeamsMod',
        {
            controller: 'structureTeamsCtrl',
            resolve: {
                user: metaDatasProvider.checkUser,
                meta: metaDatasProvider.getMeta
            },
            templateUrl: 'templates/prive/organization/structure/structureTeams.html'
        }
    );
});


// Controller for the structureTeams.html
structureTeamsMod.controller('structureTeamsCtrl', function ($log, $scope, $rootScope, $translate, $filter, structureCfgRestAPI, personRestAPI, seasonsAPI, activityCfgRestAPI, $sce, ngTableParams, $modal, user, meta) {

    //Initialize the variables
    function initialisation() {
        $scope.steps = ['one', 'two'];
        $scope.step = 0;
        $scope.inBack = false;
        $scope.selectedSeasonTeams = [];
        var teamStaffMember = {};
        var teamsStr = {};
        $scope.selectedTeam = null;
        $scope.selectedStaffMember = null;
        $scope.teamData = null;
        $scope.teamAgeCategory = null;
        $scope.teamGameLvl = null;
        $scope.teamChampionchip = null;
        $scope.teamLabel = null;
        $scope.staffMemberData = null;
        $scope.staffMemberId = null;
        $scope.staffMemberRole = null;
        $scope.staffMemberRoleCode = null;

        $scope.person = {};
        var d = new Date();
        $scope.date = d.getTime();
        $scope.gameLevels = [];
        $scope.ageCategories = [];

        $scope.teamComplete = {};
        $scope.team = {};
        $scope.idx = [];
        $scope.personId = null;
        $scope.selectedPerson = null;
        $scope.selecPersonIdx = null;
        $scope.role = null;
        $scope.structureSeasons = [];

        var personIndex = null;
        var personDetails = [];
        $scope.personDetails = [];
        getCategoriesAgeList();
        getListPersonStructure();
    }

    /** retrieve meta data */
    $scope.meta = meta;
    $scope.season = $scope.meta.season;
    $scope.structure = $scope.meta.structure;

    $scope.season = {"selected": $scope.season.code};
    $scope.saison = $scope.season.selected;

    initialisation();

    /**
     * Get all age categories for the structure
     */
    function getCategoriesAgeList() {
        activityCfgRestAPI.getCategoriesAgeList($scope.date, $scope.structure.codeActivity, $scope.structure.country._id).success(function (ageCategories) {
            $scope.ageCategories = ageCategories;
            $log.debug($scope.ageCategories);
            getLevelGameList();
        });
    }

    function getLevelGameList() {
        activityCfgRestAPI.getLevelGameList($scope.date, $scope.structure.codeActivity, $scope.structure.country._id).success(function (gameLevels) {
            $scope.gameLevels = gameLevels;
            getStructureSeasonsList();
        });
    }

    // Get list of declared seasons for the structure 
    function getStructureSeasonsList() {
        $log.debug('structureTeamsCtrl.getStructureSeasonsList()');
        seasonsAPI.getStructureSeasonsList($scope.structure.codeActivity, $scope.structure._id).success(function (structureSeasons) {
            for (var i = 0; i < structureSeasons.length; i++) {
                $scope.structureSeasons.push(structureSeasons[i].code);
            }
            $log.debug($scope.structureSeasons);
            getTeamsStrList($scope.saison);
        });
    }

    function getTeamsStrList(seasonCode) {
        $log.debug('structureTeamsCtrl.getTeamsStrList()');

        structureCfgRestAPI.getTeamsStrList(seasonCode, $scope.structure._id).success(function (teams) {
            $log.debug('This is the value from getTeamsStrList function', seasonCode);
            $log.debug('This is the value for teams', teams);

            $scope.selectedSeasonTeams = teams;
            $log.debug('This is selectedSeasonTeams', $scope.selectedSeasonTeams);

            if ($scope.selectedSeasonTeams.length > 0) {
                for (var i = 0; i < $scope.selectedSeasonTeams.length; i++) {
                    teamsStr = $scope.selectedSeasonTeams[i];
                    for (var j = 0; j < teamsStr.listStaffMember.length; j++) {
                        teamStaffMember = teamsStr.listStaffMember[j];
                        if (teamStaffMember.personId !== null) {
                            getPersonById(teamStaffMember);
                        }
                    }
                }
            }
        });
    }

    // Modal add team
    $scope.addTeam = function (teamComplete) {
        $log.debug('addTeam', teamComplete);
        $modal.open({
            templateUrl: 'templates/prive/organization/structure/addTeamsModal.html',
            controller: 'addTeamCtrl',
            backdrop: 'true',
            scope: $scope,
            size: 'lg',
            resolve: {
                teamComplete: function () {
                    return $scope.teamComplete;
                },
                meta: function () {
                    return $scope.meta;
                }
            }
        });
    };

    // Modal edit team
    $scope.editTeam = function (team) {
        $scope.team = team;
        $log.debug('editTeam', $scope.team);
        $modal.open({
            templateUrl: 'templates/prive/organization/structure/editTeamStaffModal.html',
            controller: 'editTeamCtrl',
            backdrop: 'true',
            scope: $scope,
            size: 'lg',
            resolve: {
                team: function () {
                    return $scope.team;
                },
                meta: function () {
                    return $scope.meta;
                }
            }
        });
    };

    $scope.openPlayerSheetModal = function (person) {
        $scope.person = person;
        $modal.open({
            templateUrl: 'templates/prive/organization/effective/playerPersonalInfoModal.html',
            controller: 'PlayerPersonalInfoModalInstanceCtrl',
            size: 'lg',
            resolve: {
                person: function () {
                    return $scope.person;
                }
            }
        });
    };

    $scope.teamSelected = function (idx, selectedTeam) {
        $scope.idx = idx;
        $scope.teamComplete = selectedTeam;
        $log.debug($scope.idx, $scope.teamComplete);
    };

    /**
     * Get all structure teams and their staff for the selected season
     */
    function getTeamsStrListForSelectedSeason() {
        return $scope.selectedSeasonTeams;
    }


    // ng-Table management
    $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10,          // count per page
        sorting: {
            categoryAgeCode: 'asc'     // initial sorting
        }
    }, {
        total: function () {
            return getTeamsStrListForSelectedSeason().length; // length of data
        },
        counts: [],
        getData: function ($defer, params) {
            var orderedData = params.sorting() ?
                $filter('orderBy')(getTeamsStrListForSelectedSeason(), params.orderBy()) : getTeamsStrListForSelectedSeason();
            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }

    });

    $scope.$watch('saison', function (newValue, oldValue) {
        if (angular.isDefined(newValue) && !angular.equals(newValue, oldValue)) {
            $log.debug('This is the value from $watch saison function', newValue);
            getTeamsStrList(newValue);
            $scope.tableParams.total($scope.selectedSeasonTeams.length);
            $scope.tableParams.reload();
        }
    });


    /**
     * Get data of a person and create object person in memory inside of teamStaffMember
     */

    function getPersonById(staffMember) {
        $log.debug('structureTeamsCtrl.getPersonById()');
        personRestAPI.getPerson(staffMember.personId).success(function (person) {
            staffMember.person = person;
        });
    }

    $scope.showCategoryAge = function (team) {
        $log.debug(team.categoryAge.code);
        var selected = [];
        if (team.categoryAge.code) {
            selected = $filter('filter')($scope.ageCategories, {code: team.categoryAge.code});
            $log.debug('This is from var selected', selected[0].code);
        }
        return selected.length ? selected[0].label : 'Not set';
    };

    $scope.showGameLevel = function (team) {
        var selected = [];
        if (team.teamGameLvlCode) {
            selected = $filter('filter')($scope.gameLevels, {code: team.teamGameLvlCode});
        }
        return selected.length ? selected[0].label : 'Not set';
    };

    $scope.getSelectedTeam = function (selectedTeam, teamData) {
        $scope.selectedTeam = selectedTeam;
        $scope.teamData = teamData;
        $scope.selectedStaffMember = null;
        $scope.teamLabel = teamData.label;
        $scope.teamAgeCategory = teamData.categoryAgeCode;
        $scope.teamGameLvl = teamData.gameLevel;
        $scope.teamChampionchip = teamData.championchip;
        $log.debug(teamData);
        $log.debug($scope.selectedTeam);
        $log.debug($scope.selectedStaffMember);
    };

    $scope.getSelectedTeamStaff = function (selectedTeam, teamLabel, teamAgeCategory, selectedStaffMember, staffMemberData) {
        $scope.selectedTeam = selectedTeam;
        $scope.teamLabel = teamLabel;
        $scope.teamAgeCategory = teamAgeCategory;
        $scope.selectedStaffMember = selectedStaffMember;
        $scope.staffMemberData = staffMemberData;
        $scope.staffMemberId = staffMemberData.personId;
        $scope.staffMemberRole = staffMemberData.role.label;
        $scope.staffMemberRoleCode = staffMemberData.role.code;
    };

    $scope.showPersonDetails = function (idx, person) {
        personIndex = idx;
        personDetails = person;
        $log.debug(personIndex, personDetails);
        openModalPerson(person);
    };

    // Modal show person details
    function openModalPerson(personDetails) {
        $scope.personDetails = personDetails;
        console.log('personDetails', $scope.personDetails);
        var modalInstance = $modal.open({
            templateUrl: 'templates/prive/organization/structure/personDetailsModal.html',
            controller: 'personDetailsCtrl',
            backdrop: 'true',
            scope: $scope,
            size: 'sm',
            resolve: {
                personDetails: function () {
                    return $scope.personDetails;
                }
            }
        });
    }

    // Get list of all declared persons for the structure
    function getListPersonStructure() {
        $log.debug('structureTeamsCtrl.getListPersonStructure()'+'-'+'$scope.season.selected : '+$scope.season.selected +'-'+'$scope.structure._id : '+$scope.structure._id);
        personRestAPI.getListPersonStructure($scope.season.selected, $scope.structure._id).success(function (person) {
            var data = [];
            data = person;
            $log.debug(data);
            $scope.len = data.length;
            // ng-Table management
            $scope.tableParams1 = new ngTableParams({
                page: 1,            // show first page
                count: 3,          // count per page
                sorting: {
                    name: 'asc'     // initial sorting
                }
            }, {
                total: data.length, // length of data
                counts: [],
                getData: function ($defer, params) {
                    var orderedData = params.sorting() ?
                        $filter('orderBy')(data, params.orderBy()) : data;
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            });
        });
    }

    $scope.changeSeason = function (season) {
        $scope.saison = season;
        $log.debug('This is the value from changeSeason function', $scope.saison);
    };
});

// Controller for the addTeamsModal.html
structureTeamsMod.controller('addTeamCtrl', function ($log, $scope, $rootScope, $modalInstance, teamComplete, $window, activityCfgRestAPI, meta) {

    function initialisation() {
        $log.debug('addTeamCtrl');
        $scope.myForm = {};
        $scope.myForm.$invalid = false;
        $scope.teamComplete = teamComplete;
        $log.debug($scope.teamComplete);
        var inBackState = false;
        var structureId = $scope.structure._id;

        var d = new Date();
        $scope.date = d.getTime();

        $scope.ageCategories = [];
        $scope.gameLevels = [];
        $scope.ageCategory = {"selected": null};
        $scope.gameLevel = {"selected": null};
        $scope.championship = {"selected": null};
        getCategoriesAgeList();
    }

    /** retrieve meta data */
    $scope.meta = meta;
    $scope.structure = $scope.meta.structure;

    initialisation();

    function getCategoriesAgeList() {
        activityCfgRestAPI.getCategoriesAgeList($scope.date, $scope.structure.codeActivity, $scope.structure.country._id).success(function (ageCategories) {
            $scope.ageCategories = ageCategories;
            getLevelGameList();
        });
    }

    function getLevelGameList() {
        activityCfgRestAPI.getLevelGameList($scope.date, $scope.structure.codeActivity, $scope.structure.country._id).success(function (gameLevels) {
            $scope.gameLevels = gameLevels;
        });
    }

    $scope.isFirstStep = function () {
        return $scope.step === 0;
    };

    $scope.isLastStep = function () {
        return $scope.step === ($scope.steps.length - 1);
    };

    $scope.getCurrentStep = function () {
        return $scope.steps[$scope.step];
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.handlePrevious = function () {
        inBackState = true;
        console.log('in back ', inBackState);// $scope.inBack)
        $scope.step -= ($scope.isFirstStep()) ? 0 : 1;
    };

    $scope.handleNext = function (dismiss) {
        if ($scope.myForm.$invalid) {
            alert('You have invalidated the form. Please fix.');
            inBackState = false;
        }
        else {
            if ($scope.isLastStep()) {
                // $modalInstance.close($scope.item);
            } else {
                $scope.step += 1;
            }
        }
    };
});

// Controller for editTeamStaffModal.html
structureTeamsMod.controller('editTeamCtrl', function ($log, $scope, $rootScope, $modal, $modalInstance, team, $window, activityCfgRestAPI, meta) {

    $log.debug('editTeamCtrl');

    function initialisation() {
        $scope.team.listStaffMember = team.listStaffMember;
        $scope.tempStaff = [];

        for (var j = 0; j < $scope.team.listStaffMember.length; j++) {
            $scope.tempStaff.push($scope.team.listStaffMember[j]);
        }

        $scope.person = {};
        $scope.personSheet = {};
        $scope.role = null;
        $scope.selecPersonIdx = '';
        d = new Date();
        $scope.date = d.getTime();

        $scope.roles = [];
        $scope.selectedRole = {"default": null};
        $scope.newPerson = Array.create();
        getRoleList();
    }

    /** retrieve meta data */
    $scope.meta = meta;
    $scope.structure = $scope.meta.structure;

    initialisation();

    // Modal add person if it doesn't exist in DB
    $scope.addPersonModal = function () {
        console.log('addPersonModal');
        $modal.open({
            templateUrl: 'templates/prive/organization/structure/addPersonModal.html',
            controller: 'addPersonCtrl',
            backdrop: 'true',
            scope: $scope,
            size: 'lg',
            resolve: {
                newPerson: function () {
                    return $scope.newPerson;
                }
            }
        });
    };

    function getRoleList() {
        activityCfgRestAPI.getRoleList($scope.date, $scope.structure.codeActivity, $scope.structure.country._id).success(function (roles) {
            var coach = roles[3];
            var acoach = roles[4];
            var kine = roles[5];
            $scope.roles.push(coach, acoach, kine);
            //$log.debug($scope.roles);
        });
    }


    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
        initialisation();
    };

    $scope.getRole = function (role, pers, persIdx) {

        if (!role) {
            //$log.debug($scope.person, $scope.role);
            alert('Select role to add person');
            //reset();   
            //$log.debug($scope.selecPersonIdx, $scope.person, $scope.role);
        } else {
            verifyRolePerson(role, pers, persIdx);
        }
    };

    function verifyRolePerson(role, pers, persIdx) {
        var exist = false;
        for (var p = 0; p < $scope.tempStaff.length; p++) {
            var roleCode = $scope.tempStaff[p].role.code;
            var persId = $scope.tempStaff[p].person._id;
            $log.debug('This is variable roleCode', roleCode);
            $log.debug('This is variable persId', persId);
            if (pers._id === persId && role.code === roleCode) {
                alert('Choose another role for this person');
                exist = true;
                reset();
                break;
            }

        }
        if (exist === false) {
            pushMember(role, pers, persIdx);
        }
    }

    $scope.openPlayerSheetModal = function (person) {
        $scope.personSheet = person;
        $modal.open({
            templateUrl: 'templates/prive/organization/effective/playerPersonalInfoModal.html',
            controller: 'PlayerPersonalInfoModalInstanceCtrl',
            size: 'lg',
            resolve: {
                person: function () {
                    return $scope.personSheet;
                }
            }
        });
    };

    function pushMember(role, pers, persIdx) {
        $scope.role = role;
        $scope.person = pers;
        $scope.selecPersonIdx = persIdx;
        //$log.debug($scope.person, $scope.role);
        $scope.tempStaff.push({person: $scope.person, personId: $scope.person._id, role: $scope.role});
        //$log.debug($scope.selecPersonIdx, $scope.tempStaff);
        reset();
    }

    function reset() {
        $scope.selecPersonIdx = '';
        $scope.person = null;
        $scope.role = null;
    }

    $scope.removeMember = function (idx) {
        $scope.tempStaff.splice(idx, 1);
        $log.debug(idx, $scope.tempStaff);
    };

    $scope.validate = function () {
        $log.debug($scope.tempStaff);
        $scope.team.listStaffMember = [];

        for (var j = 0; j < $scope.tempStaff.length; j++) {
            $scope.team.listStaffMember.push($scope.tempStaff[j]);
        }

        //$scope.team.listStaffMember.push($scope.tempStaff);
        $log.debug('New staff object to insert in DB is :');
        $log.debug($scope.team.listStaffMember);
    };

});

// Controller for addPersonModal.html
structureTeamsMod.controller('addPersonCtrl', function ($log, $scope, $modalInstance, $window, $filter) {

    $log.debug('addPersonCtrl');
    $scope.newPerson = Array.create();

    $scope.dt = new Date();

    $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
    };

    $scope.format = 'dd/MM/yyyy';

    $scope.clear = function () {
        $scope.dt = null;
    };

    // Disable weekend selection
    $scope.disabled = function (date, mode) {
        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.validate = function () {

    };
});

// Controller for personDetailsModal.html
structureTeamsMod.controller('personDetailsCtrl', function ($log, $scope, $modalInstance, $window, $filter, personDetails) {

    $log.debug('personDetailsCtrl');

    $scope.personDetails = personDetails;
    $log.debug($scope.personDetails);

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});