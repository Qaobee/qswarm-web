/**
 * Module API Logation Google
 * 
 * @class qaobee.tools.locationAPI
 * @author Xavier MARIN
 * @copyright <b>QaoBee</b>.
 */
angular.module('locationAPI', [])

.factory('locationAPI', function($http) {
    return {
        /**
         * @memberOf qaobee.tools.locationAPI
         * @function get
         * @description Récupération de l'adresse via les services Google
         * @see {@link https://developers.google.com/maps/documentation/geocoding/}
         */
        get : function(addr) {
            return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
                params : {
                    address : addr,
                    sensor : false
                }
            });
        }

    };
})
//
;