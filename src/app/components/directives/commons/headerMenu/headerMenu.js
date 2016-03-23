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
            'notificationsRestAPI',
            /* qaobee Rest API */
            'userRestAPI',
            'signupRestAPI'
        ])
        .directive('headerMenu', function (qeventbus, userRestAPI, signupRestAPI, $rootScope, $cookieStore, $cookies,
                                           $location, $window, $log, $translatePartialLoader, $filter, deviceDetector,
                                           notificationsRestAPI, EnvironmentConfig) {
            return {
                restrict: 'AE',
                controller: function ($scope) {
                    $translatePartialLoader.addPart('commons');
                    $translatePartialLoader.addPart('menu');
                    $translatePartialLoader.addPart('user');
                    $scope.signin = {};
                    $scope.notifications = [];
                    /**
                     *
                     * @param viewLocation
                     * @returns {boolean}
                     */
                    $scope.isActive = function (viewLocation) {
                        return viewLocation === $location.path();
                    };

                    /**
                     *
                     */
                    function getNotifications() {
                        notificationsRestAPI.getUserNotifications().then(function (data) {
                            $scope.notifications = data.data.filter(function(n) {
                                return !n.read;
                            });
                            console.log($scope.notifications)
                        });
                    }

                    /**
                     *
                     * @param id
                     * @returns {boolean}
                     */
                    $scope.markAsRead = function (id) {
                        notificationsRestAPI.markAsRead(id).then(function (data) {
                            if (data.data.status) {
                                getNotifications();
                            }
                        });
                        return false;
                    };

                    /**
                     *
                     * @param id
                     * @returns {boolean}
                     */
                    $scope.deleteNotification = function (id) {
                        notificationsRestAPI.del(id).then(function (data) {
                            if (data.data.status) {
                                getNotifications();
                            }
                        });
                        return false;
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
                    /**
                     *
                     * @param avatar
                     * @returns {string}
                     */
                    $scope.getAvatar = function (avatar) {
                        return (avatar) ? EnvironmentConfig.apiEndPoint + '/file/' + $scope.collection + '/' + avatar : 'assets/images/user.png';
                    };
                    // Si fermeture par clic sur Croix, cookie de téléchargement KO
                    /**
                     *
                     */
                    $scope.closeBanner = function () {
                        $cookies.put('downloadApp', "dlKO");
                        $scope.showBanner = false;
                    };
                    // Si clic sur download, cookie de téléchargement OK + redirection
                    /**
                     *
                     */
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
                            angular.element('#nav-mobile').css({overflow: 'auto'});
                        }

                        angular.element('.dropdown-button').dropdown();

                        angular.element('.button-collapse').sideNav({
                            // Default is 240
                            menuWidth: 240,
                            // Choose the horizontal origin
                            edge: 'left',
                            // Closes side-nav on <a> clicks, useful for Angular/Meteor
                            closeOnClick: true
                        });

                    });

                    /**
                     *
                     * @returns {boolean}
                     */
                    $scope.openSignup = function () {
                        $location.path('/signupStart');
                        return false;
                    };

                    /**
                     *
                     */
                    $scope.openLogin = function () {
                        angular.element('#modalLogin').openModal();
                    };


                    /**
                     * @name $scope.loadMetaInfos
                     * @function
                     * @memberOf qaobee.directives.headerMenu
                     * @description Load meta information such as current season, current structure and current activity
                     */
                    $scope.loadMetaInfos = function () {
                        userRestAPI.getMetas().then(function (data) {
                            if (angular.isDefined(data.data) && data.data !== null) {
                                $rootScope.meta = data.data;
                                $scope.structure = data.data.structure;

                                var eb = new vertx.EventBus(EnvironmentConfig.apiEndPoint + '/eventbus');
                                eb.onopen = function () {
                                    console.log('socket connected');
                                    eb.registerHandler('qaobee.notification.' + $scope.user._id, function (message) {
                                        $scope.notifications.unread = $scope.notifications.unread + 1;
                                        toastr.info(message.title, message.content);
                                        getNotifications();
                                    });
                                    eb.registerHandler('qaobee.notification.' + $rootScope.meta.sandbox._id, function (message) {
                                        $scope.notifications.unread = $scope.notifications.unread + 1;
                                        toastr.info(message.title, message.content);
                                        getNotifications();
                                    });
                                };
                                eb.onclose = function () {
                                    console.log('socket closed');
                                    eb = null;
                                };
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
                            $location.path('/');
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
                            return false;
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
                            angular.element('#modalLogin').closeModal();
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
                     * @name $scope.cancelSignup
                     * @function
                     * @memberOf qaobee.directives.headerMenu
                     * @description Cancel user signup
                     */
                    $scope.openForgotPwd = function () {
                        delete($scope.infos);
                        angular.element('#modalLogin').closeModal();
                        angular.element('#modalForgotPwd').openModal();
                    };

                    /**
                     * @name $scope.renewPwd
                     * @function
                     * @memberOf qaobee.directives.headerMenu
                     * @description Ask for paswword renew
                     */
                    $scope.renewPwd = function () {
                        userRestAPI.forgotPasswd($scope.infos.login).success(function (data) {
                            if (data.status === true) {
                                delete($scope.infos);
                                angular.element('#modalForgotPwd').closeModal();
                                angular.element('#modalForgotPwdOK').openModal();
                            } else {
                                toastr.warning(data.message);
                            }
                        }).error(function (error) {
                            toastr.error(error.message);
                        });
                    };
                    getNotifications();
                },
                templateUrl: 'app/components/directives/commons/headerMenu/headerMenu.html'
            };
        });
}());