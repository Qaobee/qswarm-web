/**
 * Module that shows the player's detail
 *
 * @author Xavier Marin
 * @class qaobee.prive.organization.effective.playersheet
 * @namespace qaobee.prive.organization.effective.playersheet
 *
 * @copyright <b>QaoBee</b>.
 */
angular.module('playersheet', ['statWidget', 'labelsAPI', 'noteAPI', 'personRestAPI',
    'structureCfgRestAPI', 'statAPI', 'chart.js', 'structureAPI', 'summarySheetModal', 'seasonsAPI','activityCfgRestAPI', 'userMetaAPI'])

    .config(function ($routeProvider, metaDatasProvider) {
        'use strict';
        $routeProvider.when('/private/playersheet/:id', {
            controller: 'PlayerSheetCtrl',
            resolve: {
                user: metaDatasProvider.checkUser,
                meta: metaDatasProvider.getMeta
            },
            templateUrl: 'templates/prive/organization/effective/playersheet.html'
        });
    })
/**
 * @class qaobee.prive.prive.PlayerSheetCtrl
 * @description Controller of templates/prive/organization/effective/playersheet.html
 */
    .controller('PlayerSheetCtrl', function ($scope, $log, eventbus, personRestAPI, statAPI, locationAPI, labelsAPI, userMetaAPI, $q, $window, $translatePartialLoader, $location, $rootScope, noteAPI, $filter, FileUploader, $http, structureCfgRestAPI, structureAPI, $modal, seasonsAPI, $routeParams, user, meta) {
        'use strict';
        // Id of the player
        var idPerson = $routeParams.id;
        $translatePartialLoader.addPart('effective');
        $translatePartialLoader.addPart('stats');
        $translatePartialLoader.addPart('data');
        $translatePartialLoader.addPart('main');
        $scope.person = {available: true, isGoal: false};
        $scope.flipped = false;
        $scope.toggle = function () {
            $scope.flipped = !$scope.flipped;
        };
        var personProm = $q.defer();
        $scope.personProm = personProm.promise;

        $scope.ownersId = $q.defer();
        $scope.ownersId.resolve([idPerson]);
        $scope.widget = [{
            type: 'Line',
            color: 'muted',
            stat: 'attendance',
            prom: $scope.ownersId.promise,
            aggregat: "AVG",
            listFieldsGroupBy: ['code', 'timer']
        }];
        $scope.myChart = {
            options: {
                scaleLineColor: '#fff',
                scaleFontSize: 10,
                scaleFontColor: '#fff',
                tooltipFontSize: 10,
                tooltipTitleFontSize: 10,
                maintainAspectRatio: false,
                animationEasing: "easeOutQuart",
                pointLabelFontSize: 0
            },
            data: {
                labels: [],
                series: [],
                datasets: []
            }
        };
        $scope.attendance = {
            options: {
                scaleLineColor: '#fff',
                scaleFontSize: 10,
                scaleFontColor: '#fff',
                tooltipFontSize: 10,
                tooltipTitleFontSize: 10,
                maintainAspectRatio: false,
                animationEasing: "easeOutQuart",
                percentageInnerCutout: 85,
                legendTemplate: ""
            },
            data: {
                labels: [],
                series: [],
                datasets: [[]]
            }
        };

        $scope.doTheBack = function () {
            $window.history.back();
        };
        $scope.flipFront = function () {
            $scope.flipped = false;
        };

        $scope.flipBack = function () {
            $scope.flipped = true;
        };

        $scope.stats = {};

        function buildRadars() {
            $scope.technicalRadar = {
                datasets: [[]],
                series: [$filter('translate')('playerSheet.rubrics.technical.title')],
                labels: []
            };
            $scope.physicalRadar = {
                datasets: [[]],
                series: [$filter('translate')('playerSheet.rubrics.physical.title')],
                labels: []
            };
            $scope.mentalRadar = {
                datasets: [[]],
                series: [$filter('translate')('playerSheet.rubrics.mental.title')],
                labels: []
            };
            var labels = [];
            var datasets = [];

            labels.push($filter('translate')('playerSheet.rubrics.technical.title'));
            var score = 0;
            $scope.person.technicalFolder.forEach(function (a) {
                score += a.value;
                $scope.technicalRadar.labels.push($filter('translate')('playerSheet.rubrics.technical.label.' + a.key));
                $scope.technicalRadar.datasets[0].push(a.value);
            });
            if ($scope.person.technicalFolder.length > 0) {
                datasets.push(score * 100 / (5 * $scope.person.technicalFolder.length));
            } else {
                datasets.push(0);
            }
            labels.push($filter('translate')('playerSheet.rubrics.physical.title'));
            score = 0;
            $scope.person.physicalFolder.forEach(function (a) {
                score += a.value;
                $scope.physicalRadar.labels.push($filter('translate')('playerSheet.rubrics.physical.label.' + a.key));
                $scope.physicalRadar.datasets[0].push(a.value);
            });
            if ($scope.person.physicalFolder.length > 0) {
                datasets.push(score * 100 / (5 * $scope.person.physicalFolder.length));
            } else {
                datasets.push(0);
            }

            labels.push($filter('translate')('playerSheet.rubrics.mental.title'));
            score = 0;
            $scope.person.mentalFolder.forEach(function (a) {
                score += a.value;
                $scope.mentalRadar.labels.push($filter('translate')('playerSheet.rubrics.mental.label.' + a.key));
                $scope.mentalRadar.datasets[0].push(a.value);
            });
            if ($scope.person.mentalFolder.length > 0) {
                datasets.push(score * 100 / (5 * $scope.person.mentalFolder.length));
            } else {
                datasets.push(0);
            }

            $scope.myChart.data = {
                labels: labels,
                datasets: datasets,
                series: [$scope.person.firstname + ' ' + $scope.person.name]
            };
        }

        $scope.user = user;
        $scope.meta = meta;
        $scope.season = meta.season;
        $scope.activity = meta.activity;
        $scope.structure = meta.structure;
        structureCfgRestAPI.getCategoriesAgeStrList(meta.season.code, meta.structure._id).success(function (data) {
            $scope.categories = data;
        });
        personRestAPI.getPerson(idPerson).success(function (data) {
            personProm.resolve(data);
            eventbus.prepForBroadcast("title", data.firstname + ' ' + data.name);
            initPerson(data);
            // Fetch user's stats
            $scope.ownersId = Array.create(idPerson);
            $scope.fetchPersonStats();
            // Fetch user's stats
            buildRadars();
            // Récupère les notes et les associe à chaque rubriques
            /* noteAPI.getListeNotesByPerson(idPerson).success(function (data) {
             $scope.notes = [];
             if ($scope.person.listRubricSheet) {
             for (var i = 0; i < $scope.person.listRubricSheet.length; i++) {
             var trouve = false;
             for (var j = 0; j < data.length; j++) {

             trouve = false;

             if ($scope.person.listRubricSheet[i].label === data[j].label) {
             $scope.person.listRubricSheet[i].note = data[j];
             trouve = true;
             break;
             }
             }
             if (!trouve) {
             var note = {};
             note.label = $scope.person.listRubricSheet[i].label;
             note.content = '';
             note.idPerson = $scope.person._id;

             $scope.person.listRubricSheet[i].note = note;
             }

             $scope.notes.push($scope.person.listRubricSheet[i].note);
             }
             }
             });*/
            var search = {
                activityId: meta.activity._id,
                countryId: meta.structure.country._id,
                listIndicators: ['stateForm', 'positionType']
            };
            statAPI.getIndicatorCfg(search).success(function (data) {
                if (angular.isUndefined(data) || data === null) {
                    return;
                }
                data.forEach(function (d) {
                    $scope[d.code] = d.listValues;
                });
            });


        });
        var indicators = Array.create('playtime', 'goalscored', 'goalconceded', 'holder', 'substitue', 'redCard', 'yellowCard');
        angular.forEach(indicators, function (value) {
            $scope.stats[value] = {sum: 0, avg: 0, count: 0, freq: 0};
        });

        $scope.openUnavailableModal = function (clickEvent) {
            clickEvent.stopPropagation();
            clickEvent.currentTarget.checked = $scope.person.available; // reset first
            clickEvent.preventDefault();
            $modal.open({
                templateUrl: 'templates/prive/organization/effective/playerAvailabilityModal.html',
                controller: 'PlayerAvailabilityModalCtrl',
                size: 'sm',
                resolve: {
                    person: function () {
                        return $scope.person;
                    },
                    meta: function () {
                        return $scope.meta;
                    }
                }
            }).result.then(function () {
                    $scope.funcSubmitUpdateState();
                }, function () {
                    // nothing
                });
        };

        $scope.fetchPersonStats = function () {
            var playtimeCount = 1;
            var search = {
                listIndicators: indicators,
                listOwners: $scope.ownersId,
                startDate: $scope.season.startDate,
                endDate: $scope.season.endDate,
                aggregat: "AVG",
                listFieldsGroupBy: ['code']
            };
            statAPI.getStatGroupBy(search).success(function (data) {
                if (angular.isArray(data) && data.length > 0) {
                    angular.forEach(data, function (value) {
                        $scope.stats[value._id.code].avg = value.value;
                    });
                }
            });
            var searchSum = angular.copy(search);
            searchSum.aggregat = "SUM";
            statAPI.getStatGroupBy(searchSum).success(function (data) {
                if (angular.isArray(data) && data.length > 0) {
                    angular.forEach(data, function (value) {
                        $scope.stats[value._id.code].sum = value.value;
                        if (value._id.code === 'playtime') {
                            playtimeCount = value.value;
                        }
                    });
                }

                var searchCount = angular.copy(search);
                searchCount.aggregat = "COUNT";
                statAPI.getStatGroupBy(searchCount).success(function (data) {
                    if (angular.isArray(data) && data.length > 0) {
                        angular.forEach(data, function (value) {
                            $scope.stats[value._id.code].count = value.value;
                            $scope.stats[value._id.code].freq = playtimeCount / value.value;
                        });
                    }
                });
            });
            var searchAttendance = angular.copy(search);
            searchAttendance.listIndicators = ['attendance'];
            searchAttendance.aggregat = "AVG";
            searchAttendance.value = $filter('translate')('stat.attendance.val');
            statAPI.getStatGroupBy(searchAttendance).success(function (data) {
                if (angular.isArray(data) && data.length > 0) {
                    var labels = [];
                    var datasets = [];
                    labels.push($filter('translate')('stat.attendance.value.present'));
                    labels.push($filter('translate')('stat.attendance.value.absent'));

                    datasets.push(parseInt($filter('number')(data[0].value * 100, 2)));
                    datasets.push(parseInt($filter('number')((1 - data[0].value) * 100, 2)));
                    $scope.attendance.data = {
                        labels: labels,
                        datasets: datasets
                    };
                }
            });
        };


        $scope.openPlayerSheetModal = function () {
            $modal.open({
                templateUrl: 'templates/prive/organization/effective/playerPersonalInfoModal.html',
                controller: 'PlayerPersonalInfoModalCtrl',
                size: 'lg',
                resolve: {
                    person: function () {
                        return $scope.person;
                    },
                    meta: function () {
                        return $scope.meta;
                    }
                }
            }).result.then(function (person) {
                    $scope.person = person;
                    $scope.funcSubmitUpdateState();
                }, function () {
                    // nothing
                });
        };

        $scope.showSummarySheet = function () {
            $modal.open({
                templateUrl: 'templates/prive/organization/effective/summarySheetModal.html',
                controller: 'summarySheetModalCtrl',
                backdrop: 'true',
                scope: $scope,
                size: 'md'
            });
        };

        $scope.showMap = function () {
            $modal.open({
                templateUrl: 'templates/mapModal.html',
                controller: 'MapModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    person: function () {
                        return $scope.person;
                    }
                }
            });
        };

        $scope.isAfficherNotes = false;

        /* ---- Gestion des notes ---- */

        $scope.funcUpdateNotes = function (note, rubric) {
            note.initial = note.content;
            $scope.isModifierNotes = true;

            if (rubric) {
                rubric.isModifierNoteRubric = !rubric.isModifierNoteRubric;
                $scope.focusElem('rubric-' + rubric.code + '-note');
            }
        };

        $scope.funcCancelUpdateNotes = function (note, rubric) {
            $scope.isModifierNotes = false;
            note.content = note.initial;

            if (rubric) {
                rubric.isModifierNoteRubric = false;
            }
        };

        $scope.funcSubmitUpdateNotes = function (note, rubric) {
            delete note.initial;
            noteAPI.upsert(note).success(function () {
                if (rubric) {
                    rubric.isModifierNoteRubric = false;
                }
                $scope.isModifierNotes = false;
            });
        };

        $scope.toggleNotes = function () {
            $scope.isAfficherNotes = !$scope.isAfficherNotes;
        };

        /**
         * Initialise l'objet $scope.person
         */
        function initPerson(data) {
            $scope.person = data;
            $scope.person.available = true;
            $scope.person.isGoal = false;
            $scope.person.age = dateDiff($scope.person.birthdate);
            if ($scope.person.status.availability.value === "unavailable") {
                $scope.person.available = false;
            }
            if ($scope.person.status.positionType === 'goalkeeper') {
                $scope.person.isGoal = true;
            }
            initHistoLicences();
            if (angular.isDefined($scope.person.birthcountry)) {
                $scope.person.birthcountryF = $filter('translate')($scope.person.birthcountry.label);
            }
        }

        /**
         * Initialise les histo licences
         */
        function initHistoLicences() {
            userMetaAPI.getSeasonsInfo($scope.activity._id, $scope.structure._id).success(function (data) {
                var seasons = [];
                angular.forEach(data, function (value) {
                    this[value.code] = value;
                }, seasons);

                angular.forEach($scope.person.listLicenses, function (licence) {
                    if (angular.isDefined(licence.structure)) {
                        getStructure(licence);
                    }
                    angular.forEach(licence.listHistoLicense, function (histoLicense) {
                        if (histoLicense.seasonCode === $scope.season.code) {
                            $scope.person.currentLicence = histoLicense;
                            $scope.person.currentLicence.numLicense = licence.numLicense;
                        }
                        if (angular.isDefined(histoLicense.categoryAgeCode) && angular.isDefined($scope.categories)) {
                            histoLicense.season = seasons[histoLicense.seasonCode];
                            angular.forEach($scope.categories, function (category) {
                                if (histoLicense.categoryAgeCode === category.code) {
                                    histoLicense.category = category;
                                }
                            });
                        }
                    });
                });
            });
        }


        /**
         * Recupère une structure
         */
        function getStructure(licence) {
            return structureAPI.get(licence.idStructure).success(function (data) {
                licence.structure = data;
            });
        }

        $scope.updateSkills = function (stat, skill) {
            $log.debug(stat);
            personRestAPI.updateEffectiveFeature($scope.person._id, skill, stat.key, stat.value).success(function () {
                var statistic = {
                    code: stat.key,
                    owner: $scope.person._id,
                    producter: Array.create($scope.user._id),
                    structureId: $scope.structure._id,
                    activityId: $scope.activity._id,
                    value: stat.value
                };
                statAPI.addStat(statistic).success(function () {
                    toastr.success($filter('translate')('playerSheet.updated'), $filter('translate')('stat.' + stat.key + '.libelle'));
                    buildRadars();
                });

            });
        };

        $scope.funcSubmitUpdateState = function () {
            angular.forEach($scope.person.listRubricSheet, function (value) {
                if (angular.isDefined(value.note)) {
                    delete value.note;
                    delete value.isModifierNoteRubric;
                }
            });
            var personPOST = angular.copy($scope.person);
            angular.forEach($scope.person.listLicenses, function (listLicense) {
                delete listLicense.structure;
                angular.forEach(listLicense.listHistoLicense, function (listHistoLicense) {
                    delete listHistoLicense.season;
                    delete listHistoLicense.category;
                });
            });
            if (personPOST.medicalFolder !== null && angular.isDefined(personPOST.medicalFolder.wounds)) {
                angular.forEach(personPOST.medicalFolder.wounds, function (wounds) {
                    if (angular.isDefined(wounds.idLocalityWound) && angular.isObject(wounds.idLocalityWound)) {
                        wounds.idLocalityWound = wounds.idLocalityWound._id;
                    }
                });
            }
            if (personPOST.birthcountryF) {
                delete personPOST.birthcountryF;
            }
            delete personPOST.birthyearF;
            delete personPOST.lefthanded;
            delete personPOST.position;
            delete personPOST.age;
            delete personPOST.datacompletude;
            delete personPOST.percent;
            delete personPOST.available;
            delete personPOST.isGoal;

            if ($scope.person.address.formatedAddress !== null && $scope.person.address.formatedAddress !== '') {
                var formatedAddress = $scope.person.address.formatedAddress;
                delete personPOST.address.formatedAddress;

                // gestion de l'adresse
                locationAPI.get(formatedAddress).then(function (adr) {
                    // parsing des infos
                    angular.forEach(adr.data.results[0].address_components, function (item) {
                        if (item.types.count('street_number') > 0) {
                            personPOST.address.place = item.long_name + ' ';
                        }
                        if (item.types.count('route') > 0) {
                            personPOST.address.place += item.long_name;
                        }
                        if (item.types.count('locality') > 0) {
                            personPOST.address.city = item.long_name;
                        }
                        if (item.types.count('postal_code') > 0) {
                            personPOST.address.zipcode = item.long_name;
                        }
                        if (item.types.count('country') > 0) {
                            personPOST.address.country = item.long_name;
                        }
                    });
                    // Mise à jour de la Person
                    updatePerson(personPOST);
                });
            } else {
                delete personPOST.address.formatedAddress;
                // Mise à jour de la Person
                updatePerson(personPOST);
            }
        };

        var updatePerson = function (personPOST) {
            personRestAPI.updatePerson(personPOST).success(function (data) {
                initPerson(data);
                toastr.success($filter('translate')('playerSheet.updated'));
            });
        };

        $scope.$watch('person.address', function () {
            if ($scope.person && $scope.person.address) {
                updateFormatedAddress();
            }
        });

        var updateFormatedAddress = function () {
            // Attention au formateur
            if ($scope.person.address.place === '' || $scope.person.address.place === null || $scope.person.address.zipcode === '' || $scope.person.address.zipcode === null || $scope.person.address.city === '' || $scope.person.address.city === null || $scope.person.address.country === '' || $scope.person.address.country === null) {
                $scope.person.address.formatedAddress = '';
            } else {
                // Attention au formateur
                $scope.person.address.formatedAddress = $scope.person.address.place + ", " + $scope.person.address.zipcode + " " + $scope.person.address.city + ", " + $scope.person.address.country;
            }
        };


    })


