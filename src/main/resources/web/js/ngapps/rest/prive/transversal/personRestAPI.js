/**
 * Services REST Person API
 * 
 * @class qaobee.rest.prive.transversal.PersonRestAPI
 * @author Christophe Kervella
 * @copyright <b>QaoBee</b>.
 */

angular.module('personRestAPI', []).value('personAPIURL', '/rest/prive/transversal/person')

.factory('personRestAPI', function($http, personAPIURL) {
    return {
        /**
         * @memberOf qaobee.rest.prive.transversal.PersonRestAPI
         * @function getListMemberEffective()
         * @description retrieve list of person
         * @param {String}
         *            listId : list of id person
         * @param {String}
         *            listField : list of field for one person
         * @returns {Array} com.qaobee.swarn.business.model.transversal.person.Person
         */
        getListPerson : function(listId, listField) {
            return $http({
                url : personAPIURL + '/list',
                method : "POST",
                data: {listId: listId, listField: listField}
            });
        },
        
        /**
         * @memberOf qaobee.rest.prive.transversal.PersonRestAPI
         * @function getListPersonStructure()
         * @description retrieve list of person for a structure
         * @param {String}
         *            seasonCode : the code season
         * @param {String}
         *            structureId : structure id
         * @returns {Array} com.qaobee.swarn.business.model.transversal.person.Person
         */
        getListPersonStructure : function(seasonCode, structureId) {
            return $http({
                url : personAPIURL + 'listStructure',
                method : "POST",
                data: {seasonCode: seasonCode, structureId: structureId}
            });
        },
        
        /**
         * @memberOf qaobee.rest.prive.transversal.PersonRestAPI
         * @function addPerson()
         * @description add person for a structure
         * @param {Person}
         *            person : person to add
         * @returns {person} com.qaobee.swarn.business.model.transversal.person.Person
         */
        addPerson : function(person) {
            return $http({
                url : personAPIURL + '/add',
                method : 'PUT',
                data : person
            });
        },
        
        /**
         * @memberOf qaobee.rest.prive.transversal.PersonRestAPI
         * @function getPerson()
         * @description retrieve one person by this Id
         * @param {id}
         *            id : person id
         * @returns {person} com.qaobee.swarn.business.model.transversal.person.Person
         */
        getPerson : function(id) {
            return $http({
                url : personAPIURL + '/get' + '/?id=' + id,
                method : 'GET'
            });
        },
        
        /**
         * @memberOf qaobee.rest.prive.transversal.PersonRestAPI
         * @function updatePerson()
         * @description update a person
         * @param {Person}
         *            person : person to update
         * @returns {person} com.qaobee.swarn.business.model.transversal.person.Person
         */
        updatePerson : function(person) {
            return $http({
                url : personAPIURL + '/update',
                method : 'PUT',
                data : person
            });
        },
        
        /**
         * @memberOf qaobee.rest.prive.transversal.PersonRestAPI
         * @function updateEffectiveFeature()
         * @description update a Feature od person
         * @param id
         * @param featureFolderName
         * @param featureKey
         * @param featureValue
         * @returns
         */
        updateEffectiveFeature: function(id, featureFolderName, featureKey, featureValue) {
            return $http({
                url : personAPIURL + '/feature/update',
                method : 'PUT',
                data : {
                    id : id,
                    featureFolderName : featureFolderName,
                    featureKey : featureKey,
                    featureValue : featureValue
                }
            });
        }
        
    };
});
    