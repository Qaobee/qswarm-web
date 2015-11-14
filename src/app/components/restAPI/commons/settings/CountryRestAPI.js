(function () {
    'use strict';
    /**
     * Services REST Country
     * 
     * @class qaobee.components.restAPI.commons.settings.CountryRestAPI
     * @author Jerome Roue
     * @copyright <b>QaoBee</b>.
     */
    angular.module('countryRestAPI', []).value('countryApiURL', '/api/1/commons/settings/country')

    .factory('countryRestAPI', function($http, countryApiURL) {
        return {
            /**
             * @memberOf qaobee.components.restAPI.commons.settings.CountryRestAPI
             * @function getAlpha2
             * @description Récupération du pays à partir du code Alpha-2 provenant de Google
             * @param {String}
             *            alpha2 : code alpha-2 du pays
             * @returns {Object} com.qaobee.hive.business.model.commons.settings.Country
             */
            getAlpha2 : function(alpha2) {
                return $http({
                    url : countryApiURL + '/getAlpha2/?alpha2=' + alpha2,
                    method : 'GET'
                });
            }
        
        };
    });

}());