function SymbolPalette() {
    this.init = function($input, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.$input = $input;

        this.symbolGrid = this.convertToGrid(options.symbols);

        // Output CSS and HTML for symbol palette
        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['symbolPalette']({
            symbols: this.symbolGrid
        });
        this.$input.after(html + css);

        // Store regularly access DOM objects
        this.$palette = this.$input.next();
        this.$symbols = this.$palette.find('button');

        // Initialize palette
        this.setPaletteWidth(this.symbolGrid[0].length);
        this.$palette.hide();

        var self = this;
        this.$symbols.click(function() {
            self.addSymbolToInput($(this));
        });

        this.$input.on('click touchstart focus', () => {
            if (!self.$palette.is(':visible')) {

                // Left-align symbol palette with the |$input|.
                this.$palette.css('left', this.$input.position().left);

                this.$palette.show();

                // Add event listeners for when to hide the palette.
                $('body').on('click touchstart', this.clickTouchstartEvent);

                this.$symbols.on('blur', this.blurEvent);
                this.$input.on('blur', this.blurEvent);
            }
        });
    }

    /*
        Add the symbol associated with the |$button| to the |this.$input|
        |$button| is required and a jQuery objects
    */
    this.addSymbolToInput = function($button) {
        var symbolToAdd = $button.text();
        var inputElement = this.$input.get(0);

        // Add the symbol into the input at the cursor's location
        var cursorPosition = inputElement.selectionStart;
        var inputText = this.$input.val();
        var beforeCursorText = inputText.substring(0, cursorPosition);
        var afterCursorText = inputText.substring(cursorPosition);
        var newInputText = beforeCursorText + symbolToAdd + afterCursorText;

        var numberOfCharactersInInput = this.$input.val().length;
        var maxNumberOfCharactersInInput = this.$input.attr('maxlength');
        if (numberOfCharactersInInput < maxNumberOfCharactersInInput) {
            this.$input.val(newInputText);
        }

        // Move the cursor to the end of the symbol that was just added
        var newCursorPosition = cursorPosition + symbolToAdd.length;
        inputElement.focus();
        inputElement.setSelectionRange(newCursorPosition, newCursorPosition);
    }

    // Hide the palette and remove event listeners.
    this.hidePalette = function() {
        this.$palette.hide();

        // Remove event listeners.
        $('body').off('click touchstart', this.clickTouchstartEvent);
        this.$symbols.off('blur', this.blurEvent);
        this.$input.off('blur', this.blurEvent);
    }

    /*
        Hide the palette if anywhere else besides the input, symbol, or symbol palette targetted.
        |target| is required and a DOM object
    */
    this.determineWhetherToHidePalette = function(target) {
        var inputWasTargetted = target === this.$input.get(0);
        var symbolWasTargetted = this.$palette.has($(target)).length > 0;
        var paletteWasTargetted = target === this.$palette.get(0);

        // If neither the input, nor symbols, nor palette were clicked, then hide the palette
        if (!inputWasTargetted && !symbolWasTargetted && !paletteWasTargetted) {
            this.hidePalette();
        }
    }

    /*
        Handle click and touchstart |event|.
        |event| is required and an event object.
    */
    var self = this;
    this.clickTouchstartEvent = function(event) {
        self.determineWhetherToHidePalette(event.target);
    }

    /*
        Handle blur |event|.
        |event| is required and an event object.
    */
    this.blurEvent = function(event) {
        // Ignore non-existing relatedTargets.
        if (event.relatedTarget !== null) {
            self.determineWhetherToHidePalette(event.relatedTarget);
        }
        else if (self.$input.is(':disabled')) {
            self.hidePalette();
        }
    }

    /*
        Return a symbolGrid based on the given |symbolsArray|.
        |symbolsArray| is required and an array of strings.
    */
    this.convertToGrid = function(symbolsArray) {
        var symbolGrid = [];
        var symbolsPerRowCounter = 0;
        var symbolsPerRow = (symbolsArray.length === 4) ? 2 : 3;
        symbolsArray.forEach(function(symbol) {
            // If the current row is full, then start a new row
            if ((symbolsPerRowCounter % symbolsPerRow) === 0) {
                symbolGrid.push([]);
            }

            symbolsPerRowCounter++;
            symbolGrid[symbolGrid.length - 1].push(symbol);
        });
        return symbolGrid;
    }

    /*
        Set the palette width based on |numberOfSymbolsPerRow|.
        |numberOfSymbolsPerRow| is required and a number
    */
    this.setPaletteWidth = function(numberOfSymbolsPerRow) {
        var symbolWidth = 50;
        var padding = 10;

        /*
            Example of 3 symbols.
            Each symbol is 50 px wide, with 10px of padding in between:
            -----  -----  -----
            | a |  | b |  | c |
            -----  -----  -----
        */
        var paletteWidthFromSymbols = numberOfSymbolsPerRow * symbolWidth;
        var paletteWidthFromPadding = (numberOfSymbolsPerRow - 1) * padding;
        var paletteWidth = paletteWidthFromSymbols + paletteWidthFromPadding;
        this.$palette.css('width', paletteWidth + 'px');
    }

    <%= grunt.file.read(hbs_output) %>
}

var symbolPaletteExport = {
    create: function() {
        return new SymbolPalette();
    }
}
module.exports = symbolPaletteExport;
