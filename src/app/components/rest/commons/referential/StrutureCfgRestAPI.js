(function () {
    'use strict';
    /**
     * Services REST StructureCfg
     * 
     * @class qaobee.rest.prive.organization.structure.StructureCfgRestAPI
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     */
    angular.module('structureCfgRestAPI', []).value('structureCfgApiURL', '/api/1/commons/referencial/structureCfg')

    .factory('structureCfgRestAPI', function($http, structureCfgApiURL, $rootScope) {
        return {
            /**
             * @memberOf qaobee.rest.prive.organization.structure.StructureCfgRestAPI
             * @function getCategoriesAgeStrList
             * @description Récupération des catégories d'age d'une structure.
             * @param {String}
             *            seasonCode : le code saison souhaité 
             * @param {String}
             *            structureId : l'identifiant de la structure
             * @returns {Array} com.qaobee.swarn.business.model.organisation.structure.StructureCfg
             * FIXME : (mx) passer en requête POST
             */
            getCategoriesAgeStrList : function(seasonCode, structureId) {
                return $http({
                    url : structureCfgApiURL + '/params?paramFieldList=listCategoryAge&seasonCode='+ seasonCode +'&structureId=' + structureId,
                    method : "GET"
                });
            },

            /**
             * @memberOf qaobee.rest.prive.organization.structure.StructureCfgRestAPI
             * @function getCategoryAge
             * @description Récupération d'une categorie d'age
             * @param {String}
             *            seasonCode : le code saison souhaité 
             * @param {String}
             *            structureId : l'identifiant de la structure
             * @param {String}
             *            fieldCode : le code de la categorie            
             * @returns {Array} com.qaobee.swarn.business.model.organisation.structure.StructureCfg
             * FIXME : (mx) passer en requête POST
             */
            getCategoryAge : function(seasonCode, structureId, fieldCode) {
                return $http({
                    url : structureCfgApiURL + '/param',
                    method : "POST",
                    data: {paramField:'listCategoryAge', structureId: structureId, fieldCode: fieldCode, seasonCode:seasonCode}
                });
            },

            /**
             * @memberOf qaobee.rest.prive.organization.structure.StructureCfgRestAPI
             * @function getTeamsStrList
             * @description Récupération de toutes les équipes d'une structure.
             * @param {String}
             *            seasonCode : le code saison souhaité 
             * @param {String}
             *            structureId : l'identifiant de la structure
             * @returns {Array} com.qaobee.swarn.business.model.organisation.structure.StructureCfg
             */
            getTeamsStrList : function(seasonCode, structureId) {
                return $http({
                    url : structureCfgApiURL + '/params?paramFieldList=listTeams&seasonCode='+ seasonCode +'&structureId=' + structureId,
                    method : "GET"
                });
            }
        };
    });
    
}());