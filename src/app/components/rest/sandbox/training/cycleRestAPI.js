/**
 * Services REST Cycle API
 * 
 * @class qaobee.rest.prive.training.cycle.cycleRestAPI
 * @author Mohamed EL MARZGIOUI
 * @copyright <b>QaoBee</b>.
 */
angular.module('cycleRestAPI', []).value('cycleAPIURL', '/rest/prive/training')

.factory('cycleRestAPI', function($http, cycleAPIURL) {
    return {
        /**
         * @memberOf qaobee.rest.prive.training.cycle.cycleRestAPI

         * @function addCycle()
         * @description add a cycle 
         * @param {Cycle}
         *            cycle : cycle to add
         * @returns {Cycle}  com.qaobee.swarn.model.training.Cycle
         */
        addCycle : function(cycle) {

            return $http({
                url : cycleAPIURL + '/cycle/add',
                method : 'PUT',
                data : cycle
            });
        },
        
        /**
         * @memberOf qaobee.rest.prive.training.cycle.cycleRestAPI
         * @function getCycle()
         * @description get a cycle by id
         * @param {String}
         *          idCycle : id of cycle 
         * @returns {Cycle}  com.qaobee.swarn.model.training.Cycle
         */
        getCycle : function(idCycle) {
            return $http({
                url : cycleAPIURL + '/cycle/get?_id=' + idCycle,
                method : "GET"
            });
        },
        /**
         * @memberOf qaobee.rest.prive.training.cycle.cycleRestAPI

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
                url : cycleAPIURL + '/cycle/list?categoryAge='+ categoryAge +'&name=' + authorName+'&theme=' +theme+'&subTheme=' +subTheme+'&title='+title ,
                method : "GET"
            });
        },
        /**
         * @memberOf qaobee.rest.prive.training.cycle.cycleRestAPI
         * @function updateCycle()
         * @description update a cycle
         * @param {Cycle}
         *            cycle : cycle to update
         * @returns {Cycle}  com.qaobee.swarn.model.training.Cycle
         */
        updateCycle : function(cycle) {
            return $http({
                url : cycleAPIURL + '/cycle/update',
                method : 'PUT',
                data : cycle
            });
        },
        /**
         * @memberOf qaobee.rest.prive.training.cycle.cycleRestAPI
         * @function deleteCycle()
         * @description delete a cycle
         * @param {String}
         *            idCycle : id of cycle to delete
         * @returns {Object} {"status": "ok","number": number}
         */
        deleteCycle : function(idCycle) {
            return $http({
                url : cycleAPIURL + '/cycle/delete?idCycle=' + idCycle,
                method : "DELETE"
            });
        },
        
        /**
         * @memberOf qaobee.rest.prive.training.cycle.cycleRestAPI
         * @function addSessionToCycle()
         * @description Add session to cycle
         * @param {Session}
         *            session : session to add to cycle
         * @returns {Cycle}  com.qaobee.swarn.model.training.Cycle
         */
        addSessionToCycle : function(session) {
            return $http({
                url : cycleAPIURL + '/cycle/addSession',
                method : "PUT",
                data : session
            });
        }
    };
});