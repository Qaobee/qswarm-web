(function () {
    'use strict';
    /**
     * Services REST ActivityCfg
     *
     * @class qaobee.components.restAPI.commons.settings.ActivityCfgRestAPI
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     */
    angular.module('activityCfgRestAPI', []).value('activityCfgApiURL', '/api/1/commons/settings/activitycfg')

    .factory('activityCfgRestAPI', function ($http, activityCfgApiURL) {
        return {
            /**
             * @memberOf qaobee.components.restAPI.commons.settings.ActivityCfgRestAPI
             * @function getParamFieldList
             * @description Récupération des catégories d'age d'une activité.
             * @param {Long}
             *            date : la date
             * @param {String}
             *            activityId : le code de l'activité
             * @param {String}
             *            countryId : le code pays du user
             * @param {String}
             *            paramFieldList : la liste de valeur
             * @returns {Array} com.qaobee.hive.business.model.commons.settings.CategoryAge
             */
            getParamFieldList: function (date, activityId, countryId, paramFieldList) {
                return $http({
                    url: activityCfgApiURL + '/params?paramFieldList='+paramFieldList+'&date=' + date + '&activityId=' + activityId + '&countryId=' + countryId,
                    method: 'GET'
                });
            }, 

            /**
             * @memberOf qaobee.components.restAPI.commons.settings.ActivityCfgRestAPI
             * @function getShapeConditionList
             * @description Retrieve list of shape condition
             *
             * @param {String}
             *            seasonCode : le code saison souhaité
             * @param {String}
             *            activityId : le code de l'activité
             * @param {String}
             *            countryId : le code pays du user
             * @param {String}
             *            positionType : Le poste du joueur
             * @param {String}
             *            typeCarac : le type carac (physicalFolder, mentalFolder, technicalFolder)
             * @returns {Array} com.qaobee.hive.business.model.commons.settings.ShapeCondition
             */
            getCaracteristicPlayer: function (seasonCode, activityId, countryId, positionType, typeCarac) {
                return $http({
                    url: activityCfgApiURL + '/caracteristicPlayer?=seasonCode=' + seasonCode + '&activityId=' + activityId + '&countryId=' + countryId + '&positionType=' + positionType + '&typeCarac=' + typeCarac,
                    method: 'GET'
                });
            }

        };
    });

}());