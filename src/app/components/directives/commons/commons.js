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
        .filter('searchFilter', function () {
            return function (items, query) {
                return angular.isUndefined(query) ? items : items.filter(function (item) {
                    var searchMap = [
                        item.link.type,
                        angular.isDefined(item.participants.teamHome)?item.participants.teamHome.label: '',
                        angular.isDefined(item.participants.teamVisitor)?item.participants.teamVisitor.label: '',
                        item.label,
                        item.startDate
                    ];
                    if (angular.isDefined(item.address) && angular.isDefined(item.address.formatedAddress)) {
                        searchMap.push(item.address.formatedAddress);
                    }
                    return angular.isDefined(searchMap.find(new RegExp(query , 'i')));
                });
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
                            var v = elem.val() === angular.element(firstPassword).val();
                            ctrl.$setValidity('pwmatch', v);
                        });
                    });
                }
            };
        })

        .directive('ageCheck', function () {
            return {
                require: 'ngModel',
                link: function (scope, elem, attr, ngModel) {
                    ngModel.$parsers.unshift(function (value) {
                        if (angular.isDefined(value)) {
                            var valid = moment(value, "DD/MM/YYYY").add(scope.$eval(attr.minAge), 'y').isBefore(moment());
                            ngModel.$setValidity('ageCheck', valid);
                            return valid ? value : undefined;
                        }
                        return undefined;
                    });
                    ngModel.$formatters.unshift(function (value) {
                        if (angular.isDefined(value)) {
                            var dateElem = moment(value, "DD/MM/YYYY");
                            if (value.indexOf('/') === -1) {
                                dateElem = moment(value);
                            }
                            ngModel.$setValidity('ageCheck', dateElem.add(scope.$eval(attr.minAge), 'y').isBefore(moment()));
                        }
                        return value;
                    });
                }
            };
        })

        .directive('numbersOnly', function () {
            return {
                require: 'ngModel',
                link: function (scope, element, attr, ngModelCtrl) {
                    function fromUser(text) {
                        if (text) {
                            var transformedInput = text.replace(/[^0-9]/g, '');

                            if (transformedInput !== text) {
                                ngModelCtrl.$setViewValue(transformedInput);
                                ngModelCtrl.$render();
                            }
                            return transformedInput;
                        }
                        return undefined;
                    }

                    ngModelCtrl.$parsers.push(fromUser);
                }
            };
        })

//
    ;
}());