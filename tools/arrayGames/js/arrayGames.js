function ArrayGames() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        var css = '<style><%= grunt.file.read(css_filename) %></style>';

        this.utilities = require('utilities');

        this.numElementsInArray = 7;
        this.elementsInArrayIndex = [];
        for (var i = 0; i < this.numElementsInArray; i++) {
            this.elementsInArrayIndex.push(i + 1);
        }
        this.previousWindow2DArray = [];
        for (var i = 0; i < (this.numElementsInArray + 1); i++) { // +1 for showing initial array
            this.previousWindow2DArray.push(this.elementsInArrayIndex);
        }

        var html = this[this.name]['arrayGames']({ id: this.id, elementsInArrayIndex: this.elementsInArrayIndex, previousWindow2DArray: this.previousWindow2DArray });
        $('#' + this.id).html(css + html);

        var self = this;
        $('#' + this.id).click(function() {
            if (!self.beenClicked) {
                var event = {
                    part: 0,
                    complete: true,
                    answer: 'arrayGames tool',
                    metadata: {
                        event: 'arrayGames tool clicked'
                    }
                };

                parentResource.postEvent(event);
            }

            self.beenClicked = true;
        });

        this.$tool = $('#' + this.id);
        this.$resetConfirmContainer = this.$tool.find('.zyante-array-games-reset-confirm-container');
        this.$cancelResetButton = this.$tool.find('.zyante-array-games-cancel-reset-button');
        this.$confirmResetButton = this.$tool.find('.zyante-array-games-confirm-reset-button');
        this.$modalCover = this.$tool.find('.zyante-array-games-modal-cover');
        this.$startButton = $('#start-button-' + this.id);
        this.$resetButton = $('#reset-button-' + this.id);
        this.$nextButton = $('#next-button-' + this.id);
        this.$actionButton = $('#action-button-' + this.id);
        this.$clearButton = $('#clear-time-button-' + this.id);
        this.$feedback = $('#' + this.id + ' .feedback');

        this.$resetButton.hide();
        this.$resetConfirmContainer.hide();

        var $prevWindows = $('#prevWindows_' + this.id);
        $prevWindows.hide().css('visibility', 'hidden');
        $prevWindows.find('tr').css('visibility', 'hidden');
        this.$feedback.hide();

        this.type = 'maxVal'; // default
        if (options && options['type']) { // an option has been passed
            var supportedTypes = [ 'maxVal', 'negValCntr', 'sortLarge', 'swapSort', 'quicksort' ];
            for(var i = 0; i < supportedTypes.length; i++) { // if a valid option was passed, then use it
                if (options['type'] === supportedTypes[i]) {
                    this.type = options['type'];
                    break;
                }
            }
        }

        if (this.type === 'maxVal') {
            this.$actionButton.text('Store value');
            $(`#showVal_${this.id}`).text('');
            $(`#showValLabel_${this.id}`).text('max');
            $('#' + this.id + ' .show-sorted').hide();
        }
        else if (this.type === 'negValCntr') {
            this.$actionButton.text('Increment');
            $('#showVal_' + this.id).text('0');
            $('#showValLabel_' + this.id).text('Counter');
            this.didIncOnElement = [ false, false, false, false, false, false, false ];
            $('#' + this.id + ' .show-sorted').hide();
        }
        else if (this.type === 'sortLarge') {
            this.$actionButton.text('Swap values');
            $('#showVal_' + this.id).text('');
            $('#showValLabel_' + this.id).text('');
            $('#' + this.id + ' .show-sorted').hide();
        }
        else if (this.type === 'swapSort') {
            this.$feedback.parent().addClass('feedback-area');
            this.checkmarkImageURL = this.utilities.getCheckmarkImageURL(parentResource);
            $('#' + this.id + ' .show-sorted').html('<img src="' + this.checkmarkImageURL + '">Sorted');
            $('#' + this.id + ' .show-sorted').hide();
            this.$actionButton.text('Swap');
            $('#showVal_' + this.id).text('');
            $('#showValLabel_' + this.id).text('');
            $('#next-button-' + this.id).hide();
            $('#' + this.id + ' .array-element').click(function(e) {
                self.elementClick(e);
            });
            this.highlightQueue = [];
        }
        else if (this.type === 'quicksort') {
            this.$feedback.parent().addClass('feedback-area');
            this.checkmarkImageURL = this.utilities.getCheckmarkImageURL(parentResource);
            $('#' + this.id + ' .show-sorted').html('<img src="' + this.checkmarkImageURL + '">Sorted');
            $('#' + this.id + ' .show-sorted').hide();
            $('#prevWindows_' + this.id).show();
            $('#next-button-' + this.id).text('Partition');
            this.$actionButton.text('Back');
            $('#showVal_' + this.id).text('XX').css('visibility', 'hidden');
            $('#showValLabel_' + this.id).text('Pivot value:').css('visibility', 'hidden');
            $('#' + this.id + ' .array-element').click(function(e) {
                self.elementClick(e);
            });
            this.qsPartitionStart = 0;
            this.qsPartitionEnd = 6;
            this.qsCurrWindowRow = 0;
            this.qsPartitionStack = [];
            this.qsPadding = 0;
            this.qsSnapshot = [];
            this.qsDS = []; // data structure to print quicksort previous windows
            /* An example of how the data structure looks initially
                [ // row in previous windows, a.k.a. recursive depth
                    [ // groups per row
                        [46, 93, 91, 80, 68, 39, 12] // elements per group
                    ]
                ]
            */
            /* One partition later
                [
                    [
                        [46, 93, 91, 80, 68, 39, 12]
                    ],
                    [
                        [46, 68, 39, 12], [93, 91, 80] // elements less than 80 in left-most group; rest of elements in right-most group
                    ],
                ]
            */
        }

        var self = this;
        this.$startButton.click(function() {
            self.startButtonClick();
        });
        this.$resetButton.click(function() {
            self.resetButtonClick();
        });
        this.$nextButton.click(function() {
            self.nextButtonClick();
        });
        this.$actionButton.click(function() {
            self.actionButtonClick();
        });
        this.$clearButton.click(function() {
            self.clearButtonClick();
            this.blur();
        });
        this.$cancelResetButton.click(function() {
            self.cancelResetButtonClick();
        });
        this.$confirmResetButton.click(function() {
            self.confirmResetButtonClick();
        });
    };

    /// ////////////////////////////////// Interface functions ///////////////////////////////

    this.startButtonClick = function() {
        this.$startButton.hide();
        this.$resetButton.show();
        this.utilities.enableButton(this.$nextButton);
        this.utilities.enableButton(this.$actionButton);

        this.startTimer();

        if (this.type === 'maxVal') {
            $('#element1_' + this.id).addClass('array-element-is-active');
            $(`#${this.id} .array-element`).each((index, element) => {
                const randNum = Math.floor(Math.random() * 100);

                if (index === 0) {
                    $(`#showVal_${this.id}`).addClass('value-border');
                }
                $(element).text(randNum);
            });
        }
        else if (this.type === 'negValCntr') {
            $('#element1_' + this.id).addClass('array-element-is-active');
            $('#' + this.id + ' .array-element').each(function() {
                var randNum = Math.floor(Math.random() * 100) - 50;
                $(this).text(randNum);
            });
            this.didIncOnElement = [ false, false, false, false, false, false, false ];
        }
        else if (this.type === 'sortLarge') {
            $('#element1_' + this.id).addClass('array-element-is-active');
            $('#element2_' + this.id).addClass('array-element-is-active').addClass('highlighted');
            $('#' + this.id + ' .array-element').each(function() {
                var randNum = Math.floor(Math.random() * 100);
                $(this).text(randNum);
            });
        }
        else if (this.type === 'swapSort') {
            this.highlightQueue.length = 0;
            $('#showValLabel_' + this.id).text('Unsorted');
            $('#' + this.id + ' .array-element').each(function() {
                var $this = $(this);
                var randNum = Math.floor(Math.random() * 100);
                $this.text(randNum);
                $this.addClass('array-element-is-active').addClass('clickable');
            }).addClass('array-element-is-active');
        }
        else if (this.type === 'quicksort') {
            this.qsDS.length = 0;
            this.qsDS[0] = [];
            this.qsPartitionStack.length = 0;
            this.qsPartitionStart = 0;
            this.qsPartitionEnd = 6;
            this.qsPadding = 0;
            this.qsCurrWindowRow = 0;
            this.qsSnapshot.length = 0;

            var $elems = $('#' + this.id + ' .array-element');
            var randNumArray = [];
            $elems.each(function(i) {
                var randNum = Math.floor(Math.random() * 100);
                randNumArray.push(randNum);
                $(this).text(randNum);
            });
            $elems.addClass('array-element-is-active').addClass('clickable');

            this.qsDS[0].push(randNumArray);
            this.qsDrawPreviousWindows();

            this.utilities.disableButton(this.$actionButton);
            $('#showValLabel_' + this.id).text('Pivot value:').css('visibility', 'visible');
            $('#showVal_' + this.id).css('visibility', 'visible').text($elems.eq(3).text());
        }
    };

    this.hideResetConfirmModal = function() {
        this.$modalCover.removeClass('active-cover');
        this.$resetConfirmContainer.hide();
        this.$tool.unbind('mousedown');
    };

    this.cancelResetButtonClick = function() {
        this.hideResetConfirmModal();
        this.$resetButton.show();
    };

    this.confirmResetButtonClick = function() {
        this.reset();
    };

    this.displayResetConfirmModal = function() {
        this.$modalCover.addClass('active-cover');
        this.$startButton.hide();
        this.$resetButton.hide();
        this.$resetConfirmContainer.show();
        this.$cancelResetButton.focus();

        var self = this;
        this.$tool.mousedown(function(event) {
            // Cancel reset unless confirm reset is clicked
            if (!$(event.target).hasClass('zyante-array-games-confirm-reset-button')) {
                self.cancelResetButtonClick();
            }
        });
    };

    this.resetButtonClick = function() {
        this.displayResetConfirmModal();
    };

    this.nextButtonClick = function() {
        if (!this.$nextButton.hasClass('disabled')) {
            var allDone = false;
            if (this.type === 'maxVal') {
                var foundCurrShown = false;
                allDone = true;
                $('#' + this.id + ' .array-element').each(function() {
                    if ($(this).hasClass('array-element-is-active')) {
                        $(this).removeClass('array-element-is-active');
                        foundCurrShown = true;
                    }
                    else if (foundCurrShown) {
                        $(this).addClass('array-element-is-active');
                        allDone = false;
                        return false;
                    }
                });
            }
            else if (this.type === 'negValCntr') {
                var foundCurrShown = false;
                allDone = true;
                $('#' + this.id + ' .array-element').each(function() {
                    if ($(this).hasClass('array-element-is-active')) {
                        $(this).removeClass('array-element-is-active');
                        foundCurrShown = true;
                    }
                    else if (foundCurrShown) {
                        $(this).addClass('array-element-is-active');
                        allDone = false;
                        return false;
                    }
                });
            }
            else if (this.type === 'sortLarge') {
                var self = this;
                allDone = true;
                $('#' + this.id + ' .array-element').each(function(i) {
                    if ($(this).hasClass('array-element-is-active')) {
                        if (i < 5) {
                            allDone = false;
                            $(this).removeClass('array-element-is-active').removeClass('highlighted');
                            $('#element' + (i + 2) + '_' + self.id).addClass('array-element-is-active').removeClass('highlighted');
                            $('#element' + (i + 3) + '_' + self.id).addClass('array-element-is-active').addClass('highlighted');
                        }
                        else {
                            allDone = true;
                        }
                        return false;
                    }
                });
            }
            // Partition button is clicked
            else if (this.type === 'quicksort') {
                var noValuesSelectedAbovePartition = true;
                var noValuesUnselectedBelowPartition = true;
                var $elems = $('#' + this.id + ' .array-element');
                var selectedArr = [];
                var unselectedArr = [];

                for (var i = this.qsPartitionStart; i <= this.qsPartitionEnd; i++) {
                    if ($elems.eq(i).hasClass('highlighted')) {
                        selectedArr.push(i);
                        if (parseInt($elems.eq(i).text()) > parseInt($('#showVal_' + this.id).text())) {
                            noValuesSelectedAbovePartition = false;
                            break;
                        }
                    }
                    else {
                        unselectedArr.push(i);
                        if (parseInt($elems.eq(i).text()) < parseInt($('#showVal_' + this.id).text())) {
                            noValuesUnselectedBelowPartition = false;
                            break;
                        }
                    }
                }

                // only 1 element in the partition
                if (this.qsPartitionStart === this.qsPartitionEnd) {
                    this.qsTakeSnapshot();

                    $elems.eq(this.qsPartitionStart).removeClass('clickable').removeClass('highlighted').addClass('correct');
                    this.qsPadding++;

                    // Still partitions on stack
                    if (this.qsPartitionStack.length > 0) {
                        // Pop unsorted partition from stack
                        var nextPartition = this.qsPartitionStack.pop();
                        this.qsCurrWindowRow = nextPartition.wndwRow;
                        this.qsPartitionStart = nextPartition.start;
                        this.qsPartitionEnd = nextPartition.end;

                        // Present unsorted partition
                        this.qsPartitionSetup();

                        // Update previous windows
                        var newArrayToAddToWindow = [];
                        for (var i = this.qsPartitionStart; i <= this.qsPartitionEnd; i++) {
                            this.utilities.enableButton($elems.eq(i));
                            $elems.eq(i).addClass('clickable');
                            newArrayToAddToWindow.push($elems.eq(i).text());
                        }
                        this.qsAddSpacingToDataStructure();
                        this.qsDS[this.qsCurrWindowRow].push(newArrayToAddToWindow);
                        this.qsDrawPreviousWindows();
                    }
                    // Stack empty means array sorted
                    else {
                        allDone = true;
                        $('#' + this.id + ' .show-sorted').show();
                        $('#' + this.id + ' .show-value-container').hide();
                        this.saveTime();
                    }
                }
                else if (!noValuesSelectedAbovePartition) {
                    this.giveUserFeedback('Deselect values greater than the pivot value.');
                }
                else if (!noValuesUnselectedBelowPartition) {
                    this.giveUserFeedback('All values less than pivot must be selected.');
                }
                else if (selectedArr.length === 0) {
                    this.giveUserFeedback('At least one value must be selected.');
                }
                else if (selectedArr.length === (this.qsPartitionEnd - this.qsPartitionStart + 1)) {
                    this.giveUserFeedback('At least one value must be unselected.');
                }
                // 2+ elements in partition and partition selection is valid
                else {
                    this.qsTakeSnapshot();

                    // re-order partition
                    var currArrayVals = [];
                    $elems.each(function(i) {
                        currArrayVals.push($(this).text()); // store current array text
                    });
                    var newArrOrder = selectedArr.concat(unselectedArr);
                    var selectionCntr = 0;
                    for (var elem = this.qsPartitionStart; elem <= this.qsPartitionEnd; elem++) {
                        $elems.eq(elem).text(currArrayVals[newArrOrder[selectionCntr]]); // reorder array text

                        if (selectionCntr < selectedArr.length) { // these elements are in the left partition and remain active
                            $elems.eq(elem).removeClass('highlighted');
                        }
                        else { // these elements are in the right partition and are disabled
                            this.utilities.disableButton($elems.eq(elem));
                            $elems.eq(elem).removeClass('clickable').removeClass('highlighted');
                        }

                        selectionCntr++;
                    }

                    this.qsCurrWindowRow++;

                    // push right partition to stack
                    var middle = this.qsPartitionStart + selectedArr.length;
                    this.qsPartitionStack.push({ start: middle, end: this.qsPartitionEnd, wndwRow: this.qsCurrWindowRow }); // Right partition

                    // present left partition
                    this.qsPartitionEnd = this.qsPartitionStart + selectedArr.length - 1;
                    this.qsPartitionSetup();

                    // Update previous windows
                    var currPartitionAsText = selectedArr.map(function(selectedIndex) {
                        return currArrayVals[selectedIndex];
                    });

                    // if haven't reached this row... then make array for this row
                    if (!this.qsDS[this.qsCurrWindowRow]) {
                        this.qsDS[this.qsCurrWindowRow] = [];
                    }
                    this.qsAddSpacingToDataStructure();
                    this.qsDS[this.qsCurrWindowRow].push(currPartitionAsText);
                    this.qsDrawPreviousWindows();
                }
            }

            if (allDone) {
                this.pauseTimer();
                $('#' + this.id + ' .array-element').addClass('array-element-is-active').removeClass('highlighted');

                this.utilities.disableButton(this.$nextButton);
                if (this.type !== 'quicksort') {
                    this.utilities.disableButton(this.$actionButton);
                }

                this.checkCorrectness();
            }
            else {
                this.utilities.enableButton(this.$actionButton);
            }
        }
    };

    this.actionButtonClick = function() {
        if (!this.$actionButton.hasClass('disabled')) {
            // Save button is clicked
            if (this.type === 'maxVal') {
                var self = this;
                $('#' + this.id + ' .array-element').each(function() {
                    if ($(this).hasClass('array-element-is-active')) {
                        $('#showVal_' + self.id).text($(this).text());
                        return false;
                    }
                });
                this.utilities.disableButton(this.$actionButton);
            }
            else if (this.type === 'negValCntr') {
                var self = this;
                $('#' + this.id + ' .array-element').each(function(i) {
                    if ($(this).hasClass('array-element-is-active')) {
                        self.didIncOnElement[i] = true;
                        return false;
                    }
                });
                var incVal = $('#showVal_' + this.id).text();
                $('#showVal_' + this.id).text(parseInt(incVal) + 1);
                this.utilities.disableButton(this.$actionButton);
            }
            else if (this.type === 'sortLarge') {
                var self = this;
                $('#' + this.id + ' .array-element').each(function(i) {
                    if ($(this).hasClass('array-element-is-active')) {
                        var tmp = $(this).text();
                        $(this).text($('#element' + (i + 2) + '_' + self.id).text());
                        $('#element' + (i + 2) + '_' + self.id).text(tmp);
                        return false;
                    }
                });
            }
            else if (this.type === 'swapSort') {
                // swap elements, then check if sorted
                if (this.highlightQueue.length === 2) {
                    var $arrayElems = $('#' + this.id + ' .array-element');
                    var $elem1ToSwap = $arrayElems.eq(this.highlightQueue[0]);
                    var $elem2ToSwap = $arrayElems.eq(this.highlightQueue[1]);
                    var tmp = $elem1ToSwap.text();
                    $elem1ToSwap.text($elem2ToSwap.text());
                    $elem2ToSwap.text(tmp);

                    $elem1ToSwap.removeClass('highlighted');
                    $elem2ToSwap.removeClass('highlighted');

                    this.highlightQueue.length = 0;

                    var $arrayElems = $('#' + this.id + ' .array-element');
                    var isSorted = true;
                    for (var i = 0; i < $arrayElems.length - 1; i++) {
                        var leftElem = parseInt($arrayElems.eq(i).text());
                        var rightElem = parseInt($arrayElems.eq(i + 1).text());
                        if (leftElem > rightElem) {
                            isSorted = false;
                            break;
                        }
                    }

                    if (isSorted) {
                        $('#' + this.id + ' .show-sorted').show();
                        $('#' + this.id + ' .show-value-container').hide();
                        this.pauseTimer();
                        this.saveTime();
                        this.utilities.disableButton(this.$actionButton);
                        $('#' + this.id + ' .array-element').removeClass('clickable');
                    }
                }
                else {
                    this.giveUserFeedback('Selected two numbers then click "Swap values"');
                }
            }
            // Back button is clicked
            else if (this.type === 'quicksort') {
                $('#' + this.id + ' .show-sorted').hide();
                $('#' + this.id + ' .show-value-container').show();

                // Clear previous windows
                var $prevWindow = $('#prevWindows_' + this.id);
                var $prevWindowRows = $prevWindow.find('tr');
                var $prevWindowRowsCols = $prevWindowRows.find('td');
                $prevWindow.css('visibility', 'hidden');
                $prevWindowRows.css('visibility', 'hidden');
                $prevWindowRowsCols.css('visibility', 'hidden');

                // Get previous window snapshot
                // pop from snapshot stack
                var snapshot = this.qsSnapshot.pop();
                this.qsDS = snapshot.ds;
                this.qsPartitionStart = snapshot.start;
                this.qsPartitionEnd = snapshot.end;
                this.qsPadding = snapshot.padding;
                this.qsCurrWindowRow = snapshot.currWndRow;
                this.qsPartitionStack = snapshot.stack;

                // Replace current array elements with previous array elements
                var $newArrayElements = snapshot.arrayElements;
                var $arrayElemParent = $('#' + this.id + ' .array-element').parent();
                $arrayElemParent.empty();
                $arrayElemParent.html($newArrayElements.html());
                var self = this;
                $('#' + this.id + ' .array-element').removeClass('highlighted').click(function(e) {
                    self.elementClick(e);
                });

                this.qsPartitionSetup();
                this.qsDrawPreviousWindows();

                // Remove disable from partition in case that array was sorted and parition button was disabled
                this.utilities.enableButton(this.$nextButton);

                if (this.qsSnapshot.length === 0) {
                    this.utilities.disableButton(this.$actionButton);
                }
            }
        }
    };

    this.elementClick = function(e) {
        if (this.$startButton.css('display') !== 'block') { // game is in play
            if (this.type === 'swapSort') {
                var $elem = $(e.target);
                var elemNum = -1;
                var $arrayElems = $('#' + this.id + ' .array-element');

                // which is the index of the element in the array that was clicked?
                $arrayElems.each(function(i) {
                    if ($(this).attr('id') === $elem.attr('id')) {
                        elemNum = i;
                        return false;
                    }
                });

                if ($elem.hasClass('clickable')) {
                    // clicked element is already highlighted
                    if ($elem.hasClass('highlighted')) {
                        $elem.removeClass('highlighted');
                        var i = 0;
                        // which index in the queue is the clicked element?
                        for(i = 0; i < this.highlightQueue.length; i++) {
                            if (this.highlightQueue[i] === elemNum) {
                                break;
                            }
                        }
                        this.highlightQueue.splice(i, 1);
                    } else {
                        $elem.addClass('highlighted');
                        this.highlightQueue.push(elemNum);
                    }

                    if (this.highlightQueue.length > 2) {
                        $arrayElems.eq(this.highlightQueue[0]).removeClass('highlighted');
                        this.highlightQueue.splice(0, 1);
                    }
                }
            } else if (this.type === 'quicksort') {
                var $elem = $(e.target);
                if ($elem.hasClass('clickable')) {
                    $elem.toggleClass('highlighted');
                }
            }
        }
    };

    this.clearButtonClick = function() {
        if (!this.$clearButton.hasClass('disabled')) {
            $('#bestTime_' + this.id).text('-');
            this.utilities.disableButton(this.$clearButton);
        }
    };

    /// ////////////////////////// Support functions /////////////////////////////////////

    // Take a snapshot of quicksort state then push onto snapshot stack
    this.qsTakeSnapshot = function() {
        // Make a deep copy of the partition stack
        var stackDeepCopy = [];
        for(var i = 0; i < this.qsPartitionStack.length; i++) {
            stackDeepCopy.push({ start: this.qsPartitionStack[i].start, end: this.qsPartitionStack[i].end, wndwRow: this.qsPartitionStack[i].wndwRow });
        }

        // store DOM objects of array elements
        this.qsSnapshot.push(
            {
                ds:            JSON.parse(JSON.stringify(this.qsDS)),
                arrayElements: $('#' + this.id + ' .array-element').parent().clone(),
                start:         this.qsPartitionStart,
                end:           this.qsPartitionEnd,
                padding:       this.qsPadding,
                currWndRow:    this.qsCurrWindowRow,
                stack:         stackDeepCopy
            }
        );
    };

    // Output quicksort instructions to the user based on the partition start and end
    this.qsPartitionSetup = function() {
        var $elems = $('#' + this.id + ' .array-element');
        // Next partition has only 1 element
        if (this.qsPartitionStart === this.qsPartitionEnd) {
            $('#showValLabel_' + this.id).text('Partition sorted.');
            $('#showVal_' + this.id).css('visibility', 'hidden');
            $('#next-button-' + this.id).text('Next');
        }
        else {
            var newPartition = parseInt((this.qsPartitionStart + this.qsPartitionEnd) / 2);
            $('#showValLabel_' + this.id).text('Pivot value:');
            $('#showVal_' + this.id).css('visibility', 'visible').text($elems.eq(newPartition).text());
            $('#next-button-' + this.id).text('Partition');
        }
    };

    // Add blank spaces before a group in quicksort's data structure when a
    this.qsAddSpacingToDataStructure = function() {
        var elemsInRow = 0;
        // count number of occupied element spaces in current row
        for (var group = 0; group < this.qsDS[this.qsCurrWindowRow].length; group++) {
            for (var elem = 0; elem < this.qsDS[this.qsCurrWindowRow][group].length; elem++) {
                elemsInRow++;
            }
        }
        var spacing = [];
        // while not enough spaces
        while (elemsInRow < this.qsPadding) {
            // add blank spaces
            spacing.push('blank');
            elemsInRow++;
        }
        if (spacing.length > 0) {
            this.qsDS[this.qsCurrWindowRow].push(spacing);
        }
    };

    // Draw the previous windows table based on quicksort's data structure
    // The previous windows table consists of rows, representing depth of recursion
    // Each row consists of groups of elements. A group represents a partition.
    this.qsDrawPreviousWindows = function() {
        // previous windows table
        var $prevWindows = $('#prevWindows_' + this.id);
        // each row in table
        var $rows = $prevWindows.find('tr');

        $prevWindows.css('visibility', 'visible');
        // Show first row
        $rows.eq(0).css('visibility', 'visible');
        // Show first row's columns
        $rows.eq(0).find('td').css('visibility', 'visible');

        // each row in the table
        for (var row = 0; row < this.qsDS.length; row++) {
            $rows.eq(row + 1).css('visibility', 'visible');
            var $elems = $rows.eq(row + 1).find('td');

            // count number of elements on this row
            var elemCntr = 0;
            // each group in a row
            for (var group = 0; group < this.qsDS[row].length; group++) {
                // each element in a group
                for (var elem = 0; elem < this.qsDS[row][group].length; elem++) {
                    if (this.qsDS[row][group][elem] !== 'blank') {
                        $elems.eq(elemCntr).css('visibility', 'visible');
                        $elems.eq(elemCntr).text(this.qsDS[row][group][elem]);

                        // special cases for groups larger than 1 element
                        if (this.qsDS[row][group].length > 1) {
                            // left-most element in group only removes right border
                            if (elem === 0) {
                                $elems.eq(elemCntr).css('border-left-width', '1px');
                                $elems.eq(elemCntr).css('border-right-width', '0px');
                            }
                            // right-most element in group only removes left border
                            else if (elem === (this.qsDS[row][group].length - 1)) {
                                $elems.eq(elemCntr).css('border-left-width', '0px');
                                $elems.eq(elemCntr).css('border-right-width', '1px');
                            }
                            else {
                                $elems.eq(elemCntr).css('border-left-width', '0px');
                                $elems.eq(elemCntr).css('border-right-width', '0px');
                            }
                        }
                        else {
                            $elems.eq(elemCntr).css('border-left-width', '1px');
                            $elems.eq(elemCntr).css('border-right-width', '1px');
                        }
                    }
                    else { // this element is padding between groups that are not directly touching
                        $elems.eq(elemCntr).css('visibility', 'hidden');
                    }

                    elemCntr++;
                }
            }

            while (elemCntr < $elems.length) {
                $elems.eq(elemCntr).css('visibility', 'hidden');
                elemCntr++;
            }
        }
    };

    this.hideArray = function() {
        var self = this;
        $('#' + this.id + ' .array-element').each(function() {
            self.utilities.enableButton($(this));
            $(this).text('X').removeClass('highlighted').removeClass('array-element-is-active').removeClass('correct').removeClass('wrong').removeClass('clickable');
        });
    };

    this.checkCorrectness = function() {
        if (this.type === 'maxVal') {
            var maxVal = -1;
            $('#' + this.id + ' .array-element').each(function() {
                var currNum = parseInt($(this).text());
                if (currNum > maxVal) {
                    maxVal = currNum;
                }
            });

            if (parseInt($('#showVal_' + this.id).text()) === maxVal) {
                $('#' + this.id + ' .array-element').each(function() {
                    if (parseInt($(this).text()) === maxVal) {
                        $(this).addClass('correct');
                    }
                });

                this.saveTime();
            } else {
                $('#' + this.id + ' .array-element').each(function() {
                    if (parseInt($(this).text()) === maxVal) {
                        $(this).addClass('wrong');
                    }
                });
            }
        } else if (this.type === 'negValCntr') {
            var isCorrect = true;
            var elementsToColor = [];
            var self = this;
            // Find out if correct
            $('#' + this.id + ' .array-element').each(function(i) {
                var shouldInc = parseInt($(this).text()) < 0;
                if (shouldInc != self.didIncOnElement[i]) {
                    isCorrect = false;
                }
            });

            // Use whether is correct to color all red or green
            $('#' + this.id + ' .array-element').each(function(i) {
                var shouldInc = parseInt($(this).text()) < 0;
                var didInc = self.didIncOnElement[i];

                if (shouldInc) {
                    if (isCorrect) {
                        $(this).addClass('correct');
                    }
                    else {
                        $(this).addClass('wrong');
                    }
                } else {
                    if (didInc) {
                        $(this).addClass('wrong');
                    }
                }
            });

            if (isCorrect) {
                this.saveTime();
            }
        } else if (this.type === 'sortLarge') {
            var maxVal = -1;
            $('#' + this.id + ' .array-element').each(function() {
                var currNum = parseInt($(this).text());
                if (currNum > maxVal) {
                    maxVal = currNum;
                }
            });

            if (parseInt($('#element7_' + this.id).text()) === maxVal) {
                $('#' + this.id + ' .array-element').each(function() {
                    if (parseInt($(this).text()) === maxVal) {
                        $(this).addClass('correct');
                    }
                });

                this.saveTime();
            } else {
                $('#' + this.id + ' .array-element').each(function() {
                    if (parseInt($(this).text()) === maxVal) {
                        $(this).addClass('wrong');
                    }
                });
            }
        }
    };

    // |giveUserFeedback| fade-in, pause, then fade-out the |feedback| to the user
    // Parameter |feedback| is a string
    this.giveUserFeedback = function(feedback) {
        this.$feedback.finish().text(feedback).fadeIn().delay(3000).fadeOut(1000);
    };

    /// /////////////////////////// Timer functions ///////////////////////
    var timeInterval;
    this.saveTime = function() {
        var $bestTime = $('#bestTime_' + this.id);
        var $newTime = $('#time_' + this.id);
        if (($bestTime.text() === '-') || (parseInt($newTime.text()) < parseInt($bestTime.text()))) {
            $bestTime.text($newTime.text());
        }

        this.utilities.enableButton(this.$clearButton);
    };

    this.startTimer = function() {
        $('#time_' + this.id).html('0');
        this.resumeTimer();
    };

    this.removeTimer = function() {
        this.pauseTimer();
        $('#time_' + this.id).text('-');
    };

    this.incTimer = function() {
        var $timerOutput = $('#time_' + this.id);

        if ($timerOutput.length > 0) {
            var time = parseInt($timerOutput.text());
            $timerOutput.text(String(time + 1));
        }
        else {
            this.pauseTimer();
        }
    };

    this.pauseTimer = function() {
        window.clearInterval(timeInterval);
        timeInterval = undefined;
    };

    this.resumeTimer = function() {
        var self = this;
        timeInterval = window.setInterval(function() {
            self.incTimer();
        }, 1000);
    };

    this.reset = function() {
        this.$startButton.show();
        this.$resetButton.hide();
        this.hideResetConfirmModal();
        this.utilities.disableButton(this.$nextButton);
        this.utilities.disableButton(this.$actionButton);
        this.hideArray();
        this.removeTimer();

        if (this.type === 'maxVal') {
            $(`#showVal_${this.id}`).removeClass('value-border').text('');
        }
        else if (this.type === 'negValCntr') {
            $('#showVal_' + this.id).text('0');
        }
        else if (this.type === 'sortLarge') {
            $('#showVal_' + this.id).text('');
        }
        else if (this.type === 'swapSort') {
            this.highlightQueue.length = 0;
            $('#showValLabel_' + this.id).text('');
            $('#' + this.id + ' .array-element').removeClass('array-element-is-active');
            $('#' + this.id + ' .show-sorted').hide();
            $('#' + this.id + ' .show-value-container').show();
        }
        else if (this.type === 'quicksort') {
            $('#showValLabel_' + this.id).css('visibility', 'hidden');
            $('#showVal_' + this.id).css('visibility', 'hidden');
            this.utilities.enableButton($('#' + this.id + ' .array-element'));
            $('#' + this.id + ' .array-element').removeClass('array-element-is-active').removeClass('highlighted');
            $('#' + this.id + ' .show-sorted').hide();
            $('#' + this.id + ' .show-value-container').show();

            var $prevWindow = $('#prevWindows_' + this.id);
            var $prevWindowRows = $prevWindow.find('tr');
            var $prevWindowRowsCols = $prevWindowRows.find('td');
            $prevWindow.css('visibility', 'hidden');
            $prevWindowRows.css('visibility', 'hidden');
            $prevWindowRowsCols.css('visibility', 'hidden');
        }
    };

    <%= grunt.file.read(hbs_output) %>
}

var arrayGamesExport = {
    create: function() {
        return new ArrayGames();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = arrayGamesExport;
