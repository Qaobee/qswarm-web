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
     * @class qaobee.components.directives.headerMenu
     *
     */
    angular.module(
        'qaobee.headerMenu', [
            'qaobee.eventbus',
            'notificationsRestAPI',
            'userRestAPI',
            'signupRestAPI',
            'seasonsRestAPI'
        ])
        .directive('headerMenu', function (qeventbus, $rootScope, $translate, $location, $window, $log,
                                           $translatePartialLoader, $filter, signupRestAPI, userRestAPI,
                                           seasonsRestAPI, notificationsRestAPI, EnvironmentConfig) {
            return {
                restrict: 'AE',
                controller: function ($scope) {
                    $translatePartialLoader.addPart('commons');
                    $translatePartialLoader.addPart('menu');
                    $translatePartialLoader.addPart('user');
                    $translatePartialLoader.addPart('home');
                    $scope.hideTrial = false;
                    $scope.signin = {};
                    $scope.notifications = [];
                    $scope.hasnotif = false;
                    $scope.isProd = $window.location.hostname === 'www.qaobee.com';
                    $scope.showCnil = $translate.use() === 'fr_FR';

                    $scope.isActive = function (viewLocation) {
                        return viewLocation === $location.path();
                    };

                    /**
                     *
                     */
                    function getNotifications() {
                        if (!$scope.user) {
                            return;
                        }
                        notificationsRestAPI.getUserNotifications().then(function (data) {
                            if (!!data.data && !data.data.error) {
                                $scope.notifications = data.data.filter(function (n) {
                                    return !n.read;
                                });
                                $scope.notifications.forEach(function (n) {
                                    n.content = n.content.stripTags().truncate(30);
                                });
                                $scope.hasnotif = ($scope.notifications.length > 0);
                            }
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

                    $scope.deleteNotification = function (id) {
                        notificationsRestAPI.del(id).then(function (data) {
                            if (data.data.status) {
                                getNotifications();
                            }
                        });
                        return false;
                    };

                    $scope.getAvatar = function (avatar) {
                        return (avatar) ? EnvironmentConfig.apiEndPoint + '/file/SB_Person/' + avatar : 'assets/images/user.png';
                    };

                    $rootScope.$on('$viewContentLoaded', function () {
                        // Detect touch screen and enable scrollbar if necessary
                        $scope.hideTrial = $location.path() === '/';
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

                    $scope.openSignup = function () {
                        delete($scope.infos);
                        angular.element('#modalLogin').modal('close');
                        $location.path('/signupStart');
                        return false;
                    };

                    $scope.openLogin = function () {
                        angular.element('#modalLogin').modal('open');
                    };

                    $scope.loadMetaInfos = function () {
                        userRestAPI.getMetas().then(function (data) {

                            if (angular.isDefined(data.data) && data.data !== null) {
                                $scope.meta = {
                                    sandbox: data.data,
                                    season: null
                                };
                                $scope.structure = data.data.structure;

                                seasonsRestAPI.getSeasonCurrent($scope.meta.sandbox.activityId, $rootScope.user.country._id).then(function (season) {
                                    $scope.meta.season = season.data;
                                });

                                var eb = new vertx.EventBus(EnvironmentConfig.apiEndPoint + '/eventbus');
                                eb.onopen = function () {

                                    eb.registerHandler('qaobee.notification.' + $scope.user._id, function (message) {
                                        if (!!message.title) {
                                            toastr.info(message.content.stripTags().truncate(30), message.title);
                                        }
                                        qeventbus.prepForBroadcast('notifications', message);
                                        getNotifications();
                                    });
                                    eb.registerHandler('qaobee.notification.' + $rootScope.meta.sandbox._id, function (message) {
                                        if (!!message.title) {
                                            toastr.info(message.content.stripTags().truncate(30), message.title);
                                        }
                                        qeventbus.prepForBroadcast('notifications', message);
                                        getNotifications();
                                    });
                                };

                                getNotifications();
                                eb.onclose = function () {
                                    eb = null;
                                };


                            }
                        });

                    };

                    $scope.closeTrial = function () {
                        $scope.intrial = false;
                    };

                    $scope.$on('qeventbus:logoff', function () {
                        delete $rootScope.user;
                        delete $rootScope.meta;
                        delete $scope.user;
                        delete $scope.intrial;
                        delete $window.sessionStorage.qaobeesession;
                        $location.path('/');
                    });

                    $scope.$on('qeventbus:login', function () {
                        $scope.user = qeventbus.data;
                        $scope.endTrial = 999;
                        angular.forEach($scope.user.account.listPlan, function (plan) {
                            $scope.notpaid = plan.status === 'notpaid';
                            if (plan.status === 'open') {
                                $scope.intrial = true;
                                var endDate = moment(plan.startPeriodDate).add(30, 'day');
                                $scope.endTrial = $filter('number')(moment.duration(endDate.diff(moment())).asDays() - 1, 0);
                                $scope.trialCountVal = {count: $scope.endTrial};
                            }
                        });
                        if ($scope.notpaid || $scope.endTrial <= 0) {
                            $location.path('/private/billing');
                        } else {
                            $location.path('/private');
                        }
                        $scope.loadMetaInfos();
                    });

                    $scope.$on('qeventbus:title', function () {
                        $scope.title = qeventbus.data;
                    });

                    $scope.$on('qeventbus:menuItem', function () {
                        $scope.menuItem = qeventbus.data;
                    });
                    $scope.$on('qeventbus:refreshUser', function () {
                        var data = qeventbus.data;
                        data.isAdmin = false;
                        if (angular.isDefined(data.account) && data.account.habilitations !== null) {
                            data.account.habilitations.forEach(function (a) {
                                if (a.key === 'admin_qaobee') {
                                    data.isAdmin = true;
                                }
                            });
                        }
                        $scope.notpaid = data.account.listPlan.filter(function (n) {
                                return n.status === 'notpaid';
                            }).length > 0;
                        if ($scope.notpaid) {
                            $location.path('/private/billing');
                        }
                        $rootScope.user = data;
                        $scope.user = data;
                    });

                    $scope.$on('qeventbus:sandboxChange', function () {
                        $scope.meta.sandbox = qeventbus.data.sandbox;
                    });

                    $scope.logoff = function () {
                        userRestAPI.logoff().success(function (data) {
                            qeventbus.prepForBroadcast('logoff', data);
                            return false;
                        });
                    };

                    $scope.login = function () {
                        userRestAPI.logon($scope.signin.login, $scope.signin.passwd).success(function (data) {
                            angular.element('#modalLogin').modal('close');
                            if (data.account.active) {
                                $scope.notpaid = data.account.listPlan.filter(function (n) {
                                        return n.status === 'notpaid';
                                    }).length > 0;
                                $window.sessionStorage.qaobeesession = data.account.token;
                                $rootScope.user = data;
                                $rootScope.notLogged = false;
                                $scope.user = data;
                                qeventbus.prepForBroadcast('login', data);
                                // is it his first visit?
                                if (angular.isDefined(data.account.firstConnexion) && data.account.firstConnexion === true) {
                                    $location.path('/firstconnection');
                                } else {
                                    data.isAdmin = false;
                                    if (angular.isDefined(data.account) && data.account.habilitations !== null) {
                                        data.isAdmin = (data.account.habilitations.filter(function (n) {
                                            return n.key === 'admin_qaobee';
                                        }).length > 0);
                                    }
                                    if ($scope.notpaid) {
                                        $location.path('/private/billing');
                                    }
                                }
                            } else {
                                toastr.warning($filter('translate')('modal.login.messageControl.unregistreduser'));
                            }
                        }).error(function (error) {
                            if (error) {
                                $rootScope.errMessSend = true;
                                if (error.code && error.code === 'NON_ACTIVE') {
                                    toastr.warning($filter('translate')('modal.login.messageControl.unregistreduser'));
                                } else {
                                    toastr.error(error.message);
                                }
                            }
                        });
                    };

                    $scope.openForgotPwd = function () {
                        delete($scope.infos);
                        angular.element('#modalLogin').modal('close');
                        angular.element('#modalForgotPwd').modal('open');
                    };

                    $scope.renewPwd = function () {
                        userRestAPI.forgotPasswd($scope.infos.login).success(function (data) {
                            if (data.status === true) {
                                delete($scope.infos);
                                angular.element('#modalForgotPwd').modal('close');
                                angular.element('#modalForgotPwdOK').modal('open');
                            } else {
                                toastr.warning(data.message);
                            }
                        }).error(function (error) {
                            toastr.error(error.message);
                        });
                    };
                    if (!!$scope.user) {
                        getNotifications();
                    }
                },
                templateUrl: 'app/components/directives/commons/headerMenu/headerMenu.html'
            };
        });
}());