function IntRowArray() {
    this.init = function(id, eventManager, options) {
        this.id = id;
        this.eventManager = eventManager;
        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var hbsName = '<%= grunt.option("tool") %>';
        var html = this[hbsName]['intRowArray']({ id: this.id });

        $('#' + this.id).html(css + html);

        var self = this;
        $('#' + this.id + '_intRowArr_runButton').click(function() {
            self.intRowArr_run();
        });
    };

    this.intRowArr_run = function() {
        function isNumber(o) {
            return !isNaN(o - 0) && o !== null && o !== '' && o !== false;
        }

        var intRowArr_array = [ 0, 1, 2, 3, 5, 7, 11, 13, 17, 19 ];

        var indexes = [];
        var output = 'smallRow = <br/>';
        for(var i = 1; i <= 5; i++) {
            var d = $('#' + this.id + '_intRowArr_elem' + String(i)).val();
            if(!isNumber(d)) {
                output = 'Error: Element number ' + i + " of rowIdx is not a number.";
                break;
            }
            else if(parseInt(d) > 10) {
                output = "Attempted to access rowEx(" + d+'); index out of bounds because numel(rowEx)=10.';
                hadError = true;
                break;
            } else if (parseInt(d) <= 0) {
                output = '??? Subscript indices must either be real positive integers or logicals.';
                hadError = true;
                break;
            }
            indexes.push(d);
            output += '   ' + intRowArr_array[parseInt(d) - 1];
        }

        // Concatenate string of indexes for answer to see what they tried.
        // If they just try the default run, they dont get a complete
        var answer = indexes.join();

        // If they click run, they get a complete. Log the indices they tried
        var event = {
            part: 0,
            complete: true,
            answer: indexes.join()
        };

        this.eventManager.postEvent(event);

        $('#' + this.id + '_intRowArr_output').html(output);
    };

    // Inject compiled handlebars here
    <%= grunt.file.read(hbs_output) %>
}

var intRowArrayExport = {
    create: function() {
        return new IntRowArray();
    }
};

module.exports = intRowArrayExport;
