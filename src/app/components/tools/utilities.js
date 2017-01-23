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
};