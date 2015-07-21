(function () {
    'use strict';
    /**
     * Services REST Season
     * 
     * @class qaobee.rest.commons.settings.SeasonRestAPI
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     */
    angular.module('seasonsRestAPI', []).value('seasonsApiURL', '/rest/prive/administration/settings/season')

    .factory('seasonsAPI', function($http, seasonsApiURL) {
        return {
            /**
             * @memberOf qaobee.rest.commons.settings.seasonsRestAPI
             * @function getDetail
             * @description Récupération de la saison en cours d'une activité
             * @param {String}
             *            activityId : le code de l'activité
             * @param {String}
             *            countryId : le code pays du user
             * @returns {Object} com.qaobee.swarn.business.model.commons.settings.Season
             */
            getSeasonCurrent : function(activityId, countryId) {
                return $http({
                    url : seasonsApiURL + '/getseasoncurrent/?activityId=' + activityId + '&countryId=' + countryId,
                    method : "GET"
                });
            },
            /**
             * @memberOf qaobee.rest.commons.settings.seasonsRestAPI
             * @function getList
             * @description Récupération de la liste complete des saisons
             * @param {String}
             *            activityId : activity id
             * @param {String}
             *            countryId : current country code
             * @returns {Array} com.qaobee.swarn.business.model.commons.settings.Season
             */
            getList : function(activityId, countryId) {
                return $http({
                    url : seasonsApiURL + '/list?activityId=' + activityId + '&countryId=' + countryId,
                    method : "GET"
                });
            },
            /**
             * @memberOf qaobee.rest.commons.settings.seasonsRestAPI
             * @function getDetail
             * @description Récupération du détail d'une saison
             * @param {String}
             *            id : identifiant de la saison
             * @returns {Object} com.qaobee.swarn.business.model.commons.settings.Season
             */
            getDetail : function(id) {
                return $http({
                    url : seasonsApiURL + '/get/?id=' + id,
                    method : "GET"
                });
            },
            /**
             * @memberOf qaobee.rest.commons.settings.seasonsRestAPI
             * @function del
             * @description Suppression d'une saison
             * @param {String}
             *            id
             * @returns {Object} {"status": "ok","number": number}
             */
            del : function(id) {
                return $http({
                    url : seasonsApiURL + '/del/?id=' + id,
                    method : "DELETE"
                });
            },
            /**
             * @memberOf qaobee.rest.commons.settings.seasonsRestAPI
             * @function add
             * @description Ajout d'une saison
             * @param {Object}
             *            season com.qaobee.swarn.business.model.commons.settings.Season
             * @returns {Object} com.qaobee.swarn.business.model.commons.settings.Season
             */
            add : function(season) {
                return $http({
                    url : seasonsApiURL + "/add",
                    method : "PUT",
                    data : season
                });
            },

            /**
             * @memberOf qaobee.rest.commons.settings.seasonsRestAPI
             * @function getStructureSeasonsList
             * @description Récupération de la liste complete des saisons pour une structure
             * @param {String}
             *            activityId : activity id
             * @param {String}
             *            structureId : structure id
             * @returns {Array} com.qaobee.swarn.business.model.commons.settings.Season
             */
            getStructureSeasonsList : function(activityId, structureId) {
                return $http({
                    url : seasonsApiURL + '/listStructure?activityId=' + activityId + '&structureId=' + structureId,
                    method : "GET"
                });
            }
        };
    });

}());