/**
 * @class qaobee.prive.organization.effective.MapModalInstanceCtrl
 * @description Controller of the modal templates/mapModal.html
 */
    .controller('MapModalInstanceCtrl', function ($scope, $modalInstance, person) {
        'use strict';
        $scope.person = person;
        $scope.loc = {lat: 40, lon: -73};
        $scope.markers = {
            mainMarker: {
                zoom: 12
            }
        };
        $scope.gotoLocation = function (lat, lon) {
            if ($scope.lat !== lat || $scope.lon !== lon) {
                $scope.loc = {lat: lat, lon: lon};
                $scope.markers = {
                    mainMarker: {
                        lat: lat,
                        lng: lon,
                        zoom: 14
                    }, markers: {
                        mainMarker: {
                            focus: true,
                            message: $scope.person.address.formatedAddress,
                            lat: lat,
                            lng: lon
                        }
                    }
                };
            }
        };
        $scope.geoCode = function (address) {
            if (!this.geocoder) {
                this.geocoder = new google.maps.Geocoder();
            }
            this.geocoder.geocode({'address': address}, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    var loc = results[0].geometry.location;
                    $scope.search = results[0].formatted_address;
                    $scope.gotoLocation(loc.lat(), loc.lng());
                }
            });
        };
        $scope.geoCode($scope.person.address.formatedAddress);
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    })


