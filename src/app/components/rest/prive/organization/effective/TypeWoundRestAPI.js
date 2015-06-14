angular.module('typeWoundAPI', []).value('typeWoundURL', '/rest/typewound')

.factory('typeWoundAPI', function($http, typeWoundURL, $rootScope) {
    return {
        getListe : function() {
            return $http({
                url : typeWoundURL,
                method : "GET",
                headers : {
                    'Content-Type' : 'application/json',
                    'token' : $rootScope.token
                }
            });
        }
    };
});