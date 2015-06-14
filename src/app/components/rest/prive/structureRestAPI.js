angular.module('structureAPI', []).value('structureURL', '/rest/prive/structure')

.factory('structureAPI', function($http, structureURL, $rootScope) {
    return {
        get : function(id) {
            return $http({
                url : structureURL + '/get' + '/?id=' + id,
                method : 'GET',
                headers : {
                    'Content-Type' : 'application/json',
                    'token' : $rootScope.token
                }
            });
        }
    };
});