(function () {
    'use strict';
    /**
     * Module REST d'administration des habilitations
     *
     * @class qaobee.components.restAPI.commons.technical.adminIndicatorRestAPI
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     */
    angular.module('adminindicatorRestAPI', []).value('adminIndicatorURL', '/api/1/admin/indicator')

        .factory('adminIndicatorAPI', function ($http, adminIndicatorURL) {
            return {
                /**
                 * @memberOf qaobee.components.restAPI.commons.technical.adminIndicatorRestAPI
                 * @function get
                 * @description Récupération de la liste des indicateurs
                 * @returns {Array} com.qaobee.hive.model.organisation.Indicator
                 */
                get: function () {
                    return $http({
                        url: adminIndicatorURL,
                        method: 'GET'
                    });
                },
                /**
                 * @memberOf qaobee.components.restAPI.commons.technical.adminIndicatorRestAPI
                 * @function getByKey
                 * @description Récupération du détail d'un indicateur par sa clef
                 * @param {String} libelleKey
                 * @returns {Object} com.qaobee.hive.model.organisation.Indicator
                 */
                getByKey: function (libelleKey) {
                    return $http({
                        url: adminIndicatorURL + '/getkey/?libelleKey=' + libelleKey,
                        method: 'GET'
                    });
                },
                /**
                 * @memberOf qaobee.components.restAPI.commons.technical.adminIndicatorRestAPI
                 * @function getDetail
                 * @description Récupération du détail d'un indicateur
                 * @param {String}  id
                 * @returns {Object} com.qaobee.hive.model.organisation.Indicator
                 */
                getDetail: function (id) {
                    return $http({
                        url: adminIndicatorURL + '/get/?id=' + id,
                        method: 'GET'
                    });
                },
                /**
                 * @memberOf qaobee.components.restAPI.commons.technical.adminIndicatorRestAPI
                 * @function del
                 * @description Suppression d'un indicateur
                 * @param {String} id
                 * @returns {Object} {'status': 'ok','number': number}
                 */
                del: function (id) {
                    return $http({
                        url: adminIndicatorURL + '/del/?id=' + id,
                        method: 'DELETE'
                    });
                },
                /**
                 * @memberOf qaobee.components.restAPI.commons.technical.adminIndicatorRestAPI
                 * @function add
                 * @description Ajout d'un indicateur
                 * @param {Object} indicator com.qaobee.hive.model.organisation.Indicator
                 * @returns {Object} com.qaobee.hive.model.organisation.Indicator
                 */
                add: function (indicator) {
                    return $http({
                        url: adminIndicatorURL + '/add',
                        method: 'PUT',
                        data: indicator
                    });
                }
            };
        });

}());