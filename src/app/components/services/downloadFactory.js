(function () {
    'use strict';
    angular.module('qaobee.downloadService', ['ngFileSaver'])

        .factory('downloadSrv', function ($log, $q, $http, FileSaver) {
            function openSaveAsDialog(filename, content, mediaType) {
                var blob = new Blob([content], {type: mediaType});
                FileSaver.saveAs(blob, filename);
            }

            return {
                /**
                 * Retrieve a PDF
                 * @param url pdf url
                 * @param filename File name
                 */
                getPdf: function (url, filename) {
                    $http.get(url, {
                        responseType: 'arraybuffer',
                        headers: {
                            'Content-type': 'application/json',
                            'Accept': 'application/pdf'
                        }
                    })
                        .success(function (data, status, headers, config) {
                            $log.debug(data.length, status, headers, config);
                            openSaveAsDialog(filename, data, 'application/pdf;charset=utf-8');
                        })
                        .error(function (data, status, headers, config) {
                            $log.error(data, status, headers, config);
                        });
                }
            };
        });
})();