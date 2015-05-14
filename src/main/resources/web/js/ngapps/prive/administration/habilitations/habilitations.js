/**
 * Module partie administration des habilitations du site
 *
 * @author Xavier MARIN
 * @class qaobee.admin.habilitations
 * @requires {@link qaobee.directives.adminmenu|qaobee.directives.adminmenu}
 * @requires {@link qaobee.rest.admin.adminHabilitAPI|qaobee.rest.admin.adminHabilitAPI}
 * @copyright <b>QaoBee</b>.
 */
angular.module('habilitations', ['adminHabilitAPI', 'adminmenu'])

    .config(function ($routeProvider) {
        $routeProvider.when('/admin/habilitations', {
            controller: 'AdminHabilitCtrl',
            templateUrl: 'templates/admin/habilits.html'
        }).when('/admin/habilitations/edit/:id', {
            controller: 'AdminHabilitDetailCtrl',
            templateUrl: 'templates/admin/habilitsDetail.html'
        }).when('/admin/habilitations/new', {
            controller: 'AdminHabilitAddCtrl',
            templateUrl: 'templates/admin/habilitsDetail.html'
        });
    })

/**
 * @class qaobee.admin.habilitations.AdminHabilitCtrl
 * @description Liste des habilitations. Contrôleur principal de la page
 *              templates/admin/habilits.html
 */
    .controller('AdminHabilitCtrl', function ($scope, eventbus, adminHabilitAPI, $filter) {
        // TODO : vérif des droits d'admin ici
        $scope.habilits = undefined;

        /**
         * @name $scope.loadData
         * @function
         * @memberOf qaobee.admin.habilitations.AdminHabilitCtrl
         * @description Récupère la liste des habilitations
         */
        $scope.loadData = function () {
            adminHabilitAPI.get().success(function (data) {
                $scope.habilits = data;
            });
        };

        /**
         * @name $scope.del
         * @function
         * @memberOf qaobee.admin.habilitations.AdminHabilitCtrl
         * @param idhabilit
         *            id de l'habilitation
         * @param key
         *            clef
         * @description Supprime une habilitations en fonction de son id
         */
        $scope.del = function (idhabilit, key) {
            modalConfirm($filter('translate')('popup.title.delete.habilit'), $filter('translate')('popup.message.delete') + key + ".<br />" + $filter('translate')('popup.confirm.ask'), function () {
                adminHabilitAPI.del(idhabilit).success(function (data, status, headers, config) {
                    toastr.success(key + $filter('translate')('popup.success.delete'));
                    $scope.loadData();
                });
            });
        };
        $scope.loadData();
    })

/**
 * @class qaobee.admin.habilitations.AdminHabilitAddCtrl
 * @description Ajout d'une nouvelle habilitation. Contrôleur principal de la
 *              page templates/admin/habilitsDetail.html
 */
    .controller('AdminHabilitAddCtrl', function ($scope, eventbus, adminHabilitAPI, $http, $location) {
        $scope.curhabilit = {};
        $scope.curhabilit.key = "no_name";

        /**
         * @name $scope.addorupdate
         * @function
         * @memberOf qaobee.admin.habilitations.AdminHabilitAddCtrl
         * @description Crée une nouvelle habilitation
         */
        $scope.addorupdate = function () {
            adminHabilitAPI.add($scope.curhabilit).success(function (data) {
                toastr.success(data.key + $filter('translate')('popup.success.added'));
                $location.path('/admin/habilitations/edit/' + data._id);
            });
        };

    })

/**
 * @class qaobee.admin.habilitations.AdminHabilitDetailCtrl
 * @description Modification d'une habilitation. Contrôleur principal de la page
 *              templates/admin/habilitsDetail.html
 */
    .controller('AdminHabilitDetailCtrl', function ($scope, eventbus, adminHabilitAPI, $routeParams, $location, $filter) {
        $scope.curhabilit = {};

        /**
         * @name $scope.loadData
         * @function
         * @memberOf qaobee.admin.habilitations.AdminHabilitDetailCtrl
         * @description Récupère le détail d'une habilitation en fonction de son id
         */
        $scope.loadData = function () {
            adminHabilitAPI.getDetail($routeParams.id).success(function (data) {
                $scope.curhabilit = data;
            });
        };

        /**
         * @name $scope.addorupdate
         * @function
         * @memberOf qaobee.admin.habilitations.AdminHabilitDetailCtrl
         * @description Met à jour l'habilitation
         */
        $scope.addorupdate = function () {
            if ($scope.signupForm.$valid) {
                console.log('Form is valid');
                adminHabilitAPI.add($scope.curhabilit).success(function (data) {
                    $location.path('/admin/habilitations');
                    toastr.success(data.key + $filter('translate')('popup.success.updated'));
                });
            }
        };
        $scope.loadData();
    })

//
;