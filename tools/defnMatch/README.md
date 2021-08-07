## Definition match

Definition match tool has 1 option 'terms' that contains a list of object pairs: 'term', 'definition', and the optional 'explanation'. Each pair should map to a string.
Options not needed.
There are default options set: see below.
|terms| gets converted by the tool into two global variables |this.terms| and |this.definitions|.

Definition match supports adding dummy terms or definitions by putting the JavaScript keyword undefined mapped from either 'term' or 'definition', e.g. 'term' : undefined.

Example with just terms and definitions:
```javascript
{ 
    'terms': [
        { "term": "Compiler",
          "definition": "Translates a high-level language program into low-level machine instructions.",
        },
        { "term": "Application",
          "definition": "Another word for program."
        }
    ]
}
```

Example using 1 explanation:
```javascript
{ 
    'terms': [
        { "term": "Compiler",
          "definition": "Translates a high-level language program into low-level machine instructions.",
          "explanation": "Compiler's typically optimize code performance."
        },
        { "term": "Application",
          "definition": "Another word for program."
        }
    ]
}
```

Default values of |this.terms| and |this.definitions|: 

        this.terms = [
            {
                i: '0',
               term: 'Machine instruction'
            },
            {
                i: '1',
                term: 'Assembly language'
            },
            {
                i: '2',
                term: 'Compiler'
            },
            {
                i: '3',
                term: 'Application'
            },
        ]
        
        this.definitions = [
            {
                defn: 'A series of 0s and 1s, stored in memory, that tells a processor to carry out a particular operation line a multiplication.',
                explanation: 'undefined',
                hasExplanation: false,
                i: '0',
                isDummey: '0',
                showInstruction: true
            },
            {
                defn: 'Human-readable processor instructions; an assembler translates to machine instructions (0s and 1s).',
                explanation: 'undefined',
                hasExplanation: false,
                i: '1',
                isDummey: '0',
                showInstruction: false
            },
            {
                defn: 'Translates a high-level language program into low-level machine instructions.',
                explanation: 'undefined',
                hasExplanation: false,
                i: '2',
                isDummey: '0',
                showInstruction: false
            },
            {
                defn: 'Another word for a program.',
                explanation: 'undefined',
                hasExplanation: false,
                i: '3',
                isDummey: '0',
                showInstruction: false
            },
            
        ]