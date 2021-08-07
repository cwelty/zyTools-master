function htmlViewer() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        this.utilities = require('utilities');

        // Stores the skeleton HTML code
        this.htmlContents = options ? this.utilities.unescapeHTML(options.htmlContents) : '';

        // Store the optional options: |htmlWidth| and |previewWidth|
        this.htmlWidth = (options && options.htmlWidth) ? options.htmlWidth : null;
        this.previewWidth = (options && options.previewWidth) ? options.previewWidth : null;
        this.expectedHTML = (options && options.expectedHTML) ? this.utilities.unescapeHTML(options.expectedHTML) : null;

        var css = '<style><%= grunt.file.read(css_filename) %></style>';

        var htmlViewerTableHTML = this[this.name].htmlViewerTable({
            html: this.htmlContents,
        });
        if (!!this.expectedHTML) {
            htmlViewerTableHTML = this[this.name].expectedHTMLTable({
                html:         this.htmlContents,
                expectedHTML: this.expectedHTML
            });
        }

        var html = this[this.name].htmlViewer({
            htmlViewerTableHTML: htmlViewerTableHTML
        });

        $('#' + this.id).html(css + html);
        this.submitted = false;

        // Store regularly accessed DOM elements
        var $thisTool = $('#' + this.id);
        this.$userHTML = $thisTool.find('.user-html');
        this.$userRenderedHTML = $thisTool.find('.user-rendered-html');
        this.$expectedRenderedHTML = $thisTool.find('.expected-rendered-html');

        if (this.htmlWidth) {
            this.$userHTML.css('width', this.htmlWidth + 'px');
        }

        if (this.previewWidth) {
            this.$userRenderedHTML.css('width', this.previewWidth + 'px');
            this.$expectedRenderedHTML.css('width', this.previewWidth + 'px');
        }

        if (!!this.expectedHTML) {
            var height = '150px';
            this.$userRenderedHTML.css('height', height);
            this.$expectedRenderedHTML.css('height', height);
        }

        var self = this;
        $('#' + this.id + ' .render-html').click(function() {

            self.renderHTML();

            if (!self.submitted) {
                var event = {
                    part: 0,
                    complete: true,
                    answer: self.$userHTML.val(),
                    metadata: {
                        event: 'HTML viewer used.'
                    }
                };

                self.parentResource.postEvent(event);
            }
        });

        // Reveal reset prompt container
        $('#' + this.id + ' .reset-html').click(function() {
            self.revealResetPrompt();
        });

        // Hide prompt container
        $('#' + this.id + ' .prompt-container').click(function() {
            $(this).hide();
        });

        // Resets tool
        $('#' + this.id + ' .confirm-reset-button').click(function() {
            self.reset();
        });

        this.renderHTML();
    };

    // Displays the reset prompt
    this.revealResetPrompt = function() {
        $('#' + this.id + ' .reset-prompt').show();
    };

    // Resets the tool to its initial state
    this.reset = function() {
        this.$userHTML.val(this.htmlContents);
        this.renderHTML();
    };

    // Renders html inside the input area into the preview area
    this.renderHTML = function() {
        var userHTML = this.$userHTML.val();

        // Uses the user's html as the source for the iFrame
        this.$userRenderedHTML.attr('src', 'data:text/html;charset=utf-8,' + encodeURIComponent(userHTML));

        if (!!this.expectedHTML) {
            this.$expectedRenderedHTML.attr('src', 'data:text/html;charset=utf-8,' + encodeURIComponent(this.expectedHTML));
        }
    };

    // This is more required boilerplate.
    <%= grunt.file.read(hbs_output) %>
}

var htmlViewerExport = {
    create: function() {
        return new htmlViewer();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
};
module.exports = htmlViewerExport;
