(function () {
    'use strict';
    /**
     * Display Person's avatar and permit upload if connected
     *
     *
     * @author Xavier MARIN
     * @class qaobee.directives.avatar
     * @copyright <b>QaoBee</b>.
     */
    angular.module('avatar', ['angularFileUpload'])
        .directive('avatar', function (FileUploader, $window, $rootScope, $log, EnvironmentConfig) {
            return {
                restrict: 'AE',
                scope: {
                    person: '=',
                    width: '='
                },
                controller: function ($scope, FileUploader, $modal) {
                    var modal;
                    var modalOpened = false;
                    $scope.showSpinner = false;
                    $scope.uploader = new FileUploader({
                        headers: {
                            'token': $window.sessionStorage.qaobeesession
                        },
                        autoUpload: true,
                        queueLimit: 1

                    });
                    $scope.getAvatar = function (avatar) {
                        return (avatar) ? EnvironmentConfig.apiEndPoint + '/file/Person/' + avatar : 'imgs/user.png';
                    };
                    $scope.modifyAvatar = function () {
                        modalOpened = true;
                        modal = $modal.open({
                            templateUrl: 'components/avatar/setAvatarIndividuModal.html',
                            controller: 'setAvatarIndividuModalCtrl',
                            backdrop: 'true',
                            scope: $scope,
                            size: 'md'
                        }).result.then(function () {
                                modalOpened = false;
                            }, function () {
                                modalOpened = false;
                            });
                    };
                    $scope.$watch('person', function (newValue, oldValue) {
                        if (angular.isDefined(newValue) && !angular.equals(oldValue, newValue)) {
                            $scope.uploader.url = EnvironmentConfig.apiEndPoint + '/file/Person/avatar/' + newValue._id;
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
                templateUrl: 'components/avatar/avatar.html'
            };
        })
        .controller('setAvatarIndividuModalCtrl', function ($scope, $modalInstance) {
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
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
                        return (avatar) ? EnvironmentConfig.apiEndPoint + '/file/Person/' + avatar : 'imgs/user.png';
                    };
                },
                templateUrl: 'components/avatar/simpleAvatar.html'
            };
        });
}());