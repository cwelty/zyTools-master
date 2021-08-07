function zyWordProcessor() {

    this.init = function(id, parentResource, options) {

        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;
        this.utilities = require('utilities');
        this.submitted = false;

        // Button images
        this.centerAlignImage = this.parentResource.getResourceURL('centerAlign.png', this.name);
        this.leftAlignImage = this.parentResource.getResourceURL('leftAlign.png', this.name);
        this.rightAlignImage = this.parentResource.getResourceURL('rightAlign.png', this.name);
        this.ulImage = this.parentResource.getResourceURL('ul.png', this.name);
        this.olImage = this.parentResource.getResourceURL('ol.png', this.name);
        this.indentImage = this.parentResource.getResourceURL('indent.png', this.name);
        this.outdentImage = this.parentResource.getResourceURL('outdent.png', this.name);

        // Default content for the textarea
        this.textAreaContent = '';

        // Sets pre-defined textarea contents
        if (options && ('contents' in options)) {
            this.textAreaContent = options.contents;
        }

        var html = this[this.name]['zyWordProcessor']({
            id:              this.id,
            textContents:    this.textAreaContent,
            centerImage:     this.centerAlignImage,
            leftAlignImage:  this.leftAlignImage,
            rightAlignImage: this.rightAlignImage,
            ulImage:         this.ulImage,
            olImage:         this.olImage,
            indentImage:     this.indentImage,
            outdentImage:    this.outdentImage
        });

        var css = '<style><%= grunt.file.read(css_filename) %></style>';

        $('#' + this.id).html(css + html);

        // Cached toolbar accessors
        this.$fontFaceSelect = $('#' + this.id + ' .font-face');
        this.$fontSizeSelect = $('#' + this.id + ' .font-size');
        this.$fontColorSelect = $('#' + this.id + ' .fore-ground');
        this.$backColorSelect = $('#' + this.id + ' .back-ground');
        this.$fontFormatSelect = $('#' + this.id + ' .font-format');
        this.$boldButton = $('#' + this.id + ' .bold-button');
        this.$underlineButton = $('#' + this.id + ' .underline-button');
        this.$italicButton = $('#' + this.id + ' .italic-button');

        // Sets pre-defined width
        if (options && ('width' in options)) {
            $('#' + this.id + ' .text-contents').css('width', options.width + 'px');
        }

        // Sets pre-defined height
        if (options && ('height' in options)) {
            $('#' + this.id + ' .text-contents').css('height', options.height + 'px');
        }

        var self = this;

        $('#' + this.id).on('click touchstart', function() {
            if (!self.submitted) {
                var event = {
                    part:     0,
                    complete: true,
                    answer:   '',
                    metadata: {
                        event: 'Word processor used.'
                    }
                };

                self.parentResource.postEvent(event);
                self.submitted = true;
            }
        });

        // Cancels mouse down events to prevent overwriting of focused text
        $('#' + this.id + ' .toolbar-button').mousedown(function(event) {
            if (event.returnValue) {
                event.returnValue = false;
            }
            else if (event.preventDefault) {
                event.preventDefault();
            }
            else {
                return false;
            }
        });

        // Executes drop down styling commands
        $('#' + this.id + ' .select-toolbar').change(function() {
            var command = $(this).attr('command');
            // Checks if the element is a select or an input type
            if ($(this).is('select')) {
                var options = $(this).find('option:selected').val();
            }
            else {
                var options = $(this).val();
            }

            document.execCommand(command, false, options);
        });

        var settingsListener;

        // Activates settings listener if text input area is in focus
        $('#' + this.id + ' .text-contents').focus(function() {

            // Updates style settings every 100ms
            settingsListener = setInterval(function() {
                var selectedRegion = document.getSelection();

                // Selection is a range
                if (selectedRegion.type === 'Range') {

                    // Set settings to default because we cannot set multiple styles
                    self.$fontFaceSelect.val('');
                    self.$fontSizeSelect.val('');
                    self.$fontFormatSelect.val('');
                    self.$fontColorSelect.val('#FFFFFF');
                    self.$backColorSelect.val('#FFFFFF');
                    self.$boldButton.removeClass('active');
                    self.$underlineButton.removeClass('active');
                    self.$italicButton.removeClass('active');
                }
                else {
                    self.resetToDefaultStyles();

                    // Select parent element of cursor's position
                    var parentElement = selectedRegion.baseNode.parentElement;

                    // Find all current style settings at cursor position
                    self.findStyleSettings(parentElement);
                }
            }, 100);
        });

        // Deactivates settings listener if text input area is blurred
        $('#' + this.id + ' .text-contents').blur(function() {
            clearInterval(settingsListener);
        });

        // Execute commands based on button click
        $('#' + this.id + ' .toolbar-button').click(function() {
            var command = $(this).attr('command');
            document.execCommand(command);
        });

        // Detect key event to post activity data
        $('#' + this.id + ' .text-contents').keydown(function(event) {
            // Handle tabs
            if (event.keyCode === self.utilities.TAB_KEY) {
                event.preventDefault();
                document.execCommand('insertText', false, '\t');
            }

            // Ctrl key has been pressed
            if (event.ctrlKey) {
                // Ctrl+U has a default functionality that needs to be prevented
                if (event.keyCode === self.utilities.U_KEY) {
                    event.preventDefault();
                    self.$underlineButton.hasClass('active') ? self.$underlineButton.removeClass('active') : self.$underlineButton.addClass('active');
                    document.execCommand('underline', false);
                }
                // Toggle bold button state
                else if (event.keyCode === self.utilities.B_KEY) {
                    self.$boldButton.hasClass('active') ? self.$boldButton.removeClass('active') : self.$boldButton.addClass('active');
                }
                // Toggle italic button state
                else if (event.keyCode === self.utilities.I_KEY) {
                    self.$italicButton.hasClass('active') ? self.$italicButton.removeClass('active') : self.$italicButton.addClass('active');
                }
            }
        });
    };

    // Sets font styles
    this.findStyleSettings = function(parentElement) {
        var fontFaceSet = false;
        var fontSizeSet = false;
        var fontColorSet = false;
        var backColorSet = false;

        // Iterate through structure until the surrounding div is encountered
        while (parentElement.nodeName !== 'DIV') {
            // Set settings based on encountered
            switch (parentElement.nodeName) {

                // Font style change
                case 'FONT':
                    var fontFace = parentElement.getAttribute('face');
                    if (fontFace && !fontFaceSet) {
                        fontFaceSet = true;
                        this.$fontFaceSelect.val(fontFace);
                    }

                    var fontSize = parentElement.getAttribute('size');
                    if (fontSize && !fontSizeSet) {
                        fontSizeSet = true;
                        this.$fontSizeSelect.val(fontSize);
                    }

                    var fontColor = parentElement.getAttribute('color');
                    if (fontColor && !fontColorSet) {
                        fontColorSet = true;
                        this.$fontColorSelect.val(fontColor);
                    }
                    break;

                // Background color
                case 'SPAN':
                    var backColor = $(parentElement).css('background-color');

                    if (backColor && !backColorSet) {
                        backColorSet = true;

                        // Converts rgb value into hex
                        this.$backColorSelect.val(this.utilities.rgbToHex(backColor));
                    }
                    break;

                // Bold
                case 'B':
                    this.$boldButton.addClass('active');
                    break;

                // Underline
                case 'U':
                    this.$underlineButton.addClass('active');
                    break;

                // Italic
                case 'I':
                    this.$italicButton.addClass('active');
                    break;

                // Font formats
                case 'P':
                case 'H1':
                case 'H2':
                case 'H5':
                case 'H6':
                    this.$fontFormatSelect.val(parentElement.nodeName.toLowerCase());
                    break;
            }
            parentElement = parentElement.parentElement;
        }
    };

    // Sets styles back to default values
    this.resetToDefaultStyles = function() {
        this.$fontFaceSelect.val('Helvetica');
        this.$fontSizeSelect.val(3);
        this.$fontColorSelect.val('#000000');
        this.$backColorSelect.val('#FFFFFF');
        this.$fontFormatSelect.val('p');
        this.$boldButton.removeClass('active');
        this.$underlineButton.removeClass('active');
        this.$italicButton.removeClass('active');
    };

    <%= grunt.file.read(hbs_output) %>
}

var zyWordProcessorExport = {
    create: function() {
        return new zyWordProcessor();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = zyWordProcessorExport;
