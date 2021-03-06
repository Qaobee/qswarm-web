(function () {
    'use strict';
    /**
     * Module REST d'administration des habilitations
     *
     * @class qaobee.components.restAPI.commons.technical.adminHabilitRestAPI
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     */
    angular.module('adminHabilitRestAPI', []).value('adminHabilitURL', '/api/1/admin/habilitations')

        .factory('adminHabilitAPI', function ($http, adminHabilitURL) {
            return {
                /**
                 * @memberOf qaobee.components.restAPI.commons.technical.adminHabilitRestAPI
                 * @function get
                 * @description Récupération de la liste des habilitations
                 * @returns {Array} com.qaobee.hive.business.model.commons.technical.Habilitation
                 */
                get: function () {
                    return $http({
                        url: adminHabilitURL,
                        method: 'GET'
                    });
                },
                /**
                 * @memberOf qaobee.components.restAPI.commons.technical.adminHabilitRestAPI
                 * @function getByKey
                 * @description Récupération du détail d'une habilitation par sa clef
                 * @param {String} key
                 * @returns {Object} com.qaobee.hive.business.model.commons.technical.Habilitation
                 */
                getByKey: function (key) {
                    return $http({
                        url: adminHabilitURL + '/getkey/?key=' + key,
                        method: 'GET'
                    });
                },
                /**
                 * @memberOf qaobee.components.restAPI.commons.technical.adminHabilitRestAPI
                 * @function getDetail
                 * @description Récupération du détail d'une habilitation
                 * @param {String} id
                 * @returns {Object} com.qaobee.hive.business.model.commons.technical.Habilitation
                 */
                getDetail: function (id) {
                    return $http({
                        url: adminHabilitURL + '/get/?id=' + id,
                        method: 'GET'
                    });
                },
                /**
                 * @memberOf qaobee.components.restAPI.commons.technical.adminHabilitRestAPI
                 * @function del
                 * @description Suppression d'une habilitation
                 * @param {String} id
                 * @returns {Object} {'status': 'ok','number': number}
                 */
                del: function (id) {
                    return $http({
                        url: adminHabilitURL + '/del/?id=' + id,
                        method: 'DELETE'
                    });
                },
                /**
                 * @memberOf qaobee.components.restAPI.commons.technical.adminHabilitRestAPI
                 * @function add
                 * @description Ajout d'une habilitation
                 * @param {Object} habilit com.qaobee.hive.business.model.commons.technical.Habilitation
                 * @returns {Object} com.qaobee.hive.business.model.commons.technical.Habilitation
                 */
                add: function (habilit) {
                    return $http({
                        url: adminHabilitURL + '/add',
                        method: 'PUT',
                        data: habilit
                    });
                }
            };
        });

}());