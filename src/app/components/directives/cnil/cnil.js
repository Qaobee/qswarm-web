angular.module('qaobee.cnil', [])

    .controller('CnilController', function ($scope) {
        var cookie = 'cookie-cnil=1';
        var html = angular.element('html');

        if (document.cookie.indexOf(cookie) === -1) {
            html.addClass('withCnil');
            $scope.show = true;
        }

        $scope.close = function() {
            html.removeClass('withCnil');
            $scope.show = false;

            var nextYearTime = (new Date(Date.now() + 365*24*60*60*1000)).toGMTString();
            var domainParts = location.host.split('.');
            domainParts.shift();
            var domain = '.' + domainParts.join('.');

            document.cookie = cookie + ';expires=' + nextYearTime + ';domain=' + domain + ';path=/;';
        };
    })

    .directive('cnil', [function () {
        return {
            restrict: 'E',
            replace: false,
            controller: 'CnilController',
            templateUrl: 'app/components/directives/cnil/cnil.html',
            scope: {
                link: '@'
            }
        };
    }])

;