angular.module('niveauxJeuAPI', []).value('niveauxJeuURL', '/rest/niveauxjeuliste')

.factory('niveauxJeuAPI', function($http, niveauxJeuURL, $rootScope) {
	return {
		getListe : function() {
			return $http({
				url : niveauxJeuURL,
				method : "GET",
				headers : {
					'Content-Type' : 'application/json',
					'token': $rootScope.token
				}
			});
		}
	};
});