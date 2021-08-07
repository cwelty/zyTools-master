function RowArrayIndexing() {
    this.init = function(id, eventManager, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.eventManager = eventManager;

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['rowArrayIndexing']({ id: this.id });
        $('#' + this.id).html(css + html);

        var self = this;
        $('#run-code-' + this.id).click(function() {
            self.runCode();
        });

        this.$inputs = $('#' + this.id + ' input');
        this.$output = $('#output-' + this.id);

        this.$inputs.keypress(function(event) {
            if (event.keyCode === 13) { // enter pressed
                self.runCode();
            }
        });

        $('#' + this.id).click(function() {
            if (!self.beenClicked) {
                var event = {
                    part: 0,
                    complete: true,
                    answer: '',
                    metadata: {
                        event: 'rowArrayIndexing clicked'
                    }
                };

                self.eventManager.postEvent(event);

                self.beenClicked = true;
            }
        });
    };

    this.intRowArr2_array = [ 0, 1, 2, 3, 5, 7, 11, 13, 17, 19 ];

    this.runCode = function() {
        var output = 'smallRow = <br/>';
        var startVal = -1;
        var incrementVal = -1;
        var endVal = -1;
        var hadError = false;

        // Parse each user input index
        for (var i = 0; i <= 2; i++) {
            var d = this.$inputs.eq(i).val();
            tmpD = parseInt(d);
            if (isNaN(tmpD)) {
                output = 'Error: ' + d + ' is not a number.';
                hadError = true;
                break;
            }

            if (i === 0) {
                startVal = parseInt(tmpD);
            } else if (i === 1) {
                incrementVal = parseInt(tmpD);
            } else if (i === 2) {
                endVal = parseInt(tmpD);
            }
        }

        if (!hadError) {
            if (incrementVal > 0) {
                for (var d = startVal; d <= endVal; d = d + incrementVal) {
                    if (parseInt(d) > 10) {
                        output = 'Attempted to access rowEx(' + d + ').<br/>index out of bounds because numel(rowEx) = 10.';
                        hadError = true;
                        break;
                    } else if(parseInt(d) <= 0) {
                        output = 'Subscript indices must either be real<br/>positive integers or logicals.';
                        hadError = true;
                        break;
                    }
                    output += '   ' + this.intRowArr2_array[parseInt(d) - 1];
                }
            } else if (incrementVal < 0) {
                for (var d = startVal; d >= endVal; d = d + incrementVal) {
                    if (parseInt(d) > 10) {
                        output = 'Attempted to access rowEx(' + d + ').<br/>index out of bounds because numel(rowEx) = 10.';
                        hadError = true;
                        break;
                    } else if (parseInt(d) <= 0) {
                        output = '??? Subscript indices must either be<br/>real positive integers or logicals.';
                        hadError = true;
                        break;
                    }
                    output += '   ' + this.intRowArr2_array[parseInt(d) - 1];
                }
            }
        }

        this.$output.html(output);
    };

    <%= grunt.file.read(hbs_output) %>
}

var rowArrayIndexingExport = {
    create: function() {
        return new RowArrayIndexing();
    }
};
module.exports = rowArrayIndexingExport;
