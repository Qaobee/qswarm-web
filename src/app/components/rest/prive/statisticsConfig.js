/**
 * Created by xavier on 05/11/14.
 */
/**
 *
 * @class qaobee.servivces.statisticsConfig
 * @author Xavier MARIN
 * @copyright <b>QaoBee</b>.
 */
angular.module('QSwarn.statisticsConfigAPI', []).value('statisticsConfigAPIURL', '/rest/prive/stats/configuration/')

    .factory('statisticsConfigAPI', function ($http, statisticsConfigAPIURL) {
        return {

            /**
             * @memberOf qaobee.servivces.statisticsConfig
             * @function getListIndicators
             * @description TODO
             * @returns {Array} [Stats]
             */
            getListIndicators: function (activityId, countryId, screen) {
                return $http({
                    url: statisticsConfigAPIURL + 'getListIndicators',
                    method: "POST",
                    data: {
                        activityId : activityId,
                        countryId : countryId,
                        screen : screen
                    }
                });
            },
            /**
             * @memberOf qaobee.servivces.statisticsConfig
             * @function getByCode
             * @description TODO
             * @returns {Array} [Stats]
             */
            getByCode: function (search) {
                return $http({
                    url: statisticsConfigAPIURL + 'getByCode',
                    method: "POST",
                    data: search
                });
            }
        };

    })
//
;

