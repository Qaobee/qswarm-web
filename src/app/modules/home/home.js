(function () {
    'use strict';
angular.module(
    'qaobee.home', [
        
        /* qaobee Rest API*/
        'effectiveRestAPI',
        'personRestAPI',
        'widget.nextEvent'])

    .config(function ($routeProvider, metaDatasProvider) {
        $routeProvider.when('/private', {
            controller: 'HomeControler',
            resolve: {
                user: metaDatasProvider.checkUser,
                meta: metaDatasProvider.getMeta
            },
            templateUrl: 'app/modules/home/home.html'

        });
    })
/**
 * @class qaobee.prive.prive.PrivateCtrl
 */
    .controller('HomeControler', function ($log, $scope, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, effectiveRestAPI, personRestAPI) {
        $translatePartialLoader.addPart('main');
        $translatePartialLoader.addPart('stats');

        $scope.user = user;
        $scope.meta = meta;
        $scope.effective = [];
        $scope.currentCategory = {};

        $('.collapsible').collapsible({accordion: false});

        /* Retrieve list of category for structure
         structureCfgRestAPI.getCategoriesAgeStrList($scope.meta.season.code, $scope.meta.structure._id).success(function (data) {
         $scope.categories = data;
         var found = false;
         data.forEach(function (b) {
         b.listStaffMember.forEach(function (c) {
         if (c.personId === $scope.user._id) {
         $scope.currentCategory = b;
         found = true;
         }
         });
         });
         if (!found) {
         $scope.currentCategory = data[0];
         }

         $scope.getEffective();

         });
         */
    
        
    
        /* Retrieve list player */
        $scope.getEffective = function () {
            effectiveRestAPI.getListMemberEffective($scope.meta._id, $scope.currentCategory.code).success(function (data) {
                
                /* build list id for request API person */   
                var listId = [];
                data.forEach(function (a) {
                    a.members.forEach(function (b) {
                        if (b.role.code==='player') {
                            listId.push(b.personId);
                        }    
                    });
                });
                
                var listField = Array.create('_id', 'name', 'firstname', 'avatar', 'status');
                /* retrieve person information */
                personRestAPI.getListPerson(listId, listField).success(function (data) {

                    data.forEach(function (e) {
                        if (angular.isDefined(e.status.positionType)) {
                            e.positionType = $filter('translate')('stat.positionType.value.' + e.status.positionType);
                        } else {
                            e.positionType = '';
                        }
                    });
                    $scope.effective = data;
                });
            });
        };
    
        $scope.getEffective();
    });
}());