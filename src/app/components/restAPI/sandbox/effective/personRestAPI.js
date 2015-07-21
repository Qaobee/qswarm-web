/**
 * Services REST Person API
 * 
 * @class app.components.rest.prive.sandbox.effective.PersonRestAPI
 * @author Christophe Kervella
 * @copyright <b>QaoBee</b>.
 */

angular.module('personRestAPI', []).value('personAPIURL', '/api/1/sandbox/effective/person')

.factory('personRestAPI', function($http, personAPIURL) {
    return {
        /**
         * @memberOf app.components.rest.prive.sandbox.effective.PersonRestAPI
         * @function getListMemberEffective()
         * @description retrieve list of person
         * @param {String}
         *            listId : list of id person
         * @param {String}
         *            listField : list of field for one person
         * @returns {Array} com.qaobee.hive.business.model.sandbox.effective.SB_Person
         */
        getListPerson : function(listId, listField) {
            return $http({
                url : personAPIURL + '/list',
                method : "POST",
                data: {listId: listId, listField: listField}
            });
        },
        
        /**
         * @memberOf app.components.rest.prive.sandbox.effective.PersonRestAPI
         * @function getListPersonStructure()
         * @description retrieve list of person for a structure
         * @param {String}
         *            seasonCode : the code season
         * @param {String}
         *            structureId : structure id
         * @returns {Array} com.qaobee.hive.business.model.sandbox.effective.SB_Person
         */
        getListPersonStructure : function(seasonCode, structureId) {
            return $http({
                url : personAPIURL + 'listStructure',
                method : "POST",
                data: {seasonCode: seasonCode, structureId: structureId}
            });
        },
        
        /**
         * @memberOf app.components.rest.prive.sandbox.effective.PersonRestAPI
         * @function addPerson()
         * @description add person for a structure
         * @param {Person}
         *            person : person to add
         * @returns {person} com.qaobee.hive.business.model.sandbox.effective.SB_Person
         */
        addPerson : function(person) {
            return $http({
                url : personAPIURL + '/add',
                method : 'PUT',
                data : person
            });
        },
        
        /**
         * @memberOf app.components.rest.prive.sandbox.effective.PersonRestAPI
         * @function getPerson()
         * @description retrieve one person by this Id
         * @param {id}
         *            id : person id
         * @returns {person} com.qaobee.hive.business.model.sandbox.effective.SB_Person
         */
        getPerson : function(id) {
            return $http({
                url : personAPIURL + '/get' + '/?_id=' + id,
                method : 'GET'
            });
        },
        
        /**
         * @memberOf app.components.rest.prive.sandbox.effective.PersonRestAPI
         * @function updatePerson()
         * @description update a person
         * @param {Person}
         *            person : person to update
         * @returns {person} com.qaobee.hive.business.model.sandbox.effective.SB_Person
         */
        updatePerson : function(person) {
            return $http({
                url : personAPIURL + '/update',
                method : 'PUT',
                data : person
            });
        }
    };
});
    