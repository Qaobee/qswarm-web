angular.module('summarySheetModal', [])

.controller('summarySheetModalCtrl', function($scope, $modalInstance) {

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

});
