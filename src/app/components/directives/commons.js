(function () {
    'use strict';
    angular.module(
        'qaobee.commonsDirectives', [])
        /**
         * @class qaobee.components.directives.quniqueusername
         * @description Directive de test de l'unicité du username
         */
        .directive('uniqueusername', function (userInfosAPI, $log) {
            return {
                require: 'ngModel',
                restrict: 'A',
                link: function (scope, element, attrs, ngModel) {
                    element.bind('blur', function () {
                        if (!ngModel || !element.val()) {
                            return;
                        }
                        var currentValue = element.val();
                        userInfosAPI.usernameTest(currentValue).then(function (unique) {
                            $log.debug(unique.data);
                            if (unique.data.status) {
                                ngModel.$setValidity('unique', false);
                            } else {
                                ngModel.$setValidity('unique', true);
                            }
                        });
                    });
                }
            };
        })

        .directive('uiDateNoValidate', function ($filter) {
            return {
                require: 'ngModel',
                scope: {
                    dateOption: '=',
                    model: '='

                },
                link: function ($scope) {
                    $scope.dateOption.dateFormat = $filter('translate')('date.format');
                }
            };
        })

        .directive('quiDate', function ($filter) {
            return {
                require: 'ngModel',
                scope: {
                    dateOption: '='
                },
                link: function ($scope, elem, attrs, ngModel) {
                    ngModel.$setValidity('uiDate', true);

                    function checkDate(newDate) {
                        var myDate = moment(newDate, $scope.dateOption.dateFormat.toUpperCase());
                        var val = myDate.valueOf();
                        if (!myDate.isValid()) {
                            ngModel.$setValidity('uiDate', false);
                        } else {
                            $scope.dateOption.val = val;
                            if (($scope.dateOption.minDate < val) && ($scope.dateOption.maxDate > val)) {
                                ngModel.$setValidity('uiDate', true);
                            } else {
                                ngModel.$setValidity('uiDate', false);
                            }
                        }
                    }

                    $scope.$watch(function () {
                        return ngModel.$modelValue;
                    }, function (newValue, oldValue) {
                        if (!angular.equals(oldValue, newValue)) {
                            checkDate(newValue);
                        }
                    });
                    $scope.dateOption.dateFormat = $filter('translate')('date.format');
                    if (elem.val() !== '') {
                        ngModel.$setValidity('uiDate', true);
                    }
                    elem.mask($scope.dateOption.dateFormat.replace(/\w/gi, '9'), {
                        completed: function () {
                            checkDate(this.val());
                        }
                    });
                }
            };
        })

        /**
         * Directive pour vérifier que deux mots de passe sont identiques
         *
         * @author Xavier MARIN
         * @class qaobee.components.directives.qpasswdCheck
         * @copyright <b>QaoBee</b>.
         */
        .directive('passwdCheck', function () {
            return {
                require: 'ngModel',
                link: function (scope, elem, attrs, ctrl) {
                    var firstPassword = '#' + attrs.passwdCheck;
                    elem.add(firstPassword).on('keyup', function () {
                        scope.$apply(function () {
                            var v = elem.val() === $(firstPassword).val();
                            ctrl.$setValidity('pwmatch', v);
                        });
                    });
                }
            };
        })
        /**
         * Directive de la page About pour afficher les photos
         *
         * @author Xavier MARIN
         * @class qaobee.components.directives.qaboutPhotos
         * @copyright <b>QaoBee</b>.
         */
        .directive('aboutPhotos', function () {
            return {
                restrict: 'AE',
                scope: {
                    aboutname: '=',
                    abouttitle: '=',
                    aboutdesc: '=',
                    aboutemail: '=',
                    abouttwitter: '=?',
                    aboutgithub: '=?'

                },
                controller: function ($scope, $filter) {
                    $scope.content = {};
                    $scope.content.html = '<h4 class="center-block" >' + $filter('translate')($scope.abouttitle) + '</h4><p style="text-align: justify">' + $filter('translate')($scope.aboutdesc);
                    $scope.content.html += '</p><ul class="list-inline center-block" style="text-align: center;"><li><a href="mailto:' + $filter('translate')($scope.aboutemail);
                    $scope.content.html += '" title="' + $filter('translate')($scope.aboutemail) + '" target="_blank"><span class="social-icon fa fa-envelope-square"></span></a></li>';
                    if (!$filter('translate')($scope.abouttwitter).isBlank()) {
                        $scope.content.html += '<li><a href="https://twitter.com/' + $filter('translate')($scope.abouttwitter);
                        $scope.content.html += '" title="@' + $filter('translate')($scope.abouttwitter) + '"target="_blank"><span class="social-icon fa fa-twitter-square"></span></a></li>';
                    }
                    if (!$filter('translate')($scope.aboutgithub).isBlank()) {
                        $scope.content.html += '<li><a href="https://github.com/' + $filter('translate')($scope.aboutgithub);
                        $scope.content.html += '" title="Fork me, I\'m famous" target="_blank"><span class="social-icon fa fa-github-square"></span></a></li>';
                    }
                    $scope.content.html += '</ul>';
                },
                link: function (scope, el) {
                    scope.$watch('content', function (newValue) {
                        updatePop(newValue.html);
                    });
                    function hideThis() {
                        $(el).popover('hide');
                    }

                    function updatePop(content) {
                        $(el)
                            .popover(
                                {
                                    html: true,
                                    content: content,
                                    placement: 'bottom',
                                    animation: false,
                                    trigger: 'manual',
                                    template: '<div class="popover" onmouseover="$(this).prev().attr(\'focused\', true);$(this).mouseleave(function() {$(this).prev().attr(\'focused\', false);if(\'true\' !== $(this).prev().attr(\'focusedImg\')) {$(this).popover(\'hide\');}});"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class="popover-content"><p></p></div></div></div>'
                                }).mouseenter(function () {
                            $(this).attr('focusedImg', true);
                            $(this).popover('show');
                        }).mouseleave(function () {
                            $(this).attr('focusedImg', false);
                            var focused = $(this).attr('focused');
                            setTimeout(function () {
                                if (focused !== 'true') {
                                    hideThis();
                                }
                            }, 50);

                        });
                    }
                },
                templateUrl: 'app/components/directives/aboutPhotos.html'
            };
        })

//
    ;
}());