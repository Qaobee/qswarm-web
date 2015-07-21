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

    .factory('structureAPI', function($http, structureURL, $rootScope) {
        return {
            get : function(id) {
                return $http({
                    url : structureURL + '/get' + '/?id=' + id,
                    method : 'GET'
                });
            }
        };
    });

}());