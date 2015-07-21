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
    angular.module('qaobee.prive', ['common-config', 'qaobee.home', 'effectiveRestAPI', 'personRestAPI', 'structureCfgRestAPI'])
        .config(function ($routeProvider, metaDatasProvider) {
            $routeProvider.when('/private/notifications', {
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


//
    ;
}());
