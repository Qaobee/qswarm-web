/**
 * Module partie privée du site
 *
 * @author Xavier MARIN
 * @class qaobee.prive.prive
 * @namespace qaobee.prive
 *
 * @requires {@link qaobee.prive.profile|qaobee.prive.profile}
 * @requires {@link qaobee.prive.firtsConnectWizzard|qaobee.prive.firtsConnectWizzard}
 * @requires {@link qaobee.prive.effectif.playersheet|qaobee.prive.effectif.playersheet}
 * @requires {@link qaobee.prive.effectif.categories|qaobee.prive.effectif.categories}
 * @requires {@link https://github.com/DataTorrent/malhar-angular-dashboard|ui.dashboard}
 * @requires {@link qaobee.directives.widget.calendar|qaobee.directives.widget.calendar}
 * @requires {@link qaobee.directives.widget.weather|qaobee.directives.widget.weather}
 * @requires {@link qaobee.directives.widget.notifications|qaobee.directives.widget.notification}
 * @requires {@link qaobee.directives.widget.news|qaobee.directives.widget.news}
 * @requires {@link qaobee.rest.prive.profileRestAPI|qaobee.rest.prive.profileRestAPI}
 * @requires {@link qaobee.rest.public.publicRestAPI|qaobee.rest.public.publicRestAPI}
 * @requires {@link qaobee.rest.prive.notificationsRestAPI|qaobee.rest.prive.notificationsRestAPI}
 * @copyright <b>QaoBee</b>.
 */
angular.module(
    'prive',    ['common-config', 'effectiveRestAPI'])


    .config(function ($routeProvider, metaDatasProvider) {
        'use strict';

        $routeProvider.when('/private', {
            controller: 'PrivateCtrl',
            resolve: {
                user: metaDatasProvider.checkUser,
                meta: metaDatasProvider.getMeta
            },
            templateUrl: 'templates/prive/home.html'
        }).when('/private/notifications', {
            controller: 'NotificationsCtrl',
            resolve: {
                user: metaDatasProvider.checkUser,
                meta: metaDatasProvider.getMeta
            },
            templateUrl: 'templates/prive/profile/notifications.html'
        }).when('/private/calendar', {
            controller: 'CalendarCtrl',
            resolve: {
                user: metaDatasProvider.checkUser,
                meta: metaDatasProvider.getMeta
            },
            templateUrl: 'templates/prive/calendar.html'
        });
    })

/**
 * @class qaobee.prive.prive.PrivateCtrl
 * @description Main controller of templates/prive/welcome.html
 */
    .controller('PrivateCtrl', function ($scope, userInfosAPI, $location, $rootScope, $q, $filter, eventbus, user, meta) {
        'use strict';
        var structureprom = $q.defer();
        var placeprom = $q.defer();

        $scope.structureprom = structureprom.promise;
        $scope.placeprom = placeprom.promise;


        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();


        structureprom.resolve(meta.structure);
        $scope.user = user;
        placeprom.resolve(user.address);
        $scope.limit = 5;
        

    })
//
;

