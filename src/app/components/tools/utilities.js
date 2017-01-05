/**
 * @class qaobee.tools.utilities
 * @desc Utilitaires divers
 * @author Xavier MARIN
 * @copyright <b>QaoBee</b>.
 */

/**
 * @name replaceAll
 * @function
 * @memberOf qaobee.tools.utilities
 * @description équivalent de replaceAll de Java
 * @param find  la chaîne de recherche
 * @param replace  la chaîne de remplacement
 * @returns this
 */
String.prototype.replaceAll = function (find, replace) {
    'use strict';
    var str = this;
    return str.replace(new RegExp(find, 'g'), replace);
};
Number.prototype.padLeft = function (n,str){
    return Array(n-String(this).length+1).join(str||'0')+this;
}
/*
function ensureP(txt) {
    'use strict';
    if (txt.startsWith('<p>')) {
        return txt + '</p>';
    } else {
        return txt;
    }
}
*/
/**
 * Ouvre une popup modale
 *
 * @name modalConfirm
 * @function
 * @memberOf qaobee.tools.utilities
 * @param heading message d'entête
 * @param question la question à poser
 * @param callback
 */
/*
function modalConfirm(heading, question, callback) {
    'use strict';
    angular.element('#modal-title').html(heading);
    angular.element('#modal-body').html(question);
    angular.element('#modal-ok-btn').click(function () {
        callback();
        angular.element('#myModal').modal('hide');
    });
    angular.element('#myModal').modal('show');
}*/
/**
 * Calcule le nombre d'années entre le timestamp actuel et un timestamp (antérieur)
 *
 * @name dateDiff
 * @function
 * @memberOf qaobee.tools.utilities
 * @param timestamp date passée
 * @returns nombre d'années
 * @deprecated
 */
/*
function dateDiff(timestamp) {
    'use strict';
    return Math.floor((new Date().getTime() - timestamp) / (365.25 * 24 * 3600 * 1000));
}*/