/**
 * Services REST Theme API

 * 
 * @class qaobee.rest.prive.training.theme.themeRestAPI
 * @author Mohamed EL MARZGIOUI
 * @copyright <b>QaoBee</b>.
 */
angular.module('themeRestAPI', []).value('themeAPIURL', '/rest/prive/training')

.factory('themeRestAPI', function($http, themeAPIURL) {
    return {
        /**
         * @memberOf qaobee.rest.prive.training.theme.themeRestAPI

         * @function addTheme()
         * @description add a theme 
         * @param {Theme}
         *            theme : theme to add
         * @returns {Theme}  com.qaobee.swarn.model.training.Theme
         */
        addTheme : function(theme) {

            return $http({
                url : themeAPIURL + '/theme/add',
                method : 'PUT',
                data : theme
            });
        },
        
        /**
         * @memberOf qaobee.rest.prive.training.theme.themeRestAPI
         * @function getTheme()
         * @description get a theme by id
         * @param {String}
         *          idTheme : id of theme 
         * @returns {Theme}  com.qaobee.swarn.model.training.Theme
         */
        getTheme : function(idTheme) {
            return $http({
                url : themeAPIURL + '/theme/get?_id=' + idTheme,
                method : "GET"
            });
        },
        /**
         * @memberOf qaobee.rest.prive.training.theme.themeRestAPI

         * @function getListTheme()
         * @description retrieve list of themes 
         * @returns {Array}  com.qaobee.swarn.model.training.Theme
         */
        getListTheme : function(activityId) {


            return $http({
                url : themeAPIURL + '/theme/list?activityId='+activityId,
                method : "GET"
            });
        },
        /**
         * @memberOf qaobee.rest.prive.training.theme.themeRestAPI
         * @function updateTheme()
         * @description update a theme
         * @param {Theme}
         *            theme : theme to update
         * @returns {Theme}  com.qaobee.swarn.model.training.Theme
         */
        updateTheme : function(theme) {
            return $http({
                url : themeAPIURL + '/theme/update',
                method : 'PUT',
                data : theme
            });
        },
        /**
         * @memberOf qaobee.rest.prive.training.theme.themeRestAPI
         * @function deleteTheme()
         * @description delete a theme
         * @param {String}
         *            idTheme : id of theme to delete
         * @returns {Object} {"status": "ok","number": number}
         */
        deleteTheme : function(idTheme) {
            return $http({
                url : themeAPIURL + '/theme/delete?idTheme=' + idTheme,
                method : "DELETE"
            });
        },
    };
});