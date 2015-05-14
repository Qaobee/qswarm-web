angular.module(
        'themeService',
        [ 'labelsAPI', 'structureCfgRestAPI', 'summarysheet', 'effectiveRestAPI', 'ngTable', 'ngTableExport', 'statWidget', 'userMetaAPI', 'staffListWidget', 'planingSessionWidget',
                'unavailableEffectiveWidget', 'palmaresEffectiveWidget', 'exerciseRestAPI', 'profileRestAPI', 'groupAPI', 'labelsAPI', 'statAPI', 'effectiveSearch', 'themeRestAPI', 'locationAPI',
                'ui.utils',  'ui.bootstrap', 'fileread' ]).config(function($routeProvider, metaDatasProvider) {
    'use strict';

}).service("themeService", function(themeRestAPI) {
    // function to remove duplicates subtheme's and theme's labels
    this.unique = function(origArr) {
  
        var newArr = [], origLen = origArr.length, found, x, y;

        for (x = 0; x < origLen; x++) {
            found = undefined;
            for (y = 0; y < newArr.length; y++) {
                if (origArr[x] === newArr[y]) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                newArr.push(origArr[x]);
            }
        }
        return newArr;
    };
   
    this.getThemes = function(activityId) {
  
        var promise = themeRestAPI.getListTheme(activityId).success(function(data) {
       });

        return promise;
    };
    this.getTheme = function(activityId) {
        
        var promise = themeRestAPI.getListTheme(activityId).success(function(data) {
       });

        return promise;
    };
});