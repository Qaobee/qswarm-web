/**
 * Module partie administration des activités
 *
 * @author Xavier MARIN
 * @class qaobee.prive.administration.settings.activities
 * @requires {@link qaobee.directives.adminmenu|qaobee.directives.adminmenu}
 * @requires {@link qaobee.rest.prive.administration.settings.activityAPI|qaobee.rest.admin.activityAPI}
 * @copyright <b>QaoBee</b>.
 */
angular.module('activities', ['activityAPI', 'adminmenu'])

    .config(function ($routeProvider) {
        $routeProvider.when('/admin/activities', {
            controller: 'AdminActivityCtrl',
            templateUrl: 'templates/prive/administration/settings/activities.html'
        }).when('/admin/activities/edit/:id', {
            controller: 'AdminActivityDetailCtrl',
            templateUrl: 'templates/prive/administration/settings/activityDetail.html'
        }).when('/admin/activities/new', {
            controller: 'AdminActivityAddCtrl',
            templateUrl: 'templates/prive/administration/settings/activityDetail.html'
        });
    })

/**
 * @class qaobee.prive.administration.settings.activities.AdminActivityCtrl
 * @description Liste des activities. Contrôleur principal de la page
 *              templates/prive/administration/settings/Activities.html
 */
    .controller('AdminActivityCtrl', function ($scope, eventbus, activityAPI, $location, $filter) {
        // TODO : vérif des droits d'admin ici
        $scope.activities = [];
        /**
         * @name $scope.loadData
         * @function
         * @memberOf qaobee.prive.administration.settings.activities.AdminActivityCtrl
         * @description Récupère la liste des activités
         */
        $scope.loadData = function () {
            activityAPI.getList().success(function (data) {
                $scope.activities = data;
            });
        };

        /**
         * @name $scope.del
         * @function
         * @memberOf qaobee.prive.administration.settings.activities.AdminActivityCtrl
         * @param idActivity
         *            id du activity
         * @param key
         *            clef
         * @description Supprime une activité en fonction de son id
         */
        $scope.del = function (idActivity, key) {
            modalConfirm($filter('translate')('popup.title.delete.Activity'), $filter('translate')('popup.message.delete') + key + ".<br />" + $filter('translate')('popup.confirm.ask'), function () {
                activityAPI.del(idActivity).success(function (data, status, headers, config) {
                    toastr.success(key + $filter('translate')('popup.success.delete'));
                    $scope.loadData();
                });
            });
        };
        $scope.loadData();
    })

/**
 * @class qaobee.prive.administration.settings.activities.AdminActivityAddCtrl
 * @description Ajout d'une nouvelle activité. Contrôleur principal de la page
 *              templates/prive/administration/settings/ActivitiesDetail.html
 */
    .controller('AdminActivityAddCtrl', function ($scope, eventbus, activityAPI, $http, $location, $filter) {
        $scope.curactivity = {};
        $scope.curactivity.name = "no_name";

        /**
         * @name $scope.addorupdate
         * @function
         * @memberOf qaobee.prive.administration.settings.activities.AdminActivityAddCtrl
         * @description Crée une nouvelle activité
         */
        $scope.addorupdate = function () {
            activityAPI.add($scope.curactivity).success(function (data) {
                toastr.success(data.name + $filter('translate')('popup.success.added'));
                $location.path('/admin/activities/edit/' + data._id);
            });
        };

    })

/**
 * @class qaobee.prive.administration.settings.activities.AdminActivityDetailCtrl
 * @description Modification d'une activité. Contrôleur principal de la page
 *              templates/prive/administration/settings/ActivitiesDetail.html
 */
    .controller('AdminActivityDetailCtrl', function ($scope, eventbus, activityAPI, $routeParams, $location, $filter) {
        $scope.curactivity = {};

        /**
         * @name $scope.loadData
         * @function
         * @memberOf qaobee.prive.administration.settings.activities.AdminActivityDetailCtrl
         * @description Récupère le détail d'un activité en fonction de son id
         */
        $scope.loadData = function () {
            activityAPI.getDetail($routeParams.id).success(function (data) {
                $scope.curactivity = data;
            });
        };

        /**
         * @name $scope.addorupdate
         * @function
         * @memberOf qaobee.prive.administration.settings.activities.AdminActivityDetailCtrl
         * @description Met à jour l'activité
         */
        $scope.addorupdate = function () {
            activityAPI.add($scope.curactivity).success(function (data, status, headers, config) {
                $location.path('/admin/activities');
                toastr.success(data.name + $filter('translate')('popup.success.updated'));
            });
        };
        $scope.loadData();

    })

//
;