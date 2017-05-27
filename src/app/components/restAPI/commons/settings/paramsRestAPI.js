(function () {
    'use strict';
    angular.module('paramsRestAPI', []).value('paramsApiURL', '/api/1/commons/settings/get')

        .factory('paramsRestAPI', function ($http, paramsApiURL) {
            return {
                getParams: function () {
                    return $http({
                        url: paramsApiURL,
                        method: 'GET'
                    });
                }
            };
        });

}());