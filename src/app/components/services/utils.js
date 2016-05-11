/**
 * Created by xavier on 08/03/16.
 */
(function () {
    'use strict';
    angular.module('qaobee.utils', [])
        .factory('qaobeeUtils', function () {
            return {
                guid: function () {
                    function s4() {
                        return Math.floor((1 + Math.random()) * 0x10000)
                            .toString(16)
                            .substring(1);
                    }

                    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                        s4() + '-' + s4() + s4() + s4();
                },
                getChartColours: function () {
                    return Array.create({
                        fillColor: "rgba(3, 169, 244, 0.2)",
                        strokeColor: "rgba(3, 169, 244, 1)",
                        pointColor: "rgba(3, 169, 244, 1)",

                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(3, 169, 244, 0.8)"
                    }, {
                        fillColor: "rgba(15, 157, 88, 0.2)",
                        strokeColor: "rgba(15, 157, 88, 1)",
                        pointColor: "rgba(15, 157, 88, 1)",

                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(15, 157, 88, 0.8)"
                    }, {
                        fillColor: "rgba(255, 87, 34, 0.2)",
                        strokeColor: "rgba(255, 87, 34, 1)",
                        pointColor: "rgba(255, 87, 34, 1)",

                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(255, 87, 34, 0.8)"
                    });
                }
            };
        });
}());