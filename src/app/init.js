(function () {
    'use strict';
    (function ($) {
        $(document).ready(function () {
            $.getScript('http://cdnjs.cloudflare.com/ajax/libs/jquery-easing/1.3/jquery.easing.min.js');
            var window_width = $(window).width();
            // Plugin initialization
            $('.dropdown-button').dropdown({
                    inDuration: 300,
                    outDuration: 225,
                    // Does not change width of dropdown to that of the activator
                    constrain_width: false,
                    // Activate on hover
                    hover: true,
                    // Spacing from edge
                    gutter: 0,
                    // Displays dropdown below the button
                    belowOrigin: false,
                    // Displays dropdown with edge aligned to the left of button
                    alignment: 'left'
                }
            );
            // end of document ready
        });
        /// / end of jQuery name space
    })(jQuery);
}());