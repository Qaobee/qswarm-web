(function () {
    'use strict';
    /**
     * Module API Logation Google
     *
     * @class qaobee.components.services.locationAPI
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     */
    angular.module('locationAPI', [])

        .factory('locationAPI', function ($http) {
            return {
                /**
                 * @memberOf qaobee.components.services.locationAPI
                 * @function get
                 * @description Récupération de l'adresse via les services Google
                 * @see {@link https://developers.google.com/maps/documentation/geocoding/}
                 */
                get: function (addr) {
                    return $http.get('https://maps.googleapis.com/maps/api/geocode/json', {
                        params: {
                            address: addr,
                            sensor: false
                        }
                    });
                },

                /**
                 * @memberOf qaobee.components.services.locationAPI
                 * @function getFrom
                 * @description Récupération de l'adresse via les services Google
                 * @see {@link https://developers.google.com/maps/documentation/geocoding/}
                 */
                getLatLng: function (lat, lng) {
                    return $http.get('https://maps.googleapis.com/maps/api/geocode/json', {
                        params: {
                            latlng: lat + ',' + lng,
                            sensor: false
                        }
                    });
                },
                /**
                 * @memberOf qaobee.components.services.locationAPI
                 * @returns {HttpPromise}
                 */
                getCountry: function () {
                    return $http.get('http://ip-api.com/json');
                }
            };
        });

}());