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
                 * @param   {Object}     request  request
                 * @returns {Array}    list of events
                 */
                getListEvents: function (request) {
                    return $http({
                        url: eventsAPIURL + '/list',
                        method: 'POST',
                        data: request
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
                        url: eventsAPIURL + '/get?_id=' + id,
                        method: 'GET'
                    });
                },

                /**
                 * @memberOf qaobee.components.restAPI.sandbox.agenda.eventRestAPI
                 * @function addEvent()
                 * @description add event
                 * @param {event} event : event to add
                 * @returns {Object} com.qaobee.hive.business.model.sandbox.agenda.SB_Event
                 */
                addEvent: function (event) {
                    return $http({
                        url: eventsAPIURL + '/add',
                        method: 'POST',
                        data: event
                    });
                },

                /**
                 * @memberOf qaobee.components.restAPI.sandbox.agenda.eventRestAPI
                 * @function updateEvent()
                 * @description update a event
                 * @param {SB_Event}  event : event to update
                 * @returns {SB_Event} com.qaobee.hive.business.model.sandbox.agenda.SB_Event
                 */
                updateEvent: function (event) {
                    return $http({
                        url: eventsAPIURL + '/update',
                        method: 'POST',
                        data: event
                    });
                }
            };
        });
}());
