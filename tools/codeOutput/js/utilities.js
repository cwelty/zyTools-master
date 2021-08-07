'use strict';

/* exported zyFlowchartRenderTypeMap, isLanguageAZyFlowchart */

const zyFlowchartRenderTypeMap = {
    zyFlowchart: 'flowchart',
    zyPseudocode: 'pseudocode',
    zyFlowchartZyPseudocode: 'both',
};

/**
    Return whether the language is a zyFlowchart language.
    @method isLanguageAZyFlowchart
    @param {String} language The language to check.
    @return {Boolean} Whether the language is a zyFlowchart language.
*/
function isLanguageAZyFlowchart(language) {
    return Object.keys(zyFlowchartRenderTypeMap).indexOf(language) !== -1;
}
