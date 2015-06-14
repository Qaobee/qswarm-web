/**
 * Module partie admin du site
 * 
 * @author Xavier MARIN
 * @class qaobee.admin.admin
 * @namespace qaobee.admin
 * @requires {@link qaobee.admin.users|qaobee.admin.users}
 * @requires {@link qaobee.admin.habilitations|qaobee.admin.habilitations}
 * @requires {@link qaobee.admin.blogAdmin|qaobee.admin.blogAdmin}
 * @requires {@link qaobee.admin.activities|qaobee.admin.activities}
 * @requires {@link qaobee.directives.adminmenu|qaobee.directives.adminmenu}
 * @requires {@link qaobee.rest.admin.adminMetricsAPI|qaobee.rest.admin.adminMetricsAPI}
 * @requires {@link http://cmaurer.github.io/angularjs-nvd3-directives/|nvd3ChartDirectives}
 * @requires {@link http://earlonrails.github.io/angular-chartjs-directive/|chartjs-directive}
 * @copyright <b>QaoBee</b>.
 */
angular.module('admin',
        [ 'users', 'habilitations', 'blogAdmin', 'activities', 'adminmenu', 'adminMetricsAPI', 'nvd3ChartDirectives',  'leaflet-directive', 'adminUsersAPI', 'locationAPI' ])

.config(function($routeProvider) {
    $routeProvider.when('/admin', {
        controller : 'AdminCtrl',
        templateUrl : 'app/prive/admin/admin.html'
    });
})

/**
 * @class qaobee.admin.admin.AdminCtrl
 * @description Contrôleur principal de la page templates/admin/admin.html
 */
.controller('AdminCtrl', function($scope, eventbus, adminMetricsAPI, $log, $interval, adminUsersAPI, locationAPI) {
    $scope.meters = Array.create();
    $scope.metersValues = Array.create();
    $scope.timers = Array.create();
    $scope.markers = Array.create();
    $scope.layers= {
        baselayers: {
            googleRoadmap: {
                name: 'Google Streets',
                layerType: 'ROADMAP',
                type: 'google'
            }
        },
        overlays: {
            realworld: {
                name: "Real world data",
                type: "markercluster",
                visible: true
            }
        }
    };

    adminUsersAPI.get().success(function(data, status, headers, config) {
        angular.forEach(data, function(value, key) {
            if (value.address.lat) {
                var m = {
                    layer : "realworld"
                };
                m.lat = value.address.lat;
                m.lng = value.address.lng;
                m.message = value.firstname + " " + value.name;
                $scope.markers.push(m);
            } else {
                var address = value.address.place + " " + value.address.zipcode + " " + value.address.city + " " + value.address.country;
                locationAPI.get(address).then(function(adr) {
                    if (adr.data.results.length > 0) {
                        var m = {
                            layer : "realworld",
                            lat : adr.data.results[0].geometry.location.lat,
                            lng : adr.data.results[0].geometry.location.lng,
                            message : value.firstname + " " + value.name
                        };
                        $scope.markers.push(m);
                    }
                });
            }
        }, $scope.markers);
    });

    $scope.xAxisTickFormat_Date_Format = function() {
        return function(d) {
            return moment.unix(d).format("HH:mm:ss  ");
        };
    };
    /**
     * @name $scope.getMeters
     * @function
     * @memberOf qaobee.admin.admin.AdminCtrl
     * @description Récupère les métiques de type meters
     */
    $scope.getMeters = function() {

        adminMetricsAPI.getMeters().success(function(data, status, headers, config) {
            $scope.meters = Array.create();
            angular.forEach(data, function(v, k) {
                var m = {};
                m.key = k;
                var value = Array.create(moment().unix(), v.mean.ceil(2));
                if (!angular.isDefined($scope.metersValues[k])) {
                    $scope.metersValues[k] = Array.create();
                }
                $scope.metersValues[k].push(value);
                if ($scope.metersValues[k].length > 20) {
                    $scope.metersValues[k].removeAt(0, Math.max(0, $scope.metersValues[k].length - 20));
                }
                m.values = $scope.metersValues[k];
                this.push(m);
            }, $scope.meters);
        });
    };

    /**
     * @name $scope.getTimers
     * @function
     * @memberOf qaobee.admin.admin.AdminCtrl
     * @description Récupère les métiques de type timers
     */
    $scope.getTimers = function() {
        adminMetricsAPI.getTimers().success(function(data, status, headers, config) {
            $scope.timers = [];
            angular.forEach(data, function(v, k) {
                var m = {};
                m.key = k;
                m.values = [ [ v.count, (v.mean / 1000000).ceil(2) ] ];
                this.push(m);
            }, $scope.timers);
        });
    };

    var metrixPooler = $interval(function() {
        $scope.getMeters();
        $scope.getTimers();
    }, 5000);

    $scope.getMeters();
    $scope.getTimers();

    $scope.$on('$destroy', function() {
        $interval.cancel(metrixPooler);
    });
})
//
;