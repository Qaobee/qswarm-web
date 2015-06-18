(function () {
    'use strict';
    /**
     * Created by xavier on 18/06/15.
     *
     * Directive widget Next Event<br />
     *
     */
    angular.module('widget.nextEvent', [])
        .directive('nextEvent', function () {
            return {
                restrict: 'AE',
                scope: {
                },
                controller: function ($scope) {

                },
                templateUrl: 'app/components/widgets/nextEvent/nextEvent.html'
            };
        });
}());