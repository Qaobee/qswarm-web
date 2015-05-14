angular.module('labelsAPI', []).value('labelsURL', '/rest/listelabels')

.factory('labelsAPI', function($http, labelsURL, $rootScope) {
	return {
		getListe : function(className) {
			return $http({
				url : labelsURL + '/?className=' + className,
				method : "GET",
				headers : {
					'Content-Type' : 'application/json',
					'token': $rootScope.token
				}
			});
		}
	};
});