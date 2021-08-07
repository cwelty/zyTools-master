## CodingProgression tool

This tool is a simpler version of ProgrammingProgression and uses kubernetes.
These are the available options:
* {String} language Specifies the programming language. Ex: 'cpp', 'c', 'java', 'python2', 'python3'.
* {Array} of {Object} levels Each element in the array defines a level in the progression.
    * {String} prompt The prompt of the level. Accepts HTML tags.
    * {String} explanation The explanation of the solution in the level.
    * {String} solution The solution to the level.
    * {Object} parameters The parameters for the randomization of the level. Same use as in codeOutput and other tools. Parameter values have to be strings. The parameters can be:
        * Arrays. Ex: `randomization: [ '1', '2', '3', '4', '5' ]`.
        * Objects. Ex: `variable: { name: 'userNum', output: 'User num:' }`.
        * Strings. Ex: `output: 'Hello world!'`.
    * {Array or Object} program Each element in the array is a single file of the program. If it's an object, then only one file makes the program.
        * If |program| is an object, it contains:
            * {String} filename Optional. The name of the file. Defaults to "main.<language>"
            * {String} prefix The code before student code.
            * {String} student Optional. Code that user can edit. Defaults to a comment saying "Your code goes here"
            * {String} postfix The code after student code.
        * If |program| is an array, it contains:
            * {String} filename The name of the file.
            * {Object or String} code Contains the code of the file. Only one file can be of object type, because only 1 editable file per level is supported.
                * String: File is read only.
                * Object: The code of the file separated in `prefix`, `student` (optional, the default editable code), and `postfix`.
    * {Array} input Optional. An array of string inputs for the program, if not included, there's no input.
