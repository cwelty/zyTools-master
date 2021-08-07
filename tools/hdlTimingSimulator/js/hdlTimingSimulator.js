// Draws individual time segments for the timing line
Handlebars.registerHelper('timeSteps', function(timeRange, block) {
    var timeSteps = '';

    // Stores the left and right marker labels
    // Also sets 2nd time step to be checked
    for (var i = 0; i < timeRange; i++) {
        timeSteps += block.fn({
            timeSegment: i,
            checked: ((i === 1) ? 'checked' : '')
        });
    }
    return timeSteps;
});

// Helps iterate over the number of timing cycle labels
Handlebars.registerHelper('timeLabels', function(numberOfCycles, block) {
    var cycleNumber = '';

    // Since we have N + 1 time labels we need to iterate 1 extra time
    for (var i = 0; i < numberOfCycles + 1; i++) {
        cycleNumber += block.fn(i);
    }
    return cycleNumber;
});

function hdlTimingSimulator() {

    this.init = function(id, eventManager, options) {

        this.name = '<%= grunt.option("tool") %>';
        this.id = id;

        // Checks what language the code snippet should be in, default is verilog
        if ((options) && (options['language'] === 'vhdl')) {
            this.isVerilog = false;
            this.isVHDL = true;
        }
        else {
            this.isVerilog = true;
            this.isVHDL = false;
        }

        if (this.isVHDL) {
            // Defines all the settings for VHDL
            this.languageDefinitions = {
                'alphabet': /[^abcdnortx\s\(\))]/ig,
                'operations': [ 'or', 'and', 'nor', 'nand', 'not', 'xor', 'xnor' ]
            };
        }
        else if (this.isVerilog) {
            // Defines all the settings for Verilog
            this.languageDefinitions = {
                'alphabet': /[^abc\s\^~\|\&\(\)]|(\|\||\&\&)/ig,
                'operations': [ '|', '&', '~', '^', '^~' ]
            };
        }


        this.NUMBER_OF_CYCLES = 10;

        // Input signals should be single characters
        this.inputs = [
            {
                'signal': 'a',
                'showTimeSteps': false
            },
            {
                'signal' : 'b',
                'showTimeSteps': false
            },
            {
                'signal' : 'c',
                'showTimeSteps': true
            }
        ];

        // This tool currently supports a single output z
        this.outputs = [
            {
                'signal' : 'z',
                'showTimeSteps': true
            }
        ];

        var css = '<style><%= grunt.file.read(css_filename) %></style>';

        // To allow for cleaner handlebars files the language specific code blocks have been separated into partials
        // VHDL code block
        Handlebars.registerPartial('vhdlCodeBlock', this[this.name]['vhdlCodeTemplate']);

        // Verilog code block
        Handlebars.registerPartial('verilogCodeBlock', this[this.name]['verilogCodeTemplate']);

        var html = this[this.name]['hdlTimingSimulator']({
            id: this.id,
            inputs: this.inputs,
            outputs: this.outputs,
            numberOfCycles: this.NUMBER_OF_CYCLES,
            isVerilog: this.isVerilog,
            isVHDL: this.isVHDL
        });

        // Creates the regex to capture all valid operations
        this.operationsRegex = this.createOperatorsRegex(this.languageDefinitions.operations);

        $('#' + this.id).html(css + html);

        // Controls the posting of activity limiting it to one post
        this.eventManager = eventManager;
        this.postedActivity = false;

        var self = this;
        // Runs the combination logic simulator
        $('#' + this.id + ' .run-hdl-timing-simulator').click(function() {
            self.runCombinationalLogic();
        });

        // Loads all logic combinations
        $('#' + this.id + ' .load-all-timing-combinations').click(function() {
            self.loadInputCombinations();
        });

        // If input or logic changes, indicate the input has been changed
        $('#' + this.id + ' .timing-input-signal-container .timing-diagram-segment').change(function() {
            self.inputChanged();
        });

        $('#' + this.id + ' .hdl-combinational-logic-input').keydown(function(e) {

            // Enter key runs the code
            if (e.keyCode === 13) {
                self.runCombinationalLogic();
                return false;
            }

            // If key pressed is not a character/delete return
            if ((e.keyCode >= 9) && (e.keyCode <= 45)) {
                return;
            }

            self.inputChanged();
        });

        // To solve the Safari re-render errors
        $('#' + this.id + ' .timing-diagram-segment').change(function() {
            self.reRenderSegments();
        });
    };

    // Re-renders the line segments because some browsers fail to re-render CSS changes
    this.reRenderSegments = function() {
        $('#' + this.id + ' .timing-container').hide();
        $('#' + this.id + ' .timing-container').outerHeight();
        $('#' + this.id + ' .timing-container').show();
    };

    // Takes in a left/right operand + operation and returns a javascript friendly boolean string
    this.buildLogicString = function(leftOperand, rightOperand, operation, excessContent) {
        // Return boolean string based on the type of operator that is being converted
        switch(operation.toLowerCase()) {
            // !(L && R)
            case 'nand':
                return '(!((' + leftOperand + ') && (' + rightOperand + ')))' + excessContent;
                break;

            // (((!L && R) || (L && !R)) && !(L && R))
            case '^':
            case 'xor':
                return '(((!(' + leftOperand + ') && (' + rightOperand + ')) || ((' + leftOperand + ') && !(' + rightOperand + '))) '
                    + '&& !((' + leftOperand + ') && (' + rightOperand + '))) ' + excessContent;
                break;

            // (!L && !R)
            case 'nor':
                return '(!(' + leftOperand + ') && !(' + rightOperand + ')) ' + excessContent;
                break;

            // ((L && R) || (!L && !R))
            case '^~':
            case 'xnor':
                return '(((' + leftOperand + ') && (' + rightOperand + ')) || (!(' + leftOperand + ') && !(' + rightOperand + '))) '
                    + excessContent;
                break;

            // (L || R)
            case '|':
            case 'or':
                return '((' + leftOperand + ') || (' + rightOperand + ')) ' + excessContent;
                break;

            // (L && R)
            case '&':
            case 'and':
                return '((' + leftOperand + ') && (' + rightOperand + ')) ' + excessContent;
                break;

            // (L op R)
            default:
                return '((' + leftOperand + ') ' + operation + ' (' + rightOperand + ')) ' + excessContent;
                break;
        }
    };

    // Scans the current node for operators and converts to javascript friendly operators
    this.scanAndConvert = function(node) {

        // Clean up node spacing
        node = node.replace(/(\s)+/ig, ' ');

        // Converts AND -> && for the Verilog version of this tool
        if (this.isVerilog) {
            node = node.replace(/AND/ig, '&&');
        }

        // Regex captures operators surrounded by spaces or parens
        var operatorRegex = new RegExp('(\\s|\\)){1}(' + this.operationsRegex + '){1}(\\s|\\(){1}', 'ig');

        // Gets the first match to work with
        var capturedOperator = operatorRegex.exec(node);

        // Nothing to convert return the node
        if (!capturedOperator) {
            return node;
        }

        // Left operand
        var leftOperand = node.substring(0, capturedOperator.index + capturedOperator[1].length);

        // Store the operation that was discovered
        var operation = capturedOperator[0].trim().replace(/(\(|\))*/ig, '');

        // Contents right of operator
        var rightContent = node.substring(operatorRegex.lastIndex);

        // Reset the regex to search from the start of the string
        operatorRegex.lastIndex = 0;

        // Check right contents for operators to replace
        var operatorInRightContents = operatorRegex.exec(rightContent);

        var rightOperand = rightContent;
        var excessContent = '';

        // If an operator exists in |rightContents| we want to separate it from the operand
        if (operatorInRightContents) {
            // Separate right operand from excess contents
            rightOperand = rightContent.substring(0, operatorInRightContents.index);

            // Excess contents after the right operand has been parsed
            excessContent = rightContent.substring(operatorInRightContents.index);
        }

        // Recursively creates and return JavaScript friendly boolean string
        return this.scanAndConvert(this.buildLogicString(leftOperand, rightOperand, operation, excessContent));
    };

    // Replaces basic logic that JavaScript can handle
    this.replaceNots = function(node) {

        // Replace NOT
        if (this.isVerilog) {
            // Replace all ~ with !
            node = node.replace(/~(\s)*/ig, ' ! ');

            // Since XNOR is ^~ we want to convert this case back
            return node.replace(/\^!(\s)*/ig, ' ^~ ');
        }
        else if (this.isVHDL) {
            return node.replace(/not(\s)*/ig, ' !');
        }
    };

    // Escapes all reserves characters used in regex expressions and creates the operator search regex
    this.createOperatorsRegex = function(operations) {
        var escapedOperators = [];

        operations.forEach(function(operation) {
            escapedOperators.push(operation.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'));
        });

        return escapedOperators.join('|');
    };

    /*
        Iterates through all leaf nodes of the XML tree and merges them with immediate siblings
        e.g.)   [(a & b) | ( b ^~ c) | ~c)] - root
                  /      |        \
            (a & b)     (|)    ((b ^~ c) | ~c)
                                   /     |   \
                              (b ^~ c)  (|)  (~c) <-- Each leaf node is converted to JS friendly boolean logic
            (((b && c) || (!b && !c)) || (!C))         After converted they are merged back together and replace their parent node

        |leaves| and |leavesParents| are both jQuery objects
    */
    this.computeLeaves = function(leaves, leavesParents) {

        var self = this;
        // Solve leaves first
        leaves.each(function(leafIndex) {
            var leafContents = $(this).text();

            // Wrap leaf in parens to self contain the computed result
            leafContents = self.scanAndConvert(leafContents);

            // Create a new Node to replace the old
            var newChild = document.createElement('paren');
            newChild.innerHTML = '(' + leafContents + ')';

            var currentNode = this;
            // Look for the child and replace it
            leavesParents.each(function(parentIndex) {
                // Check to see if this is the node's parent
                try {
                    // Replace the child with the new child
                    this.replaceChild(newChild, currentNode);
                }
                // This is not the node's parent, keep searching
                catch(error) {
                }
            });
        });

        // Link sibling leaves together to be re-evaluated as a new single leaf
        for (var parentParentIndex = 0; parentParentIndex < leavesParents.length; parentParentIndex++) {
            // Fuse siblings together and attempt to replace their parent in the tree
            try {
                var flattenNode = document.createTextNode($(leavesParents[parentParentIndex]).text());
                $(leavesParents[parentParentIndex]).parent()[0].replaceChild(flattenNode, leavesParents[parentParentIndex]);
            }
            // This is not the parent of the fused children
            catch(error) {
                continue;
            }
        }
    };

    // Resets the output because an input has been changed
    this.inputChanged = function() {
        // Reset message
        $('#' + this.id + ' .timing-simulator-message-area').text('');

        var self = this;
        this.outputs.forEach(function(output) {
            $('#' + self.id + ' #timing-signal-line-' + output.signal).addClass('stale-output');
        });
    };

    // Creates different combinations of input
    this.loadInputCombinations = function() {
        var inputSize = this.inputs.length;

        // Resets output because input has been changed
        this.inputChanged();

        /*
            For a 3 input with 10 cycles version it will generate the following set of combinations
            000, 001, 010, 011, 100, 101, 110, 111, ... 111
        */
        // Used for incrementing from 000, 001, ... 111
        var decimalCount = 0;

        // Generates logic combinations equal to the |NUMBER_OF_CYCLES|
        for (var timeStep = 0; timeStep < this.NUMBER_OF_CYCLES; timeStep++) {
            // Converts decimal into binary and reverses it
            var binaryInput = decimalCount.toString(2).split('').reverse().join('');

            for (var inputSignalIndex = 0; inputSignalIndex < inputSize; inputSignalIndex++) {
                // Gets a reference to individual timing segment for one input signal
                var $inputSignalSegments = $('#' + this.id + ' #timing-signal-line-' + this.inputs[inputSignalIndex].signal).children('input');

                // Check for any removed leading zeroes
                if ((inputSize - inputSignalIndex) > binaryInput.length) {
                    $($inputSignalSegments).eq(timeStep).prop('checked', false);
                }
                // Fill remaining input signals with high signals
                else if(binaryInput.length > inputSize) {
                    $($inputSignalSegments).eq(timeStep).prop('checked', true);
                }
                else {
                    // Set the input signal to the bit value of the binary string
                    var isChecked = binaryInput.charAt(inputSize - inputSignalIndex - 1) === '1';
                    $($inputSignalSegments).eq(timeStep).prop('checked', isChecked);
                }
            }
            decimalCount++;
        }
        this.reRenderSegments();
    };

    // Initiates the combinational logic parser
    this.runCombinationalLogic = function() {
        // Gets user's input
        var userInput = $('#' + this.id + ' .hdl-combinational-logic-input').val();

        // User has invalid input
        // The regex checks if the user entered logic users only the characters a, b, c, |, &, ^, ~
        if ((this.languageDefinitions.alphabet).test(userInput)) {
            $('#' + this.id + ' .timing-simulator-message-area').text('Invalid code. Please use only inputs (a, b, c) and operators ('
                                                                     + this.languageDefinitions.operations.join(', ') + ').');
            return;
        }

        /*
            Creates a structured XML tree to feed to the parser, & is an XML reserved character so it must be replaced
            e.g.) (a & b) | (~c)
            <root>
                <paren>
                    <paren>
                        a & b
                    </paren>
                    |
                    <paren>
                        ~c
                    </paren>
                </paren>
            </root>
        */

        userInput = this.replaceNots(userInput);

        // Adds white space after all operators to avoid parsing errors
        var operationsWithNoSpace = new RegExp(this.operationsRegex, 'ig');
        userInput = userInput.replace(operationsWithNoSpace, '$& ');

        var xmlStructure = '<root><paren>' + userInput.replace(/\(/ig, '<paren>').replace(/\)/ig, '</paren>').replace(/&/ig, 'AND') + '</paren></root>';

        // Check if user's input can be parsed into an XML structure
        try {
            var xmlTree = $.parseXML(xmlStructure);
        }
        // Invalid structure possibly due to missing paren
        catch(error) {
            $('#' + this.id + ' .timing-simulator-message-area').text('Could not parse logic. Please check parentheses.');
            return;
        }

        // Used for storing all leaf nodes as the tree is being trimmed
        var leaves, leavesParents;

        /*
            Trims the tree by merging sibling leaves and taking over their parent
            If the parent of the current node is the root we want to stop merging because it is already at the bottom of the tree
            A root can be defined by the node's name being 'root' or the node's type === Node.DOCUMENT_NODE
        */
        do {
            // Find all leaves
            leaves = $(xmlTree).find(':not(:has(*))');
            // Find all parents of leaves
            leavesParents = $(xmlTree).find(':not(:has(*))').parent();
            // Convert leaves to acceptable syntax and fuse them
            this.computeLeaves(leaves, leavesParents);
        } while((leavesParents[leavesParents.length - 1].nodeType != Node.DOCUMENT_NODE) && (leavesParents[leavesParents.length - 1].nodeName != 'root'));

        // Stores the output value at each segment
        var timeSegments = this.NUMBER_OF_CYCLES;

        // Store all input segments
        var inputSignalSegments = {};
        var self = this;
        this.inputs.forEach(function(input) {
            inputSignalSegments[input.signal] = $('#' + self.id + ' #timing-signal-line-' + input.signal).children('input');
        });

        // Get a reference to output segments
        var $inputZSegments = $('#' + this.id + ' #timing-signal-line-z').children('input');

        // Iterate through all time steps for each input and compute the output for each step
        for (var timeStep = 0; timeStep < timeSegments; timeStep++) {
            var signals = {};

            this.inputs.forEach(function(input) {
                var signalId = input.signal;
                signals[signalId] = $(inputSignalSegments[signalId][timeStep]).is(':checked');
            });

            // Attempts to evaluate the combinational logic
            try {
                var evalMe = $(xmlTree.childNodes[0]).text();

                // Build input search string
                var inputsToSearch = '';
                var self = this;
                this.inputs.forEach(function(input, index) {
                    inputsToSearch += input.signal;
                    // Add | to the search string if there are more inputs
                    if (index < self.inputs.length - 1) {
                        inputsToSearch += '|';
                    }
                });

                // Use the input values stored in the input array
                var searchRegex = new RegExp(inputsToSearch, 'ig');

                evalMe = evalMe.replace(searchRegex, function(matched) {
                    return 'signals.' + matched;
                });

                // Run the combinational logic
                var result = eval(evalMe);
                $($inputZSegments[timeStep]).prop('checked', result);
            }
            // Could not be evaluated, most likely due to a missing whitespace character
            catch(error) {
                $('#' + this.id + ' .timing-simulator-message-area').text('Error parsing logic. Please check all syntax.');
                return;
            }
        }

        $('#' + this.id + ' #timing-signal-line-z').removeClass('stale-output');

        if (!this.postedActivity) {
            // Posts activity event
            var event = {
                part: 0,
                complete: true,
                answer: '',
                metadata: {
                    event: 'Ran HDL timing simulator'
                }
            };

            this.eventManager.postEvent(event);
            this.postedActivity = true;
        }
    };

    <%= grunt.file.read(hbs_output) %>
}


var hdlTimingSimulatorExport = {
    create: function() {
        return new hdlTimingSimulator();
    }
};
module.exports = hdlTimingSimulatorExport;