/**
 * @class qaobee.prive.organization.effective.PlayerAvailabilityModalCtrl
 * @description Controller of the modal templates/prive/organization/effective/playerAvailabilityModal.html
 */
    .controller('PlayerAvailabilityModalCtrl', function ($scope, $rootScope, $modalInstance, person, meta, statAPI, $log, $translatePartialLoader, $filter) {
        'use strict';
        $translatePartialLoader.addPart('stats');
        $translatePartialLoader.addPart('format');
        $scope.person = person;
        $scope.reasons = [];
        $scope.initialValue = angular.copy($scope.person.status.availability);
        $scope.endDate = moment($scope.person.status.availability.endDate).format($filter('translate')('date.format'));
        $scope.dateOption = {
            minDate: new Date(1999, 0, 1, 1, 0, 1),
            maxDate: new Date(2999, 0, 1, 1, 0, 1)
        };


        /* retrieve list of reason for unavailability */
        $scope.season = meta.season;
        $scope.activity = meta.activity;
        $scope.structure = meta.structure;

        var search = {
            activityId: meta.activity._id,
            countryId: meta.structure.country._id,
            listIndicators: ['unavailability']
        };

        statAPI.getIndicatorCfg(search).success(function (data) {
            if (angular.isUndefined(data) || data === null) {
                return;
            }
            var indicator = data[0];
            indicator.listValues.forEach(function (a) {
                $scope.reasons.push(a);
            });
        });


        $scope.updateState = function () {
            if ("available" === $scope.person.status.availability.cause) {
                $scope.person.available = true;
                $scope.person.status.availability.value = "available";
                $scope.person.status.availability.endDate = moment().valueOf();
                $scope.dateOption.val = $scope.person.status.availability.endDate;
                $scope.endDate = moment().format($filter('translate')('date.format'));
            } else {
                $scope.person.available = false;
                $scope.person.status.availability.value = "unavailable";
                if (angular.isDefined($scope.dateOption.val)) {
                    $scope.person.status.availability.endDate = $scope.dateOption.val;
                    $scope.endDate = moment($scope.person.status.availability.endDate).format($filter('translate')('date.format'));
                }
            }
        };

        $scope.cancel = function () {
            $scope.person.status.availability = angular.copy($scope.initialValue);
            $modalInstance.dismiss('cancel');
        };

        $scope.ok = function (unavailableForm) {
            if (unavailableForm.$valid) {
                $scope.updateState();
                $modalInstance.close($scope.person.status.availability);
            }
        };
        $scope.updateState();
    })
