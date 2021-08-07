## Web programming progression

Progression of randomly generated programming problems where the students have to write part of a program.

Options:
* {Array} levels List of {Object}. Each {Object} defines a level and contains:
    * {Object} parameters Dictionary of parameter name and values. Values can be an {Array}, of which one element is chosen. Each element in the {Array} can be another dictionary.
    * {String} prompt The question prompt.
    * {Array} files List of {Object}. Each {Object} defines a file and contains:
        * {String} language The language of this file.
        * {String} filename The name of this file.
        * {Boolean} [isHidden=false] Whether the file should be hidden.
        * {Object} code The code in this file. Contains:
            * {String} [prefix=''] Code before the placeholder.
            * {String} [placeholder=''] The code editable by the student.
            * {String} [postfix=''] Code after the placeholder.
    * {String} solution The solution to the "placeholder" portion of the code.
    * {String} or {Array} of {String} unitTests The unit tests to run against the student's code.
* {Boolean} [doNotShowWebpage=false] Whether to show the user and expected webpages.