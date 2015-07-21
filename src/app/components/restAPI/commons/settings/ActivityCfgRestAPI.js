(function () {
    'use strict';
    /**
     * Services REST ActivityCfg
     *
     * @class qaobee.components.restAPI.commons.settings.ActivityCfgRestAPI
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     */
    angular.module('activityCfgRestAPI', []).value('activityCfgApiURL', '/rest/prive/administration/settings/activitycfg')

    .factory('activityCfgRestAPI', function ($http, activityCfgApiURL, $rootScope) {
        return {
            /**
             * @memberOf qaobee.components.restAPI.commons.settings.ActivityCfgRestAPI
             * @function getCategoriesAgeList
             * @description Récupération des catégories d'age d'une activité.
             * @param {Long}
             *            date : la date
             * @param {String}
             *            activityId : le code de l'activité
             * @param {String}
             *            countryId : le code pays du user
             * @returns {Array} com.qaobee.hive.business.model.commons.settings.CategoryAge
             */
            getCategoriesAgeList: function (date, activityId, countryId) {
                return $http({
                    url: activityCfgApiURL + '/params?paramFieldList=listCategoryAge&date=' + date + '&activityId=' + activityId + '&countryId=' + countryId,
                    method: "GET"
                });
            },
            
            /**
             * @memberOf qaobee.components.restAPI.commons.settings.ActivityCfgRestAPI
             * @function getCategoriesAgeList
             * @description Récupération d'une catégorie d'age.
             * @param {Long}
             *            date : la date
             * @param {String}
             *            activityId : le code de l'activité
             * @param {String}
             *            countryId : le code pays du user
             * @param {String}
         *            fieldCode : le code de la categorie   
             * @returns {Array} com.qaobee.hive.business.model.commons.settings.CategoryAge
             */
            getCategoryAge: function (date, activityId, countryId, fieldCode) {
                return $http({
                    url : activityCfgApiURL + '/param',
                    method : "POST",
                    data: {paramField:'listCategoryAge', date: date, activityId: activityId, countryId: countryId, fieldCode: fieldCode}
                    

                });
            },

            /**
             * @memberOf qaobee.components.restAPI.commons.settings.ActivityCfgRestAPI
             * @function getLevelGameList
             * @description Récupération des niveaux de jeux d'une activité.
             * @param {Long}
             *            date : la date
             * @param {String}
             *            activityId : le code de l'activité
             * @param {String}
             *            countryId : le code pays du user
             * @returns {Array} com.qaobee.hive.business.model.commons.settings.LevelGame
             */
            getLevelGameList: function (date, activityId, countryId) {
                return $http({
                    url: activityCfgApiURL + '/params?paramFieldList=listLevelGame&date=' + date + '&activityId=' + activityId + '&countryId=' + countryId,
                    method: "GET"
                });
            },

            /**
             * @memberOf qaobee.components.restAPI.commons.settings.ActivityCfgRestAPI
             * @function getRoleList
             * @description Récupération des fonctions d'une structure pour une activité.
             * @param {Long}
             *            date : la date du jour
             * @param {String}
             *            activityId : le code de l'activité
             * @param {String}
             *            countryId : le code pays du user
             * @returns {Array} com.qaobee.hive.business.model.commons.settings.RoleStr
             */
            getRoleList: function (date, activityId, countryId) {
                return $http({
                    url: activityCfgApiURL + '/params?paramFieldList=listRoleStr&date=' + date + '&activityId=' + activityId + '&countryId=' + countryId,
                    method: "GET"
                });
            },

            /**
             * @memberOf qaobee.components.restAPI.commons.settings.ActivityCfgRestAPI
             * @function getGenderList
             * @description Récupération des genres d'une activité.
             * @param {String}
             *            seasonCode : le code saison souhaité
             * @param {String}
             *            activityId : le code de l'activité
             * @param {String}
             *            countryId : le code pays du user
             * @returns {Array} com.qaobee.hive.business.model.commons.settings.Gender
             */
            getGenderList: function (date, seasonCode, activityId, countryId) {
                return $http({
                    url: activityCfgApiURL + '/params?paramFieldList=listGender&seasonCode=' + seasonCode + '&activityId=' + activityId + '&countryId=' + countryId + '&date=' + date,
                    method: "GET"
                });
            },

            /**
             * @memberOf qaobee.components.restAPI.commons.settings.ActivityCfgRestAPI
             * @function getLicenseTypeList
             * @description Récupération des types de licences pour une activité.
             * @param {String}
             *            seasonCode : le code saison souhaité
             * @param {String}
             *            activityId : le code de l'activité
             * @param {String}
             *            countryId : le code pays du user
             * @returns {Array} com.qaobee.hive.business.model.commons.settings.LicenseType
             */
            getLicenseTypeList: function (date, seasonCode, activityId, countryId) {
                return $http({
                    url: activityCfgApiURL + '/params?paramFieldList=listTypeLicense&seasonCode=' + seasonCode + '&activityId=' + activityId + '&countryId=' + countryId + '&date=' + date,
                    method: "GET"
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
                    method: "GET"
                });
            }

        };
    });

}());