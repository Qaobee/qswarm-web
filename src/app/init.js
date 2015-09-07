(function () {
    'use strict';
    (function($){
        $(document).ready(function() {
            var window_width = $(window).width();
            
            // Plugin initialization
            $('.slider').slider({full_width: true});
            $('.parallax').parallax();
            $('.modal-trigger').leanModal();
            $('.scrollspy').scrollSpy();
            $('.button-collapse').sideNav({'edge': 'left'});
            $('select').not('.disabled').material_select();
        
            // Pikadate datepicker
            $('.datepicker').pickadate({
                selectMonths: true, // Creates a dropdown to control month
                selectYears: 15 // Creates a dropdown of 15 years to control year
            });
            
      }); // end of document ready
    })(jQuery); // end of jQuery name space
    
}());    