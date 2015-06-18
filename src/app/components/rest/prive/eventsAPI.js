(function () {
  'use strict';
  /**
   * Created by xavier on 22/03/15.
   * @class qaobee.QSwarn.services.eventsAPI
   * @author Xavier MARIN
   * @copyright <b>QaoBee</b>.
   */
  angular.module('QSwarn.eventsAPI', []).value('eventsAPIURL', '/api/1/commons/referencial/event')

    .factory('eventsAPI', function ($http, eventsAPIURL) {
      return {

        /**
         * @description Retrieve all events match to parameters filter
         * @function
         * @memberOf qaobee.QSwarn.services.eventsAPI
         * @param   {long}     startDate  Event Start date
         * @param   {long}     endDate    Event End date
         * @param   {String}   type       Event Type
         * @param   {String}   activityId Event activity id
         * @param   {String}   seasonCode Event Season code
         * @param   {String}   eventOwner Event Owner
         * @returns {Array}    list of events
         */
        getEvents: function (startDate, endDate, type, activityId, seasonCode, eventOwner) {
          return $http({
            url: eventsAPIURL + '/list',
            method: 'POST',
            data: {
              startDate: startDate,
              endDate: endDate,
              type: type,
              activityId: activityId,
              eventOwner: eventOwner,
              seasonCode: seasonCode
            }
          });
        },
        /**
         * @description Retrieve Event by this Id
         * @function
         * @memberOf qaobee.QSwarn.services.eventsAPI
         * @param   {String} id Event id
         * @returns {Object} event com.qaobee.swarn.business.model.tranversal.event.event;
         */
        getEventdetail: function (id) {
          return $http({
            url: eventsAPIURL + '/get?id=' + id,
            method: 'GET'
          });
        }
      };
    });
}());
