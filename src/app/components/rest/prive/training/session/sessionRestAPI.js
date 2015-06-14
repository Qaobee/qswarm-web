/**
 * Services REST Session API


 * 
 * @class qaobee.rest.prive.training.session.sessionRestAPI
 * @author Mohamed EL MARZGIOUI
 * @copyright <b>QaoBee</b>.
 */
angular.module('sessionRestAPI', []).value('sessionAPIURL', '/rest/prive/training')

.factory('sessionRestAPI', function($http, sessionAPIURL) {
    return {
        /**
         * @memberOf qaobee.rest.prive.training.session.sessionRestAPI

         * @function addSession()
         * @description add a session 
         * @param {Session}
         *            session : session to add
         * @returns {Session}  com.qaobee.swarn.model.training.Session
         */
        addSession : function(session) {

            return $http({
                url : sessionAPIURL + '/session/add',
                method : 'PUT',
                data : session
            });
        },
        
        /**
         * @memberOf qaobee.rest.prive.training.session.sessionRestAPI
         * @function getSession()
         * @description get a session by id
         * @param {String}
         *          idSession : id of session 
         * @returns {Session}  com.qaobee.swarn.model.training.Session
         */
        getSession : function(idSession) {
            return $http({
                url : sessionAPIURL + '/session/get?_id=' + idSession,
                method : "GET"
            });
        },
        /**
         * @memberOf qaobee.rest.prive.training.session.sessionRestAPI

         * @function getListSession()
         * @description retrieve list of sessions 
         * @param {String}
                     categoryAge : the label of category age 
         * @param {String}
         *            authorName : the name of author 
         * @returns {Array}  com.qaobee.swarn.model.training.Session
         */
        getListSession : function(categoryAge, authorName,theme,subTheme,title) {


           
            return $http({
                url : sessionAPIURL + '/session/list?categoryAge='+ categoryAge +'&name=' + authorName+'&theme=' +theme+'&subTheme=' +subTheme+'&title='+title ,
                method : "GET"
            });
        },
        /**
         * @memberOf qaobee.rest.prive.training.session.sessionRestAPI
         * @function updateSession()
         * @description update a session
         * @param {Session}
         *            session : session to update
         * @returns {Session}  com.qaobee.swarn.model.training.Session
         */
        updateSession : function(session) {
            return $http({
                url : sessionAPIURL + '/session/update',
                method : 'PUT',
                data : session
            });
        },
        /**
         * @memberOf qaobee.rest.prive.training.session.sessionRestAPI
         * @function deleteSession()
         * @description delete a session
         * @param {String}
         *            idSession : id of session to delete
         * @returns {Object} {"status": "ok","number": number}
         */
        deleteSession : function(idSession) {
            return $http({
                url : sessionAPIURL + '/session/delete?idSession=' + idSession,
                method : "DELETE"
            });
        },
        
        /**
         * @memberOf qaobee.rest.prive.training.session.sessionRestAPI
         * @function addExerciseToSession()
         * @description Add exercise to session
         * @param {Exercise}
         *            exercise : exercise to add to session
         * @returns {Session}  com.qaobee.swarn.model.training.Session
         */
        addExerciseToSession : function(exercise) {
            return $http({
                url : sessionAPIURL + '/session/addExercise',
                method : "PUT",
                data : exercise
            });
        },
    };
});