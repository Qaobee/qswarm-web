/**
 * Module partie administration des users du site
 *
 * @author Xavier MARIN
 * @class qaobee.admin.users
 * @requires {@link qaobee.directives.adminmenu|qaobee.directives.adminmenu}
 * @requires {@link qaobee.rest.admin.adminHabilitAPI|qaobee.rest.admin.adminHabilitAPI}
 * @requires {@link qaobee.rest.admin.adminUsersAPI|qaobee.rest.admin.adminUsersAPI}
 * @requires {@link qaobee.tools.locationAPI|qaobee.tools.locationAPI}
 * @copyright <b>QaoBee</b>.
 */
angular.module('users', ['adminUsersAPI', 'adminHabilitAPI', 'adminmenu', 'locationAPI', 'angularFileUpload'])

    .config(function ($routeProvider) {
        $routeProvider.when('/admin/users', {
            controller: 'AdminUsersCtrl',
            templateUrl: 'templates/admin/users.html'
        }).when('/admin/users/edit/:id', {
            controller: 'AdminUserDetailCtrl',
            templateUrl: 'templates/admin/usersDetail.html'
        }).when('/admin/users/new', {
            controller: 'AdminUserAddCtrl',
            templateUrl: 'templates/admin/usersDetail.html'
        });
    })

/**
 * @class qaobee.admin.users.AdminUsersCtrl
 * @description Liste des users. Contrôleur principal de la page
 *              templates/admin/users.html
 */
    .controller('AdminUsersCtrl', function ($scope, eventbus, adminUsersAPI, $location, $filter) {
        $scope.users = Array.create();

        /**
         * @name $scope.loadData
         * @function
         * @memberOf qaobee.admin.users.AdminUsersCtrl
         * @description Récupère la liste des users
         */
        $scope.loadData = function () {
            adminUsersAPI.get().success(function (data) {
                $scope.users = data;
            });
        };

        /**
         * @name $scope.del
         * @function
         * @memberOf qaobee.admin.users.AdminUsersCtrl
         * @param iduser
         *            id du user
         * @param username
         *            nom prénom
         * @description Supprime un user en fonction de son id
         */
        $scope.del = function (iduser, username) {
            modalConfirm($filter('translate')('popup.title.delete.user'), $filter('translate')('popup.message.delete') + username + ".<br />" + $filter('translate')('popup.confirm.ask'), function () {
                adminUsersAPI.del(iduser).success(function (data, status, headers, config) {
                    toastr.success(username + $filter('translate')('popup.success.delete'));
                    $scope.loadData();
                });
            });
        };
        $scope.loadData();
    })

