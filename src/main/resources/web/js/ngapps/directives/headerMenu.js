/**
 * Created by xavier on 09/07/14.
 */
/**
 * Header menu and auth directive<br />
 *
 * Usage :
 *
 * <pre>
 * &lt;header-menu user=&quot;user&quot; /&gt;
 * @author Xavier MARIN
 * @class qaobee.directives.headerMenu
 * @requires {@link qaobee.directives.notifications|qaobee.directives.notifications}
 * @requires {@link qaobee.rest.public.userMetaAPI|qaobee.rest.public.userMetaAPI}
 * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
 *
 */
angular.module('headerMenu', ['header.notifications', 'eventbus', 'userMetaAPI'])
    .directive("headerMenu", function (eventbus, $modal, userInfosAPI, userMetaAPI, $rootScope, $cookieStore, $location, $window, $log, $translatePartialLoader) {
        'use strict';
        return {
            restrict: 'AE',
            controller: function ($scope) {
                var ModalInstanceCtrl;
                $translatePartialLoader.addPart('main');
                $translatePartialLoader.addPart('ui');
                $scope.signin = {};
                /**
                 * @name $scope.loadMetaInfos
                 * @function
                 * @memberOf qaobee.directives.headerMenu
                 * @description Load meta information such as current season, current structure and current activity
                 */
                $scope.loadMetaInfos = function () {
                    userMetaAPI.getMetas().success(function (data) {
                        if (angular.isDefined(data) && data !== null) {
                            $rootScope.meta = data;
                            $scope.structure = data.structure;
                        }
                    });
                };
                /**
                 * @name $scope.$on
                 * @function
                 * @memberOf qaobee.directives.headerMenu
                 * @description Intercept eventbus
                 */
                $scope.$on('eventbus', function () {
                    if ("logoff" === eventbus.message) {
                        $log.debug("logoff");
                        delete $scope.user;
                        delete $window.sessionStorage.qaobeesession;
                        if ($location.path().startsWith('/private') || $location.path().startsWith('/admin') || $location.path().startsWith('/firstconnection')) {
                            $location.path('');
                        }
                    } else if ("login" === eventbus.message) {
                        $scope.user = eventbus.data;
                        $scope.loadMetaInfos();
                    } else if ("title" === eventbus.message) {
                        $scope.title = eventbus.data;
                    } else if ("refreshUser" === eventbus.message) {
                        var data = eventbus.data;
                        data.isAdmin = false;
                        if (angular.isDefined(data.account) && data.account.habilitations !== null) {
                            data.account.habilitations.forEach(function (a) {
                                if (a.key === "admin_qaobee") {
                                    data.isAdmin = true;
                                }
                            });
                        }
                        $rootScope.user = data;
                    }
                });

                /**
                 * @name $scope.logoff
                 * @function
                 * @memberOf qaobee.directives.headerMenu
                 * @description Disconnection
                 */
                $scope.logoff = function () {
                    userInfosAPI.logoff().success(function (data) {
                        eventbus.prepForBroadcast("logoff", data);
                        delete $rootScope.user;
                        delete $rootScope.meta;
                        delete $scope.user;
                    });

                };

                ModalInstanceCtrl = function ($scope, $modalInstance, signin, $location, $rootScope, $filter, $log) {
                    $scope.signin = signin;
                    /**
                     * @name $scope.cancel
                     * @function
                     * @memberOf qaobee.QaobeeSwarnApp.ModalInstanceCtrl
                     * @description Close the popin
                     */
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };

                    /**
                     * @name $scope.forgotPasswd
                     * @function
                     * @memberOf qaobee.QaobeeSwarnApp.ModalInstanceCtrl
                     * @description Fergotten password management
                     */
                    $scope.forgotPasswd = function () {
                        userInfosAPI.forgotPasswd($scope.signin.login).success(function () {
                            $location.path('/');
                            $modalInstance.dismiss('cancel');
                        });

                    };

                    /**
                     * @name $scope.login
                     * @function
                     * @memberOf qaobee.QaobeeSwarnApp.ModalInstanceCtrl
                     * @description Validate login form
                     */
                    $scope.login = function () {
                        userInfosAPI.logon($scope.signin.login, $scope.signin.passwd).success(function (data) {
                            $modalInstance.close(data);
                            if (data.account.active) {
                                var paid = true;
                                // Let's verify if our user as paid
                                angular.forEach(data.account.listPlan, function (plan) {
                                    if (plan.status === "open") {
                                        paid = false;
                                    }
                                });

                                if (!paid) {
                                    $location.path('/notPaid');
                                } else {
                                    $window.sessionStorage.qaobeesession = data.account.token;
                                    $rootScope.user = data;
                                    $scope.user= data;
                                    eventbus.prepForBroadcast("login", data);
                                    // is it his first visit?
                                    if (angular.isDefined(data.account.firstConnexion) && data.account.firstConnexion === true) {
                                        $location.path('/firstconnection');
                                    } else {
                                        data.isAdmin = false;
                                        if (angular.isDefined(data.account) && data.account.habilitations !== null) {
                                            data.account.habilitations.forEach(function (a) {
                                                if (a.key === "admin_qaobee") {
                                                    data.isAdmin = true;
                                                }
                                            });
                                        }
                                        $location.path('/private');
                                    }
                                }
                            } else {
                                toastr.warning($filter('translate')('popup.warning.unregistreduser'));
                            }
                        }).error(function (error) {
                            if (error) {
                                $rootScope.errMessSend = true;
                                if (error.code && error.code === 'NON_ACTIVE') {
                                    $modalInstance.dismiss('cancel');
                                    toastr.warning($filter('translate')('popup.warning.unregistreduser'));
                                } else {
                                    toastr.error(error.message);
                                }
                            }
                            $log.error(error);
                        });
                    };
                };

                /**
                 * @name $scope.openLoginModal
                 * @function
                 * @memberOf qaobee.directives.headerMenu
                 * @param {String} size Modal window size
                 * @description open the login popin
                 */
                $scope.openLoginModal = function (size) {
                    $modal.open({
                        templateUrl: 'templates/public/login.html',
                        controller: ModalInstanceCtrl,
                        size: size,
                        resolve: {
                            signin: function () {
                                return $scope.signin;
                            },
                            user: function () {
                                return $scope.user;
                            }
                        }
                    });
                };
            },
            templateUrl: 'templates/directives/headerMenu.html'
        };
    });
