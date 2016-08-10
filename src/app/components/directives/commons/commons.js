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

//
    ;
}());