(function () {
    'use strict';
    /**
     * Module partie privée du site
     *
     * @author Xavier MARIN
     * @class qaobee.prive.prive
     * @namespace qaobee.prive
     *
     * @requires {@link qaobee.rest.prive.profileRestAPI|qaobee.rest.prive.effectiveRestAPI}
     * @requires {@link qaobee.rest.prive.notificationsRestAPI|qaobee.rest.prive.personRestAPI}
     * @requires {@link qaobee.rest.prive.notificationsRestAPI|qaobee.rest.prive.structureCfgRestAPI}
     * @copyright <b>QaoBee</b>.
     */
    angular.module('prive', ['common-config', 'effectiveRestAPI', 'personRestAPI', 'structureCfgRestAPI'])
        .config(function ($routeProvider, metaDatasProvider) {
            $routeProvider.when('/private', {
                controller: 'HomeControler',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/prive/home.html'

            }).when('/private/notifications', {
                controller: 'NotificationsCtrl',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/prive/profile/notifications.html'

            }).when('/private/calendar', {
                controller: 'CalendarCtrl',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/prive/calendar.html'
            });
        })

    /**
     * @class qaobee.prive.prive.PrivateCtrl
     * @description Main controller of templates/prive/home.html
     */
        .controller('HomeControler', function ($log, $scope, $translatePartialLoader, $location, $rootScope, $q, $filter, eventbus, user, meta, effectiveRestAPI, personRestAPI, structureCfgRestAPI) {
            $translatePartialLoader.addPart('main');
            $translatePartialLoader.addPart('stats');

            $scope.user = user;
            $scope.meta = meta;
            $scope.effective = [];
            $scope.currentCategory = {};

            $('.collapsible').collapsible({accordion: false});

            /* Retrieve list of category for structure */
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

            /* Retrieve list player */
            $scope.getEffective = function () {
                effectiveRestAPI.getListMemberEffective($scope.meta.season.code, $scope.meta.structure._id, $scope.currentCategory.code).success(function (data) {
                    /* build list id for request API person */
                    var listId = [];
                    data.forEach(function (a) {
                        listId = a.members;
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
        })
//
    ;
}());