/**
 * @class qaobee.prive.organization.effective.PlayerPersonalInfoModalCtrl
 * @description Controller of the modal templates/prive/organization/effective/playerPersonalInfoModal.html
 */
    .controller('PlayerPersonalInfoModalCtrl', function ($scope, $rootScope, $modalInstance, person, meta, labelsAPI, statAPI, locationAPI,activityCfgRestAPI, $log, $filter, $translatePartialLoader) {
        'use strict';
        $translatePartialLoader.addPart('effective');
        $translatePartialLoader.addPart('data');
        $translatePartialLoader.addPart('main');
        $scope.translated = function (p) {
            return $filter('translate')(p.label);
        };
        person.status.squadnumber = parseInt(person.status.squadnumber);
        person.status.weight = parseInt(person.status.weight);
        person.status.height = parseInt(person.status.height);
        $scope.person = person;

        $scope.dateOption = {
            minDate: new Date(1900, 0, 1, 1, 0, 1),
            maxDate: new Date()
        };
        $scope.birthdate = moment($scope.person.birthdate).format($filter('translate')('date.format'));

        labelsAPI.getListe('countries').success(function (data) {
            $scope.countriesList = data;
            angular.forEach($scope.countriesList, function (item) {
                if ($scope.person.nationality._id === item._id) {
                    $scope.person.nationality = item;
                }
                if ($scope.person.birthcountry._id === item._id) {
                    $scope.person.birthcountry = item;
                }
            });
        });

        activityCfgRestAPI.getGenderList(moment().valueOf(), meta.season.code, meta.activity.code, meta.structure.country._id).success(function (data) {
            $scope.genders = data;
        });

            $scope.season = meta.season;
            $scope.activity = meta.activity;
            $scope.structure = meta.structure;

            var search = {
                activityId: meta.activity._id,
                countryId: meta.structure.country._id,
                listIndicators: ['positionType', 'laterality']
            };
            statAPI.getIndicatorCfg(search).success(function (data) {
                if (angular.isUndefined(data) || data === null) {
                    return;
                }
                data.forEach(function (d) {
                    $scope[d.code] = d.listValues;
                });
            });

        $scope.ok = function () {
            if (angular.isDefined($scope.dateOption.val)) {
                $scope.person.birthdate = $scope.dateOption.val;
            }
            $modalInstance.close($scope.person);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
        /**
         * @name $scope.getLocation
         * @function
         * @memberOf qaobee.prive.effectif.playersheet
         * @description Fetch address with Google API
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
//
;