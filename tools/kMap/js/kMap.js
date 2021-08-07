function KMap() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        this.useProgressionMode = false;
        if (options && options['progressionMode']) {
            this.useProgressionMode = true;
        }

        this.useMultipleParts = false;
        if (options && options.useMultipleParts) {
            this.useMultipleParts = true;
        }

        const useTwoVariables = options && options.useTwoVariables;

        this.mintermRow1 = [
            { minterm: 'a\' b\' c\'', value: '000' },
            { minterm: 'a\' b\' c', value: '001' },
            { minterm: 'a\' b c', value: '011' },
            { minterm: 'a\' b c\'', value: '010' }
        ];

        this.mintermRow2 = [
            { minterm: 'a b\' c\'', value: '100' },
            { minterm: 'a b\' c', value: '101' },
            { minterm: 'a b c', value: '111' },
            { minterm: 'a b c\'', value: '110' }
        ];

        if (useTwoVariables) {
            this.mintermRow1 = [
                { minterm: 'a\' b\'', value: '00' },
                { minterm: 'a\' b', value: '01' },
            ];

            this.mintermRow2 = [
                { minterm: 'a b\'', value: '10' },
                { minterm: 'a b', value: '11' },
            ];
        }

        const css = '<style><%= grunt.file.read(css_filename) %></style>';
        const html = this[this.name].kMap({
            mintermRow1: this.mintermRow1,
            mintermRow2: this.mintermRow2,
            useTwoVariables,
        });

        // If not |useProgressionMode|, then render the tinker only mode.
        // Otherwise, render the progression mode.
        if (!this.useProgressionMode) {
            $('#' + this.id).html(css + html);
            this.initializeTool();

            // Additional initialization for tinker tool
            this.$mintermPrompt.hide();

            var self = this;
            $('#' + this.id).click(function() {
                if (!self.beenClicked) {
                    var event = {
                        part: 0,
                        complete: true,
                        answer: '',
                        metadata: {
                            event: 'kmap clicked (progressionMode = false)'
                        }
                    };

                    self.parentResource.postEvent(event);
                }

                self.beenClicked = true;
            });
        } else {
            var self = this;
            this.progressionTool = require('progressionTool').create();
            this.progressionTool.init(this.id, this.parentResource, {
                html: html,
                css: css,
                numToWin: 6,
                useMultipleParts: this.useMultipleParts,
                start: function() {
                    self.makeLevel(0);
                },
                reset: function() {
                    self.makeLevel(0);
                    self.$kmapCells.removeClass('active');
                },
                next: function(currentQuestion) {
                    self.makeLevel(currentQuestion);
                },
                isCorrect: function(currentQuestion) {
                    self.$kmapCells.removeClass('active');

                    var isAnswerCorrect = true;

                    var userAnswers = [];
                    var expectedAnswers = [];

                    // Iterate over all kmap cells
                    self.$kmapCellsContent.each(function(index) {
                        var $content = $(this);
                        var isContentSelected = $content.hasClass('selected');
                        var shouldContentBeSelected = self.$mintermIndexesDisplayed.indexOf(index) !== -1 ? true : false;

                        // If user selected content, then store user's answer
                        if (isContentSelected) {
                            userAnswers.push($content.find('.kmap-cell-minterm').text());
                        }

                        // If content was supposed to be selected, then store expected answer
                        if (shouldContentBeSelected) {
                            expectedAnswers.push($content.find('.kmap-cell-minterm').text());
                        }

                        // If user answer is not what's expected, then the answer is wrong.
                        // Otherwise, highlight the correctly selected cell
                        if (isContentSelected !== shouldContentBeSelected) {
                            isAnswerCorrect = false;

                            // If the correct content was not selected, then show the correct content with a green background
                            if (shouldContentBeSelected) {
                                $content.addClass('selected');
                                $content.parent().addClass('correct');
                                $content.find('.kmap-cell-value').css('visibility', 'visible');
                                $content.find('.kmap-cell-minterm').css('visibility', 'visible');
                            }
                        } else {
                            if (isContentSelected) {
                                $content.parent().addClass('correct');
                            }
                        }
                    });

                    // If correct, then just say so.
                    // Otherwise, show the selected cell's value and minterm
                    if (isAnswerCorrect) {
                        self.progressionTool.explanationMessage = 'Correct.';
                    } else {
                        // Show the selected cell's value and minterm
                        self.$kmapCellsContent.each(function(index) {
                            var $this = $(this);
                            if ($this.hasClass('selected')) {
                                $this.find('.kmap-cell-value').css('visibility', 'visible');
                                $this.find('.kmap-cell-minterm').css('visibility', 'visible');
                            }
                        });

                        self.progressionTool.explanationMessage = 'Solution is highlighted.';
                    }

                    self.progressionTool.userAnswer = self.stringifyArrayOfMinterms(userAnswers);
                    self.progressionTool.expectedAnswer = self.stringifyArrayOfMinterms(expectedAnswers);

                    return isAnswerCorrect;
                }
            });

            this.initializeTool();

            // Setup question queues
            var numberOfMinterms = this.mintermRow1.length + this.mintermRow2.length;
            for (var i = 0; i < numberOfMinterms; i++) {
                this.singleMintermQuestions.push(i);

                for (var j = i + 1; j < numberOfMinterms; j++) {
                    this.doubleMintermQuestions.push({ term1: i, term2: j });
                }
            }
            this.shuffleArray(this.singleMintermQuestions);
            this.shuffleArray(this.doubleMintermQuestions);

            // Setup level without interactivity
            this.makeLevel(0);
            this.$kmapCells.removeClass('active');
        }
    };

    // Used to store which indexes the user should select for the progression tool
    this.$mintermIndexesDisplayed = [];

    // Used for first 3 questions to cycle the minterm to find. The cycling prevents the same minterm back-to-back.
    this.singleMintermQuestions = [];

    // Used to keep track of location in cycling queue of |this.singleMintermQuestions|.
    this.currentSingleMintermQuestion = 0;

    // Used for latter 3 questions to cycle the minterms to find. Cycling prevents same minterm back-to-back.
    this.doubleMintermQuestions = [];

    // Used to keep track of location in cycling queue of |this.doubleMintermQuestions|.
    this.currentDoubleMintermQuestion = 0;

    // Randomize the order of the array contents
    // |array| is required and an array. Content type doesn't matter.
    this.shuffleArray = function(array) {
        var currentIndex = array.length;
        var temporaryValue;
        var randomIndex;

        // While there remain elements to shuffle
        while (currentIndex > 0) {
            // Randomly pick a remaining element
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // Swap the randomly selected element with the current index element
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
    };

    // Cache DOM objects, initialize CSS, and click listeners
    this.initializeTool = function() {
        // Cache regularly used DOM objects
        this.$kmapCells = $('#' + this.id + ' .kmap-cell');
        this.$kmapCellsContent = $('#' + this.id + ' .kmap-cell-contents');
        this.$kmapCellValues = this.$kmapCellsContent.find('.kmap-cell-value');
        this.$kmapCellMinterms = this.$kmapCellsContent.find('.kmap-cell-minterm');
        this.$mintermPrompt = $('#' + this.id + ' .minterm-prompt');

        // Apply click listener
        var self = this;
        this.$kmapCells.click(function() {
            var $this = $(this);
            if ($this.hasClass('active')) {
                self.kmapCellClicked($this);
            }
        });
    };

    // Toggle the visibility of the clicked |$kmapCell|'s contents
    // |$kmapCell| is a required jQuery object
    this.kmapCellClicked = function($kmapCell) {
        var $kmapCellContent = $kmapCell.find('.kmap-cell-contents');
        if ($kmapCellContent.hasClass('selected')) {
            $kmapCellContent.removeClass('selected');
        } else {
            $kmapCellContent.addClass('selected');
        }
    };

    // Convert an array of minterms to a string.
    // The string will seperate minterms with ' + '.
    // |mintermsToDisplay| is required. |mintermsToDisplay| is an array of strings.
    this.stringifyArrayOfMinterms = function(mintermsToDisplay) {
        var stringOfMinterms = '';
        var lastMinterm = mintermsToDisplay[mintermsToDisplay.length - 1];
        mintermsToDisplay.forEach(function(minterm) {
            stringOfMinterms += minterm;
            if (minterm !== lastMinterm) {
                stringOfMinterms += ' + ';
            }
        });
        return stringOfMinterms;
    };

    // Generate an minterm that students are to identify in the k-map.
    // Difficulty of the minterm is based on |currentQuestionNumber|. Harder has more terms in the minterm.
    // For example, a'bc is easy and a'bc + a'b'c' is harder.
    // |currentQuestionNumber| is a number.
    this.makeLevel = function(currentQuestionNumber) {
        // Reset kmap cells
        this.$kmapCells.addClass('active').removeClass('correct');
        this.$kmapCellsContent.removeClass('selected');
        this.$kmapCellValues.css('visibility', 'hidden');
        this.$kmapCellMinterms.css('visibility', 'hidden');

        // Clear array of minterms to display
        this.$mintermIndexesDisplayed.length = 0;

        // First 3 problems require the user to identify one minterm
        // The latter 3 problems require the user to identify two minterms
        if ((currentQuestionNumber >= 0) && (currentQuestionNumber <= 2)) {
            this.currentSingleMintermQuestion = (this.currentSingleMintermQuestion + 1) % this.singleMintermQuestions.length;
            var nextMinterm = this.singleMintermQuestions[this.currentSingleMintermQuestion];
            this.$mintermIndexesDisplayed.push(nextMinterm);
        } else {
            this.currentDoubleMintermQuestion = (this.currentDoubleMintermQuestion + 1) % this.doubleMintermQuestions.length;
            var nextMinterm1 = this.doubleMintermQuestions[this.currentDoubleMintermQuestion].term1;
            var nextMinterm2 = this.doubleMintermQuestions[this.currentDoubleMintermQuestion].term2;
            this.$mintermIndexesDisplayed.push(nextMinterm1);
            this.$mintermIndexesDisplayed.push(nextMinterm2);
        }

        var mintermsToDisplay = [];
        var self = this;
        this.$mintermIndexesDisplayed.forEach(function(index) {
            var minterm = self.$kmapCellsContent.eq(index).find('.kmap-cell-minterm').text();
            mintermsToDisplay.push(minterm);
        });

        this.$mintermPrompt.text(this.stringifyArrayOfMinterms(mintermsToDisplay));
    };

    // Reset hook for zyWeb to tell tool to reset itself
    this.reset = function() {
        this.progressionTool.reset();
    };

    <%= grunt.file.read(hbs_output) %>
}

var kMapExport = {
    create: function() {
        return new KMap();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = kMapExport;
