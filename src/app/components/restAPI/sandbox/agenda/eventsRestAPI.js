(function () {
   'use strict';
   /**
    * Created by xavier on 22/03/15.
    * @class qaobee.components.restAPI.sandbox.agenda.eventsRestAPI
    * @author Xavier MARIN
    * @copyright <b>QaoBee</b>.
    */
    angular.module('eventsRestAPI', []).value('eventsAPIURL', '/api/1/sandbox/agenda/event')

        .factory('eventsRestAPI', function ($http, eventsAPIURL) {
            return {

            /**
             * @description Retrieve all events match to parameters filter
             * @function
             * @memberOf qaobee.components.restAPI.sandbox.agenda.eventRestAPI
             * @param   {long}     startDate  Event Start date
             * @param   {long}     endDate    Event End date
             * @param   {String}   type       Event Type
             * @param   {String}   activityId Event activity id
             * @param   {String}   seasonCode Event Season code
             * @param   {String}   eventOwner Event Owner
             * @returns {Array}    list of events
             */
                getListEvents: function (startDate, endDate, type, activityId, owner) {
                    return $http({
                        url: eventsAPIURL + '/list',
                        method: 'POST',
                        data: {
                            startDate: startDate,
                            endDate: endDate,
                            linkType: type,
                            activityId: activityId,
                            owner: owner
                        }
                    });
                },
          
            /**
             * @description Retrieve Event by this Id
             * @function getEvent()
             * @memberOf qaobee.components.restAPI.sandbox.agenda.eventRestAPI
             * @param   {String} id Event id
             * @returns {Object} event com.qaobee.hive.business.model.sandbox.agenda.event;
             */
                getEvent: function (id) {
                    return $http({
                        url: eventsAPIURL + '/get?id=' + id,
                        method: 'GET'
                    });
                },
          
            /**
             * @memberOf qaobee.components.restAPI.sandbox.agenda.eventRestAPI
             * @function add()
             * @description add event
             * @param {SB_Event}
             *            event : event to add
             * @returns {SB_Event} com.qaobee.hive.business.model.sandbox.agenda.SB_Event
             */
                add : function(event) {
                    return $http({
                        url : eventsAPIURL + '/add',
                        method : 'PUT',
                        data : event
                    });
                },

            /**
             * @memberOf qaobee.components.restAPI.sandbox.agenda.eventRestAPI
             * @function update()
             * @description update a event
             * @param {SB_Event}
             *            event : event to update
             * @returns {SB_Event} com.qaobee.hive.business.model.sandbox.agenda.SB_Event
             */
                update : function(event) {
                    return $http({
                        url : eventsAPIURL + '/update',
                        method : 'PUT',
                        data : event
                    });
                }
        };
    });
}());
