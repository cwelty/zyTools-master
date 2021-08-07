## Pseudocode programming progression

Progression of randomly generated programming problems where the students have to write part of a program in pseudocode.

Options:
* {Boolean} exam Whether to load as an exam. Default is false, to load as a CA.
* {Array} levels Array of {Object}. Each {Object} defines a level and contains:
    * {Object} parameters Dictionary of parameter name and values. Values can be an {Array}, of which one element is chosen. Each element in the {Array} can be another dictionary.
    * {String} prompt The question prompt.
    * {Object} [code={}] The code in this file. Contains:
        * {String} [pre=''] Code before the placeholder.
        * {String} [placeholder='\n// Your solution goes here\n'] The code editable by the student.
        * {String} [post=''] Code after the placeholder.
    * {String} solution The solution to the "placeholder" portion of the code.
    * {Array} [inputs=['']] Array of {String}. Each input string is used to test the user's code.
        * Optionally, Array of {Object} in which each item contains:
        * {String} input To test user's code.
        * {Integer} points Number of points the input test is worth.
    * {String} explanation The explanation to this level.