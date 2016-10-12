(function () {
    'use strict';
    angular.module(
        'qaobee.appdownload-banner', ['ng.deviceDetector'])
        .directive('appdownloadBanner', function ($cookies, EnvironmentConfig, deviceDetector) {
            return {
                restrict: 'AE',
                controller: function ($scope) {
                    if (deviceDetector.os === 'android') {
                        var cookieDownload = $cookies.get('downloadApp');
                        if (angular.isUndefined(cookieDownload)) {
                            $scope.urlAppMobile = EnvironmentConfig.appMobile.google;
                            $scope.showBanner = true;
                        }
                    }

                    $scope.closeBanner = function () {
                        $cookies.put('downloadApp', "dlKO");
                        $scope.showBanner = false;
                    };

                    $scope.openDownload = function () {
                        $cookies.put('downloadApp', "dlOK");
                        $window.location.href = $scope.urlAppMobile;
                        $scope.showBanner = false;
                    };
                },
                templateUrl: 'app/components/directives/commons/appdownload-banner/appdownload-banner.html'
            };
        });
}());