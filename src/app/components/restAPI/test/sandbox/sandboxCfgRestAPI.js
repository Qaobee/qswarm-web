(function () {
    'use strict';
    /**
     * Created by jerome on 22/10/15.
     * @class
     * @author Jerome ROUE
     * @copyright <b>QaoBee</b>.
     */
    angular.module('sandboxCfgRestAPI', []).value('sandboxCfgAPIURL', '/api/1/sandbox/config/sandboxCfg')

        .factory('sandboxCfgRestAPI', function ($http, sandboxCfgAPIURL) {
            return {

                getList: function (sandboxId, seasonId) {
                    return $http({
                        url: sandboxCfgAPIURL + '/getList?sandbox._id=' + sandboxId + '&season._id=' + seasonId,
                        method: 'GET'
                    });
                }
            };
        });
}());
