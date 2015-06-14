/**
 * Age categories module
 */
var structureAgeCategoriesMod = angular.module('structureAgeCategoriesMod', [ 'structureCfgRestAPI', 'activityCfgRestAPI', 
                                                                              'ngTable', 'ngTableExport', 'personRestAPI' ]);

structureAgeCategoriesMod.config(function ($routeProvider) {
    $routeProvider
        .when('/private/structureAgeCategoriesMod',
        {
            controller: 'structureAgeCategegoriesCtrl',
            templateUrl: 'templates/prive/organization/structure/structureAgeCategories.html'
        }
    );

});

// Main controller for the module
structureAgeCategoriesMod.controller('structureAgeCategegoriesCtrl', function ($log, $scope, $rootScope, $filter, structureCfgRestAPI, personRestAPI, $sce, ngTableParams, $modal) {


     //Initialize the variables
    function initialisationStructure() {
        $scope.categories = [];
        ageCatStaffMember = {};
        ageCatStr = {}; 
        $scope.selectedCategory = null;
        $scope.categoryData = null;
        $scope.selectedStaffMember = null;
        $scope.staffMemberData = null;
        $scope.categoryLabel = null;
        $scope.ageMin = null;
        $scope.catCode = null;
        $scope.ageMax = null;
        $scope.gender = null;
        $scope.order = null;
        $scope.staffMemberId = null;
        $scope.staffMemberRole = null;
        $scope.staffMemberRoleCode = null;
        //$scope.currentSeason = $rootScope.season.code;
        //$scope.seasons = [];
        getCategoriesAgeStrList();
    }
    
    // Modal age categories
    $scope.addCategory = function () {
        var modalInstance = $modal.open({
            templateUrl: 'templates/prive/organization/structure/addAgeCategoriesModal.html',
            controller: 'addAgeCategoriesModalCtrl',
            backdrop: 'true',
            scope: $scope,
            size: 'lg'
        });
    };

    // Modal staff
    $scope.addStaff = function () {           
            var modalInstance = $modal.open({
                templateUrl: 'templates/prive/organization/structure/addStaffModal.html',
                controller: 'addStaffModalCtrl',
                backdrop: 'true',
                scope: $scope,
                size: 'lg'
            });                
    };
    
    
    /**
     * Get all structure age categories and their staff 
     */

    function getCategoriesAgeStrList() {
        $log.debug('structureAgeCategegoriesCtrl.getCategoriesAgeStrList()');

        structureCfgRestAPI.getCategoriesAgeStrList($scope.meta.season.code, $scope.meta.structure._id).success(function (categories) {
            //$scope.categories = categories; 
            //getSeasonsCodeStrList();
            
            var data = [];
            
            data = categories;

            if (data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    ageCatStr = data[i];                    
                    for (var j = 0; j < ageCatStr.listStaffMember.length; j++) {
                        ageCatStaffMember = ageCatStr.listStaffMember[j];
                            if(ageCatStaffMember.personId !== null){  
                            getPersonById(ageCatStaffMember);
                        }                           
                    }                    
                }
            }
           
            
            /**
             * ng-Table management
            */

            $scope.tableParams = new ngTableParams({
                page: 1,            // show first page
                count: 10,          // count per page
                sorting: {
                    label: 'asc'     // initial sorting
                }
            }, {             
                total: data.length, // length of data
                counts: [],
                getData: function($defer, params) {
                    var orderedData = params.sorting() ?
                    $filter('orderBy')(data, params.orderBy()) : data;
                    // params.total(orderedData.length);  set total for recalculation of pagination
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            });        
        });
    }    

    
    /**
     * Get data of a person and create object person in memory inside of ageCatStaffMember
     */
    
    function getPersonById(staffMember) {
        $log.debug('structureAgeCategegoriesCtrl.getPersonById()');
        personRestAPI.getPerson(staffMember.personId).success(function (person) {
            staffMember.person = person;
        });       
    }
    
    /* function getSeasonsCodeStrList(){
     $log.debug('structureAgeCategegoriesCtrl.getSeasonsCodeStrList()');

         structureCfgRestAPI.getSeasonsCodeStrList($rootScope.structure._id).success(function(seasons){
             $scope.seasons = seasons;
         });
     }*/

    $scope.getSelectedCategory = function (selectedCategory, categoryData) {
        $scope.selectedCategory = selectedCategory;
        $scope.categoryData = categoryData;
        $scope.selectedStaffMember = null;      
        $scope.categoryLabel = categoryData.label;
        $scope.ageMin = categoryData.ageMin;
        $scope.catCode = categoryData.code;
        $scope.ageMax = categoryData.ageMax;
        $scope.gender = categoryData.genre;
        $scope.order = categoryData.order;
        $log.debug(categoryData);       
        $log.debug($scope.selectedCategory);
        $log.debug($scope.selectedStaffMember);
    };
    
    $scope.getSelectedCategoryStaff = function (selectedCategory, categoryLabel, selectedStaffMember, staffMemberData) {
       $scope.selectedCategory = selectedCategory;
       $scope.categoryLabel = categoryLabel;
       $scope.selectedStaffMember = selectedStaffMember;
       $scope.staffMemberData = staffMemberData;
       $scope.staffMemberId = staffMemberData.personId;
       $scope.staffMemberRole = staffMemberData.role.label;
       $scope.staffMemberRoleCode = staffMemberData.role.code;
       $log.debug(staffMemberData);      
       $log.debug($scope.selectedCategory);
       $log.debug($scope.selectedStaffMember, $scope.categoryLabel);
    };
   
    initialisationStructure();
});

