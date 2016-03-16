(function () {
    'use strict';
    angular.module('qaobee.widgets', ['qaobee.widgets.agenda'])
        .factory('widgetDefinitions', function () {
            return {
                get: function () {

                    return [
                        {
                            name: 'agenda',
                            directive: 'widget-calendar',
                            class: 'blue-grey darken-1 white-text',
                            title: 'mainAgenda.next_event',
                            attrs: {
                                meta: 'meta',
                                user: 'user'
                            },
                            size: {
                                height : '500px'
                            }
                        }
                    ];
                }
            };
        })
        .value('defaultWidgets', [
            {name: 'agenda'}
        ]);
})();