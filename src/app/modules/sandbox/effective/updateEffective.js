(function () {
    'use strict';
    /**
     * Module dashboard effective
     *
     * @author Christophe Kervella
     * @class qaobee.modules.sandbox.effective.updateEffective
     * @namespace qaobee.modules.sandbox.effective
     *
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.updateEffective', [
        'activityCfgRestAPI',
        'effectiveRestAPI',
        'personRestAPI',
        'userRestAPI'])

        .config(function ($routeProvider, metaDatasProvider) {
            $routeProvider.when('/private/updateEffective/:effectiveId', {
                controller: 'UpdateEffectiveControler',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/sandbox/effective/writeEffective.html'
            });
        })

        /**
         * @class qaobee.modules.sandbox.effective.UpdateEffectiveControler
         * @description Main controller for view updateEffective.html
         */
        .controller('UpdateEffectiveControler', function ($log, $window, $scope, $routeParams, $http, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta,
                                                          activityCfgRestAPI, effectiveRestAPI, personRestAPI, userRestAPI) {

            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('effective');
            $translatePartialLoader.addPart('stats');

            $scope.effectiveId = $routeParams.effectiveId;
            $scope.addEffectiveTitle = false;

            // return button
            $scope.doTheBack = function () {
                if (user.newEffective) {
                    delete user.newEffective;
                }
                $window.history.back();
            };

            $scope.user = user;
            $scope.meta = meta;
            $scope.effective = {};
            $scope.listCategory = [];
            $scope.persons = [];
            $scope.selectedPlayers = [];

            /* get SB_Effective */
            $scope.getEffective = function () {
                if (user.newEffective) {
                    $scope.effective = user.newEffective;
                    $scope.getPersonSandBox();
                } else {
                    effectiveRestAPI.getEffective($scope.effectiveId).success(function (data) {
                        $scope.effective = data;
                        $scope.getPersonSandBox();
                    });
                }
            };

            /* Retrieve list of categoryAge */
            $scope.getListCategoryAge = function () {
                activityCfgRestAPI.getParamFieldList(moment().valueOf(), $scope.meta.activity._id, $scope.meta.structure.country._id, 'listCategoryAge').success(function (data) {
                    $scope.listCategory = data.sortBy(function (n) {
                        return n.order;
                    });
                });
            };

            /* get SB_Person */
            $scope.getPersonSandBox = function () {
                personRestAPI.getListPersonSandbox($scope.meta.sandbox._id).success(function (data) {
                    data.forEach(function (a) {
                        if (angular.isDefined(a.status.positionType)) {
                            a.positionType = $filter('translate')('stats.positionType.value.' + a.status.positionType);
                        } else {
                            a.positionType = '';
                        }

                        a.checked = false;
                        var trouve = $scope.effective.members.find(function (n) {
                            return n.personId === a._id;
                        });

                        if (angular.isDefined(trouve)) {
                            a.checked = true;
                        }
                    });
                    $scope.persons = data.sortBy(function (n) {
                        return n.name;
                    });
                });
            };

            /* Add player  */
            $scope.onClickAddPlayer = function () {
                if (!$scope.effectiveCaracterSection.$valid) {
                    $scope.effectiveCaracterSection.effectiveLabel.$setDirty();
                    $scope.effectiveCaracterSection.effectiveCategoryAge.$setDirty();
                } else {
                    user.newEffective = $scope.effective;
                    $location.path('private/addPlayer/' + meta._id);
                }
            };

            /* update effective */
            $scope.writeEffective = function () {
                if (user.newEffective) {
                    delete user.newEffective;
                }

                $scope.listCategory.forEach(function (c) {
                    if (c.code === $scope.effective.categoryAge.code) {
                        $scope.effective.categoryAge = c;
                    }
                });

                effectiveRestAPI.update($scope.effective).success(function (effective) {
                    toastr.success($filter('translate')('updateEffective.toastSuccess', {
                        effective: effective.categoryAge.label
                    }));

                    $location.path('private/effective/' + $scope.user.effectiveDefault);
                });
            };

            /* Update effective list member*/
            $scope.changed = function (item) {
                if (item.checked) {
                    var roleMember = {code: 'player', label: 'Joueur'};
                    var member = {personId: item._id, role: roleMember};
                    $scope.effective.members.push(member);
                } else {
                    $scope.effective.members.remove(function (n) {
                        return n.personId === item._id;
                    });
                }
            };

            /* check user connected */
            $scope.checkUserConnected = function () {
                userRestAPI.getUserById(user._id).success(function () {
                    $scope.getListCategoryAge();
                    $scope.getEffective();
                }).error(function () {
                    $log.error('UpdateEffectiveControler : User not Connected');
                });
            };
            /* Primary, check if user connected */
            $scope.checkUserConnected();
        })
    //
    ;
}());
