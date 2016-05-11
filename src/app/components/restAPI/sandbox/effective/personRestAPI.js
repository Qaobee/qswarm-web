(function () {
    'use strict';
    /**
     * Person Rest API
     *
     * @class qaobee.components.restAPI.sandbox.effective.PersonRestAPI
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     */

    angular.module('personRestAPI', []).value('personAPIURL', '/api/1/sandbox/effective/person')

        .factory('personRestAPI', function ($http, personAPIURL) {
            return {
                /**
                 * @memberOf qaobee.components.restAPI.sandbox.effective.PersonRestAPI
                 * @function getListMemberEffective()
                 * @description retrieve list of person
                 * @param {String}  listId : list of id person
                 * @param {String} listField : list of field for one person
                 * @returns {Array} com.qaobee.hive.business.model.sandbox.effective.SB_Person
                 */
                getListPerson: function (listId, listField) {
                    return $http({
                        url: personAPIURL + '/list',
                        method: 'POST',
                        data: {listId: listId, listField: listField}
                    });
                },

                /**
                 * @memberOf qaobee.components.restAPI.sandbox.effective.PersonRestAPI
                 * @function getListPersonSandbox()
                 * @description retrieve list of person for sandbox's user
                 * @param {String} sandboxId : the sandbox id
                 * @returns {Array} com.qaobee.hive.business.model.sandbox.effective.SB_Person
                 */
                getListPersonSandbox: function (sandboxId) {
                    return $http({
                        url: personAPIURL + '/listSandbox/?sandboxId=' + sandboxId,
                        method: 'get'
                    });
                },

                /**
                 * @memberOf qaobee.components.restAPI.sandbox.effective.PersonRestAPI
                 * @function addPerson()
                 * @description add person for a structure
                 * @param {Person} person : person to add
                 * @returns {person} com.qaobee.hive.business.model.sandbox.effective.SB_Person
                 */
                addPerson: function (person) {
                    return $http({
                        url: personAPIURL + '/add',
                        method: 'PUT',
                        data: person
                    });
                },

                /**
                 * @memberOf qaobee.components.restAPI.sandbox.effective.PersonRestAPI
                 * @function getPerson()
                 * @description retrieve one person by this Id
                 * @param {id} id : person id
                 * @returns {person} com.qaobee.hive.business.model.sandbox.effective.SB_Person
                 */
                getPerson: function (id) {
                    return $http({
                        url: personAPIURL + '/get/?_id=' + id,
                        method: 'GET'
                    });
                },

                /**
                 * @memberOf qaobee.components.restAPI.sandbox.effective.PersonRestAPI
                 * @function updatePerson()
                 * @description update a person
                 * @param {Person} person : person to update
                 * @returns {person} com.qaobee.hive.business.model.sandbox.effective.SB_Person
                 */
                updatePerson: function (person) {
                    return $http({
                        url: personAPIURL + '/update',
                        method: 'PUT',
                        data: person
                    });
                }
            };
        });

}());