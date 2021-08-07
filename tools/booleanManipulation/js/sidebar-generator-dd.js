/*
	Generate sidebar, the list of properties/laws html, for the normal configuration of booleanManipulation, returns |handlebarsDictionary|
*/
function generateSidebar(self) {
    var handlebarsDictionary = {
        propertyTitle: 'Properties',
        firstColumn: {
            displayUniArrow: true,
            displayBiArrow:  true,
            bidirectionalRules: [
                {
                    label:         'Distributive',
                    conditionHTML: 'ab+ac',
                    resultHTML:    'a(b+c)'
                },
                {
                    label:         'Identity',
                    conditionHTML: 'a' + SYMBOLS.AND + '1',
                    resultHTML:    'a'
                },
                {
                    label:         'Identity',
                    conditionHTML: 'a+0',
                    resultHTML:    'a'
                },
                {
                    label:         'Complement',
                    conditionHTML: 'a+a\'',
                    resultHTML:    '1'
                },
                {
                    label:         'Idempotence',
                    conditionHTML: 'a+a',
                    resultHTML:    'a'
                }
            ],
            unidirectionalRules: [
                {
                    label:         'Complement',
                    conditionHTML: 'aa\'',
                    resultHTML:    '0'
                },
                {
                    label:         'Null elements',
                    conditionHTML: 'a' + SYMBOLS.AND + '0',
                    resultHTML:    '0'
                },
                {
                    label:         'Null elements',
                    conditionHTML: 'a+1',
                    resultHTML:    '1'
                }
            ]
        }
    };
    return handlebarsDictionary;
}
