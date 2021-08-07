function StackSim() {
    this.init = function(id, eventManager, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.eventManager = eventManager;
        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        this.stackSize = 6;
        this.stackIndex = [];
        for (var i = 1; i <= this.stackSize; i++) {
            this.stackIndex.push(i);
        }
        var html = this[this.name]['stackSim']({ id: this.id, stackIndex: this.stackIndex });
        $('#' + this.id).html(css + html);

        var self = this;
        $('#' + this.id).click(function() {
            if (!self.beenClicked) {
                var event = {
                    part: 0,
                    complete: true,
                    answer: 'tool clicked',
                    metadata: {
                        event: 'stack sim clicked'
                    }
                };

                self.eventManager.postEvent(event);
            }

            self.beenClicked = true;
        });

        $('#' + this.id + ' .push').click(function(e) {
            self.pushClicked(e);
        });

        $('#' + this.id + ' .pop').click(function() {
            self.popClicked();
        });
    };

    this.pushClicked = function(e) {
        if (!$(e.target).is('input#val' + this.id)) { // if the input field is not clicked...
            var cntr = parseInt($('#stackCntr_' + this.id).text()); // get stack counter
            if (cntr < 6) { // if stack not full...
                $('#stackCntr_' + this.id).text(cntr + 1); // increment stack counter
                $('#' + this.id + ' .cell span').eq(cntr).text($('#val' + this.id).val()).removeClass('old'); // add new value to stack
            } else { // if stack is full, then output error
                $('#output' + this.id).finish().hide().text('Error: stack full').fadeIn().delay(1000).fadeOut();
            }
        }
    };

    this.popClicked = function() {
        var cntr = parseInt($('#stackCntr_' + this.id).text()); // get stack counter
        if (cntr > 0) { // if stack not empty...
            $('#stackCntr_' + this.id).text(cntr - 1); // decrement stack counter
            var $poppedElem = $('#' + this.id + ' .cell span').eq(cntr - 1);
            $poppedElem.addClass('old'); // mark popped value as old
            $('#' + this.id + ' .popped-value span').finish().hide().text($poppedElem.text()).fadeIn(); // display popped value
        } else { // if stack is empty, then output error
            $('#output' + this.id).finish().hide().text('Error: stack empty').fadeIn().delay(1000).fadeOut();
        }
    };

    <%= grunt.file.read(hbs_output) %>
}

var stackSimExport = {
    create: function() {
        return new StackSim();
    }
};
module.exports = stackSimExport;