// Age categories modal controller
structureAgeCategoriesMod.controller('addAgeCategoriesModalCtrl', function($scope, $log, $modalInstance, $rootScope, activityCfgRestAPI, $modal, $filter, $http, structureCfgRestAPI, personRestAPI, ngTableParams) {
    
    function initialisationCategories() {
        $scope.categorySelected = {};
        $scope.selection = [];
        $scope.selectedAgeCategory = [];
        $scope.ageCategoryData = [];
        structure = $scope.meta.structure; 
        structureCodeActivity = structure.codeActivity;
        structureCountry = structure.addressStr.country;
        countryCode = 'CNTR-250-FR-FRA';
        d = new Date();
        date = d.getTime();
        $scope.steps = ['one', 'two'];
        $scope.step = 0;
        $scope.inBack=false;
        $scope.myForm={};
        $scope.myForm.$invalid = false;
        $scope.personId = [];
        $scope.choosenRole = null;
        $scope.len = 0;
        //$scope.staff.selection = null;
        getCategoriesAgeList();
    }
    
    var inBackState=false;
    
    $scope.isFirstStep = function() {
        return $scope.step === 0;
    };
    
    $scope.isLastStep = function() {
        return $scope.step === ($scope.steps.length - 1);
    };
    
    $scope.getCurrentStep = function() {
        return $scope.steps[$scope.step];
    };
    
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };   
    
    $scope.handlePrevious = function() {
        inBackState=true;
        console.log('in back ',inBackState);// $scope.inBack)
        $scope.step -= ($scope.isFirstStep()) ? 0 : 1;
    };
    
    $scope.handleNext = function(dismiss) {
        if($scope.myForm.$invalid){
            alert('You have invalidated the form. Please fix.');
            inBackState=false;
        }
        else
        {                       
           if($scope.isLastStep()) {               
              // $modalInstance.close($scope.item);
           } else {
             $scope.step += 1;
             getListPersonStructure();
           }                       
        }
    };
   
    function getCategoriesAgeList() {
        $log.debug('addAgeCategoriesModalCtrl.getCategoriesAgeList()');
        
        activityCfgRestAPI.getCategoriesAgeList(date, structureCodeActivity, countryCode).success(function(ageCategories) {           
            
            var data = [];
            data = ageCategories;
            $log.debug(data);
            
            /**
             * ng-Table management
            */

            $scope.tableParams2 = new ngTableParams({
                page: 1,            // show first page
                count: 5,          // count per page
                sorting: {
                    label: 'asc'     // initial sorting
                }
            }, {             
                total: data.length, // length of data
                counts: [],
                getData: function($defer, params) {

                    var orderedData = params.sorting() ?
                            $filter('orderBy')(data, params.orderBy()) : data;

                            //params.total(orderedData.length);  set total for recalculation of pagination
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }); 
        });       
    }
    
    $scope.getSelectedAgeCategory = function (selectedAgeCategory, ageCategoryData) {
        $scope.selectedAgeCategory = selectedAgeCategory;
        $scope.ageCategoryData = ageCategoryData;
        $log.debug($scope.selectedAgeCategory);
        $log.debug($scope.ageCategoryData);
    };
    
    
    
function getListPersonStructure() {
        
        var seasonCode = $scope.meta.season.code;
        var structureId = $scope.meta.structure._id;
        
        personRestAPI.getListPersonStructure(seasonCode, structureId).success(function (person) {
            
            var data = [];
            data = person;
            $log.debug(person);
            $scope.len = data.length;
            /**
             * ng-Table management
            */

            $scope.tableParams3 = new ngTableParams({
                page: 1,            // show first page
                count: 5,          // count per page
                sorting: {
                    name: 'asc'     // initial sorting
                }
            }, {             
                total: data.length, // length of data
                counts: [],
                getData: function($defer, params) {

                    var orderedData = params.sorting() ?
                            $filter('orderBy')(data, params.orderBy()) : data;

                            // params.total(orderedData.length);  set total for recalculation of pagination
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }); 
        });       
    }
  /*  $scope.staff=[{
        id:{},
        role:{}
    }];
    $scope.$watch('selection', function() {
       console.log('change', $scope.selection);
       angular.forEach($scope.selection, function(person) {
           $scope.staff.id = person._id;
           //$scope.staff.role = role;
           $log.debug($scope.staff);
       });
    }, true);*/
    $scope.selectedPers = function (pers){
        if (!pers.selected) {   
            $scope.personId = pers;
            $log.debug($scope.personId);
            /*var selPerson = [];
            angular.forEach($scope.personId, function(pers) {
                selPerson += $scope.personId;
            }); 
            $log.debug(selPerson);*/
        }       
    };
    
    $scope.personSelected = {};
    var i;
    for(i = 0; i<$scope.len;i++){
        console.log($scope.personSelected[i]);
    }
    $scope.selectRole = function (role) {
        $scope.choosenRole = role;
        $log.debug(role);
    };
    
    $scope.add = function () {
        if (($scope.personId !== null) && ($scope.choosenRole !== null)) {
           // $scope.staff.selection = [$scope.personId, $scope.choosenRole];
            $log.debug($scope.personId);
            $log.debug($scope.choosenRole);
           // $log.debug($scope.staff.selection);
            $modalInstance.dismiss('cancel');             
        }       
        else {
            alert("Select person and/or role!");
        }        
    };
    
    initialisationCategories();
});

// Staff modal controller
structureAgeCategoriesMod.controller('addStaffModalCtrl', function($scope, $log, $modalInstance, $rootScope, personRestAPI, $modal, $filter, $http, ngTableParams) {
    
    function initializationStaff() {
        $scope.personId = null;
        $scope.choosenRole = null;
        getListPersonStructure();
    }
    
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };  
    
    function getListPersonStructure() {
        
        var seasonCode = $scope.meta.season.code;
        var structureId = $scope.meta.structure._id;
        
        personRestAPI.getListPersonStructure(seasonCode, structureId).success(function (person) {
            
            var data = [];
            data = person;
            $log.debug(person);
            
            /**
             * ng-Table management
            */

            $scope.tableParams4 = new ngTableParams({
                page: 1,            // show first page
                count: 5,          // count per page
                sorting: {
                    name: 'asc'     // initial sorting
                }
            }, {             
                total: data.length, // length of data
                counts: [],
                getData: function($defer, params) {

                    var orderedData = params.sorting() ?
                            $filter('orderBy')(data, params.orderBy()) : data;

                         //  params.total(orderedData.length); set total for recalculation of pagination
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }); 
        });       
    }
    
    $scope.selectedPerson = function (pers){
        if (!pers.selected) {           
            $log.debug(pers);
            $scope.personId = pers._id;                        
        }        
    };
    
    $scope.selectRole = function (role) {
        $scope.choosenRole = role;
        $log.debug(role);
    };
    
    $scope.add = function () {
        if (($scope.personId !== null) && ($scope.choosenRole !== null)) {
            $log.debug($scope.personId);
            $log.debug($scope.choosenRole);
            $modalInstance.dismiss('cancel');             
        }       
        else {
            alert("Select person and/or role!");
        }        
    };
    
    initializationStaff();
});