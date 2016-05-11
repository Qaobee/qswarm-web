(function () {
    'use strict';
    /**
     *
     * @class qaobee.components.restAPI.commons.settings.IndicatorRestAPI
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     */
    angular.module('indicatorRestAPI', []).value('indicatorAPIURL', '/api/1/commons/settings/indicator')

        .factory('indicatorRestAPI', function ($http, indicatorAPIURL) {
            return {

                /**
                 * @memberOf qaobee.components.restAPI.commons.settings.IndicatorRestAPI
                 * @function getListIndicators
                 * @description return a list of indicator filter by one or more screen, and for the couple activity/country
                 * @param   {String}   activityId limits on one activity
                 * @param   {String}   countryId limits on one country
                 * @param   {Array}   screens limits indicator for screens
                 * @returns {Array} [Indicators]
                 */
                getListIndicators: function (activityId, countryId, screens) {
                    return $http({
                        url: indicatorAPIURL + '/getList',
                        method: 'POST',
                        data: {
                            activityId: activityId,
                            countryId: countryId,
                            screens: screens
                        }
                    });
                },
                /**
                 * @memberOf qaobee.components.restAPI.commons.settings.IndicatorRestAPI
                 * @function getByCode
                 * @description return a list of indicator filter one or more code, and for the couple activity/country
                 * @param   {String}   activityId limits on one activity
                 * @param   {String}   countryId limits on one country
                 * @param   {Array}   codes limits indicator for codes
                 * @returns {Array} [Indicators]
                 */
                getByCode: function (activityId, countryId, codes) {
                    return $http({
                        url: indicatorAPIURL + '/getByCode',
                        method: 'POST',
                        data: {
                            activityId: activityId,
                            countryId: countryId,
                            codes: codes
                        }
                    });
                }
            };

        })
    //
    ;

}());
