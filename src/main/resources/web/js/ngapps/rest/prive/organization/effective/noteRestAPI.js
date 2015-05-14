angular.module('noteAPI', []).value('noteURL', '/rest/prive/notes')

.factory('noteAPI', function($http, noteURL, $rootScope) {
	return {
		getListeNotesByPerson : function(id) {
			return $http({
				url : noteURL + "/liste?idIndividu=" + id,
				method : "GET",
				headers : {
					'Content-Type' : 'application/json',
					'token': $rootScope.token
				}
			});
		},
		upsert : function(note) {
			return $http({
				url : noteURL,
				method : "PUT",
				data : note,
				headers : {
					'Content-Type' : 'application/json',
					'token': $rootScope.token
				}
			});
		}
	};
});