/**
 * @class qaobee.admin.users.AdminUserAddCtrl
 * @description Ajout d'un nouveau user. Contrôleur principal de la page
 *              templates/admin/usersDetail.html
 */
    .controller('AdminUserAddCtrl', function ($scope, eventbus, adminUsersAPI, adminHabilitAPI, $http, $location, $filter, locationAPI, $q) {
        $scope.dateOption = {
            minDate: new Date(1900, 0, 1, 1, 0, 1),
            maxDate: new Date()
        };
        $scope.curuser = {
            address: {}
        };
        $scope.curuser.name = $filter('translate')('message.anonymous');
        $scope.habilits = Array.create();
        $scope.habilitsFiltred = Array.create();

        // Récupération de la liste des habilitations
        $scope.loadTags = function (query) {
            var deferred = $q.defer();
            adminHabilitAPI.getByKey(query).success(function (data) {
                data.each(function (n) {
                    $scope.habilitsFiltred.add({
                        'text': n.key
                    });
                });
                $scope.habilits = data;
                deferred.resolve($scope.habilitsFiltred);
            });
            return deferred.promise;
        };

        /**
         * @name $scope.addorupdate
         * @function
         * @memberOf qaobee.admin.users.AdminUserAddCtrl
         * @description Crée un nouveau user
         */
        $scope.addorupdate = function () {
            $scope.curuser.birthdate = $scope.dateOption.val;
            var habilits = Array.create();
            $scope.curuser.habilitations.each(function (n) {
                habilits.add($scope.habilits.find(function (h) {
                    return h.key == n.text;
                }));
            });
            $scope.curuser.habilitations = habilits;
            if ($scope.curuser.address.formatedAddress !== null && !$scope.curuser.address.formatedAddress.isBlank()) {
                locationAPI.get($scope.curuser.address.formatedAddress).then(function (adr) {
                    $scope.curuser.address.lat = adr.data.results[0].geometry.location.lat;
                    $scope.curuser.address.lng = adr.data.results[0].geometry.location.lng;
                    // parsing des infos
                    angular.forEach(adr.data.results[0].address_components, function (item) {
                        if (item.types.count('street_number') > 0) {
                            $scope.curuser.address.address = item.long_name + ' ';
                        }
                        if (item.types.count('route') > 0) {
                            $scope.curuser.address.address += item.long_name;
                        }
                        if (item.types.count('locality') > 0) {
                            $scope.curuser.address.city = item.long_name;
                        }
                        if (item.types.count('postal_code') > 0) {
                            $scope.curuser.address.zipcode = item.long_name;
                        }
                        if (item.types.count('country') > 0) {
                            $scope.curuser.address.country = item.long_name;
                        }
                    });
                    adminUsersAPI.add($scope.curuser).success(function (data) {
                        toastr.success(data.forname + " " + data.name + $filter('translate')('popup.success.added'));
                        $location.path('/admin/users/edit/' + data._id);
                    });
                });
            } else {
                adminUsersAPI.add($scope.curuser).success(function (data) {
                    toastr.success(data.forname + " " + data.name + $filter('translate')('popup.success.added'));
                    $location.path('/admin/users/edit/' + data._id);
                });
            }
        };

        /**
         * @name $scope.getLocation
         * @function
         * @memberOf qaobee.admin.users.AdminUserAddCtrl
         * @description Récupération de l'adresse via les services Google
         * @see {@link https://developers.google.com/maps/documentation/geocoding/}
         */
        $scope.getLocation = function (val) {
            return locationAPI.get(val).then(function (res) {
                var addresses = Array.create();
                angular.forEach(res.data.results, function (item) {
                    addresses.push(item.formatted_address);
                });
                return addresses;
            });
        };

    })

