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
            'qaobee.headerNotifications',
            'notificationsRestAPI',
            'userRestAPI',
            'signupRestAPI',
            'seasonsRestAPI',
            'angular-send-feedback'
        ])
        .directive('headerMenu', function (qeventbus, $rootScope, $translate, $location, $window, anchorSmoothScroll,
                                           $translatePartialLoader, $filter, signupRestAPI, userRestAPI, $sce, $log,
                                           seasonsRestAPI) {
            return {
                restrict: 'AE',
                controller: function ($scope) {
                    $translatePartialLoader.addPart('commons').addPart('menu').addPart('user').addPart('home');
                    $scope.desktop = !$rootScope.isMobile;
                    $scope.hideTrial = false;
                    $scope.signin = {};
                    $scope.isProd = $window.location.hostname === 'www.qaobee.com';
                    $scope.showCnil = $translate.use() === 'fr_FR';
                    if ($location.hash() !== '') {
                        $location.hash('');
                    }
                    $scope.gotoAnchor = function (x) {
                        try {
                            $location.path('/');
                            $location.hash(x);
                            $scope.menuItem = x;
                            anchorSmoothScroll.scrollTo(x, 60);
                        } catch (e) {
                            $log.error('[headerMenu] gotoAnchor', e);
                        }
                    };
                    $scope.isActive = function (viewLocation) {
                        return viewLocation === $location.path();
                    };

                    $scope.mailResend = function () {
                        angular.element('#modalMailResend').modal('close');
                        signupRestAPI.mailResend($scope.signin.login);
                    };

                    $rootScope.$on('$viewContentLoaded', function () {
                        angular.element('.dropdown-header-button').dropdown({
                                inDuration: 300,
                                outDuration: 225,
                                constrain_width: false,
                                hover: false,
                                gutter: 0,
                                belowOrigin: false,
                                alignment: 'left',
                                stopPropagation: true
                            }
                        );
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
                            menuWidth: 240,
                            edge: 'left',
                            closeOnClick: true
                        });
                    });

                    $scope.openSignup = function () {
                        delete($scope.infos);
                        angular.element('#modalLogin').modal('close');
                        $location.path('/signup');
                        return false;
                    };

                    $scope.openLogin = function () {
                        angular.element('#modalLogin').modal();
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
                            }
                        });
                    };

                    $scope.closeTrial = function () {
                        $scope.hideTrial = true;
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
                        $log.debug('[headerMenu] qeventbus:login', $scope.user.account, $location.path());
                        $scope.hideTrial = true;
                        if($scope.user.account.status === 'TRIAL'){
                            $scope.hideTrial = false;
                            angular.forEach($scope.user.account.listPlan, function (plan) {
                                $scope.intrial = true;
                                var endDate = moment(plan.endPeriodDate);
                                $scope.endTrial = moment.duration(endDate.diff(moment())).asDays() - 1;
                                $log.debug('[headerMenu] qeventbus:login', $scope.endTrial, endDate, moment());
                                if($scope.endTrial < 0) {
                                    $scope.endTrial = 0;
                                    $scope.notpaid = true;
                                    $scope.user.account.status = 'NOT_PAID'
                                }
                                $scope.trialCountVal = {
                                    count: $filter('number')($scope.endTrial, 0),
                                    intCount: $scope.endTrial
                                };
                                $log.debug('[headerMenu] qeventbus:login', $scope.trialCountVal);
                            });
                        }
                        $scope.loadMetaInfos();
                        
                        switch ( $scope.user.account.status) {
                            case 'NOT_PAID':
                                $scope.notpaid = true;
                                $location.path('/private/billing');
                                break;
                            case 'TRIAL_ENDED':
                                $scope.endTrial = 0;
                                $scope.notpaid = true;
                                $location.path('/private/billing');
                                break;
                            default:
                                // is it his first visit?
                                qeventbus.prepForBroadcast('notifications', {});
                                $location.path('/private');
                        }
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
                                qeventbus.prepForBroadcast('login', data);
                                $window.sessionStorage.qaobeesession = data.account.token;
                                $rootScope.user = data;
                                $rootScope.notLogged = false;
                                $scope.user = data;
                                
                            } else {
                                angular.element('#modalMailResend').modal();
                                angular.element('#modalMailResend').modal('open');
                            }
                        }).error(function (error) {
                            if (error) {
                                $rootScope.errMessSend = true;
                                if (error.code && error.code === 'NON_ACTIVE') {
                                    angular.element('#modalMailResend').modal();
                                    angular.element('#modalMailResend').modal('open');
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
                        qeventbus.prepForBroadcast('notifications', {});
                    }
                },
                templateUrl: 'app/components/directives/commons/headerMenu/headerMenu.html'
            };
        });
}());