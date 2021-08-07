function arrowDiagram() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option('tool') %>';
        this.id = id;
        this.parentResource = parentResource;

        this.progressionTool = require('progressionTool').create();
        this.segmentedControlOnto = require('segmentedControl').create();
        this.segmentedControlOneToOne = require('segmentedControl').create();
        this.utilities = require('utilities');

        var checkmarkImageURL = this.utilities.getCheckmarkImageURL(parentResource);

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['arrowDiagram']({
            id:                  this.id,
            checkmarkURL:        checkmarkImageURL,
        });
        this.arrowTemplate = this[this.name]['arrow'];
        this.floorOrCeilProblemTemplate = this[this.name]['floorOrCeilProblem'];

        var self = this;
        this.progressionTool.init(this.id, this.parentResource, {
            html: html,
            css: css,
            numToWin: 6,
            useMultipleParts: true,
            start: function() {
                self.makeLevel(0);
                self.focusPart(self.$partA);
            },
            reset: function() {
                self.resetLevel();
                self.makeLevel(0);
                self.removeFocus();
            },
            next: function(currentQuestion) {
                self.utilities.disableButton(self.$undoButton);
                self.$oneToOneCheckmark.hide();
                self.$ontoCheckmark.hide();
                self.$oneToOneXMark.hide();
                self.$ontoXMark.hide();
                self.isInCheckMode = false;

                if (self.undoAddArrowStack.length > 0) {
                    self.utilities.enableButton(self.$undoButton);
                }

                if (self.userAddedArrows) {
                    self.segmentedControlOneToOne.enable();
                    self.segmentedControlOnto.enable();
                }

                if (self.userAddedArrows && self.userSelectedProperties) {
                    self.focusPart(self.$partA);
                    self.unfocusPart(self.$partB);
                    self.segmentedControlOnto.disable();
                    self.segmentedControlOneToOne.disable();
                    self.makeLevel(currentQuestion);
                    self.resetUndoButton();
                    self.segmentedControlOnto.deselectSegments();
                    self.segmentedControlOneToOne.deselectSegments();
                }
            },
            isCorrect: function(currentQuestion) {
                self.isInCheckMode = true;
                self.segmentedControlOneToOne.disable();
                self.segmentedControlOnto.disable();
                self.utilities.disableButton(self.$undoButton);
                self.explanationMessage = '';

                var userArrowIndices = self.determineArrowIndices();
                var userChoseOnto = self.segmentedControlOnto.getSelectedSegmentIndex() === 0;
                var userChoseOneToOne = self.segmentedControlOneToOne.getSelectedSegmentIndex() === 0;
                var explanationMessage = '';

                var isCorrectSoFar = self.checkAllArrowsAdded();

                if (isCorrectSoFar) {
                    isCorrectSoFar = self.checkFunctionPropertiesSelected();
                }

                if (isCorrectSoFar) {
                    self.focusPart(self.$partA);
                    self.focusPart(self.$partB);
                    self.generateExpectedArrows(self.$arrows);

                    isCorrectSoFar = self.checkArrowsAreCorrect(userArrowIndices);
                }

                if (isCorrectSoFar) {
                    isCorrectSoFar = self.checkFunctionPropertiesAreCorrect(userChoseOnto, userChoseOneToOne);
                }

                if (isCorrectSoFar) {
                    explanationMessage = 'Correct.';
                }
                else {
                    explanationMessage = self.explanationMessage;
                }

                return {
                    explanationMessage: explanationMessage,
                    userAnswer:         JSON.stringify(new Answer(userArrowIndices, userChoseOnto, userChoseOneToOne)),
                    expectedAnswer:     JSON.stringify(new Answer(self.expectedArrowIndices, self.isAnswerOnto, self.isAnswerOneToOne)),
                    isCorrect:          isCorrectSoFar
                };
            }
        });

        this.segmentedControlOnto.init(
            [ 'onto', 'not onto' ],
            'segmented-control-onto-' + this.id
        );

        this.segmentedControlOneToOne.init(
            [ 'one-to-one', 'not one-to-one' ],
            'segmented-control-one-to-one-' + this.id
        );

        var $thisTool = $('#' + this.id);

        /*
            Div that contains the function for the question.
            Ex. x + 2, or abs(x) - 4.
            Used in:
                this.makeLinearQuestion()
                this.makeAbsoluteValueQuestion()
                this.makeFloorCeilQuestio(floorOrCeil)
        */
        this.$function = $thisTool.find('.function');

        /*
            Button to remove the most recently added arrow.
            Used in:
                this.resetLevel()
                this.resetUndoButton()
                this.addUserArrow($DOMset1, $DOMset2, $DOMarrows)
        */
        this.$undoButton = $thisTool.find('.undo-button');

        /*
            Div that gets populated with all of the elements in the domain.
            Used in:
                this.focusNextDot()
                this.disableSets()
                this.elementClickEvent($DOMelement)
                this.addUserArrow($DOMset1, $DOMset2, $DOMarrows)
                this.makeLinearQuestion()
                this.makeAbsoluteValueQuestion()
        */
        this.$domain = $thisTool.find('.domain');

        /*
            Div that gets populated with all of the elements in the range.
            Used in:
                this.focusNextDot()
                this.disableSets()
                this.elementClickEvent($DOMelement)
                this.addUserArrow($DOMset1, $DOMset2, $DOMarrows)
                this.makeLinearQuestion = function()
                this.makeAbsoluteValueQuestion()
                this.makeFloorCeilQuestion(floorOrCeil)
        */
        this.$range = $thisTool.find('.range');

        /*
            Div that contains each arrow that is drawn.
            Used in:
                this.clearGraph()
                this.elementClickEvent($DOMelement)
                this.determineArrowIndices()
                this.makeLevel(currentQuestion)
        */
        this.$arrows = $thisTool.find('.arrows');

        /*
            Red x-mark used to show when the onto segmented control is incorrect.
            Used in:
                .resetLevel = function()
                next: function(currentQuestion)
                isCorrect: function(currentQuestion)
        */
        this.$ontoXMark = $thisTool.find('.onto .x-mark');

        /*
            Green checkmark used to show when the onto segmented control is correct.
            Used in:
                .resetLevel = function()
                next: function(currentQuestion)
                isCorrect: function(currentQuestion)
        */
        this.$ontoCheckmark = $thisTool.find('.onto .checkmark');

        /*
            Red x-mark used to show when the one-to-one segmented control is incorrect.
            Used in:
                .resetLevel = function()
                next: function(currentQuestion)
                isCorrect: function(currentQuestion)
        */
        this.$oneToOneXMark = $thisTool.find('.one-to-one .x-mark');

        /*
            Green checkmark used to show when the one-to-one segmented control is correct.
            Used in:
                .resetLevel = function()
                next: function(currentQuestion)
                isCorrect: function(currentQuestion)
        */
        this.$oneToOneCheckmark = $thisTool.find('.one-to-one .checkmark');

        /*
            partA is a div on the left hand side of the tool that contains the graph portion which is intended to be completed first.
            Used in:
                this.resetLevel()
                this.focusNextDot()
        */
        this.$partA = $thisTool.find('.add-arrows');

        /*
            partB is a div on the left hand side of the tool that contains the function property portion which is intended to be completed second.
            Used in:
                this.resetLevel()
                this.focusNextDot()
        */
        this.$partB = $thisTool.find('.function-properties');

        /*
            Keeps track of new arrows as they are added in case they need to be removed when the undo button is clicked.
            Used in:
                this.resetUndoButton()
                this.addUserArrow($DOMset1, $DOMset2, $DOMarrows)
                this.$undoButton.click(function())
        */
        this.undoAddArrowStack = [];

        /*
            A number to be used in a function such as "x + 5"
            Used in:
                this.makeLinearQuestion()
        */
        this.linerNumberToAdd = this.utilities.getCarousel([ 1, 2, 3, 4, 5 ]);

        /*
            Determines if the arrows go up down or straight across by offsetting the f(x) values.
            Used in:
                this.makeAbsoluteValueQuestion()
                this.makeLinearQuestion()
        */
        this.offsetCarousel = this.utilities.getCarousel([ 0, 1, 2 ]);

        /*
            The divisor in floor and ceil questions.
            Used in:
                this.makeFloorCeilQuestion(floorOrCeil)
        */
        this.numberFloorCeilDivisorCarousel = this.utilities.getCarousel([2, 3, 4]);

        /*
            The number added to the numerator in ceil and absolute value questions.
            Used in:
                this.makeFloorCeilQuestion(floorOrCeil)
                this.makeAbsoluteValueQuestion()
        */
        this.specialNumberToAdd = this.utilities.getCarousel([ -2, -1, 1, 2 ]);

        /*
            Explanation provided if one-to-one segmented control is incorrect
            Used in:
                this.makeLinearQuestion()
                this.makeAbsoluteValueQuestion()
                isCorrect: function(currentQuestion)
                this.makeFloorCeilQuestion(floorOrCeil)
        */
        this.OneToOneExplanation = '';

        /*
            Explanation provided if onto segmented control is incorrect
            Used in:
                this.makeLinearQuestion()
                this.makeAbsoluteValueQuestion()
                isCorrect: function(currentQuestion)
                this.makeFloorCeilQuestion(floorOrCeil)

        */
        this.OntoExplanation = '';

        this.isInCheckMode = false;

        this.$undoButton.click(function() {
            var lastAddedArrow = self.undoAddArrowStack.pop();
            lastAddedArrow.remove();
            if (self.undoAddArrowStack.length === 0) {
                self.utilities.disableButton($(this));
            }
            self.focusNextDot();
            self.focusPart(self.$partA);
            self.unfocusPart(self.$partB);
            self.segmentedControlOneToOne.disable();
            self.segmentedControlOnto.disable();

        });

        this.resetLevel();
        this.makeLevel(0);
        self.removeFocus();
    };

    this.checkAllArrowsAdded = function() {
        var noElementsHighlighted = ($('#' + this.id + ' .highlighted-element').length === 0);

        if (!noElementsHighlighted) {
            this.userAddedArrows = false;
            this.explanationMessage = 'Complete A then B.';
        }
        else {
            this.userAddedArrows = true;
        }

        return noElementsHighlighted;
    };
    this.checkFunctionPropertiesSelected = function() {
        var segmentedControlsSelected = ((this.segmentedControlOnto.getSelectedSegmentIndex() !== null) && (this.segmentedControlOneToOne.getSelectedSegmentIndex() !== null));

        if (!segmentedControlsSelected) {
            this.userSelectedProperties = false;
            this.explanationMessage = 'Complete B.';
        }
        else {
            this.userSelectedProperties = true;
        }

        return segmentedControlsSelected;
    };

    this.checkArrowsAreCorrect = function(userArrowIndices) {
        var areArrowsCorrect = true;
        var arrowsIncorrectMessage = 'See arrows above. Dashed arrow is a corrected answer.';

        this.expectedArrowIndices.forEach(function(expectedArrowIndexPair, index) {
            if ((expectedArrowIndexPair[0] !== userArrowIndices[index][0]) || (expectedArrowIndexPair[1] !== userArrowIndices[index][1])) {
                areArrowsCorrect = false;
                this.explanationMessage = arrowsIncorrectMessage;
            }
        });

        if (!areArrowsCorrect) {
            this.explanationMessage = arrowsIncorrectMessage;
        }

        return areArrowsCorrect;
    };

    this.checkFunctionPropertiesAreCorrect = function(userChoseOnto, userChoseOneToOne) {
        var areFunctionPropertiesCorrect = true;

        if (userChoseOnto !== this.isAnswerOnto) {
            this.$ontoXMark.show();
            this.explanationMessage += '  ' + this.OntoExplanation;
            areFunctionPropertiesCorrect = false;
        }
        else {
            this.$ontoCheckmark.show();
        }
        if (userChoseOneToOne !== this.isAnswerOneToOne) {
            this.$oneToOneXMark.show();
            this.explanationMessage += '  ' + this.OneToOneExplanation;
            areFunctionPropertiesCorrect = false;
        }
        else {
            this.$oneToOneCheckmark.show();
        }

        return areFunctionPropertiesCorrect;
    };

    /*
        Sets all elements (graph, segment contols, parts) to their default state.
    */
    this.resetLevel = function() {
        this.clearGraph();
        this.resetUndoButton();
        this.segmentedControlOneToOne.deselectSegments();
        this.segmentedControlOnto.deselectSegments();
        this.segmentedControlOneToOne.disable();
        this.segmentedControlOnto.disable();
        this.utilities.disableButton(this.$undoButton);
        this.$ontoXMark.hide();
        this.$ontoCheckmark.hide();
        this.$oneToOneXMark.hide();
        this.$oneToOneCheckmark.hide();
        this.$partA.css('opacity', 0.5);
        this.$partB.css('opacity', 0.5);
    };

    /*
        Disables the undo button and clears the undo stack
    */
    this.resetUndoButton = function() {
        this.undoAddArrowStack = [];
        this.utilities.disableButton(this.$undoButton);
    };

    /*
        Sets all highlighted elemens and focused sets to default state
    */
    this.removeFocus = function() {
        $('#' + this.id + ' .highlighted-element').removeClass('highlighted-element');
        $('#' + this.id + ' .focused').addClass('disabled');
        $('#' + this.id + ' .focused').removeClass('focused');
    };

    /*
        Focuses and enables |$DOMset|
        |$DOMset| is required and a jquery div
    */
    this.focusAndEnable = function($DOMset) {
        $DOMset.addClass('focused');
        $DOMset.removeClass('disabled');
    };

    /*
        Unfocuses |$DOMset|
        |$DOMset| is required and a jquery div
    */
    this.unfocusSet = function($DOMset) {
        $DOMset.removeClass('focused');
    };

    /*
        Highlights |$DOMelement|
        |$DOMelement| is required and a jquery div
    */
    this.highlight = function($DOMelement) {
        $DOMelement.addClass('highlighted-element');
    };

    /*
       Fades |part| to full opactity.
       |part| is required and a div.
    */
    this.focusPart = function(part) {
        part[0].style.transition = ' opacity 0.5s linear';
        part[0].style.opacity = '1';
    };

    /*
       Fades |part| to half opactity.
       |part| is required and a div.
    */
    this.unfocusPart = function(part) {
        part[0].style.transition = ' opacity 0.5s linear';
        part[0].style.opacity = '.5';
    };

    /*
        Circles the next element in x.
    */
    this.focusNextDot = function() {
        var numberOfHiddenElements = $('#' + this.id + ' .hidden-element').length;
        var numberOfDomainElements = this.$domain.children().length - numberOfHiddenElements;

        var existingArrowIndexPairs = this.determineArrowIndices();
        var elementToVisit = existingArrowIndexPairs.length;

        if (elementToVisit < numberOfDomainElements) {
            this.$domain.addClass('disabled');
            $DOMelement = $(this.$domain.children()[elementToVisit + numberOfHiddenElements]);
            this.$domain.children().removeClass('highlighted-element');
            this.focusAndEnable(this.$range);
            this.highlight($DOMelement);
        }
        else {
            this.unfocusPart(this.$partA);
            this.focusPart(this.$partB);
            this.segmentedControlOnto.enable();
            this.segmentedControlOneToOne.enable();
        }
    };

    /*
        Disables the domain and range sets so the elements are no longer clickable
    */
    this.disableSets = function() {
        this.$domain.addClass('disabled');
        this.$range.addClass('disabled');
    };

    /*
        Removes all elements from |$DOMset|
        |$DOMset| is required and a jquery div
    */
    this.clearDOMset = function($DOMset) {
        $DOMset.html('');
    };

    /*
        Removes all arrows from the graph
    */
    this.clearGraph = function() {
        this.$arrows.children().remove();
    };

    /*
        Manages the state of the elements in both sets during the add arrow process.
        |$DOMelement| is a div and is required.
    */
    this.elementClickEvent = function($DOMelement) {
        var $DOMset = $DOMelement.parent();
        if ($DOMset.hasClass('disabled') || this.isInCheckMode) {
            return;
        }

        this.unfocusSet($DOMset);

        this.highlight($DOMelement);
        this.addUserArrow(this.$domain, this.$range, this.$arrows);
        this.focusNextDot();
    };

    /*
        Iterates through the children of |$DOMset| and returns the index of the child
        that has the highlighted class.
        |$DOMset| is required and is a div.
    */
    this.findLastHighlightedElementIndex = function($DOMset) {
        var highlightedElementIndex;
        $DOMset.children().each(function(index, element) {
            if ($(element).hasClass('highlighted-element')) {
                highlightedElementIndex = index;
            }
        });
        return highlightedElementIndex;
    };

    /*
        Creates the basic div structure for an arrow.
    */
    this.generateArrow = function($DOMarrows, element1Index, element2Index) {
        $DOMarrows.append(this.arrowTemplate());
        var $lastAddedArrow = this.getLastArrow($DOMarrows);
        this.styleArrow($lastAddedArrow, element1Index, element2Index);

        return $lastAddedArrow;
    };

    /*
        Determines if the arrow points up, down, or straight and by how much.
        |element1Index| is required and a integer.
        |element2Index| is required and a integer.
    */
    this.determineDirectionClass = function(element1Index, element2Index) {
        var directionClass = '';

        if (element1Index === element2Index) {
            directionClass = 'straight-arrow';
        }
        else if (element1Index > element2Index) {
            var distance = element1Index - element2Index;
            directionClass = 'arrow-up-' + distance;
        }
        else {
            var distance = element2Index - element1Index;
            directionClass = 'arrow-down-' + distance;
        }

        return directionClass;
    };

    /*
        Adds classes to |$arrow| to make it point from |element1Index| to |element2Index|.
        |$arrow| is required and a div.
        |element1Index| is required and an integer.
        |element2Index| is required and an integer.
    */
    this.styleArrow = function($arrow, element1Index, element2Index) {
        $arrow.addClass('arrow-from-' + element1Index);
        var directionClass = this.determineDirectionClass(element1Index, element2Index);
        $arrow.addClass(directionClass);
    };

    this.getLastArrow = function($DOMarrows) {
        return $DOMarrows.children().last();
    };

    /*
        Draws an arrow from |$DOMset1| to |$DOMset2| and appends it to |$DOMarrows|.
        |$DOMset1| is required and a div.
        |$DOMset2| is required and a div.
        |$DOMarrows| is required and a div.
    */
    this.addUserArrow = function($DOMset1, $DOMset2, $DOMarrows) {
        var element1Index = this.findLastHighlightedElementIndex($DOMset1);
        var element2Index = this.findLastHighlightedElementIndex($DOMset2);

        var $arrow = this.generateArrow($DOMarrows, element1Index, element2Index);
        this.undoAddArrowStack.push($arrow);
        this.utilities.enableButton(this.$undoButton);

        this.$domain.children().removeClass('highlighted-element');
        this.$range.children().removeClass('highlighted-element');
        this.disableSets();
    };

    /*
        Iterates through the array |this.expectedArrowIndices| and draws an arrow between each pair of
        elements in the array and appends the arrows to |$DOMarrows|.
        |$DOMarrows| is required and an array.
    */
    this.generateExpectedArrows = function($DOMarrows) {
        var DOMIndexPairs = $DOMarrows.children().map(function(index, arrow) {
            var index1;
            var index2;

            arrow.className.split(' ').forEach(function(classname, index) {
                if (classname.indexOf('arrow-from') > -1) {
                    index1 = parseInt(classname.charAt(classname.length - 1));
                }
                if (classname.indexOf('arrow-up') > -1) {
                    distance = parseInt(classname.charAt(classname.length - 1));
                    index2 = index1 - distance;
                }
                if (classname.indexOf('arrow-down') > -1) {
                    distance = parseInt(classname.charAt(classname.length - 1));
                    index2 = index1 + distance;
                }
                if (classname.indexOf('straight-arrow') > -1) {
                    index2 = index1;
                }
            });

            return [ [ index1, index2 ] ];
        });

        var self = this;
        this.expectedArrowIndices.forEach(function(elementIndexPair, index) {
            if (elementIndexPair[1] === DOMIndexPairs[index][1]) {
                $DOMarrows.children().eq(index).addClass('user-correct-arrow');
            }
            else {
                $DOMarrows.children().eq(index).addClass('user-incorrect-arrow');
                var $arrow = self.generateArrow($DOMarrows, elementIndexPair[0], elementIndexPair[1]);
                $arrow.addClass('expected-arrow');
            }
        });
    };

    /*
        Iterates throught the children of |this.$arrows| and creates an array of the index pairs
        for each child arrow.
    */
    this.determineArrowIndices = function() {
        var arrowIndices = [];
        this.$arrows.children().each(function(index, arrow) {
            var arrowClasses = arrow.className.split(' ');
            var index1 = parseInt(arrowClasses[1].slice(-1));
            var distance = parseInt(arrowClasses[2].slice(-1));
            var direction = arrowClasses[2].slice(6);

            var index2;
            if (direction[0] === 'u') {
                index2 = index1 - distance;
            }
            else if (direction[0] === 'd') {
                index2 = index1 + distance;
            }
            else {
                index2 = index1;
            }
            if (!$(arrow).hasClass('expected-arrow')) {
                arrowIndices.push([ index1, index2 ]);
            }
        });

        arrowIndices.sort();

        return arrowIndices;
    };

    /*
       Draws an arrow for all index pairs in |arrowIndexPairs| except the last one and appends
       it to |$DOMarrows|.
       |arrowIndexPairs| is required and an array of arrays.
       |$DOMarrows| is required and a div.
    */
    this.drawPartialGraph = function(arrowIndexPairs, $DOMarrows) {
        for (var i = 0; i < arrowIndexPairs.length - 1; i++) {
            var element1Index = arrowIndexPairs[i][0];
            var element2Index = arrowIndexPairs[i][1];

            var $arrow = this.generateArrow($DOMarrows, element1Index, element2Index);
            $arrow.addClass('disabled');

            $DOMarrows.append($arrow);
        }
    };

    /*
        Creates a |$DOMelement| for each element in |elements| and adds it into |$DOMset|.
        |$DOMset| is required and a div.
        |elements| is required and an array of integers.
        |labelOnRight| is optional and a bool.
        |hiddenElement| is optional and a bool.
    */
    this.populateSet = function($DOMset, elements, labelOnRight, hiddenElement) {
        this.clearDOMset($DOMset);

        if (hiddenElement) {
            var $DOMelement = $('<div>');
            $DOMelement.addClass('element');
            $DOMelement.addClass('hidden-element');
            $DOMset.addClass('has-hidden-element');
            $DOMset.append($DOMelement);
        }
        else {
            $DOMset.removeClass('has-hidden-element');
        }

        var self = this;
        elements.forEach(function(element) {
            var $DOMelement = $('<div>');
            var $label = $('<div>');
            var $point = $('<div>');

            $DOMelement.addClass('element');

            $label.html(element);
            $label.addClass('label');

            $point.addClass('point');

            if (labelOnRight) {
                $DOMelement.append($point);
                $DOMelement.append($label);
            }
            else {
                $DOMelement.append($label);
                $DOMelement.append($point);
            }

            $DOMelement.click(function() {
                self.elementClickEvent($(this));
            });

            $DOMset.append($DOMelement);
        });
    };

    /*
        Fills |$DOMset1| with elements from |elements1| and fills |$DOMset2| with elements from |elements2|
        |$DOM1set| is required and a div.
        |elements1| is required and an array of integers.
        |$DOM2set| is required and a div.
        |elements2| is required and an array of integers.
        |hiddenElement| is optional and a bool.
    */
    this.populateSets = function($DOMset1, elements1, $DOMset2, elements2, hiddenElement) {
        var labelOnRight = false;
        this.populateSet($DOMset1, elements1, labelOnRight, hiddenElement);

        labelOnRight = true;
        this.populateSet($DOMset2, elements2, labelOnRight);

        this.disableSets();
    };

    /*
        Generates two sets, the first starts at a randomly generated number and contains 4
        elements each 1 larger than the previous.  The second set contains 6 elements and
        is generated based on the first set, |sign|, |number|, and |offset|.
        |sign| is required and a string that is either '+ ' or '- '.
        |number| is required and an integer.
        |offset| is required and an integer.
    */
    this.generateTwoSets = function(sign, number, offset) {
        var set1 = [];
        var startSet1 = this.utilities.pickNumberInRange(-2, 2);

        for (var i = 0; i < 4; i++) {
            set1.push(i + startSet1);
        }

        if (sign === '- ') {
            number *= -1;
        }

        var set2 = [];
        for (var i = 0; i < 6; i++) {
            set2.push(i + startSet1 + number - offset);
        }

        return [ set1, set2 ];
    };

    /*
        Generates a function (ex. x + 1) then generates 2 sets and returns an array of index
        pairs that map the first set onto the second set based on the function.
    */
    this.makeLinearQuestion = function() {
        var sign = this.utilities.flipCoin() ? '+ ' : '- ';
        var number = this.linerNumberToAdd.getValue();

        this.$function.html(' x ' + sign + number);

        var offset = this.offsetCarousel.getValue();

        var sets = this.generateTwoSets(sign, number, offset);
        var set1 = sets[0];
        var set2 = sets[1];

        var hiddenSet = true;
        this.populateSets(this.$domain, set1, this.$range, set2, hiddenSet);

        offset--;
        var result = set1.map(function(element, index) {
            return [ (index + 1), (index + 1 + offset) ];
        });

        this.isAnswerOnto = true;
        this.isAnswerOneToOne = true;

        this.OneToOneExplanation = 'f(x) is one-to-one: If x ≠ y, then x ' + sign + number + ' ≠ y ' + sign + number + '.'; +this.utilities.getNewline();
        this.OntoExplanation = 'f(x) is onto: For every y, there is an integer x such that x ' + sign + number + ' = y.' + this.utilities.getNewline();

        return result;
    };

    /*
        Finds a value that can never be reached with the function f(x) = abs(x) +/- |number|.
        |sign| is required and a string.
        |number| is required and an integer.
    */
    this.findAbsoluteValueContradictionElements = function(sign, number) {
        var contradictionElement;

        // If |sign| is positive then f(x) = abs(x) + |number| will always be a positive number so f(x) can never be 0.
        // Ex. if |number| = 2 then f(0) = 0 + 2 = 2, f(-1) = 1 + 2 = 3, f(-2) = 2 + 2 = 4, but no value of x will ever equal '0'
        if (sign === '+ ') {
            contradictionElement = 0;
        }
        // If |sign| is negative then f(x) = abs(x) - |number| will never reach a number larger than -(number + 1).
        // Ex. if |number| = 2 then f(0) = 0 - 2 = -2, f(-1) = 1 - 2 = -1, f(-2) = 2 - 2 = 0, but no value of x will ever equal '-3'
        else if (sign === '- ') {
            contradictionElement = (number + 1) * -1;
        }

        return contradictionElement;
    };

    /*
        Generates 2 sets where the first is a list of numbers from -2 to 2 and the second is a
        set that ensures each value in |set1| maps to an element in |set2| based on the function
        f(x) = abs(x) +/- |number| where +/- is determined by |sign|.
        |number| is required and a string.
        |sign| is required and a string that is either '+ ' or '- '.
    */
    this.generateSetsForAbsoluteValueFunction = function(contradictionElement) {
        var set1 = [ -2, -1, 0, 1, 2 ];

        var set2 = [];

        for (var i = 0; i < 5; i++) {
            set2.push(i + contradictionElement);
        }

        return [ set1, set2 ];
    };

    /*
        Generates an absolute value function (ex. f(x) = |x| + 2) and generates 2 sets then
        returns an array of index pairs that map the 2 sets together based on the function.
    */
    this.makeAbsoluteValueQuestion = function() {
        var number = this.specialNumberToAdd.getValue();
        var sign = (number > 0) ? '+ ' : '- ';

        number = Math.abs(number);

        var contradictionElement = this.findAbsoluteValueContradictionElements(sign, number);

        this.$function.html(' |x| ' + sign + number);

        var sets = this.generateSetsForAbsoluteValueFunction(contradictionElement);
        var set1 = sets[0];
        var set2 = sets[1];
        this.populateSets(this.$domain, set1, this.$range, set2);

        var result = set1.map(function(element, set1Index) {
            var set2Index;
            if (sign === '+ ') {
                set2Index = set2.indexOf(Math.abs(element) + number);
            }
            else if (sign === '- ') {
                set2Index = set2.indexOf(Math.abs(element) - number);
            }
            return [ set1Index, set2Index ];
        }).filter(function(element) {
            return element[1] !== -1;
        });

        this.isAnswerOnto = false;
        this.isAnswerOneToOne = false;

        var fOfTwo = (sign === '+ ') ? Math.abs(2) + number : Math.abs(2) - number;

        this.OneToOneExplanation = 'f(x) is not one-to-one: f(-2) = f(2) = ' + fOfTwo + '.' + this.utilities.getNewline();
        this.OntoExplanation = 'f(x) is not onto: There is no value of x such that f(x) maps to ' + contradictionElement + this.utilities.getNewline();

        return result;
    };

    /*
        Iterates through a set and removes a duplicates.
        |set| is required an an array.
    */
    this.removeDuplicates = function(set) {
        var uniqueElements = [];

        for (var i = 0; i < set.length; i++) {
            if (uniqueElements.indexOf(set[i]) === -1) {
                uniqueElements.push(set[i]);
            }
        }

        return uniqueElements;
    };

    /*
        Adds extra elements to |set| until the length of |set| is |newSize|.
        |set| is requires and an array.
    */
    this.padSet = function(set, newSize) {
        var currentSize = set.length;

        var addToEnd = this.utilities.flipCoin();

        for (var i = 0; (i < newSize - currentSize); i++) {
            if (addToEnd) {
                var lastVal = set[set.length - 1];
                var newVal = lastVal + 1;
                set.push(newVal);
            }
            else {
                var firstVal = set[0];
                var newVal = firstVal - 1;
                set.unshift(newVal);
            }
        }

        return set;
    };

    /*
        Generates two sets to be used in a Floor or Ceiling question.
        |divisior| is required and a number.
        |adder| is required and a number.
        |floorOrCeil| is required and a boolean.
    */
    this.generateFloorCeilSets = function(divisor, adder, floorOrCeil) {
        var set1 = [];
        var set2 = [];
        var startSet1 = this.utilities.pickNumberInRange(0, 8);

        if (divisor == 4) {
            if (floorOrCeil == 'floor') {
                startSet1 = 3;
            }
            else if (floorOrCeil == 'ceil') {
                startSet1 = 4;
            }
        }

        for (var i = 0; i < 6; i++) {
            set1.push(i + startSet1);
            if (floorOrCeil === 'floor') {
                set2.push(Math.floor((i + startSet1) / divisor));
            }
            else if (floorOrCeil === 'ceil') {
                set2.push(Math.ceil((i + startSet1 + adder) / divisor));
            }
        }

        set2 = this.removeDuplicates(set2);
        set2 = this.padSet(set2, 6);
        
        return [set1, set2];
    }

    /*
        Finds 2 elements in |set| such that the floor of both elements or the ceil of both elements are the same value.
        |set| is required and an array.
        |divisor| is required and a number.
        |adder| is required and a number.
        |floorOrCeil| is required and a boolean.
    */
    this.findFloorOrCeilContradictionElements = function(set, divisor, adder, floorOrCeil) {
        var contradictionElement1 = set[0];
        var contradictionElement2;
        set.forEach(function(currentElement) {
            if (floorOrCeil === 'floor') {
                if ((Math.floor(contradictionElement1 / divisor) === Math.floor(currentElement / divisor)) && (contradictionElement1 !== currentElement)) {
                    contradictionElement2 = currentElement;
                }
                else if (isNaN(contradictionElement2)) {
                    contradictionElement1 = currentElement;
                }
            }
            else if (floorOrCeil === 'ceil') {
                if ((Math.ceil((contradictionElement1 + adder) / divisor) === Math.ceil((currentElement + adder) / divisor)) && (contradictionElement1 !== currentElement)) {
                    contradictionElement2 = currentElement;
                }
                else if (isNaN(contradictionElement2)) {
                    contradictionElement1 = currentElement;
                }
            }
        });

        return [ contradictionElement1, contradictionElement2 ];
    };

    /*
        Generates a Floor or Ceiling Question.
        |floorOrCeil| is required and a boolean.
    */
    this.makeFloorCeilQuestion = function(floorOrCeil) {
        var divisor = this.numberFloorCeilDivisorCarousel.getValue();
        var adder = this.specialNumberToAdd.getValue();
        adderString = ' + ' + adder;
        if (adder < 0) {
            adderString = ' - ' + (adder * -1);
        }

        var sets = [];

        if (floorOrCeil === 'floor') {
            this.$function.html(this.floorOrCeilProblemTemplate({
                floorOrCeil: 'floor',
                numerator:   'x',
                denominator: divisor
            }));
            sets = this.generateFloorCeilSets(divisor, adder, 'floor');
        }
        else if (floorOrCeil === 'ceil') {
            this.$function.html(this.floorOrCeilProblemTemplate({
                floorOrCeil: 'ceil',
                numerator:   'x' + adderString,
                denominator: divisor
            }));
            sets = this.generateFloorCeilSets(divisor, adder, 'ceil');
        }

        var set1 = sets[0];
        var set2 = sets[1];
        this.populateSets(this.$domain, set1, this.$range, set2);

        var result = set1.map(function(element, set1Index) {
            var set2Index;
            if (floorOrCeil === 'floor') {
                set2Index = set2.indexOf(Math.floor(element / divisor));
            }
            else if (floorOrCeil === 'ceil') {
                set2Index = set2.indexOf(Math.ceil((element + adder) / divisor));
            }

            return [ set1Index, set2Index ];
        }).filter(function(element) {
            return element[1] !== -1;
        });

        this.isAnswerOnto = true;
        this.isAnswerOneToOne = false;

        var contradictionElements = this.findFloorOrCeilContradictionElements(set1, divisor, adder, floorOrCeil);
        var fOfContradictionElements = (floorOrCeil === 'floor') ? Math.floor(contradictionElements[0] / divisor) : Math.ceil((contradictionElements[0] + adder) / divisor);

        this.OneToOneExplanation = 'f(x) is not one-to-one: f(' + contradictionElements[0] + ') = f(' + contradictionElements[1] + ') = ' + fOfContradictionElements + '.' + this.utilities.getNewline();
        this.OntoExplanation = 'f(x) is onto: For every y, there is an x such that f(x)=y.' + this.utilities.getNewline();

        return result;
    };


    this.makeLevel = function(currentQuestion) {
        var result;
        this.clearGraph();

        switch(currentQuestion) {
            case 0:
                result = this.makeLinearQuestion();
                this.focusNextDot();
                break;
            case 1:
                result = this.makeLinearQuestion();
                this.focusNextDot();
                break;
            case 2:
                result = this.makeAbsoluteValueQuestion();
                this.focusNextDot();
                break;
            case 3:
                result = this.makeAbsoluteValueQuestion();
                this.focusNextDot();
                break;
            case 4:
                $(".arrowDiagram .buttons")[0].style.top = "566px";
                result = this.makeFloorCeilQuestion('floor');
                this.focusNextDot();
                break;
            case 5:
                result = this.makeFloorCeilQuestion('ceil');
                this.focusNextDot();
                break;
        }

        this.expectedArrowIndices = result;
    };

    this.reset = function() {
        this.progressionTool.reset();
    };

    <%= grunt.file.read(hbs_output) %>
}

var arrowDiagramExport = {
    create: function() {
        return new arrowDiagram();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = arrowDiagramExport;
