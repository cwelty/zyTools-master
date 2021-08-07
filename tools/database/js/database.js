function Database() {
    this.init = function(id, eventManager, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.eventManager = eventManager;

        /*
            The expected answer includes the following strings:
            |operation| is required and specifies which operation should be selected. Valid operations are: insert, select, and delete.
            |id|, |name|, and |price| are required if the operation is insert. Otherwise, they are optional.
            Written during |generateQuestion| and read during |isCorrect|.
        */
        this.expectedAnswer = {
            operation:   '',
            id:          '',
            name:        '',
            price:       ''
        };

        /*
            Written during |generateQuestion| and read during |isCorrect|
            |records| is a 2D array of strings. Ex:
            [
                ['Q254', 'Audiobook', '1.99'],
                ['R654', 'Book', '10.50'],
                ['Z110', 'DVD', '16.99']
            ]
        */
        this.records = [];

        // List of possible items to be used in the name field for |records|.
        this.possibleNames = [ 'Book', 'Jacket', 'Lamp', 'Chair' ];

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['database']({
            id: this.id
        });

        this.utilities = require('utilities');
        this.progressionTool = require('progressionTool').create();
        var self = this;
        this.progressionTool.init(this.id, this.eventManager, {
            html:             html,
            css:              css,
            numToWin:         3,
            useMultipleParts: true,
            start: function() {
                self.generateQuestion(0);
                self.enableInteractiveElements();
            },
            reset: function() {
                self.generateQuestion(0);
                self.disableInteractiveElements();
            },
            next: function(currentQuestion) {
                self.generateQuestion(currentQuestion);
                self.enableInteractiveElements();
            },
            isCorrect: function(currentQuestion) {
                var userAnswer = self.getUserAnswer();
                var isCorrect = true;
                $.each(userAnswer, function(property, userValue) {
                    var expectedValue = self.expectedAnswer[property];

                    if (userValue.toLowerCase() !== expectedValue.toLowerCase()) {
                        isCorrect = false;
                    }
                });

                var explanationMessage = '';
                if (isCorrect) {
                    explanationMessage = 'Correct. ';
                }
                else {
                    var explanationHTML = self[self.name]['expectedAndUserAnswer']({
                        expectedOperation: self.buildQueryString(self.expectedAnswer),
                        userOperation:     self.buildQueryString(userAnswer)
                    });
                    explanationMessage = explanationHTML + self.utilities.getNewline();
                }

                if (userAnswer.operation === self.expectedAnswer.operation) {
                    switch (userAnswer.operation) {
                        case 'select':
                            var indicesOfChosenRecords = self.getIndexOfChosenRecords(userAnswer);
                            if (indicesOfChosenRecords.length > 0) {
                                var selectedRecords = self.getSelectedRecords(indicesOfChosenRecords);
                                var databaseTableHTML = self[self.name]['databaseTable']({
                                    records:        selectedRecords,
                                    tableClassName: 'selected-records'
                                });
                                explanationMessage += 'Your operation selected:' + self.utilities.getNewline() + databaseTableHTML;
                            }
                            else {
                                explanationMessage += 'Your operation selected no records.';
                            }
                            break;
                        case 'delete':
                            var indicesOfChosenRecords = self.getIndexOfChosenRecords(userAnswer);
                            if (indicesOfChosenRecords.length > 0) {
                                explanationMessage += 'Your operation deleted the above struck-out record';
                                explanationMessage += (indicesOfChosenRecords.length > 1) ? 's.' : '.';
                                self.strikeOutRecordsByIndex(indicesOfChosenRecords);
                            }
                            else {
                                explanationMessage += 'Your operation did not delete any records.';
                            }
                            break;
                        case 'insert':
                            self.insertRecordToTable(userAnswer);
                            explanationMessage += 'Inserted record is highlighted above.';
                            break;
                    }
                }

                self.disableInteractiveElements();

                return {
                    explanationMessage: explanationMessage,
                    userAnswer:         JSON.stringify(userAnswer),
                    expectedAnswer:     JSON.stringify(self.expectedAnswer),
                    isCorrect:          isCorrect
                };
            }
        });

        // Cache regularly used DOM objects
        var $thisTool = $('#' + this.id);
        this.$operation = $thisTool.find('.operation');
        this.$insertForm = $thisTool.find('.insert-form');
        this.$selectAndDeleteForm = $thisTool.find('.select-and-delete-form');
        this.$inputs = $thisTool.find('input');
        this.$selects = $thisTool.find('select');

        this.$operation.change(function() {
            self.operatorChanged();
        });

        this.$inputs.keypress(function(event) {
            if (event.keyCode === self.utilities.ENTER_KEY) {
                self.progressionTool.check();
            }
        });

        this.generateQuestion(0);
        this.resetInputs();
        this.disableInteractiveElements();
    };

    /*
        |insertQueryObject| is required and an object containing: |operation|, |id|, |name|, and |price|.
        Also, |operation| is required to store 'insert'.
    */
    this.insertRecordToTable = function(insertQueryObject) {
        this.records.push([ insertQueryObject.id, insertQueryObject.name, insertQueryObject.price ]);
        this.outputRecordsAsDatabaseTable();
        this.highlightRecordsByIndex([ this.records.length - 1 ]);
    };

    /*
        Apply the |className| to each record in |indicesOfChosenRecords|.
        |indicesOfChosenRecords| is required and an array of numbers.
        |className| is required and a string.
    */
    this.applyClassToRecordsByIndex = function(indicesOfChosenRecords, className) {
        var $tableRows = $('#' + this.id + ' .database-container tbody tr');
        $tableRows.each(function(index) {
            if (indicesOfChosenRecords.indexOf(index) !== -1) {
                $(this).addClass(className);
            }
        });
    };

    /*
        Apply the class 'highlight' to each record in |indicesOfChosenRecords|.
        |indicesOfChosenRecords| is required and an array of numbers.
    */
    this.highlightRecordsByIndex = function(indicesOfChosenRecords) {
        this.applyClassToRecordsByIndex(indicesOfChosenRecords, 'highlight-cell');
    };

    /*
        Apply the class 'strikethrough' to each record in |indicesOfChosenRecords|.
        |indicesOfChosenRecords| is required and an array of numbers.
    */
    this.strikeOutRecordsByIndex = function(indicesOfChosenRecords) {
        this.applyClassToRecordsByIndex(indicesOfChosenRecords, 'strikethrough');
    };

    /*
        Given |queryObject|, return a string of the query.
        |queryObject| is required and an object containing: |operation|, |id|, |name|, and |price|.
        Ex: If operation is 'select' and name is specified as 'Jacket', return: SELECT Name Jacket
    */
    this.buildQueryString = function(queryObject) {
        var query = '';
        if ((queryObject.operation === 'select') || (queryObject.operation === 'delete')) {
            var fieldUsed = this.getFieldUsedFromQueryObject(queryObject);
            query = queryObject.operation.toUpperCase() + ' ' + fieldUsed + ' ' + queryObject[fieldUsed.toLowerCase()];
        }
        else if (queryObject.operation === 'insert') {
            query = 'INSERT ID ' + queryObject.id + ' Name ' + queryObject.name + ' Price ' + queryObject.price;
        }

        query += ';';

        return query;
    };

    /*
        Return the field used from the |queryObject|.
        |queryObject| is required and an object.
    */
    this.getFieldUsedFromQueryObject = function(queryObject) {
        var field = '';
        if (queryObject.id !== '') {
            field = 'ID';
        }
        else if (queryObject.name !== '') {
            field = 'Name';
        }
        else if (queryObject.price !== '') {
            field = 'Price';
        }
        return field;
    };

    /*
        Return the records for the indices in |indicesOfChosenRecords|.
        |indicesOfChosenRecords| is required and an array of numbers.
    */
    this.getSelectedRecords = function(indicesOfChosenRecords) {
        return this.records.filter(function(record, index) {
            return indicesOfChosenRecords.indexOf(index) !== -1;
        });
    };

    /*
        Return an array of indices of the records chosen for the given user's query.
        The user's query is stored in |userAnswer|.
        |userAnswer| is required and an object containing properties: |operation|, |id|, |name|, and |price|.
    */
    this.getIndexOfChosenRecords = function(userAnswer) {
        var recordIndexForField = null;
        var recordValueToFind = '';
        if (userAnswer.id !== '') {
            recordIndexForField = 0;
            recordValueToFind = userAnswer.id;
        }
        else if (userAnswer.name !== '') {
            recordIndexForField = 1;
            recordValueToFind = userAnswer.name;
        }
        else if (userAnswer.price !== '') {
            recordIndexForField = 2;
            recordValueToFind = userAnswer.price;
        }

        var indicesOfChosenRecords = [];
        if (recordIndexForField !== null) {
            var self = this;
            indicesOfChosenRecords = this.records.filter(function(record) {
                return record[recordIndexForField].toLowerCase() === recordValueToFind.toLowerCase();
            }).map(function(record) {
                return self.records.indexOf(record);
            });
        }

        return indicesOfChosenRecords;
    };

    /*
        Return an object containing the user's answer. The object contains the following properties:
        |operation|, |id|, |name|, and |price|
    */
    this.getUserAnswer = function() {
        var userAnswer = {
            operation: this.$operation.find('option:selected').val(),
            id:        '',
            name:      '',
            price:     ''
        };

        // If the insert operation is chosen, then get the input values in the insert form.
        if (userAnswer.operation === 'insert') {
            var $insertFormInputs = $('#' + this.id + ' .insert-form input');

            userAnswer.id = $insertFormInputs.eq(0).val();
            userAnswer.name = $insertFormInputs.eq(1).val();
            userAnswer.price = $insertFormInputs.eq(2).val();
        }
        // Otherwise, get the input value for the selected field.
        else {
            var fieldSelected = $('#' + this.id + ' .select-and-delete-form select').val();
            var fieldValue = $('#' + this.id + ' .select-and-delete-form input').val();

            switch (fieldSelected) {
                case 'id':
                    userAnswer.id = fieldValue;
                    break;
                case 'name':
                    userAnswer.name = fieldValue;
                    break;
                case 'price':
                    userAnswer.price = fieldValue;
                    break;
            }
        }

        return userAnswer;
    };

    // Disable the inputs and selects.
    this.disableInteractiveElements = function() {
        this.$inputs.attr('disabled', true);
        this.$selects.attr('disabled', true);
    };

    // Enable the inputs and selects.
    this.enableInteractiveElements = function() {
        this.$inputs.attr('disabled', false);
        this.$selects.attr('disabled', false);
    };

    // Show the form for the insert operation.
    this.showInsertForm = function() {
        this.$insertForm.show();
        this.$selectAndDeleteForm.hide();
    };

    // Show the form for the select and delete form.
    this.showSelectAndDeleteForm = function() {
        this.$insertForm.hide();
        this.$selectAndDeleteForm.show();
    };

    // Clear the input fields and set the first option in each select.
    this.resetInputs = function() {
        this.$inputs.val('');
        this.$selects.each(function() {
            this.selectedIndex = 0;
        });

        this.showSelectAndDeleteForm();
    };

    // If insert operation selected, then show the insert form. Otherwise, show the form for select and delete.
    this.operatorChanged = function() {
        if (this.$operation.find('option:selected').val() === 'insert') {
            this.showInsertForm();
        }
        else {
            this.showSelectAndDeleteForm();
        }
    };

    // Generate a random ID starting with one A-Z, then followed by three digits.
    this.generateID = function() {
        // Select the alphabet character, not including I and O b/c they look too much like 1 and 0.
        var alphabet;
        do {
            alphabet = String.fromCharCode(65 + this.utilities.pickNumberInRange(0, 25));
        } while([ 'I', 'O' ].indexOf(alphabet) !== -1);

        // Pick the digits from 2 - 9 b/c 1 and 0 look too much like I and O.
        var firstDigit = this.utilities.pickNumberInRange(2, 9);
        var secondDigit = this.utilities.pickNumberInRange(2, 9);
        var thirdDigit = this.utilities.pickNumberInRange(2, 9);

        return (alphabet + firstDigit + secondDigit + thirdDigit);
    };

    /*
        Return an array containing |numberOfIDs| unique IDs.
        |numberOfIDs| is required and a number.
    */
    this.generateNUniqueIDs = function(numberOfIDs) {
        var ids = [];

        var newID;
        while (ids.length < numberOfIDs) {
            newID = this.generateID();
            if (ids.indexOf(newID) === -1) {
                ids.push(newID);
            }
        }

        return ids;
    };

    /*
        Output the database |records| as a table.
    */
    this.outputRecordsAsDatabaseTable = function() {
        var databaseTableHTML = this[this.name]['databaseTable']({
            records:        this.records,
            tableClassName: ''
        });
        $('#' + this.id + ' .database-container').html(databaseTableHTML);
    };

    /*
        Display an equation given the |currentQuestionNumber|
        |currentQuestionNumber| is an integer
    */
    this.generateQuestion = function(currentQuestionNumber) {
        this.resetInputs();

        // Randomly generate a new |records|.
        this.utilities.shuffleArray(this.possibleNames);
        var ids = this.generateNUniqueIDs(4);
        this.records = [
            [ ids[0], this.possibleNames[0], '5.99' ],
            [ ids[1], this.possibleNames[0], '10.50' ],
            [ ids[2], this.possibleNames[1], '16.99' ],
            [ ids[3], this.possibleNames[2], '12.30' ]
        ];
        this.utilities.shuffleArray(this.records);

        // Build the instructions and |expectedAnswer|.
        var instructions = '';
        if (currentQuestionNumber === 0) {
            instructions = 'Select all items named ' + this.possibleNames[0] + '.';

            this.expectedAnswer = {
                operation: 'select',
                id:        '',
                name:      this.possibleNames[0],
                price:     ''
            };
        }
        else if (currentQuestionNumber === 1) {
            instructions = 'Delete the record with ID ' + ids[0] + '.';

            this.expectedAnswer = {
                operation: 'delete',
                id:        ids[0],
                name:      '',
                price:     ''
            };
        }
        else if (currentQuestionNumber === 2) {
            var newID;
            do {
                newID = this.generateID();
            } while(ids.indexOf(newID) !== -1);

            var newPrice = (this.utilities.pickNumberInRange(800, 1300) / 100.0).toFixed(2);

            instructions = 'Insert a ' + this.possibleNames[2].toLowerCase() + ' for ' + newPrice + ' with ID ' + newID + '.';

            this.expectedAnswer = {
                operation: 'insert',
                id:        newID,
                name:      this.possibleNames[2],
                price:     newPrice
            };
        }

        // Output question to DOM.
        $('#' + this.id + ' .instructions').text(instructions);
        this.outputRecordsAsDatabaseTable();
    };

    // Reset hook for zyWeb to tell tool to reset itself
    this.reset = function() {
        this.progressionTool.reset();
    };

    <%= grunt.file.read(hbs_output) %>
}

var databaseExport = {
    create: function() {
        return new Database();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = databaseExport;
