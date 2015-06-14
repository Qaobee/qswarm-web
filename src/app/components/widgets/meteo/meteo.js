/**
 * Created by xavier on 09/07/14.
 *
 * Directive widget weather<br />
 *
 * Usage :
 *
 * <pre>
 * &lt;widget-weather city=&quot;city&quot; country=&quot;country&quot; /&gt;
 * @author Xavier MARIN
 * @class qaobee.directives.widgets.weather
 * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
 *
 */
angular.module('widget.weather', [])

    .factory('myHttp', ['$http', 'myCache', function ($http, myCache) {
        'use strict';
        var headers = {
            'cache': myCache,
            'dataType': 'json'
        };
        var APPID = "bc1e24c531732375aece237bb2a5d49a";
        return {
            config: headers,
            get: function (url, success, fail) {
                return $http.get(url + "&APPID=" + APPID, this.config);
            },
            getLocal: function (url, success, fail) {
                return $http.get(url);
            },
            jsonp: function (url, success, fail) {
                return $http.jsonp(url, this.config);
            }
        };
    }])

    .factory('weatherApi', ['myHttp', function (myHttp) {
        'use strict';
        return {
            getWeeklyWeather: function (city) {
                return myHttp.get('http://api.openweathermap.org/data/2.5/forecast/daily?q=' + city + '&mode=json&units=metric');
            }
        };
    }])

    .factory('myCache', function ($cacheFactory) {
        'use strict';
        return $cacheFactory('myCache', {
            capacity: 100
        });
    })

    .directive('widgetWeather', function (weatherApi) {
        'use strict';
        return {
            restrict: 'AE',
            scope: {
                place: '=',
                height: '=?'
            },
            controller: function ($scope, $element) {
                var statCell = $element.children(1).children(1).children(1).children(1).children(1);
                var statPanel = $element.children(1).children(1).children(1).children(1);
                $scope.inheight = $scope.height || Math.min(statCell.outerHeight(), 120);
                $scope.currentTime = moment().format('h:mm a');
                $scope.flipped = false;

                $scope.place.then(function (place) {
                    weatherApi.getWeeklyWeather(place.city + "," + place.country).then(function (response) {
                        $scope.data = response.data;
                        $element.children(1).height(statPanel.outerHeight());
                        $scope.inheight = statPanel.outerHeight();
                        if (angular.isDefined($scope.data.list) && $scope.data.list.length) {
                            $scope.data.list.forEach(function (i, v) {
                                var date = moment(i.dt * 1000);
                                i.dt = {
                                    day: date.format("ddd")
                                };
                                if (moment().format("d") === date.format("d")) {
                                    i.dt.today = true;
                                }
                            });
                        }

                    });
                });

                $scope.toggle = function () {
                    $scope.flipped = !$scope.flipped;
                };

                $scope.flipFront = function () {
                    $scope.flipped = false;
                };

                $scope.flipBack = function () {
                    $scope.flipped = true;
                };
            },
            templateUrl: 'templates/directives/widgets/meteo.html'
        };
    });

function JSON_CALLBACK() { // Nothing
}
