(function () {
    'use strict';
    /**
     * Session Rest API
     * 
     * @class qaobee.components.restAPI.sandbox.training.session.sessionRestAPI
     * @author Mohamed EL MARZGIOUI
     * @copyright <b>QaoBee</b>.
     */
    angular.module('sessionRestAPI', []).value('sessionAPIURL', '/api/1/sandbox/training/session')

    .factory('sessionRestAPI', function($http, sessionAPIURL) {
        return {
            /**
             * @memberOf qaobee.components.restAPI.sandbox.training.session.sessionRestAPI

             * @function addSession()
             * @description add a session 
             * @param {Session}
             *            session : session to add
             * @returns {Session}  com.qaobee.hive.business.model.sandbox.training.Session
             */
            addSession : function(session) {

                return $http({
                    url : sessionAPIURL + '/add',
                    method : 'PUT',
                    data : session
                });
            },

            /**
             * @memberOf qaobee.components.restAPI.sandbox.training.session.sessionRestAPI
             * @function getSession()
             * @description get a session by id
             * @param {String}
             *          idSession : id of session 
             * @returns {Session}  com.qaobee.hive.business.model.sandbox.training.Session
             */
            getSession : function(idSession) {
                return $http({
                    url : sessionAPIURL + '/get?_id=' + idSession,
                    method : 'GET'
                });
            },
            /**
             * @memberOf qaobee.components.restAPI.sandbox.training.session.sessionRestAPI

             * @function getListSession()
             * @description retrieve list of sessions 
             * @param {String}
                         categoryAge : the label of category age 
             * @param {String}
             *            authorName : the name of author 
             * @returns {Array}  com.qaobee.hive.business.model.sandbox.training.Session
             */
            getListSession : function(categoryAge, authorName,theme,subTheme,title) {



                return $http({
                    url : sessionAPIURL + '/list?categoryAge='+ categoryAge +'&name=' + authorName+'&theme=' +theme+'&subTheme=' +subTheme+'&title='+title ,
                    method : 'GET'
                });
            },
            /**
             * @memberOf qaobee.components.restAPI.sandbox.training.session.sessionRestAPI
             * @function updateSession()
             * @description update a session
             * @param {Session}
             *            session : session to update
             * @returns {Session}  com.qaobee.hive.business.model.sandbox.training.Session
             */
            updateSession : function(session) {
                return $http({
                    url : sessionAPIURL + '/update',
                    method : 'PUT',
                    data : session
                });
            },
            /**
             * @memberOf qaobee.components.restAPI.sandbox.training.session.sessionRestAPI
             * @function deleteSession()
             * @description delete a session
             * @param {String}
             *            idSession : id of session to delete
             * @returns {Object} {'status': 'ok','number': number}
             */
            deleteSession : function(idSession) {
                return $http({
                    url : sessionAPIURL + '/delete?idSession=' + idSession,
                    method : 'DELETE'
                });
            },

            /**
             * @memberOf qaobee.components.restAPI.sandbox.training.session.sessionRestAPI
             * @function addExerciseToSession()
             * @description Add exercise to session
             * @param {Exercise}
             *            exercise : exercise to add to session
             * @returns {Session}  com.qaobee.hive.business.model.sandbox.training.Session
             */
            addExerciseToSession : function(exercise) {
                return $http({
                    url : sessionAPIURL + '/addExercise',
                    method : 'PUT',
                    data : exercise
                });
            }
        };
    });
    
}());