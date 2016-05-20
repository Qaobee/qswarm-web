;(function () {
  'use strict'
  /**
   * user effective default
   *
   * @author christophe kervella
   * @class qaobee.user.config
   * @copyright <b>QaoBee</b>.
   */
  angular.module('qaobee.user.effectiveDefault', [])

    .config(function ($routeProvider, metaDatasProvider) {
      $routeProvider.when('/private/config/effectiveDefault', {
        controller: 'EffectiveDefaultCtrl',
        resolve: {
          user: metaDatasProvider.checkUser,
          meta: metaDatasProvider.getMeta
        },
        templateUrl: 'app/modules/commons/users/config/effectiveDefault.html'
      })
    })
    /**
     * @class qaobee.user.config.EffectiveDefaultCtrl
     * @description Main controller of app/modules/commons/users/config/effectiveDefaut.html
     */
    .controller('EffectiveDefaultCtrl', function ($scope, $filter, EnvironmentConfig, $translatePartialLoader, $translate, $rootScope, $log, user, meta,
      userRestAPI, effectiveRestAPI, profileRestAPI, $window) {
      $translatePartialLoader.addPart('profile')
      $translatePartialLoader.addPart('commons')
      $translatePartialLoader.addPart('user')
      $translatePartialLoader.addPart('effective')

      $scope.user = user
      $scope.meta = meta

      $scope.updUser = {}
      angular.copy($scope.user, $scope.updUser)
      $scope.effectives = []

      // return button
      $scope.doTheBack = function () {
        $window.history.back()
      }
      /* Retrieve list effective */
      $scope.getEffectives = function () {
        effectiveRestAPI.getListEffective($scope.meta._id, $scope.currentCategory).success(function (data) {
          $scope.effectives = data.sortBy(function (n) {
            return n.label
          })
        })
      }

      /**
       * @name $scope.updateUser
       * @function
       * @description update the default effective user
       */
      $scope.updateEffectiveDefaultUser = function () {
        $scope.user.effectiveDefault = $scope.updUser.effectiveDefault
        profileRestAPI.update($scope.updUser).success(function (data) {
          $translate('profile.popup.update.success').then(function (mess) {
            toastr.success(mess, data.firstname + ' ' + data.name)
            $scope.doTheBack()
          })
        })
      }

      $scope.$on('$destroy', function () {
        delete $scope.updUser
      })

      /* check user connected */
      $scope.checkUserConnected = function () {
        userRestAPI.getUserById(user._id).success(function () {
          $scope.getEffectives()
        }).error(function () {
          $log.error('ConfigCtrlControler : User not Connected')
        })
      }

      /* Primary, check if user connected */
      $scope.checkUserConnected()
    })
}())
