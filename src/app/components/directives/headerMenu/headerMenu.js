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

            /* qaobee Rest API */
            'userRestAPI',
            'signupRestAPI'
        ])
        .directive('headerMenu', function (qeventbus, userRestAPI, signupRestAPI, $rootScope, $cookieStore, $location, $window, $log, $translatePartialLoader, $filter) {
            return {
                restrict: 'AE',
                controller: function ($scope) {
                    $translatePartialLoader.addPart('commons');
                    $translatePartialLoader.addPart('menu');
                    $translatePartialLoader.addPart('user');
                    $scope.signin = {};
                        $scope.isActive = function(viewLocation) {
                        return viewLocation === $location.path();
                    };
                    /**
                     * @description initialization materialize components
                     */
                    $rootScope.$on('$viewContentLoaded', function () {
                        // Detect touch screen and enable scrollbar if necessary
                        function is_touch_device() {
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
                            menuWidth: 240, // Default is 240
                            edge: 'left', // Choose the horizontal origin
                            closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
                        });

                        $('.tooltipped').tooltip({delay: 50});
                    });


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
                            $log.debug('logoff');
                            delete $scope.user;
                            delete $window.sessionStorage.qaobeesession;
                            if ($location.path().startsWith('/private') || $location.path().startsWith('/admin') || $location.path().startsWith('/firstconnection')) {
                                $location.path('');
                            }
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
                                    $log.debug(data);
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
                            $log.error(error);
                        });
                    };
                    
                    /**
                     * @name $qcope.cancelSignup
                     * @function
                     * @memberOf qaobee.directives.headerMenu
                     * @description Cancel user signup
                     */
                    $scope.cancelSignup = function() {
                    	delete $scope.signup;
                    	$('#modalSignup').closeModal();
                    };
                    
                    /**
                     * @name $scope.usernameTest
                     * @function
                     * @memberOf qaobee.directives.headerMenu
                     * @description Test login and create account 
                     */
                    $scope.usernameTest = function() {
                    	signupRestAPI.usernameTest($scope.signup.login).success(function (data) {
                    		if(data.status===true) {
                    			toastr.warning($filter('translate')('error.signup.nonunique'));
                    		} else {
                    			$scope.signup.junit = true;
                    			$scope.signup.plan = new Object();
                    			$scope.signup.plan.levelPlan='FREEMIUM';
                    			$log.error($scope.signup);
                    			signupRestAPI.registerUser($scope.signup).success(function (data2) {
                    				$('#modalSignup').closeModal();
                          			delete $scope.signup;
                          			delete $scope.passwdConfirm;
                          			$('#modalSignupOK').openModal();
                    			}).error(function (error) {
                                    if (error) {
                                        $rootScope.errMessSend = true;
                                        toastr.error(error.message);
                                    }
                                    $log.error(error);
                                });
                    		}
                    	});
                    	
                    	/**
                         * @name $scope.logoff
                         * @function
                         * @memberOf qaobee.directives.headerMenu
                         * @description Disconnection
                         */
                    	$scope.closeSignupOk = function() {
                        	$('#modalSignupOK').closeModal();
                        };
                    };
                },
                templateUrl: 'app/components/directives/headerMenu/headerMenu.html'
            };
        });
}());