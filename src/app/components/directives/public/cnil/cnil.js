angular.module('qaobee.cnil', [])

    .controller('CnilController', function ($scope, $cookies, $location) {
        $scope.show = !angular.isDefined($cookies.get('cnil'));
        $scope.close = function () {
            $scope.show = false;
            var nextYearTime = (new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)).toGMTString();
            var domainParts = $location.host().split('.');
            domainParts.shift();
            var domain = '.' + domainParts.join('.');
            if ('.' === domain) {
                domain = 'localhost';
            }
            $cookies.put('cnil', 'true', {
                path: '/',
                domain: domain,
                expires: nextYearTime,
                secure: false
            });
        };
    })

    .directive('cnil', [function () {
        return {
            restrict: 'E',
            replace: false,
            controller: 'CnilController',
            templateUrl: 'app/components/directives/public/cnil/cnil.html',
            scope: {
                link: '@'
            }
        };
    }])

;