/**
 * @class qaobee.admin.users.AdminUserDetailCtrl
 * @description Edition d'un user. Contrôleur principal de la page
 *              templates/admin/usersDetail.html
 */
    .controller('AdminUserDetailCtrl', function ($scope, eventbus, adminUsersAPI, adminHabilitAPI, $routeParams, $location, $filter, $q, $rootScope, locationAPI, FileUploader) {
        $scope.dateOption = {
            minDate: new Date(1900, 0, 1, 1, 0, 1),
            maxDate: new Date()
        };
        // Récupération de la liste des habilitations
        $scope.loadTags = function (query) {
            var deferred = $q.defer();
            adminHabilitAPI.getByKey(query).success(function (data) {
                data.each(function (n) {
                    $scope.habilitsFiltred.add({
                        'text': n.key
                    });
                });
                $scope.habilits = data;
                deferred.resolve($scope.habilitsFiltred);
            });
            return deferred.promise;
        };

        /**
         * @name $scope.loadUser
         * @function
         * @memberOf qaobee.admin.users.AdminUserDetailCtrl
         * @description Récupère le détail d'un user en fonction de son id
         */
        $scope.loadUser = function () {
            adminHabilitAPI.get().success(function (data) {
                $scope.habilits = data;
            });
            adminUsersAPI.getDetail($routeParams.id).success(function (data) {
                $scope.curuser = data;
                var habilits = Array.create();
                $scope.birthdate = moment(data.birthdate).format($filter('translate')('date.format'));
                if ($scope.curuser.habilitations !== null) {
                    $scope.curuser.habilitations.each(function (n) {
                        habilits.add({
                            'text': n.key
                        });
                    });
                    $scope.curuser.habilitations = habilits;
                }
            });
        };

        /**
         * @name $scope.addorupdate
         * @function
         * @memberOf qaobee.admin.users.AdminUserDetailCtrl
         * @description Met à jour le user
         */
        $scope.addorupdate = function () {
            // si les données sont ok
            if ($scope.signupForm.$valid) {
                if (angular.isDefined($scope.passwd) && $scope.passwd !== '') {
                    $scope.curuser.passwd = $scope.passwd;
                }
                var habilits = Array.create();
                $scope.curuser.habilitations.each(function (n) {
                    habilits.add($scope.habilits.find(function (h) {
                        return h.key == n.text;
                    }));
                });
                $scope.curuser.habilitations = habilits;
                $scope.curuser.birthdate = $scope.dateOption.val;
                if ($scope.curuser.address.formatedAddress !== null && !$scope.curuser.address.formatedAddress.isBlank()) {
                    locationAPI.get($scope.curuser.address.formatedAddress).then(function (adr) {
                        $scope.curuser.address.lat = adr.data.results[0].geometry.location.lat;
                        $scope.curuser.address.lng = adr.data.results[0].geometry.location.lng;
                        // parsing des infos
                        angular.forEach(adr.data.results[0].address_components, function (item) {
                            if (item.types.count('street_number') > 0) {
                                $scope.curuser.address.place = item.long_name + ' ';
                            }
                            if (item.types.count('route') > 0) {
                                $scope.curuser.address.place += item.long_name;
                            }
                            if (item.types.count('locality') > 0) {
                                $scope.curuser.address.city = item.long_name;
                            }
                            if (item.types.count('postal_code') > 0) {
                                $scope.curuser.address.zipcode = item.long_name;
                            }
                            if (item.types.count('country') > 0) {
                                $scope.curuser.address.country = item.long_name;
                            }
                        });

                        adminUsersAPI.add($scope.curuser).success(function (data) {
                            $location.path('/admin/users');
                            toastr.success(data.forname + " " + data.name + $filter('translate')('popup.success.updated'));
                        });
                    });
                } else {
                    adminUsersAPI.add($scope.curuser).success(function (data) {
                        $location.path('/admin/users');
                        toastr.success(data.forname + " " + data.name + $filter('translate')('popup.success.updated'));
                    });
                }
            }
        };

        /**
         * @name $scope.upload
         * @function
         * @memberOf qaobee.admin.users.AdminUserDetailCtrl
         * @description Upload de l'avatar
         */
        $scope.upload = function () {
            var config = {
                'headers': {
                    'token': $rootScope.token,
                    'uid': $scope.curuser._id
                }
            };
            FileUploader.send('/file/avatar', document.getElementById('avatar').files, config).then(function (result) {
                adminUsersAPI.getDetail($routeParams.id).success(function (data) {
                    $scope.curuser.avatar = data.avatar;
                    toastr.success(data.forname + " " + data.name + $filter('translate')('popup.success.updated'));
                    document.getElementById('avatar').value = "";
                });
            });
        };

        /**
         * @name $scope.getLocation
         * @function
         * @memberOf qaobee.admin.users.AdminUserAddCtrl
         * @description Récupération de l'adresse via les services Google
         * @see {@link https://developers.google.com/maps/documentation/geocoding/}
         */
        $scope.getLocation = function (val) {
            return locationAPI.get(val).then(function (res) {
                var addresses = Array.create();
                angular.forEach(res.data.results, function (item) {
                    addresses.push(item.formatted_address);
                });
                return addresses;
            });
        };

        $scope.loadUser();
    })
//
;