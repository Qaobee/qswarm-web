(function () {
   'use strict';
   /**
    * Created by jerome on 22/10/15.
    * @class 
    * @author Jerome ROUE
    * @copyright <b>QaoBee</b>.
    */
    angular.module('sandboxRestAPI', []).value('sandboxAPIURL', '/api/1/sandbox/config/sandbox')

        .factory('sandboxRestAPI', function ($http, sandboxAPIURL) {
            return {

            	getListByOwner: function (userId) {
                    return $http({
                        url: sandboxAPIURL + '/getListByOwner?id=' + userId,
                        method: 'GET'
                    });
                }
            	
        };
    });
}());
