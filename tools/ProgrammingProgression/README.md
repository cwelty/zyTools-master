## ProgrammingProgression tool

This tool has a somehow complicated options structure:
* {String} language Specifies the programming language. Ex: 'cpp', 'c', 'java', 'python2', 'python3'.
* {Array} of {Objects} levels Array in which each object represents a different level:
    * {String} prompt Defines the prompt of the level. Accepts HTML tags.
    * {Object} solution Describes the solution with two attributes:
        * {String} code Contains the code that solves this problem. The solution code.
        * {Boolean} [show=false] Whether the solution should be shown in the explanation of the level.
            This behaviour is currently not supported.
    * {Object} parameters Contains each parameter.
        There's a special parameter called `programInput` that will define the input sent to the program, this is specially powerful when used in parameter groups (described below).
        The parameters can be defined in one of the following forms. Both can be found in the same level:
        * {Array} *parameter_name* Contains all the values the parameter can take (randomizes the level).
            Ex: prompt: ['3 2 1 Go!', 'Ready, Set, Go!', 'Hello world!']
        * {Array} *parameter_group* Contains {Objects} that define a group of parameters.
            Ex: operator: [ { conditionSymbol: ['<'], printIfTrue: ['less than 18'], printIfFalse: ['18 or more'] },
                { conditionSymbol: ['>'], printIfTrue: ['more than 18'], printIfFalse: ['18 or less'] } ]
    * {Array} of {Objects} files Defining each file:
        * {String} filename With the name of the file.
        * {Object} program Contains the different parts of the program. Any part not included defaults to an empty string:
            * {String} [headers=''] Contains the headers of the code (usually imports or include statements).
            * {String} [classDefinition=''] Contains the classDefinition of the code (mainly for Java).
            * {String} [main=''] Contains the main of the code ('void main () {').
            * {String} [prefix=''] Contains the prefix of the code, this is any code before the student entered code.
            * {String} [student=''] Contains the student of the code, this is where the student enters code. It's usually '<STUDENT_CODE>' or empty.
            * {String} [postfix=''] Contains the postfix of the code. All the code after the students code.
            * {String} [returnStatement=''] Contains the returnStatement of the code. The return statement of the code.
    * {Object} test Contains the parameters to test and the testing code.
        * {Object} parameters Contains the parameters that are going to be used in the testing code. These parameters will always include all the level parameters defined earlier, and overwrite any parameter defined with the same name earlier. There are some reserved parameter names:
            * {String} [testFunctionReturns='void'] Defines what will the testing functions return, it's usually 'void', but at some point we might want to return an int or a float. Defaults to 'void'.
            * {String} [testFunctionParameters=''] Defines the parameters sent to the test functions. Defaults to an empty string.
            * {String} programInput Can be defined either in the level parameters or here. If it's here it will be the same for every randomization, if it's defined in the level parameters it can be different for each parameter group.
        * {String} main Defines the testing program, can use Handlebars code. This is the code that will go pasted at the bottom of the corresponding file of 'cBoilerplate.js', 'cppBoilerplate.js' or 'javaBoilerplate.js'. There are two specially interesting functions:
            `testSolutionCode()` is a function that runs the solution code.
            `testStudentCode()` is a function that tests the students code.
            The parameter `testFunctionReturns` described above defines what will these functions return (usually void), and the parameter `testFunctionParameters` described above defines what parameters will these functions receive.
