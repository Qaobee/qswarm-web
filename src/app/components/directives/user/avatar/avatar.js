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
                    width: '=',
                    collection: '@?'
                },
                controller: function ($scope, FileUploader) {
                    $scope.showSpinner = false;
                    $scope.collection = $scope.collection || 'SB_Person';
                    $scope.uploader = new FileUploader({
                        headers: {
                            'token': $window.sessionStorage.qaobeesession
                        },
                        autoUpload: false,
                        queueLimit: 1
                    });

                    $scope.uploader.url = EnvironmentConfig.apiEndPoint + '/file/' + $scope.collection + '/avatar/' + $scope.person._id;
                    $scope.getAvatar = function (avatar) {
                        return (avatar) ? EnvironmentConfig.apiEndPoint + '/file/' + $scope.collection + '/' + avatar : 'assets/images/user.png';
                    };

                    $scope.$watch('person', function (newValue, oldValue) {
                        if (angular.isDefined(newValue) && !angular.equals(oldValue, newValue)) {
                            $scope.uploader.url = EnvironmentConfig.apiEndPoint + '/file/' + $scope.collection + '/avatar/' + newValue._id;
                        }
                    });

                    $scope.uploader.filters.push({
                        name: 'imageFilter',
                        fn: function (item) {
                            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                            return '|jpg|png|jpeg|gif|'.indexOf(type) !== -1;
                        }
                    });
                    $scope.uploader.onWhenAddingFileFailed = function (item, filter) {
                        if (filter.name === "queueLimit") {
                            $scope.uploader.clearQueue();
                            $scope.uploader.addToQueue(item);
                        }
                    };
                    $scope.uploader.onAfterAddingFile = function (fileItem) {
                        fileItem.upload();
                    };
                    $scope.uploader.onSuccessItem = function (fileItem, response) {
                        $scope.person.avatar = response.avatar;
                        $scope.uploader.clearQueue();
                    };
                    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
                        $log.error('onErrorItem', fileItem, response, status, headers);
                        toastr.error(response);
                    };
                },
                templateUrl: 'app/components/directives/user/avatar/avatar.html'
            };
        })

        .directive('simpleAvatar', function (EnvironmentConfig) {
            return {
                restrict: 'AE',
                scope: {
                    person: '=',
                    width: '=',
                    link: '=',
                    collection: '@?'
                },
                controller: function ($scope) {
                    $scope.collection = $scope.collection || 'SB_Person';
                    $scope.getAvatar = function (avatar) {
                        return (avatar) ? EnvironmentConfig.apiEndPoint + '/file/' + $scope.collection + '/' + avatar : 'assets/images/user.png';
                    };
                },
                templateUrl: 'app/components/directives/user/avatar/simpleAvatar.html'
            };
        });
}());
