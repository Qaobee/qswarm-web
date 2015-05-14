/**
 * Services REST Exercise API

 * 
 * @class qaobee.rest.prive.training.exercise.exerciseRestAPI
 * @author Mohamed EL MARZGIOUI
 * @copyright <b>QaoBee</b>.
 */
angular.module('exerciseRestAPI', []).value('exerciseAPIURL', '/rest/prive/training')

.factory('exerciseRestAPI', function($http, exerciseAPIURL) {
    return {
        /**
         * @memberOf qaobee.rest.prive.training.exercise.exerciseRestAPI
         * @function addExercise()
         * @description add a exercise 
         * @param {Exercise}
         *            exercise : exercise to add
         * @returns {Exercise}  com.qaobee.swarn.model.training.Exercise
         */
        addExercise : function(exercise) {

            return $http({
                url : exerciseAPIURL + '/exercise/add',
                method : 'PUT',
                data : exercise
            });
        },
        
        /**
         * @memberOf qaobee.rest.prive.training.exercise.exerciseRestAPI
         * @function getExercise()
         * @description get a exercise by id
         * @param {String}
         *          idExercise : id of exercise 
         * @returns {Exercise}  com.qaobee.swarn.model.training.Exercise
         */
        getExercise : function(idExercise) {
            return $http({
                url : exerciseAPIURL + '/exercise/get?_id=' + idExercise,
                method : "GET"
            });
        },
        /**
         * @memberOf qaobee.rest.prive.training.exercise.exerciseRestAPI

         * @function getListExercise()
         * @description retrieve list of exercise 
         * @param {String}
                     categoryAge : the label of category age 
         * @param {String}
         *            authorName : the name of author 
         * @returns {Array}  com.qaobee.swarn.model.training.Exercise
         */
        getListExercise : function(categoryAge, authorName,theme,subTheme,title) {


            return $http({
                url : exerciseAPIURL + '/exercise/list?categoryAge='+ categoryAge +'&name=' + authorName+'&theme=' +theme+'&subTheme=' +subTheme+'&title='+title ,
                method : "GET"
            });
        },
        /**
         * @memberOf qaobee.rest.prive.training.exercise.exerciseRestAPI
         * @function updateExercise()
         * @description update a exercise
         * @param {Exercise}
         *            exercise : exercise to update
         * @returns {Exercise}  com.qaobee.swarn.model.training.Exercise
         */
        updateExercise : function(exercise) {
            return $http({
                url : exerciseAPIURL + '/exercise/update',
                method : 'PUT',
                data : exercise
            });
        },
        /**
         * @memberOf qaobee.rest.prive.training.exercise.exerciseRestAPI
         * @function deleteExercise()
         * @description delete a exercise
         * @param {String}
         *            idExercise : id of exercise to delete
         * @returns {Object} {"status": "ok","number": number}
         */
        deleteExercise : function(idExercise) {
            return $http({
                url : exerciseAPIURL + '/exercise/delete?idExercise=' + idExercise,
                method : "DELETE"
            });
        },
    };
});