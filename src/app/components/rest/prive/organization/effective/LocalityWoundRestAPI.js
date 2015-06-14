angular.module('localityWoundAPI', []).value('localityWoundURL', '/rest/localitywound')

.factory('localityWoundAPI', function($http, localityWoundURL, $rootScope) {
    return {
        getListe : function() {
            return $http({
                url : localityWoundURL,
                method : "GET",
                headers : {
                    'Content-Type' : 'application/json',
                    'token' : $rootScope.token
                }
            });
        }
    };
});