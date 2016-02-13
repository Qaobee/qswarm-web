(function () {
    'use strict';
    /**
     * Header menu and auth directive<br />
     *
     * Usage :
     *
     * <pre>
     * &lt;header-menu user=&quot;user&quot; /&gt;
     * @author Xavier MARIN
     * @class qaobee.components.directives.qheaderMenu
     * @requires {@link qaobee.components.services.qaobee.eventbus|qaobee.components.services.qaobee.eventbus}
     * @requires {@link qaobee.components.directives.notifications|qaobee.components.directives.notifications}
     * @requires {@link qaobee.components.restAPI.commons.users.user.userRestAPI|qaobee.components.restAPI.commons.users.user.userRestAPI}
     * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
     *
     */
    angular.module(
        'qaobee.headerMenu', [

            /* qaobee services */
            'qaobee.eventbus',
            'ng.deviceDetector',

            /* qaobee Rest API */
            'userRestAPI',
            'signupRestAPI'
        ])
        .directive('headerMenu', function (qeventbus, userRestAPI, signupRestAPI, $rootScope, $cookieStore, $cookies, $location, $window, $log, $translatePartialLoader, $filter, deviceDetector) {
            return {
                restrict: 'AE',
                controller: function ($scope) {
                    $translatePartialLoader.addPart('commons');
                    $translatePartialLoader.addPart('menu');
                    $translatePartialLoader.addPart('user');
                    $scope.signin = {};
                    $scope.isActive = function (viewLocation) {
                        return viewLocation === $location.path();
                    };

                    /*****************************************
                     * Gestion de la bannière de téléchargement de l'appli mobile
                     */
                        // Par défaut, on n'affiche pas la bannière
                    $scope.showBanner = false;
                    if (deviceDetector.os === 'android') {
                        var cookieDownload = $cookies.get('downloadApp');
                        if (angular.isUndefined(cookieDownload)) {
                            $scope.showBanner = true;
                        }
                    }
                    // Si fermeture par clic sur Croix, cookie de téléchargement KO
                    $scope.closeBanner = function () {
                        $cookies.put('downloadApp', "dlKO");
                        $scope.showBanner = false;
                    };
                    // Si clic sur download, cookie de téléchargement OK + redirection
                    $scope.openDownload = function () {
                        $cookies.put('downloadApp', "dlOK");
                        $window.location.href = 'https://play.google.com/apps/testing/com.qaobee.qswarm.hand';
                        $scope.showBanner = false;
                    };


                    /**
                     * @description initialization materialize components
                     */
                    $rootScope.$on('$viewContentLoaded', function () {
                        // Detect touch screen and enable scrollbar if necessary
                        function is_touch_device() { // NOSONAR
                            try {
                                document.createEvent('TouchEvent');
                                return true;
                            } catch (e) {
                                return false;
                            }
                        }

                        if (is_touch_device()) {
                            $('#nav-mobile').css({overflow: 'auto'});
                        }

                        $('.dropdown-button').dropdown();

                        $('.button-collapse').sideNav({
                            // Default is 240
                            menuWidth: 240,
                            // Choose the horizontal origin
                            edge: 'left',
                            // Closes side-nav on <a> clicks, useful for Angular/Meteor
                            closeOnClick: true
                        });

                    });

                    $scope.openSignup = function () {
                        $location.path('/signupStart');
                    };

                    $scope.openLogin = function () {
                        $('#modalLogin').openModal();
                    };


                    /**
                     * @name $scope.loadMetaInfos
                     * @function
                     * @memberOf qaobee.directives.headerMenu
                     * @description Load meta information such as current season, current structure and current activity
                     */
                    $scope.loadMetaInfos = function () {
                        userRestAPI.getMetas().success(function (data) {
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
                     * @description Intercept qeventbus
                     */
                    $scope.$on('qeventbus', function () {
                        if ('logoff' === qeventbus.message) {
                            delete $scope.user;
                            delete $window.sessionStorage.qaobeesession;
                            $location.path('');
                        } else if ('login' === qeventbus.message) {
                            $scope.user = qeventbus.data;
                            $scope.loadMetaInfos();
                        } else if ('title' === qeventbus.message) {
                            $scope.title = qeventbus.data;
                        } else if ('refreshUser' === qeventbus.message) {
                            var data = qeventbus.data;
                            data.isAdmin = false;
                            if (angular.isDefined(data.account) && data.account.habilitations !== null) {
                                data.account.habilitations.forEach(function (a) {
                                    if (a.key === 'admin_qaobee') {
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
                        userRestAPI.logoff().success(function (data) {
                            qeventbus.prepForBroadcast('logoff', data);
                            delete $rootScope.user;
                            delete $rootScope.meta;
                            delete $scope.user;
                        });

                    };

                    /**
                     * @name $scope.login
                     * @function
                     * @memberOf qaobee.QaobeeSwarnApp.ModalInstanceCtrl
                     * @description Validate login form
                     */
                    $scope.login = function () {
                        userRestAPI.logon($scope.signin.login, $scope.signin.passwd).success(function (data) {
                            $('#modalLogin').closeModal();
                            if (data.account.active) {
                                var paid = true;
                                // Let's verify if our user as paid
                                angular.forEach(data.account.listPlan, function (plan) {
                                    if (plan.status === 'open') {
                                        paid = false;
                                    }
                                });

                                if (!paid) {
                                    $location.path('/notPaid');
                                } else {
                                    $window.sessionStorage.qaobeesession = data.account.token;
                                    $rootScope.user = data;
                                    $scope.user = data;
                                    qeventbus.prepForBroadcast('login', data);
                                    // is it his first visit?
                                    if (angular.isDefined(data.account.firstConnexion) && data.account.firstConnexion === true) {
                                        $location.path('/firstconnection');
                                    } else {
                                        data.isAdmin = false;
                                        if (angular.isDefined(data.account) && data.account.habilitations !== null) {
                                            data.account.habilitations.forEach(function (a) {
                                                if (a.key === 'admin_qaobee') {
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
                                    toastr.warning($filter('translate')('popup.warning.unregistreduser'));
                                } else {
                                    toastr.error(error.message);
                                }
                            }
                        });
                    };

                    /**
                     * @name $qcope.cancelSignup
                     * @function
                     * @memberOf qaobee.directives.headerMenu
                     * @description Cancel user signup
                     */
                    $scope.openForgotPwd = function () {
                        delete($scope.infos);
                        $('#modalLogin').closeModal();
                        $('#modalForgotPwd').openModal();
                    };

                    /**
                     * @name $qcope.renewPwd
                     * @function
                     * @memberOf qaobee.directives.headerMenu
                     * @description Ask for paswword renew
                     */
                    $scope.renewPwd = function () {
                        userRestAPI.forgotPasswd($scope.infos.login).success(function (data) {
                            if (data.status === true) {
                                delete($scope.infos);
                                $('#modalForgotPwd').closeModal();
                                $('#modalForgotPwdOK').openModal();
                            } else {
                                toastr.warning(data.message);
                            }
                        }).error(function (error) {
                            toastr.error(error.message);
                        });
                    };

                },
                templateUrl: 'app/components/directives/commons/headerMenu/headerMenu.html'
            };
        });
}());