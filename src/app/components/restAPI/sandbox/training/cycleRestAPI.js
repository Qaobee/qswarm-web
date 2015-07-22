(function () {
    'use strict';
    /**
     * Cycle Rest API
     * 
     * @class qaobee.components.restAPI.sandbox.training.cycle.cycleRestAPI
     * @author Mohamed EL MARZGIOUI
     * @copyright <b>QaoBee</b>.
     */
    angular.module('cycleRestAPI', []).value('cycleAPIURL', '/api/1/sandbox/training/cycle')

    .factory('cycleRestAPI', function($http, cycleAPIURL) {
        return {
            /**
             * @memberOf qaobee.components.restAPI.sandbox.training.cycle.cycleRestAPI

             * @function addCycle()
             * @description add a cycle 
             * @param {Cycle}
             *            cycle : cycle to add
             * @returns {Cycle}  com.qaobee.swarn.model.training.Cycle
             */
            addCycle : function(cycle) {

                return $http({
                    url : cycleAPIURL + '/add',
                    method : 'PUT',
                    data : cycle
                });
            },

            /**
             * @memberOf qaobee.components.restAPI.sandbox.training.cycle.cycleRestAPI
             * @function getCycle()
             * @description get a cycle by id
             * @param {String}
             *          idCycle : id of cycle 
             * @returns {Cycle}  com.qaobee.swarn.model.training.Cycle
             */
            getCycle : function(idCycle) {
                return $http({
                    url : cycleAPIURL + '/get?_id=' + idCycle,
                    method : 'GET'
                });
            },
            /**
             * @memberOf qaobee.components.restAPI.sandbox.training.cycle.cycleRestAPI

             * @function getListCycle()
             * @description retrieve list of cycle 
             * @param {String}
                         categoryAge : the label of category age 
             * @param {String}
             *            authorName : the name of author 
             * @returns {Array}  com.qaobee.swarn.model.training.Cycle
             */
            getListCycle : function(categoryAge, authorName,theme,subTheme,title) {


                return $http({
                    url : cycleAPIURL + '/list?categoryAge='+ categoryAge +'&name=' + authorName+'&theme=' +theme+'&subTheme=' +subTheme+'&title='+title ,
                    method : 'GET'
                });
            },
            /**
             * @memberOf qaobee.components.restAPI.sandbox.training.cycle.cycleRestAPI
             * @function updateCycle()
             * @description update a cycle
             * @param {Cycle}
             *            cycle : cycle to update
             * @returns {Cycle}  com.qaobee.swarn.model.training.Cycle
             */
            updateCycle : function(cycle) {
                return $http({
                    url : cycleAPIURL + '/update',
                    method : 'PUT',
                    data : cycle
                });
            },
            /**
             * @memberOf qaobee.components.restAPI.sandbox.training.cycle.cycleRestAPI
             * @function deleteCycle()
             * @description delete a cycle
             * @param {String}
             *            idCycle : id of cycle to delete
             * @returns {Object} {'status': 'ok','number': number}
             */
            deleteCycle : function(idCycle) {
                return $http({
                    url : cycleAPIURL + '/delete?idCycle=' + idCycle,
                    method : 'DELETE'
                });
            },

            /**
             * @memberOf qaobee.components.restAPI.sandbox.training.cycle.cycleRestAPI
             * @function addSessionToCycle()
             * @description Add session to cycle
             * @param {Session}
             *            session : session to add to cycle
             * @returns {Cycle}  com.qaobee.swarn.model.training.Cycle
             */
            addSessionToCycle : function(session) {
                return $http({
                    url : cycleAPIURL + '/addSession',
                    method : 'PUT',
                    data : session
                });
            }
        };
    });
    
}());