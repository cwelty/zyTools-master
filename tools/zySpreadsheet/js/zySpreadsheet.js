/*
    Generates a row of cell properties
    Expected parameters:
    |rowIndex| (int): Current row index for determining cell row position
    |numberOfColumns| (int): Total number of columns in a row to help determine column label and cell position.
*/
Handlebars.registerHelper('generateRowCellProperties', function(rowIndex, numberOfColumns, block) {
    var cellProperties = '';
    var charCodeForA = 'A'.charCodeAt(0);
    var label = '-';

    if (rowIndex !== 0) {
        label = rowIndex;
    }

    cellProperties += block.fn({
        columnLabel: label,
        cellPosition: label + String(rowIndex)
    });

    for (var i = 1; i < numberOfColumns; i++) {
        label = String.fromCharCode(charCodeForA + i - 1);

        cellProperties += block.fn({
            columnLabel: (rowIndex === 0) ? label : null,
            cellPosition: label + String(rowIndex)
        });
    }

    return cellProperties;
});

function zySpreadsheet() {

    this.init = function(id, eventManager, options) {

        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.eventManager = eventManager;
        this.utilities = require('utilities');
        this.submitted = false;
        this.isProgression = false;
        this.toolDOMId = '#' + this.id;

        // Stores spreadsheet data
        this.data = {};
        this.nonComputedData = {};
        this.savedData = {};
        this.lockedCells = [];
        this.numberOfRows = 10;
        this.numberOfColumns = 6;
        this.selectedCell;
        this.isKeyCaptureEnabled = false;

        // Options can set number of rows/columns and preset any cell's contents
        if (options) {
            // Option sets row dimension of spreadsheet
            if ('rows' in options) this.numberOfRows = parseInt(options['rows']);

            // Option sets column dimension of spreadsheet
            if ('columns' in options) this.numberOfColumns = parseInt(options['columns']);

            // Stores the prefilled values for indicated cells
            if ('prefill' in options) {
                for (var cell in options['prefill']) {
                    var cellPosition = cell.toUpperCase();
                    this.data[cellPosition] = this.nonComputedData[cellPosition] = options['prefill'][cell];
                }
            }

            // Stores locked cells
            if ('locked' in options) {
                this.lockedCells = options['locked'];
            }

            // Option sets mode of the tool
            if ('useProgression' in options) {
                this.isProgression = JSON.parse(options['useProgression']);
            }
        }

        var self = this;

        // Create HTML/CSS for tool
        var toolTemplate = this[this.name]['baseTemplate']({
            isProgression: this.isProgression
        });
        var css = '<style><%= grunt.file.read(css_filename) %></style>';

        // Initialize progression tool if |isProgression| is true
        if (this.isProgression) {
            this.expectedAnswer = '';
            this.answerProperties = {};

            this.progressionTool = require('progressionTool').create();

            this.progressionTool.init(this.id, this.eventManager, {
                html: toolTemplate,
                css: css,
                numToWin: 5,
                useMultipleParts: true,

                start: function() {
                    self.makeLevel(0);
                    self.setSheetEnabled(true);
                },

                reset: function() {
                    self.clearSheet();
                    self.$instructions.html('');
                    self.setSheetEnabled(false);
                },

                next: function(currentQuestion) {
                    self.makeLevel(currentQuestion);
                },

                isCorrect: function() {
                    self.setSheetEnabled(false);

                    // First test: Checks if the default values pass
                    var test1Results = self.checkAnswers();

                    // Second test: Generate new random values to check for correctness
                    var test2Results = self.testAnswers();

                    if (test1Results.passed && test2Results.passed) {
                        return {
                            explanationMessage: 'Correct',
                            userAnswer: '',
                            expectedAnswer: '',
                            isCorrect: true
                        };
                    }
                    else {
                        return {
                            explanationMessage: test2Results.explanation,
                            userAnswer: '',
                            expectedAnswer: '',
                            isCorrect: false
                        };
                    }
                }
            });
            this.$instructions = $(this.toolDOMId + ' .instructions');
        }
        // Renders a non-progression version
        else {
            $(this.toolDOMId).html(css + toolTemplate);
        }

        // Draws sheet inside template
        this.drawSheet(this.numberOfRows, this.numberOfColumns);

        // Disable sheet before start is clicked
        if (this.isProgression) {
            this.setSheetEnabled(false);
        }

        // Fills cells with prefilled contents
        this.fillCellsAndCompute();

        // Locks appropriate cells
        this.lockCells();

        // If equation-field is focused convert cell to show |nonComputedData|
        $(this.toolDOMId).on('focus', '.cell-contents-bar .equation-field', function() {
            var cellPosition = self.selectedCell.attr('cellPosition');
            $(self.selectedCell).prop('disabled', false);
            $(self.selectedCell).val(self.nonComputedData[cellPosition]);
        });

        // If equation-field is blurred revert to showing computed contents
        $(this.toolDOMId).on('blur', '.cell-contents-bar .equation-field', function() {
            // Blur cell contents to fire all computations
            if (!$(self.selectedCell).attr('disabled')) {
                $(self.selectedCell).blur();
            }

            // Re-enable global key listeners
            self.setKeyCaptureEnabled(true);
        });

        $(this.toolDOMId).on('keydown', '.cell-contents-bar .equation-field', function(event) {
            // If enter/tab is pressed select next appropriate cell
            if (event.keyCode === self.utilities.TAB_KEY || event.keyCode === self.utilities.ENTER_KEY) {

                $(self.selectedCell).blur();
                $(self.selectedCell).prop('disabled', true);

                // Select cell to the right if tab is pressed, else select next cell down
                (event.keyCode === self.utilities.TAB_KEY) ? self.selectNeighborCell('right') : self.selectNextCell();

                this.blur();
                return false;
            }
        });

        // Links equation-field with cell-contents
        $(this.toolDOMId).on('keyup', '.cell-contents-bar .equation-field', function() {
            // Link two text fields
            self.selectedCell.val(this.value);
        });

        // Clicking on selected cell enters editable mode
        $(this.toolDOMId).on('click', '.spreadsheet:not(.disabled-sheet) td:has(input.cells.focused[disabled]:not(.locked))', function() {
            self.enableInputCell();
            self.setKeyCaptureEnabled(false);
        });

        // Enables/disables global listeners if the tool is in focus
        $(this.toolDOMId).on('click', function(event) {
            var $currentTarget = $(event.target);

            if ($currentTarget.is('.spreadsheet:not(.disabled-sheet) input.cells:not(.focused)')) {
                // Removes focus from preselected cell
                $(self.toolDOMId + ' .focused').removeClass('focused');
                self.focusAndHighlight($currentTarget);
            }

            // To avoid calling duplicate listeners
            if (!self.isKeyCaptureEnabled && $currentTarget.is(self.toolDOMId + ' input.cells.focused.disabled')) {
                self.setKeyCaptureEnabled(true);

                // Checks if click takes tool out of focus
                $('body').on('click', function(event) {
                    // Click is inside tool
                    if ($(event.target).is(self.toolDOMId + ' , ' + self.toolDOMId + ' *')) {
                        // Equation-field clicked ignore click
                        if ($(event.target).is(self.toolDOMId + ' .equation-field')) {
                            self.setKeyCaptureEnabled(false);
                        }
                    }
                    // Disable keydown listener because click is outside tool
                    else {
                        // Clears out selections and highlighting
                        self.clearAllHighlights();

                        // Disables global listener
                        self.setKeyCaptureEnabled(false);
                    }
                });
            }
        });

        // Restores equation into cell
        $(this.toolDOMId).on('focus', '.spreadsheet:not(.disabled-sheet) input.cells', function() {
            var cellPosition = this.getAttribute('cellposition');

            this.value = self.nonComputedData[cellPosition] ? self.nonComputedData[cellPosition] : '';

            if (!self.submitted && !self.isProgression) {
                var event = {
                    part: 0,
                    complete: true,
                    answer: '',
                    metadata: {
                        event: 'Spreadsheet used'
                    }
                };

                self.eventManager.postEvent(event);
                self.submitted = true;
            }
        });

        // Computes all equations when a cell is updated
        $(this.toolDOMId).on('blur', '.spreadsheet:not(.disabled-sheet) input.cells', function() {
            var cellPosition = this.getAttribute('cellposition');
            var cellValue = String(this.value);

            self.nonComputedData[cellPosition] = cellValue;
            var cycles = self.findAllCycles();

            if (cycles.indexOf(String(cellPosition)) >= 0) {
                this.value = self.data[cellPosition] = self.nonComputedData[cellPosition] = 'Circular reference';
            }
            else if (cellValue.charAt(0) === '=') {
                self.computeCell(this);
                self.recomputeDependencies(self.createReferenceGraph(), cellPosition);
            }
            else {
                self.data[cellPosition] = isNaN(cellValue) ? cellValue : parseFloat(cellValue);
                self.recomputeDependencies(self.createReferenceGraph(), cellPosition);
            }
        });

        // Enables enter to switch to next cell
        $(this.toolDOMId).on('keydown', '.spreadsheet:not(.disabled-sheet) input.cells', function(event) {
            // If tab/enter/up/down are pressed navigate to appropriate cell
            if ((event.keyCode === self.utilities.TAB_KEY) || (event.keyCode === self.utilities.ENTER_KEY) || (event.keyCode === self.utilities.ARROW_UP) || (event.keyCode === self.utilities.ARROW_DOWN)) {
                self.setKeyCaptureEnabled(true);
            }
            else {
                $(self.toolDOMId + ' .cell-contents-bar .equation-field').val(this.value);
            }
        });

        // Used for linking value of two input fields
        $(this.toolDOMId).on('keyup', '.spreadsheet:not(.disabled-sheet) input.cells', function(event) {
            if ((event.keyCode !== self.utilities.ENTER_KEY) && (event.keyCode !== self.utilities.ARROW_UP) && (event.keyCode !== self.utilities.ARROW_DOWN)) {
                $(self.toolDOMId + ' .cell-contents-bar .equation-field').val(this.value);
            }
        });
    };

    // Selected next cell in sequence (top->down, left->right)
    this.selectNextCell = function() {
        // Blur input field to call the compute
        $(this.selectedCell).blur();

        // Gets grid coordinates to target next cell
        var cellIndices = this.findPosition(this.selectedCell);

        // Last row, select first cell in next column
        if ((cellIndices.row >= this.numberOfRows) && (cellIndices.column < this.numberOfColumns)) {
            this.selectCellAt(1, cellIndices.column + 1);
        }
        // Last cell in spreadsheet, select previous cell
        else if ((cellIndices.row >= this.numberOfRows) && (cellIndices.column >= this.numberOfColumns)) {
            this.selectCellAt(cellIndices.row - 1, cellIndices.column);
        }
        // Put next cell below in focus
        else {
            this.selectCellAt(cellIndices.row + 1, cellIndices.column);
        }
    };

    // Enables/disables keydown listener
    this.setKeyCaptureEnabled = function(isEnabled) {
        if (isEnabled && !this.isKeyCaptureEnabled) {
            this.isKeyCaptureEnabled = true;
            var self = this;

            // Checks if |keyCode| is an arrow key
            $('body').on('keydown', function(event) {
                switch (event.keyCode) {
                    case self.utilities.ARROW_LEFT:
                        self.selectNeighborCell('left');
                        break;

                    case self.utilities.ARROW_UP:
                        self.selectNeighborCell('up');
                        break;

                    case self.utilities.TAB_KEY:
                    case self.utilities.ARROW_RIGHT:
                        self.selectNeighborCell('right');
                        break;

                    case self.utilities.ARROW_DOWN:
                        self.selectNeighborCell('down');
                        break;

                    case self.utilities.ENTER_KEY:
                        self.selectNextCell();
                        break;

                    case self.utilities.DELETE_KEY:
                        // Locked cells cannot be cleared
                        if (self.selectedCell.hasClass('locked')) {
                            return false;
                        }

                        // Delete cell and recompute any cell dependencies
                        self.clearContentsOfSelectedCell();
                        self.recomputeDependencies(self.createReferenceGraph(), $(self.selectedCell).attr('cellPosition'));
                        break;

                    // Forward |keyCode| to input field otherwise and disable listener
                    default:
                        if (self.selectedCell) {
                            // Prevents modification of locked cells
                            if (self.selectedCell.hasClass('locked')) {
                                return false;
                            }
                            else {
                                self.clearContentsOfSelectedCell();
                                self.enableInputCell();
                                self.setKeyCaptureEnabled(false);
                                return true;
                            }
                        }
                        break;
                }

                return false;
            });
        }
        else if (!isEnabled && this.isKeyCaptureEnabled) {
            this.isKeyCaptureEnabled = false;
            $('body').unbind('keydown');
        }
    };

    /*
        Creates reference graph that shows cell references from each cell.
        Returns an Object with cell positions as the keys, and an array of cell positions referenced in those cells
        e.g.) { A1: [B2, B4], ... , C4: [A1]}
    */
    this.createReferenceGraph = function() {
        var cellReferences = {};
        var self = this;

        // Build reference map
        this.cells.forEach(function(cell) {
            var cellPosition = cell.getAttribute('cellposition');
            var cellData = String(self.nonComputedData[cellPosition]) || '';

            // Cell has a possible other cell reference
            if (cellData.charAt(0) === '=') {
                var equation = cellData.substring(1).trim().toUpperCase();

                const equationTokens = equation.split(/(\s)+|\*|\+|\-|\/|\^|[^SUM|AVERAGE|COUNT]\(|\)/ig);

                // Filter out undefined and spaces from split
                var filteredTokens = equationTokens.filter(function(token) {
                    return (token && (token.trim().length > 0));
                });

                var referencedCells = [];

                filteredTokens.forEach(function(equationToken) {

                    // Add check for ranges in functions
                    if (equationToken.match(/SUM|AVERAGE|COUNT/g)) {
                        var cellRanges = equationToken.match(/\((.)*/ig);

                        if (cellRanges) {
                            cellRanges.forEach(function(cellRange) {
                                var removeOpenParen = cellRange.replace(/\(/g, '');

                                referencedCells = referencedCells.concat(self.getCellsInRange(removeOpenParen));
                            });
                        }
                    }
                    // individual references can never be ranges
                    else {
                        if ((/[A-Z]{1,2}(\d){1,2}/g).test(equationToken)) {
                            referencedCells.push(equationToken);
                        }
                    }

                });
                cellReferences[cellPosition] = referencedCells;
            }
            else {
                cellReferences[cellPosition] = [];
            }
        });

        return cellReferences;
    };

    // Creates a dependency graph based on the given |referenceGraph|
    this.createDependencyGraph = function(referenceGraph) {
        var dependencyGraph = {};

        // Iterate through reference graph and build dependency graph
        for (var cell in referenceGraph) {
            var referencedCells = referenceGraph[cell];

            // For each cell get references and add them to the dependency graph list
            referencedCells.forEach(function(referencedCell) {
                if (dependencyGraph[referencedCell]) {
                    dependencyGraph[referencedCell].push(cell);
                }
                else {
                    dependencyGraph[referencedCell] = [ cell ];
                }
            });
        }

        return dependencyGraph;
    };

    // Gets a cell element by |cellPosition| and returns a jQuery object
    this.getCellElement = function(cellPosition) {
        return $(this.toolDOMId + ' input.cells[cellposition="' + cellPosition + '"]').eq(0);
    };

    /*
        Recomputes all cells that use the current cell indicated in |cellPosition| as a dependency
        This function is required to be run after cycles have been detected.
    */
    this.recomputeDependencies = function(referenceGraph, cellPosition) {
        this.computeCell(this.getCellElement(cellPosition));
        var dependencyGraph = this.createDependencyGraph(referenceGraph);
        var self = this;

        // If this cell has no dependencies then do nothing
        if (!dependencyGraph[cellPosition] || dependencyGraph[cellPosition].length === 0) {
            return;
        }

        dependencyGraph[cellPosition].forEach(function(cell) {
            self.recomputeDependencies(referenceGraph, cell);
        });
    };

    // Find all cells involved in any cycles
    this.findAllCycles = function() {
        var referenceGraph = this.createReferenceGraph();

        var cellsWithCycles = [];
        for (var cell in referenceGraph) {
            if (this.findCycle(referenceGraph, cell, [ cell.trim().toUpperCase() ])) {
                cellsWithCycles.push(cell);
            }
        }
        return cellsWithCycles;
    };

    /*
        Looks for a cycle from a starting point
        |cellGraph| (object) : A generated reference graph of all cell references
        |currentCellPosition| (string) : Current cell that is being checked
        |cellsVisited| (array of string) : All cells visited so far
    */
    this.findCycle = function(cellGraph, currentCellPosition, cellsVisited) {
        var cycleFound = false;
        var self = this;

        var cellsVisitedSoFar = cellsVisited.slice();

        if (!cellGraph[currentCellPosition]) {
            return false;
        }

        // Iterates through all cells referenced in the current cell
        cellGraph[currentCellPosition].forEach(function(referencedCell) {
            // Checks if any of the referenced cells are equal to the starting cell
            if (cellsVisitedSoFar.indexOf(referencedCell.trim().toUpperCase()) >= 0) {
                cycleFound = true;
            }
            // Checks if any of the cells referenced have references to the starting cell
            else if (!cycleFound) {
                cellsVisitedSoFar = cellsVisited.slice();
                cellsVisitedSoFar.push(referencedCell);
                cycleFound = self.findCycle(cellGraph, referencedCell, cellsVisitedSoFar);
            }
        });

        return cycleFound;
    };

    // Returns an array of cell positions in a cell range
    this.getCellsInRange = function(cellRange) {
        var cellArguments = cellRange.split(/,/g);
        var self = this;
        var referencedCells = [];

        cellArguments.forEach(function(cell) {
            var trimmedCell = cell.trim();

            // This is a range selection
            if (trimmedCell.indexOf(':') > 0) {
                var corners = self.findCorners(trimmedCell);

                // Iterates through all cells inside bounds and sums them together
                for (var i = corners.topLeft.row; i <= corners.bottomRight.row; i++) {
                    for (var j = corners.topLeft.column; j <= corners.bottomRight.column; j++) {
                        referencedCells.push(self.generateColumnLabel(j) + i);
                    }
                }
            }
            else {
                referencedCells.push(trimmedCell);
            }
        });

        return referencedCells;
    };

    // Clears equation field label, text contents, and disables text field
    this.clearEquationField = function() {
        $(this.toolDOMId + ' .cell-contents-bar .equation-field').val('');
        $(this.toolDOMId + ' .cell-contents-bar .equation-field').prop('disabled', true);
        $(this.toolDOMId + ' .current-selected-cell').text('--');
    };

    // Clears the contents of the selected cell
    this.clearContentsOfSelectedCell = function() {
        var cell = this.selectedCell;
        var cellPosition = $(cell).attr('cellposition');

        // Clear textfields
        $(cell).val('');
        $(this.toolDOMId + ' .cell-contents-bar .equation-field').val('');

        // Cleared stored data
        this.nonComputedData[cellPosition] = '';
        this.data[cellPosition] = '';
    };

    // Disables all input cells
    this.disableInputCells = function() {
        var $cells = $(this.toolDOMId + ' .spreadsheet:not(.disabled-sheet) input.cells');
        $cells.addClass('disabled').addClass('disabled');

        // Only blur focused cells.
        $cells.each(function() {
            if ($(this).is(':focus')) {
                $(this).blur();
            }
        });
    };

    // Enables selected input cell and disables all others
    this.enableInputCell = function() {
        var $cell = $(this.selectedCell);
        this.disableInputCells();
        $cell.removeClass('disabled');
        $cell.focus();
    };

    // Adds focused class and sets highlight
    this.focusAndHighlight = function($cell) {
        // Highlights appropriate headers
        this.highlightHeaders($cell);

        // Disable input cells because |selectedCell| will be changed
        this.disableInputCells();

        // Computed the old focus cell
        if (this.selectedCell) {
            var oldCellPosition = this.selectedCell.attr('cellPosition');
            var oldCellValue = this.nonComputedData[oldCellPosition] ? this.nonComputedData[oldCellPosition] : '';
            if (oldCellValue.charAt(0) === '=') {
                this.computeCell($cell);
                this.recomputeDependencies(this.createReferenceGraph(), oldCellPosition);
            }
        }

        // Sets |selectedCell|
        this.selectedCell = $cell;

        var cellPosition = $cell.attr('cellPosition');

        // Changes state of |$equationField|
        $(this.toolDOMId + ' .cell-contents-bar .equation-field').prop('disabled', $cell.hasClass('locked'));

        // Disable |$cell| if |$cell| is locked.
        $cell.prop('disabled', $cell.hasClass('locked'));

        // Set value of |$equationField|
        var cellValue = this.nonComputedData[cellPosition] ? this.nonComputedData[cellPosition] : '';
        $(this.toolDOMId + ' .cell-contents-bar .equation-field').val(cellValue);
        $cell.val(cellValue);

        // Set text label reference
        $(this.toolDOMId + ' .cell-contents-bar .current-selected-cell').text(cellPosition);

        // Removes focus from preselected cell
        $(this.toolDOMId + ' .focused').removeClass('focused');
        $cell.addClass('focused');
    };

    // Sets |selectedCell| with the cell located at |row| |column|
    this.selectCellAt = function(row, column) {
        var $newSelectedCell = this.getElementAtPosition(row, column);

        // Sets |selectedCell|
        this.selectedCell = $newSelectedCell;

        // Focuses cell and highlights headers
        this.focusAndHighlight($newSelectedCell);
    };

    // Selects a neighboring cell from the last selected cell
    this.selectNeighborCell = function(direction) {
        var currentSelectedCell = this.selectedCell;

        // Blur out selected cell if input is enabled
        if (!this.selectedCell.attr('disabled')) {
            $(currentSelectedCell).blur();
        }

        if (currentSelectedCell) {
            var cellIndices = this.findPosition(currentSelectedCell);

            switch (direction) {
                case 'left':
                    if (cellIndices.column > 1) {
                        this.selectCellAt(cellIndices.row, cellIndices.column - 1);
                    }
                    break;

                case 'up':
                    if (cellIndices.row > 1) {
                        this.selectCellAt(cellIndices.row - 1, cellIndices.column);
                    }
                    break;

                case 'right':
                    if (cellIndices.column < this.numberOfColumns) {
                        this.selectCellAt(cellIndices.row, cellIndices.column + 1);
                    }
                    break;

                case 'down':
                    if (cellIndices.row < this.numberOfRows) {
                        this.selectCellAt(cellIndices.row + 1, cellIndices.column);
                    }
                    break;
            }
        }
    };

    // Returns the targeted input element at position |row| & |column|
    this.getElementAtPosition = function(row, column) {
        var $spreadsheetRows = $(this.toolDOMId + ' .spreadsheet:not(.disabled-sheet) tr');
        return $spreadsheetRows.eq(row).find('td').eq(column).find('input');
    };

    /*
        Converts single cell references to actual values
        |token| : Current cell reference that needs to be replaced with computed value
        |equation| : Current equation where the reference needs to be replaced
    */
    this.computeBasicReferences = function(token, equation) {
        var self = this;

        var substitutedEquation = equation;
        var tokenToReplaceRegex = new RegExp(token + '([^\\d|:])', 'ig');

        // Adds an ending character for the regex to capture all cell references
        substitutedEquation += ' ';

        // Checks if parsed token is a cell label
        if ((self.data[token] !== null) && (self.data[token] !== undefined) && (token.trim().length > 0)) {
            var valueAt = ((isNaN(self.data[token])) || (self.data[token].length === 0)) ? '0' : self.data[token];
            substitutedEquation = substitutedEquation.replace(tokenToReplaceRegex, valueAt + '$1');
        }
        else if (!self.data[token] || self.data[token].trim().length === 0 && (token.trim().length > 0)) {
            substitutedEquation = substitutedEquation.replace(tokenToReplaceRegex, 0 + '$1');
        }

        return substitutedEquation;
    };

    // Runs compute at |cellPosition|
    this.computeCell = function(cell) {
        var self = this;

        // Function support for SUM of cell range
        function SUM(cellRange) {
            var calculatedResult = self.calculateSum(cellRange);
            return calculatedResult['valid'] ? calculatedResult['sum'] : '#NAME?';
        }

        // Function support for AVERAGE of cell range
        function AVERAGE(cellRange) {
            var calculatedResult = self.calculateSum(cellRange);
            return calculatedResult['valid'] ? (calculatedResult['sum'] / calculatedResult['cellCount']) : '#NAME?';
        }

        /**
            Function support for COUNT of cell range
            @method COUNT
            @param {Array} cellRange The range of cells to count.
            @return {String} The number of cells.
        */
        function COUNT(cellRange) { // eslint-disable-line no-unused-vars
            const calculatedResult = self.calculateSum(cellRange);

            return calculatedResult.valid ? calculatedResult.cellCount : '#NAME?';
        }

        // Attempts to compute equation at the given |cellPosition|
        function attemptComputation(equation, cellPosition) {
            try {
                var computedValue = eval(equation);

                self.data[cellPosition] = ((computedValue !== null) && (computedValue !== undefined)) ? computedValue : '#REF';
            }
            // Catches invalid equations
            catch(error) {
                self.data[cellPosition] = '#VALUE!';
            }
        }

        var cellPosition = $(cell).attr('cellposition');

        // Regex splits equation by mathematical operations and parentheses
        var mathematicalOperationsRegex = /(\s)+|\*|\+|\-|\/|\^|\(|\)/ig;

        // Computation exists
        if ((self.nonComputedData[cellPosition]) && (String(self.nonComputedData[cellPosition]).charAt(0) === '=')) {

            // No equation, reset cell
            if (self.nonComputedData[cellPosition].length === 1) {
                self.data[cellPosition] = '';
                self.nonComputedData[cellPosition] = '';
                $(cell).val(self.data[cellPosition]);
                return;
            }

            var equation = self.nonComputedData[cellPosition].substring(1).trim().toUpperCase();

            // Check if the equation is using a function
            if (equation.match(/SUM|AVERAGE|COUNT/g)) {

                // Uses a regex to surround contents inside the parentheses with "'s
                equation = equation.replace(/(SUM|AVERAGE|COUNT)+\(([^\)]*)/g, '$1("$2"');

                // Attempts to compute function
                try {
                    var computedValue = eval(equation);

                    if (computedValue !== null && computedValue !== undefined) {
                        self.data[cellPosition] = computedValue;
                    }
                    else if (isNaN(computedValue)) {
                        self.data[cellPosition] = '#DIV/0!';
                    }
                    else {
                        self.data[cellPosition] = '#REF';
                    }
                }
                catch(error) {
                    var equationSplit = equation.split(mathematicalOperationsRegex);

                    if (equationSplit.length > 1) {
                        equationSplit.forEach(function(token) {

                            // Checks if parsed token is a SUM or AVERAGE or COUNT function call
                            if (token && !token.match(/SUM|AVERAGE|COUNT/g)) {
                                equation = self.computeBasicReferences(token, cellPosition, equation);
                            }
                        });

                        attemptComputation(equation, cellPosition);
                    }
                    else {
                        self.data[cellPosition] = error.message ? 'Syntax error' : error;
                    }
                }
                $(cell).val(self.data[cellPosition]);
            }
            else {
                var equationSplit = equation.split(mathematicalOperationsRegex);
                var valueToSet = '';

                // Cell is equal to contents of another cell
                if (equationSplit.length === 1) {
                    // Checks if the cell is a valid cell [XXyy] X's are letters and y's are numbers
                    if (!(/[A-Z]{1,2}(\d){1,2}/g).test(equationSplit[0]) && isNaN(equationSplit[0])) {
                        $(cell).val('#NAME?');
                        self.data[cellPosition] = valueToSet;
                    }
                    // Checks to see if it is a constant number and not a reference
                    else if (!isNaN(equationSplit[0])) {
                        valueToSet = equationSplit[0];
                        $(cell).val(valueToSet);
                        self.data[cellPosition] = valueToSet;
                    }
                    // If the cell is a NaN or empty use '0' as the default value
                    else if ((typeof (self.data[cellPosition]) === 'number' && isNaN(self.data[cellPosition]))
                             || (String(self.data[cellPosition]).trim().length === 0)
                             || !self.data[cellPosition]) {
                        valueToSet = '0';
                        $(cell).val(valueToSet);
                        self.data[cellPosition] = valueToSet;
                    }
                    else {
                        valueToSet = self.data[equationSplit[0]] ? self.data[equationSplit[0]] : '0';
                        self.data[cellPosition] = valueToSet;
                        $(cell).val(valueToSet);
                    }
                }
                else {
                    var substitutedEquation = equation;
                    equationSplit.forEach(function(token) {
                        if (token && token.trim().length >= 1) {
                            substitutedEquation = self.computeBasicReferences(token, substitutedEquation);
                        }
                    });

                    attemptComputation(substitutedEquation, cellPosition);
                    $(cell).val(self.data[cellPosition]);
                }
            }
        }
        else {
            self.data[cellPosition] = ($(cell).val() === '' || isNaN($(cell).val())) ? $(cell).val() : parseFloat($(cell).val());
        }
    };

    // Computes all cells
    this.computeAllCells = function() {
        var self = this;

        var referenceGraph = self.createReferenceGraph();

        // Checks each cell for any computations
        this.cells.forEach(function(cell) {
            self.computeCell(cell);
            self.recomputeDependencies(referenceGraph, $(cell).attr('cellPosition'));
        });
    };

    // Clears all highlights
    this.clearHighlight = function() {
        // Un-highlight any selected row
        $(this.toolDOMId + ' .selected-row').removeClass('selected-row');
        $(this.toolDOMId + ' .selected-column').removeClass('selected-column');
    };

    // Highlights matching headers to the current cell
    this.highlightHeaders = function(cell) {
        this.clearHighlight();

        // Gets grid coordinates to target next cell
        var cellIndices = this.findPosition(cell);
        var $spreadsheetRows = $(this.toolDOMId + ' .spreadsheet:not(.disabled-sheet) tr');

        $spreadsheetRows.eq(cellIndices.row).find('td').eq(0).addClass('selected-row');
        $spreadsheetRows.eq(0).find('td').eq(cellIndices.column).addClass('selected-column');
    };

    // Looks for position of |cell| in the spreadsheet grid
    this.findPosition = function(cell) {
        var $spreadsheetRows = $(this.toolDOMId + ' .spreadsheet tr');
        var rowIndex = $spreadsheetRows.index($(cell).closest('tr'));
        var columnIndex = $spreadsheetRows.eq(rowIndex).find('td').index($(cell).parent('td'));

        return { row: rowIndex, column: columnIndex };
    };

    // Finds top left and bottom right corners of cell range
    this.findCorners = function(cellRange) {
        var cellBounds = cellRange.split(':');

        // Get selected space and all values in between to sum
        var topLeft = $(this.toolDOMId + ' .spreadsheet input[cellposition=' + cellBounds[0] + ']');
        var bottomRight = $(this.toolDOMId + ' .spreadsheet input[cellposition=' + cellBounds[1] + ']');

        var topLeftCorner = this.findPosition(topLeft);
        var bottomRightCorner = this.findPosition(bottomRight);

        // Swap corners if they selected out of order
        if (topLeftCorner.row > bottomRightCorner.row) {
            var temporary = topLeftCorner;
            topLeftCorner = bottomRightCorner;
            bottomRightCorner = temporary;
        }

        if (topLeftCorner.column > bottomRightCorner.column) {
            var temporary = topLeftCorner.column;
            topLeftCorner.column = bottomRightCorner.column;
            bottomRightCorner.column = temporary;
        }

        return { topLeft: topLeftCorner, bottomRight: bottomRightCorner };
    };

    // Checks if a circular/cyclic reference exists
    this.checkReferences = function(currentCell, cellRange) {
        var cellArguments = cellRange.split(/,/g);
        var self = this;
        var circularExists = false;
        cellArguments.forEach(function(cell) {
            var trimmedCell = cell.trim();

            // This is a range selection
            if (trimmedCell.indexOf(':') > 0) {
                var corners = self.findCorners(trimmedCell);

                // Iterates through all cells inside bounds and sums them together
                for (var i = corners.topLeft.row; i <= corners.bottomRight.row; i++) {
                    for (var j = corners.topLeft.column; j <= corners.bottomRight.column; j++) {
                        var cellPosition = self.generateColumnLabel(j) + i;
                        if (cellPosition === currentCell) {
                            circularExists = true;
                        }
                    }
                }
            }
            else {
                if (currentCell === trimmedCell && !circularExists) {
                    circularExists = true;
                }
            }
        });

        return circularExists;
    };

    // Returns the sum and number of cells referenced
    this.calculateSum = function(cellRange) {
        // Incorrect function call reference
        if (!cellRange) {
            return {
                sum:       0,
                cellCount: 1,
                valid:     false
            };
        }

        var cellArguments = cellRange.split(/,/g);
        var totalSum = 0;
        var cellCount = 0;

        var self = this;

        cellArguments.forEach(function(cell) {
            var trimmedCell = cell.trim();

            // This is a range selection
            if (trimmedCell.indexOf(':') > 0) {
                var corners = self.findCorners(trimmedCell);

                // Iterates through all cells inside bounds and sums them together
                for (var i = corners.topLeft.row; i <= corners.bottomRight.row; i++) {
                    for (var j = corners.topLeft.column; j <= corners.bottomRight.column; j++) {
                        var cellPosition = self.generateColumnLabel(j) + i;
                        if (self.data[cellPosition] == null || isNaN(self.data[cellPosition]) || String(self.data[cellPosition]).trim() === '') {
                            totalSum += 0;
                        }
                        else {
                            totalSum += parseFloat(self.data[cellPosition]);
                            cellCount++;
                        }
                    }
                }
            }
            else {
                // Immediate decimal value
                if (!isNaN(trimmedCell)) {
                    totalSum += parseFloat(trimmedCell);
                    cellCount++;
                }
                else {
                    if (isNaN(self.data[trimmedCell]) || String(self.data[trimmedCell]).trim().length === 0) {
                        totalSum += 0;
                    }
                    else {
                        totalSum += parseFloat(self.data[trimmedCell]);
                        cellCount++;
                    }
                }
            }
        });

        // |sum| - total sum of cells, |cellCount| - number of cells, |valid| - if function call is valid
        return {
            sum:       totalSum,
            cellCount: cellCount,
            valid:     true
        };
    };

    // Caches a reference to all cells for easy accessibility
    this.cacheCells = function() {
        // Caches all created cells
        this.cells = [].slice.call($(this.toolDOMId + ' .cells'));
    };

    // Fills cells with stored contents. Spreadsheet must have cells
    this.fillCellsAndCompute = function() {
        var self = this;

        this.cells.forEach(function(cell) {
            var cellPosition = cell.getAttribute('cellposition');
            cell.value = self.nonComputedData[cellPosition] || '';
        });

        // Computed any pre-populated cells
        this.computeAllCells();
    };

    // Creates a new sheet with size |rows| x |columns|
    this.drawSheet = function(rows, columns) {

        // Set global variables for grid size
        this.numberOfRows = rows;
        this.numberOfColumns = columns;

        // Headers are added to the number of rows and columns
        var html = this[this.name]['zySpreadsheet']({
            id:              this.id,
            numberOfRows:    (rows + 1),
            numberOfColumns: (columns + 1)
        });

        // Re-renders HTML inside the zySpreadsheet container
        $(this.toolDOMId + ' .zySpreadsheet-container').html(html);

        // Updates global variable of cached cells
        this.cacheCells();
    };

    // Generates letter labels for column headers
    this.generateColumnLabel = function(index) {
        var charCodeForA = 'A'.charCodeAt(0);
        return String.fromCharCode(charCodeForA + index - 1);
    };

    // Clears any highlighted cells
    this.clearAllHighlights = function() {
        this.selectedCell = null;
        this.disableInputCells();
        this.clearHighlight();
        this.selectedCell = null;
        $(this.toolDOMId + ' .focused').removeClass('focused');

        this.clearEquationField();
    };

    // Clears sheet and all stored cell contents
    this.clearSheet = function() {
        // Reset all stored values
        this.data = {};
        this.nonComputedData = {};
        $(this.toolDOMId + ' .cell-contents-bar .equation-field').val('');

        // Unlocks all cells
        this.lockedCells = [];

        // Draw a new sheet
        this.drawSheet(this.numberOfRows, this.numberOfColumns);
    };

    // Enables/disables the full sheet from being clicked on
    this.setSheetEnabled = function(isEnabled) {
        this.clearAllHighlights();
        this.disableInputCells();

        $(this.toolDOMId + ' .spreadsheet:not(.disabled-sheet) input.cells').attr('disabled', !isEnabled);

        // Enables sheet to allow for all clicks
        if (isEnabled) {
            $(this.toolDOMId + ' .spreadsheet').removeClass('disabled-sheet');
        }
        // Disables all clicks on sheet and fades sheet out
        else {
            this.setKeyCaptureEnabled(false);
            $(this.toolDOMId + ' .spreadsheet').addClass('disabled-sheet');
        }
    };

    // Checks user's answer with a new set  of randomly generate cell data values
    this.testAnswers = function() {
        // Save sheet before second test
        this.saveSheet();

        var self = this;

        // Generates new random values for locked cells
        this.lockedCells.forEach(function(cell) {
            self.data[cell] = self.nonComputedData[cell] = self.utilities.pickNumberInRange(0, 1000);
        });

        // Checks answers with the new randomly generated values
        var passedCheck = this.checkAnswers();

        // Restore sheet to previous state
        this.restoreSheet();

        return passedCheck;
    };

    // Highlights incorrect answer cell
    this.highlightIncorrect = function(cellPosition) {
        var answerCell = this.getCellElement(cellPosition);
        answerCell.addClass('expected-answer');
    };

    // Highlights correct answer cell
    this.highlightCorrect = function(cellPosition) {
        var answerCell = this.getCellElement(cellPosition);
        answerCell.addClass('correctly-answered');
    };

    // Creates a level along with an expected answer
    this.createLevelAnswers = function(difficulty) {
        var instructions = '';
        var expectedAnswer = {};
        var mustUse = '';
        var hint = '';
        var mustUseHint = '';

        // Difficulty ranges from 0-4, 0 being the easiest
        switch(difficulty) {
            default:
            case 0:
                var randomCell1 = this.selectRandomCell('A1:F10');

                var randomValue1 = this.utilities.pickNumberInRange(0, 10);

                instructions = 'Set ' + randomCell1 + ' equal to ' + randomValue1 + '.';
                hint = randomCell1 + ' should be set to ' + randomValue1 + '.';
                mustUseHint = hint;

                // Expected answer is randomCell1 = randomValue1
                expectedAnswer[randomCell1] = randomValue1;

                break;
            case 1:
                var randomCell1 = this.selectRandomCell('B1:B10');
                var randomCell2 = this.selectRandomCell('A1:A10');

                var cellsToPopulate = this.getCellsInRange('A1:A10');
                var self = this;

                cellsToPopulate.forEach(function(cellPosition) {
                    self.data[cellPosition] = self.nonComputedData[cellPosition] = self.utilities.pickNumberInRange(0, 1000);
                });

                instructions = 'Set ' + randomCell1 + ' equal to ' + randomCell2;
                hint = 'Note: =F4 sets the cell to equal F4.';

                // Expected answer is randomCell1 = randomCell2
                expectedAnswer[randomCell1] = '=' + randomCell2;

                // User is required to use the = operator
                mustUse = '=';
                mustUseHint = 'Use the = operator.';

                // Locks randomly generated cells
                this.lockedCells = cellsToPopulate;
                break;
            case 2:
                this.data['A1'] = this.nonComputedData['A1'] = this.utilities.pickNumberInRange(0, 1000);
                this.data['A2'] = this.nonComputedData['A2'] = this.utilities.pickNumberInRange(0, 1000);

                instructions = 'Set B1 equal to A1 minus A2.';
                hint = 'Note: =C2-C3 sets the cell equal to C2 minus C3.';

                // Stores expected answer
                expectedAnswer = {
                    'B1': '=A1 - A2'
                };

                // Locks randomly generated cells
                this.lockedCells = [ 'A1', 'A2' ];

                // User is required to use the = operator
                mustUse = '=';
                mustUseHint = 'Use the = operator.';
                break;
            case 3:
                this.data['A1'] = this.nonComputedData['A1'] = this.utilities.pickNumberInRange(0, 1000);
                this.data['A2'] = this.nonComputedData['A2'] = this.utilities.pickNumberInRange(0, 1000);
                this.data['A3'] = this.nonComputedData['A3'] = this.utilities.pickNumberInRange(0, 1000);

                instructions = 'Use the SUM function to set A4 to the sum of A1:A3.';
                hint = '=SUM(x:y) computes the sum of cells x to y (or similar).';

                // Answer is expected to be the sum of A1:A3 stored in B1
                expectedAnswer = {
                    'A4': '=SUM(A1:A3)'
                };

                // Locks randomly generated cells
                this.lockedCells = [ 'A1', 'A2', 'A3' ];

                // User is required to use the SUM function
                mustUse = 'sum';
                mustUseHint = 'Use the =SUM() function.';
                break;
            case 4:
                // Populate [A1:E1]
                var cellsToPopulate = this.getCellsInRange('A1:E1');
                var self = this;

                cellsToPopulate.forEach(function(cellPosition) {
                    self.data[cellPosition] = self.nonComputedData[cellPosition] = self.utilities.pickNumberInRange(0, 1000);
                });

                // Locks randomly generated cells
                this.lockedCells = cellsToPopulate;

                instructions = 'Use the COUNT function to set F1 to the count of A1:E1.';
                hint = '=COUNT(x:y) computes the number of cells x to y (or similar).';

                // Answer is expected to be the count of A1:E1 stored in F1
                expectedAnswer = { F1: '=COUNT(A1:E1)' };

                // User is required to use the COUNT function
                mustUse = 'count';
                mustUseHint = 'Use the =COUNT() function.';
                break;
        }

        // Lock appropriate cells
        this.lockCells();

        // Stores additional information regarding an answer
        this.answerProperties = {
            mustUse:     mustUse,
            mustUseHint: mustUseHint,
            hint:        hint
        };

        this.$instructions.html(instructions);
        this.expectedAnswer = expectedAnswer;
    };

    // Checks the users answers against the expected
    this.checkAnswers = function() {
        var answerIsCorrect = true;
        var explanation = '';

        for (answer in this.expectedAnswer) {
            // Checks if an incorrect answer has already been encountered
            if (answerIsCorrect) {
                // Creates a hidden answer cell not visible to the user to check against
                var hiddenAnswerCell = 'ZZ11';
                this.nonComputedData[hiddenAnswerCell] = this.data[hiddenAnswerCell] = this.expectedAnswer[answer];

                var hiddenCell = document.createElement('input');
                hiddenCell.setAttribute('cellPosition', hiddenAnswerCell);
                hiddenCell.value = this.nonComputedData[hiddenAnswerCell];

                // Compute hidden cell to compare answer
                this.computeCell(hiddenCell);

                // Recompute user's answer to verify they match
                this.computeCell(this.getCellElement(answer));

                // Checks if any must use syntax is present
                var mustUseRegex = new RegExp(this.answerProperties.mustUse, 'ig');

                if (String(this.data[answer]) !== String(this.data[hiddenAnswerCell])) {
                    answerIsCorrect = false;
                    this.highlightIncorrect(answer);

                    // Show different hints based on incorrectness
                    if (!this.nonComputedData[answer] || this.nonComputedData[answer].trim().length === 0) {
                        explanation = 'Above highlighted cell is ' + answer + '.';
                    }
                    else if (!this.nonComputedData[answer].match(mustUseRegex)) {
                        explanation = 'You entered ' + this.nonComputedData[answer] + '. ' + this.answerProperties.mustUseHint;
                    }
                    else {
                        explanation = 'You entered ' + this.nonComputedData[answer] + '. ' + this.answerProperties.hint;
                    }
                }
                else {
                    // Checks if the user used the required functions
                    if (!this.nonComputedData[answer].match(mustUseRegex)) {
                        answerIsCorrect = false;
                        this.highlightIncorrect(answer);
                        explanation = 'You entered ' + this.nonComputedData[answer] + '. ' + this.answerProperties.mustUseHint;

                    }
                    else {
                        this.highlightCorrect(answer);
                    }
                }
            }
            else {
                break;
            }
        }

        return {
            passed:     answerIsCorrect,
            explanation: explanation
        };
    };

    // Creates a new level at the specified difficulty
    this.makeLevel = function(difficulty) {
        this.clearSheet();

        // Draw a sheet with 10 rows and 6 columns
        this.drawSheet(10, 6);

        // Generates the level and the expected answer
        this.createLevelAnswers(difficulty);

        // Populate new sheet
        this.fillCellsAndCompute();
    };

    // Saves current sheet
    this.saveSheet = function() {
        var copiedData = {};
        var copiedNonComputedData = {};

        // Make copies of the current stored data
        var copiedData = $.extend({}, this.data);
        var copiedNonComputedData = $.extend({}, this.nonComputedData);

        // Store the copies
        this.savedData = {
            data: copiedData,
            nonComputedData: copiedNonComputedData
        };
    };

    // Restores any current sheet
    this.restoreSheet = function() {
        this.data = this.savedData['data'];
        this.nonComputedData = this.savedData['nonComputedData'];
        this.fillCellsAndCompute();
    };

    // Selects a column or row within the given range
    this.selectRandomCell = function(cellRange) {
        var allCells = this.getCellsInRange(cellRange);

        return this.utilities.pickElementFromArray(allCells);
    };

    // Locks cells indicated in |lockedCells| from being edited
    this.lockCells = function() {
        var self = this;

        // Unlocks all previously locked cells
        $(this.toolDOMId + ' .locked').removeClass('locked');

        this.lockedCells.forEach(function(cellPosition) {
            var $cell = $(self.toolDOMId + ' .spreadsheet:not(.disabled-sheet) input.cells[cellPosition=' + cellPosition + ']');
            $cell.addClass('locked');
        });
    };

    // Reset hook for zyWeb to tell tool to reset itself
    this.reset = function() {
        this.progressionTool.reset();
    };

    <%= grunt.file.read(hbs_output) %>
}

var zySpreadsheetExport = {
    create: function() {
        return new zySpreadsheet();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = zySpreadsheetExport;
