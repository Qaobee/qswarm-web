/**
 * Module partie administration des blogs du site
 *
 * @author Xavier MARIN
 * @class qaobee.admin.blogAdmin
 * @requires {@link qaobee.directives.adminmenu|qaobee.directives.adminmenu}
 * @requires {@link qaobee.rest.admin.adminBlogAPI|qaobee.rest.admin.adminBlogAPI}
 * @copyright <b>QaoBee</b>.
 */
angular.module('blogAdmin', ['adminBlogAPI', 'adminmenu'])

    .config(function ($routeProvider) {
        $routeProvider.when('/admin/blogposts', {
            controller: 'AdminBlogsCtrl',
            templateUrl: 'templates/admin/blogs.html'
        }).when('/admin/blogposts/edit/:id', {
            controller: 'AdminBlogDetailCtrl',
            templateUrl: 'templates/admin/blogDetail.html'
        }).when('/admin/blogposts/new', {
            controller: 'AdminBlogAddCtrl',
            templateUrl: 'templates/admin/blogDetail.html'
        });
    })

/**
 * @class qaobee.admin.blogAdmin.AdminBlogsCtrl
 * @description Liste des blogs. Contrôleur principal de la page
 *              templates/admin/blogs.html
 */
    .controller('AdminBlogsCtrl', function ($scope, eventbus, adminBlogAPI, $location, $filter) {
        // TODO : vérif des droits d'admin ici
        $scope.blogposts = undefined;

        /**
         * @name $scope.loadData
         * @function
         * @memberOf qaobee.admin.blogAdmin.AdminBlogsCtrl
         * @description Récupère la liste des blogs
         */
        $scope.loadData = function () {
            adminBlogAPI.get().success(function (data) {
                $scope.blogposts = data;
            });
        };

        /**
         * @name $scope.del
         * @function
         * @memberOf qaobee.admin.blogAdmin.AdminBlogsCtrl
         * @param idblog
         *            id du blog
         * @param title
         *            titre
         * @description Supprime un blog en fonction de son id
         */
        $scope.del = function (idblog, title) {
            modalConfirm($filter('translate')('popup.title.delete.blogpost'), $filter('translate')('popup.message.delete') + title + ".<br />" + $filter('translate')('popup.confirm.ask'), function () {
                adminBlogAPI.del(idblog).success(function (data) {
                    toastr.success(title + $filter('translate')('popup.success.delete'));
                    $scope.loadData();
                });
            });
        };
        $scope.loadData();
    })

/**
 * @class qaobee.admin.blogAdmin.AdminBlogAddCtrl
 * @description Ajout d'un nouveau blog. Contrôleur principal de la page
 *              templates/admin/blogDetail.html
 */
    .controller('AdminBlogAddCtrl', function ($scope, eventbus, adminBlogAPI, $http, $location, $filter) {
        $scope.curblogpost = {};
        $scope.curblogpost.title = "Sans nom";

        /**
         * @name $scope.addorupdate
         * @function
         * @memberOf qaobee.admin.blogAdmin.AdminBlogAddCtrl
         * @description Crée un nouveau blog
         */
        $scope.addorupdate = function () {
            if ($scope.curblogpost.exerp.isBlank()) {
                $scope.curblogpost.exerp = $scope.curblogpost.content.stripTags().truncate(150);
            }
            adminBlogAPI.add($scope.curblogpost).success(function (data) {
                toastr.success(data.title + $filter('translate')('popup.success.added'));
                $location.path('/admin/blogposts/edit/' + data._id);
            });
        };

    })

/**
 * @class qaobee.admin.blogAdmin.AdminBlogDetailCtrl
 * @description Edition d'un blog. Contrôleur principal de la page
 *              templates/admin/blogDetail.html
 */
    .controller('AdminBlogDetailCtrl', function ($scope, eventbus, adminBlogAPI, $routeParams, $location, $filter) {
        $scope.curblogpost = {};

        /**
         * @name $scope.loadData
         * @function
         * @memberOf qaobee.admin.blogAdmin.AdminBlogDetailCtrl
         * @description Récupère le détail d'un blog en fonction de son id
         */
        $scope.loadData = function () {
            adminBlogAPI.getDetail($routeParams.id).success(function (data) {
                $scope.curblogpost = data;
            });
        };

        /**
         * @name $scope.addorupdate
         * @function
         * @memberOf qaobee.admin.blogAdmin.AdminBlogDetailCtrl
         * @description Met à jour le blog
         */
        $scope.addorupdate = function () {
            if ($scope.curblogpost.exerp.isBlank()) {
                $scope.curblogpost.exerp = $scope.curblogpost.content.stripTags().truncate(150);
            }
            adminBlogAPI.add($scope.curblogpost).success(function (data, status, headers, config) {
                $location.path('/admin/blogposts');
                toastr.success(data.title + $filter('translate')('popup.success.updated'));
            });
        };
        $scope.loadData();
    })

//
;