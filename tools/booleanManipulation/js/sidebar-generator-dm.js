/*
	Generates the sidebar, the list of properties/laws html, for the given configuration, returns |handlebarsDictionary|
	basicOnly - boolean
	expandAndReduce - boolean
*/
function generateSidebarForDiscreteMath(basicOnly, expandAndReduce) {
    var handlebarsDictionary;

    var distributiveAnd = {
        label:         'Distributive',
        conditionHTML: toDiscreteMath('ab+ac'),
        resultHTML:    toDiscreteMath('a(b+c)')
    };
    var distributiveOr = {
        label:         'Distributive',
        conditionHTML: toDiscreteMath('(a+b)' + SYMBOLS.AND + '(a+c)'),
        resultHTML:    toDiscreteMath('a+bc')
    };
    var demorganAnd = {
        label:         'De Morgan',
        conditionHTML: toDiscreteMath('(ab)' + SYMBOLS.NOT),
        resultHTML:    toDiscreteMath('(a' + SYMBOLS.NOT + SYMBOLS.OR + 'b' + SYMBOLS.NOT + ')')
    };
    var demorganOr = {
        label:         'De Morgan',
        conditionHTML: toDiscreteMath('(a' + SYMBOLS.OR + 'b)' + SYMBOLS.NOT),
        resultHTML:    toDiscreteMath('(a' + SYMBOLS.NOT + 'b' + SYMBOLS.NOT + ')')
    };
    var Conditional = {
        label:         'Conditional',
        conditionHTML: toDiscreteMath('a' + DISCRETE_SYMBOLS.IMPLIES + 'b'),
        resultHTML:    toDiscreteMath('a\'+b')
    };
    var identityAnd = {
        label:         'Identity',
        conditionHTML: toDiscreteMath('a' + SYMBOLS.AND + '1'),
        resultHTML:    toDiscreteMath('a')
    };
    var identityOr = {
        label:         'Identity',
        conditionHTML: toDiscreteMath('a+0'),
        resultHTML:    toDiscreteMath('a')
    };
    var doubleNeg = {
        label:         'Double negation',
        conditionHTML: toDiscreteMath('a' + SYMBOLS.NOT + SYMBOLS.NOT),
        resultHTML:    toDiscreteMath('a')
    };
    var complementOr = {
        label:         'Complement',
        conditionHTML: toDiscreteMath('a+a\''),
        resultHTML:    toDiscreteMath('1')
    };
    var complementAnd = {
        label:         '',
        conditionHTML: toDiscreteMath('aa\''),
        resultHTML:    toDiscreteMath('0')
    };
    var complementTrue = {
        label:         '',
        conditionHTML: toDiscreteMath('1\''),
        resultHTML:    toDiscreteMath('0')
    };
    var complementFalse = {
        label:         '',
        conditionHTML: toDiscreteMath('0\''),
        resultHTML:    toDiscreteMath('1')
    };
    var idempotenceOr = {
        label:         'Idempotence',
        conditionHTML: toDiscreteMath('a+a'),
        resultHTML:    toDiscreteMath('a')
    };
    var annihilatorAnd = {
        label:         'Null elements',
        conditionHTML: toDiscreteMath('a' + SYMBOLS.AND + '0'),
        resultHTML:    toDiscreteMath('0')
    };
    var annihilatorOr = {
        label:         '',
        conditionHTML: toDiscreteMath('a+1'),
        resultHTML:    toDiscreteMath('1')
    };
    if (basicOnly) {
        handlebarsDictionary = {
            propertyTitle: 'Laws',
            firstColumn: {
                displayUniArrow: false,
                displayBiArrow:  false,
                unidirectionalRules: [
                    distributiveAnd,
                    distributiveOr,
                    demorganAnd,
                    demorganOr,
                    Conditional,
                    identityAnd,
                    identityOr,
                    doubleNeg,
                    complementOr,
                    complementAnd,
                    complementTrue,
                    complementFalse,
                    idempotenceOr,
                    annihilatorAnd,
                    annihilatorOr
                ]
            }
        };
    }
    else if (expandAndReduce) {
        handlebarsDictionary = {
            propertyTitle: 'Laws',
            firstColumn: {
                displayUniArrow: true,
                displayBiArrow:  true,
                bidirectionalRules: [
                    distributiveAnd,
                    distributiveOr
                ],
                unidirectionalRules: [
                    demorganAnd,
                    demorganOr,
                    Conditional,
                    identityAnd,
                    identityOr
                ]
            },
            secondColumn: {
                displayUniArrow: true,
                displayBiArrow:  false,
                unidirectionalRules: [
                    doubleNeg,
                    complementOr,
                    complementAnd,
                    complementTrue,
                    complementFalse,
                    idempotenceOr,
                    annihilatorAnd,
                    annihilatorOr
                ]
            }
        };
    }
    else {
        handlebarsDictionary = {
            propertyTitle: 'Laws',
            firstColumn: {
                displayUniArrow: false,
                displayBiArrow:  false,
                unidirectionalRules: [
                    distributiveAnd,
                    distributiveOr,
                    demorganAnd,
                    demorganOr,
                    Conditional,
                    identityAnd,
                    identityOr
                ]
            },
            secondColumn: {
                displayUniArrow: false,
                displayBiArrow:  false,
                unidirectionalRules: [
                    doubleNeg,
                    complementOr,
                    complementAnd,
                    complementTrue,
                    complementFalse,
                    idempotenceOr,
                    annihilatorAnd,
                    annihilatorOr
                ]
            }
        };
    }

    handlebarsDictionary.isDiscreteMath = true;

    return handlebarsDictionary;
}
