function EquationSolver() {
    this.init = function(id, eventManager, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.eventManager = eventManager;

        // A Token is an object that contains a type and a value.
        // { 'type' : 'constant',
        //   'value' : 5};
        this.leftHandSideTokens = [];
        this.rightHandSideToken = [];

        // The spanLists are an HTML representation of each expression
        this.leftHandSideSpanList = [];
        this.rightHandSideSpanList = [];

        // The CoefficentValues and ConstantValues lists keep track of all coefficents
        // and constants on both the left and right hand side of the equation.
        // They are an abstraction of the two expressions. They help the equationSolver to
        // easily compare the left expression to the right expression in order to determine
        // and compute the next step.
        this.leftCoefficentValues = [];
        this.rightCoefficentValues = [];
        this.leftConstantValues = [];
        this.rightConstantValues = [];

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['equationSolver']({ id: this.id });
        $('#' + this.id).html(css + html);

        var self = this;
        $('#begin-solving-button-' + this.id).click(function() {
            self.beginSolving();
        });
        $('#new-equation-' + this.id).click(function() {
            self.reset();
        });
        $('#user-equation-' + this.id).on('input', function() {
            $('#begin-solving-button-' + self.id).prop('disabled', false);
            $('#begin-solving-button-' + self.id).removeClass('disabled');
        });
        $('#user-equation-' + this.id).keydown(function(event) {
            if (event.keyCode == 13) {
                self.beginSolving();
            }
        });
    };

    // The beginSolving function grabs the users input then verifies that the input is Vald.
    // Valid input of the user should be an equation with #'s, +'s, -'s, x's and exactly 1 equals sign
    // This function splits the equations into left and right expressions.  It then calls determineNextStep
    // and revealCaption to display the first step.  Finally, it prompts the user to continue (via the revealCaption function)
    this.beginSolving = function() {
        var equation = $('#user-equation-' + this.id).val();
        if (!this.isValid(equation)) {
            return;
        }
        this.initWorkspace();

        var leftHandSide = equation.split('=')[0].replace(/ /g, '');
        var rightHandSide = equation.split('=')[1].replace(/ /g, '');

        if (leftHandSide === '') {
            leftHandSide = 0;
        }
        if (rightHandSide === '') {
            rightHandSide = 0;
        }

        this.leftHandSideTokens = this.tokenize(leftHandSide);
        this.rightHandSideTokens = this.tokenize(rightHandSide);

        if (this.leftHandSideTokens.length === 0) {
            this.leftHandSideTokens.push({ 'type' : 'const',
                                            'value' : 0 });
        }
        if (this.rightHandSideTokens.length === 0) {
            this.rightHandSideTokens.push({ 'type' : 'const',
                                             'value' : 0 });
        }

        this.leftHandSideSpanList = this.spanifyExpression(this.leftHandSideTokens);
        this.rightHandSideSpanList = this.spanifyExpression(this.rightHandSideTokens);
        var caption = this.determineNextStep(this.leftHandSideTokens, this.rightHandSideTokens);

        var captionTableDataCell = this.drawEquation(caption);
        this.revealCaption(captionTableDataCell, caption);
    };

    // The spanifyExpression function converts a list of token dictionaries into an HTML entity which adds classes
    // to each token based on it's type so that these tokens can be stylized to make them stand out.
    this.spanifyExpression = function(expression) {
        var expressionSpanList = [];
        for (var i = 0; i < expression.length; i++) {
            $expression = $(expression[i]);
            if ($expression.attr('type') === 'coefficent') {
                if ($expression.attr('value') === 1) {
                    continue;
                }
            }
            expressionSpanList[i] = $('<span>');
            expressionSpanList[i].addClass('token');
            expressionSpanList[i].addClass($expression.attr('type'));
            expressionSpanList[i].addClass('not-focused');
            if ($expression.attr('type') === 'constant') {
                var temp = $expression.attr('value');
                $expression.attr('value', parseFloat(temp.toFixed(3)));
                if (temp !== $expression.attr('value')) {
                    expressionSpanList[i].html($expression.attr('value') + ' (rounded to 3 places)');
                } else {
                    expressionSpanList[i].html($expression.attr('value'));
                }
            } else {
                expressionSpanList[i].html($expression.attr('value'));
            }
        }
        return expressionSpanList;
    };

    this.checkIfRounded = function(number) {
    };

    // This function calls countTerms to split the equation into left/right coefficent/constant lists then uses those lists to determine the next step.
    // It returns a tuple with the action string and the captionContents.  The action string is used by the evaluate function to determine how to manipulate the
    // equation.  The caption span is an HTML representation of the caption which is later used by revealCaption to draw the caption.
    this.determineNextStep = function() {
        var leftCountedValues = this.countTerms(this.leftHandSideTokens);
        var rightCountedValues = this.countTerms(this.rightHandSideTokens);

        this.leftCoefficentValues = leftCountedValues[0];
        this.rightCoefficentValues = rightCountedValues[0];
        this.leftConstantValues = leftCountedValues[1];
        this.rightConstantValues = rightCountedValues[1];

        var action = '';
        var captionContents = '';

        // a, b, c and d are real #'s
        // Step 1: Simplify by combining all x terms
        // Step 2: Simplify by combining all constants
        // Step 3: if (a = bx)
        //             Swap sides
        //         else if (bx + a = cx + d || bx = cx || bx = cx + d || bx + a = cx)
        //             Move x term left
        // Step 4: if (bx + c = d)
        //            Move const term right
        // Step 5: if (bx = a)
        //             Divide by b
        // Done
        if (this.leftCoefficentValues.length === 0 && this.rightCoefficentValues.length === 0) {
            if (this.compareSumOfLists(this.leftConstantValues, this.rightConstantValues)) {
                action = 'no-action';
                captionContents = '<span>All <span class="x">x\'s</span> eliminated.  No single solution for <span class="x">x</span>.</span>';
            } else {
                action = 'no-action';
                captionContents = '<span>All <span class="x">x\'s</span> eliminated.  No solution for <span class="x">x</span>.</span>';
            }
        } else if ((this.leftCoefficentValues.length > 1) && (this.rightCoefficentValues.length > 1)) {
            action = 'combine-xterms';
            captionContents = '<span>Simplify: Combine <span class="x">x-terms</span> on both sides... </span>';
        } else if ((this.leftConstantValues.length > 1) && (this.rightConstantValues.length > 1)) {
            action = 'combine-constants';
            captionContents = '<span>Simplify: Combine <span class="constant">constants</span> on both sides ...</span>';
        } else if ((this.leftCoefficentValues.length > 1) || (this.rightCoefficentValues.length > 1)) {
            action = 'combine-xterms';
            captionContents = '<span>Simplify: Combine <span class="x">x-terms</span> ...</span>';
        } else if ((this.leftConstantValues.length > 1) || (this.rightConstantValues.length > 1)) {
            action = 'combine-constants';
            captionContents = '<span>Simplify: Combine <span class="constant">constants</span> ...</span>';
        } else if ((this.leftConstantValues.length === 1) && (this.rightCoefficentValues.length === 1)
                    && (this.leftCoefficentValues.length === 0) && (this.rightConstantValues.length === 0)) {
            if (this.rightCoefficentValues[0] === 0) {
                if (this.leftConstantValues[0] === 0) {
                    action = 'no-action';
                    captionContents = '<span>Divide by 0 is undefined. No single solution for <span class="x">x</span>.</span>';
                } else {
                    action = 'no-action';
                    captionContents = '<span>Divide by 0 is undefined. No solution for <span class="x">x</span>.</span>';
                }
            } else {
                action = 'swap';
                captionContents = '<span>Swap sides ...</span>';
            }

        } else if (this.rightCoefficentValues.length === 1) {
            if (this.rightCoefficentValues[0] === 1) {
                action = 'move-x';
                captionContents = '<span>Subtract <span class="x">x</span> from both sides ...</span>';
            } else {
                action = 'move-x';
                captionContents = '<span>Subtract <span class="x">' + this.rightCoefficentValues[0] + 'x</span> from both sides ...</span>';
            }
        } else if (this.leftConstantValues.length === 1) {
            action = 'move-constant';
            captionContents = '<span>Subtract <span class="constant">' + this.leftConstantValues[0] + '</span> from both sides ...</span>';
        } else if (this.leftCoefficentValues[0] !== 1) {
            if (this.leftCoefficentValues[0] === 0) {
                if (this.rightConstantValues[0] === 0) {
                    action = 'no-action';
                    captionContents = '<span>Divide by 0 is undefined. No single solution for <span class="x">x</span>.</span>';
                } else {
                    action = 'no-action';
                    captionContents = '<span>Divide by 0 is undefined. No solution for <span class="x">x</span>.</span>';
                }
            } else {
                action = 'divide';
                captionContents = '<span>Divide both sides by <span class="x">' + this.leftCoefficentValues[0] + '</span> ...</span>';
            }
        } else {
            action = 'done';
            captionContents = '';
        }

        return [ action, captionContents ];
    };

    // The compareSumOfLists function takes two lists of integers, sums up the two lists, then returns a string that describes whether the sums are equal
    // This function is used by the determineNextStep function.  It is needed in the case where there is exactly one x term on the left
    // and one on the right and the coefficents of the x terms are equal.  In this case, the sume of the constants are also equal the
    // equation is True, otherwise the equation is false.
    this.compareSumOfLists = function(list1, list2) {
        sum1 = this.sumOfListValues(list1);
        sum2 = this.sumOfListValues(list2);
        return (sum1 === sum2);
    };

    // The countTerms takes in a list of token dictionaries and extracts all of the coefficent values from that list as well as all of the constant values
    // from that list and places them into two seperate lists, coefficentValues and constantValues.  This abstraction of the data allows other functions
    // to easily determine how many constants and coefficents are in an expression, as well as sum up all of the values, or compare two expression to each
    // other.
    this.countTerms = function(expression) {
        var coefficentValues = [];
        var constantValues = [];
        for (var i = 0; i < expression.length; i++) {
            if (expression[i].type === 'x') {
                if (i > 0) {
                    if (expression[i - 1].type === 'minus') {
                        coefficentValues.push(-1);
                    } else if (expression[i - 1].type != 'coefficent') {
                        coefficentValues.push(1);
                    } else {
                        coefficentValues.push(parseFloat(expression[i - 1].value));
                    }
                } else {
                    coefficentValues.push(1);
                }
            } else if (expression[i].type === 'constant') {
                constantValues.push(parseFloat(expression[i].value));
            }
        }
        return [ coefficentValues, constantValues ];
    };

    // The drawEquation function accepts a caption object.  The caption is a tuple that contains an action string (caption[0]) and an captionContents (caption[1]).
    //
    // The action string dictates what action needs to be done to the equation in the next step.  When the equation is complete the action
    // string will be either, true false or done.  If the equation is not complete this function draws a "Show next step" button.  If the equation
    // is complete the "Show next step button" does not need to be drawn.
    //
    // The captionContents is an HTML represenation of the caption.  This function does not use this variable unless the action string is true or false.
    this.drawEquation = function(caption) {
        var nextStepTableRow = $('<tr>');
        var captionLineTableRow = $('<tr>');
        captionLineTableRow.append($('<td>'));
        captionLineTableRow.append($('<td>'));
        captionLineTableRow.append($('<td>'));
        captionLineTableRow.append($('<td>'));
        $('#workspacebody-' + this.id).append(nextStepTableRow);
        $('#workspacebody-' + this.id).append(captionLineTableRow);
        var leftHandSideTableDataCell = $('<td class="expression" >');
        var rightHandSideTableDataCell = $('<td class="expression">');
        var equalTableDataCell = $('<td class="equal">');
        var captionTableDataCell = $('<td class="caption">');

        leftHandSideTableDataCell.html(this.leftHandSideSpanList);
        rightHandSideTableDataCell.html(this.rightHandSideSpanList);
        equalTableDataCell.html('=');

        if (caption[0] != 'no-action') {
            captionTableDataCell.html('<button class="button">Show next step</button>');
            captionTableDataCell.addClass('padded');
            var self = this;
            captionTableDataCell.click(function() {
                self.revealCaption(captionTableDataCell, caption);
            });
        } else {
            captionTableDataCell.html(caption[1]);
            var event = {
                part: 0,
                complete: true,
                metadata: {
                    event: 'Equation Solver done'
                }
            };
            this.eventManager.postEvent(event);
        }

        nextStepTableRow.append(leftHandSideTableDataCell);
        nextStepTableRow.append(equalTableDataCell);
        nextStepTableRow.append(rightHandSideTableDataCell);
        if (caption[0] != 'done') {
            captionLineTableRow.append(captionTableDataCell);
        } else {
            var event = {
                part: 0,
                complete: true,
                metadata: {
                    event: 'Equation Solver done'
                }
            };
            this.eventManager.postEvent(event);
        }

        return captionTableDataCell;
    };

    // The evaluate function expects a string 'action' then calls the appropriate function to manipluate
    // the expression based on the action it was told.
    this.evaluate = function(action) {
        switch (action) {
            case 'combine-xterms':
                this.leftCoefficentValues = [ this.combineTerms(this.leftCoefficentValues) ];
                this.rightCoefficentValues = [ this.combineTerms(this.rightCoefficentValues) ];
                break;
            case 'combine-constants':
                this.leftConstantValues = [ this.combineTerms(this.leftConstantValues) ];
                this.rightConstantValues = [ this.combineTerms(this.rightConstantValues) ];
                break;
            case 'swap':
                this.swap();
                break;
            case 'move-x' :
                this.leftCoefficentValues = [ this.moveTerms(this.leftCoefficentValues[0], this.rightCoefficentValues[0]) ];
                this.rightCoefficentValues = [];
                break;
            case 'move-constant' :
                this.rightConstantValues = [ this.moveTerms(this.rightConstantValues[0], this.leftConstantValues[0]) ];
                this.leftConstantValues = [];
                break;
            case 'divide':
                this.divide();
                break;
            case 'done':
                break;
        }
    };

    // The combineTerms function "combines" all terms in a list by summing them together
    this.combineTerms = function(list) {
        var sum = 0;
        list.forEach(function(element, index) {
            sum += element;
        });

        return sum;
    };

    // The swap function turns a = bx into bx = a
    this.swap = function() {
        this.leftCoefficentValues = [ this.rightCoefficentValues[0] ];
        this.rightConstantValues = [ this.leftConstantValues[0] ];
        this.rightCoefficentValues = [];
        this.leftConstantValues = [];
    };

    // the moveTerm function is called when moving a term from one side of an equation to the
    // other.  It assumes there is exactly 1 of the type of term on each side, termA and termB
    // and it tries to move termB to termA's side by subtracting b from a.
    this.moveTerms = function(termA, termB) {
        if (termA === undefined) {
            termA = 0;
        }
        return termA - termB;
    };

    // The divide function assumes the equation is in the form ax = b and transforms the
    // equation into x = b/a
    this.divide = function() {
        this.rightConstantValues[0] /= this.leftCoefficentValues[0];
    //    var temp = this.rightConstantValues[0];
    //    this.rightConstantValues[0] = parseFloat(this.rightConstantValues[0].toFixed(3));
    //    if (temp !== this.rightConstantValues[0]) {
    //    }
        this.leftCoefficentValues[0] = [ 1 ];
    };

    // The sumOfListValues function accepts a list of floats.  It then returns the sum of all of the values in the list.
    this.sumOfListValues = function(list) {
        var total = 0;
        for (i = 0; i < list.length; i++) {
            total += parseInt(list[i]);
        }
        return total;
    };

    // The reassembleEquation function is called after the evaluate function has manipulated the equation.  It repopulates
    // the list of token dictionaries with the remaining coefficent and constant values and adds x, -, and + tokens where
    // appropriate.
    this.reassembleEquation = function() {
        this.leftHandSideTokens = [];
        this.rightHandSideTokens = [];
        this.leftHandSideTokens = this.assembleCoefficents(this.leftCoefficentValues, this.leftHandSideTokens);
        this.rightHandSideTokens = this.assembleCoefficents(this.rightCoefficentValues, this.rightHandSideTokens);
        this.leftHandSideTokens = this.assembleConstants(this.leftConstantValues, this.leftHandSideTokens);
        this.rightHandSideTokens = this.assembleConstants(this.rightConstantValues, this.rightHandSideTokens);
    };

    // The assembleConstants function is called by the resassembleEquation function.  The constants variable is a list
    // of floats.  The tokens variable is a list of token dictionaries.  This function makes new token dictionaries using
    // the information from the constants list and pushes these new tokens on to the end of the tokens list.
    this.assembleConstants = function(constants, tokens) {
        for (var i = 0; i < constants.length; i++) {
            if (constants[i] === 0) {
                continue;
            }
            if (tokens.length >= 1 && constants[i] >= 0) {
                tokens.push({ 'type' : 'plus',
                                       'value' : '+' });
            }
            tokens.push({ 'type' : 'constant',
                          'value': constants[i] });
        }
        if (tokens.length === 0) {
            tokens.push({ 'type' : 'constant',
                          'value': 0 });

        }
        return tokens;
    };

    // The assembleCoefficents function is called by the reassembleEquation function.  The coefficents variable is a list of
    // floats.  The tokens varaible is a list of token dictionaries.  This function makes new token dictionaries using the
    // coefficent list.  If the value of the coefficent is anything other than 1, then two tokens must be created, a coefficent
    // token and an x token.  If the coefficent value is 1 then only an x token needs to be created.  This function also keeps track
    // of when plus tokens need to be added.  All of the new tokens created by this function get pushed to the end of the tokens list.
    this.assembleCoefficents = function(coefficents, tokens) {
        for (var i = 0; i < coefficents.length; i++) {
            if (tokens.length >= 1 && coefficents[i] >= 0) {
                tokens.push({ 'type' : 'plus',
                                    'value' : '+' });
            }
            if (parseInt(coefficents[i]) === 1) {
                tokens.push({ 'type' : 'x',
                                    'value' : 'x' });
            } else if (parseInt(coefficents[i]) === -1) {
                tokens.push({ 'type' : 'minus',
                                    'value' : '-' });
                tokens.push({ 'type' : 'x',
                                    'value' : 'x' });
            } else if (parseInt(coefficents[i]) === 0) {
                continue;
            } else {
                tokens.push({ 'type' : 'coefficent',
                                    'value' : coefficents[i] });
                tokens.push({ 'type' : 'x',
                                    'value' : 'x' });
            }
        }
        return tokens;
    };

    // The revealCaption button is called when the user presses the "Show next step" button.  That button is replaced by the caption
    // for the next step.  This function also adds a new row with a "Do step" button which prompts the user to contine.
    this.revealCaption = function(captionTableDataCell, caption) {
        $captionTableDataCell = $(captionTableDataCell);
        $captionTableDataCell.off();
        var $newLine = $('<tr>');
        $('#workspacebody-' + this.id).append($newLine);

        var $newNext = $('<td class="caption" colspan="5">');
        $newNext.html('<button class="button do-step">Do step</button>');
        var self = this;
        $newNext.click(function() {
            $(this).remove();
            self.evaluate(caption[0]);
            self.reassembleEquation();
            self.leftHandSideSpanList = self.spanifyExpression(self.leftHandSideTokens);
            self.rightHandSideSpanList = self.spanifyExpression(self.rightHandSideTokens);
            self.drawEquation(self.determineNextStep());
        });
        if (caption[0] != 'done' && caption[0] != 'no-action') {
            $newLine.append($newNext);
        }
        $($captionTableDataCell.children().get(0)).html(caption[1]);
        $($captionTableDataCell.children().get(0)).removeClass('button');
        $($captionTableDataCell.children().get(0)).addClass('caption');
    };

    // The tokenize parses an "expression" which is passed in as a string and creates a list of tokens which are represented
    // as dictionaries that contain a type and a value.
    this.tokenize = function(expression) {
        var tokens = [];
        expression = expression.toString();
        // /-?[0-9]+|\+|x|-/g matches all numbers (which may or may not be preceeded with a '-',
        // as well as all -'s that are not followed by a number and +'s and x's
        expression = expression.match(/-?[0-9]+|\+|x|-/g);
        for (var i = 0; i < expression.length; i++) {
            var token = { 'type': '',
                          'value': '' };
            switch (expression[i]) {
                case 'x':
                    token.type = 'x';
                    token.value = 'x';
                    if (i > 0) {
                        if (tokens[tokens.length - 1].type === 'constant') {
                            tokens[tokens.length - 1].type = 'coefficent';
                        }
                    }
                    break;

                case '+':
                    if (tokens.length > 0) {
                        if (tokens[tokens.length - 1].type === 'plus' || tokens[tokens.length - 1].type === 'minus') {
                            continue;
                        } else {

                            token.type = 'plus';
                            token.value = '+';
                        }
                    } else {
                        token.type = 'plus';
                        token.value = '+';
                    }
                    break;
                case '-':
                    if (tokens.length > 0) {
                        if (tokens[tokens.length - 1].type === 'plus') {
                            tokens.pop();
                            token.type = 'minus';
                            token.value = '-';
                        } else if (tokens[tokens.length - 1].type === 'minus') {
                            tokens.pop();
                            token.type = 'plus';
                            token.value = '+';
                        } else {
                            token.type = 'minus';
                            token.value = '-';
                        }
                    } else {
                        token.type = 'minus';
                        token.value = '-';
                    }
                    break;
                default:
                    if (tokens.length > 0) {
                        if (expression[i] < 0) {
                            if (tokens[tokens.length - 1].type === 'minus') {
                                tokens[tokens.length - 1].type = 'plus';
                                tokens[tokens.length - 1].value = '+';
                                token.type = 'constant';
                                token.value = -parseFloat(expression[i]);
                            } else {
                                token.type = 'constant';
                                token.value = parseFloat(expression[i]);
                            }
                        } else {
                            token.type = 'constant';
                            token.value = parseFloat(expression[i]);
                        }
                    } else {
                        token.type = 'constant';
                        token.value = parseFloat(expression[i]);
                    }
            }
            tokens.push(token);
        }
        return tokens;
    };

    // The reset function clears the table, reenables and selects the input box and redraws the begin solving button
    this.reset = function() {
        $('#new-equation-' + this.id).hide();
        this.clearTable();
        var beginSolvingButton = $('<tr>');
        beginSolvingButton.html('<td> <button id="begin-solving-button-' + this.id + '" class="button">Begin solving</button></td>');
        $('#workspacebody-' + this.id).append(beginSolvingButton);
        $userEquation = $('#user-equation-' + this.id);
        $userEquation.prop('disabled', false);
        $userEquation.select();
        $userEquation.removeClass('disabled');
        var self = this;
        beginSolvingButton.click(function() {
            $('.error-container').hide();
            self.beginSolving();
        });

    };

    // The clear table function is called by the reset function.
    this.clearTable = function() {
        $('#workspacebody-' + this.id + ' tr').remove();
    };

    // The initWorkspace function removes the begin solving button, disables the input field and
    // makes the new equation (reset) button visible.
    this.initWorkspace = function() {
        $('#user-equation-' + this.id).prop('disabled', true);
        $('#user-equation-' + this.id).addClass('disabled');
        $('#new-equation-' + this.id).show();
        this.clearTable();
    };

    this.handleError = function(error) {
        $errorContainer = $('#' + this.id + ' .error-container');
        $errorContainer.html(error);
        $errorContainer.show();
        $('#begin-solving-button-' + this.id).prop('disabled', true);
        $('#begin-solving-button-' + this.id).addClass('disabled');
    };

    // The isValid function verifies that the input string is a valid equation
    this.isValid = function(equation) {
        // Remove all spaces from equation
        equation = equation.replace(/\s+/g, '');

        // Check length
        if (equation.length > 25) {
            this.reset();
            var error = 'Equation can not exceed 25 characters<br><br>';
            this.handleError();
            this.handleError(error);
            return false;
        }

        // Check for space between numbers
        if ((/[0-9] +[0-9]/).test(equation)) {
            this.reset();
            var error = 'Are you missing an operator?<br><br>';
            this.handleError(error);
            return false;
        }
        // Check for x followed by a number with no operators
        if ((/x ?[0-9]/).test(equation)) {
            var error = 'You must place an operator between x and any numbers following x<br><br>';
            this.reset();
            this.handleError(error);
            return false;
        }

        // Check for 2 back to back x's
        if ((/x ?x/).test(equation)) {
            var error = 'Are you missing an operator?<br><br>';
            this.reset();
            this.handleError(error);
            return false;
        }

        // Check for one and only one equals sign
        if (equation.indexOf('=') < 0) {
            var error = 'An equation can only have one =<br><br>';
            this.reset();
            this.handleError(error);
            return false;
        }
        if (equation.split('=').length > 2) {
            var error = 'An equation only has one =<br><br>';
            this.reset();
            this.handleError(error);
            return false;
        }

        // Check for at least one x
        if (equation.indexOf('x') < 0) {
            var error = 'An equation must contain at least one x variable.<br><br>';
            this.reset();
            this.handleError(error);
            return false;
        }

        // Check that all characters are valid
        // /[0-9]|x|\=|\+|-| /  => extracts all #'s, x's, +'s, -'s and spaces from checkString
        var checkString = equation.split(/[0-9]|x|\=|\+|-| /);
        for (var i = 0; i < checkString.length; i++) {
            if (checkString[i] !== '') {
                var error = checkString[i] + ' is not supported by this tool<br>';
                this.reset();
                this.handleError(error);
                return false;
            }
        }

        // Check for minus at end of expression
        var leftExpression = equation.split('=')[0];
        var rightExpression = equation.split('=')[1];
        if ((leftExpression[leftExpression.length - 1] == '-') ||
            (rightExpression[rightExpression.length - 1]) == '-' ||
            (leftExpression[leftExpression.length - 1] == '+') ||
            (rightExpression[rightExpression.length - 1]) == '+') {
            var error = 'Expressions can not end with an operator';
            this.reset();
            this.handleError(error);
            return false;
        }
        return true;
    };

    <%= grunt.file.read(hbs_output) %>
}

var equationSolverExport = {
    create: function() {
        return new EquationSolver();
    }
};
module.exports = equationSolverExport;
