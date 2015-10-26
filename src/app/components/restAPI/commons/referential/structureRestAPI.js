(function () {
    'use strict';
    /**
     * Module REST gestion des structures
     * 
     * @class qaobee.components.restAPI.commons.referential.structureRestAPI
     * @author Nada
     * @copyright <b>QaoBee</b>.
     */
    angular.module('structureRestAPI', []).value('structureURL', '/api/1/commons/referencial/structure')

    .factory('structureRestAPI', function($http, structureURL) {
        return {
            get : function(id) {
                return $http({
                    url : structureURL + '/get' + '/?id=' + id,
                    method : 'GET'
                });
            },
            
            getList : function(activity, address) {
            	return $http({
            		url : structureURL + '/getList',
            		method : 'POST',
            		data : {'activity': activity, 'address': address}
            	});
            }
        };
    });

}());