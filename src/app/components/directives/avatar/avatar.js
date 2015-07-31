(function () {
    'use strict';
    /**
     * Display Person's avatar and permit upload if connected
     *
     *
     * @author Xavier MARIN
     * @class qaobee.components.directives.avatar
     * @copyright <b>QaoBee</b>.
     */
    angular.module(
        'qaobee.avatar', [
        
            /* angular module */
            'angularFileUpload'
        ])
        .directive('avatar', function (FileUploader, $window, $rootScope, $log, EnvironmentConfig) {
            return {
                restrict: 'AE',
                scope: {
                    person: '=',
                    width: '='
                },
                controller: function ($scope, FileUploader) {
                    $scope.showSpinner = false;
                    $scope.uploader = new FileUploader({
                        headers: {
                            'token': $window.sessionStorage.qaobeesession
                        },
                        autoUpload: true,
                        queueLimit: 1

                    });
                    $scope.getAvatar = function (avatar) {
                        return (avatar) ? EnvironmentConfig.apiEndPoint + '/file/SB_Person/' + avatar : 'assets/images/user.png';
                    };
                    
                    $scope.$watch('person', function (newValue, oldValue) {
                        if (angular.isDefined(newValue) && !angular.equals(oldValue, newValue)) {
                            $scope.uploader.url = EnvironmentConfig.apiEndPoint + '/file/SB_Person/avatar/' + newValue._id;
                        }
                    });

                    $scope.uploader.filters.push({
                        name: 'imageFilter',
                        fn: function (item) {
                            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                            return '|jpg|png|jpeg|gif|'.indexOf(type) !== -1;
                        }
                    });
                    $scope.uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
                        $log.debug('onWhenAddingFileFailed', item, filter, options);
                    };
                    $scope.uploader.onAfterAddingFile = function (fileItem) {
                        $log.info('onAfterAddingFile', fileItem);
                    };
                    $scope.uploader.onProgressItem = function () { //fileItem, progress) {
                        // $scope.showSpinner = true;
                    };

                    $scope.uploader.onSuccessItem = function (fileItem, response) {
                        //     $scope.showSpinner = false;
                        $scope.person.avatar = response.avatar;
                        $scope.uploader.clearQueue();
                    };
                    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
                        $log.info('onErrorItem', fileItem, response, status, headers);
                        toastr.error(response);
                        //  $scope.showSpinner = false;
                    };
                },
                templateUrl: 'app/components/directives/avatar/avatar.html'
            };
        })

        .directive('simpleAvatar', function (EnvironmentConfig) {
            return {
                restrict: 'AE',
                scope: {
                    person: '=',
                    width: '=',
                    link: '='
                },
                controller: function ($scope) {
                    $scope.getAvatar = function (avatar) {
                        return (avatar) ? EnvironmentConfig.apiEndPoint + '/file/Person/' + avatar : 'assets/images/user.png';
                    };
                },
                templateUrl: 'app/components/directives/avatar/simpleAvatar.html'
            };
        });
}());