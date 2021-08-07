function PythonTutor() {
    this.init = function(id, resourceManager, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.resourceManager = resourceManager;

        // Default options that define the following program:
        // x = 5
        // print x
        this.trace = {'code': 'x = 5\nprint x', 'trace': [ {'ordered_globals': [],
                      'stdout': '', 'func_name': '<module>', 'stack_to_render': [], 'globals': {},
                      'heap': {}, 'line': 1, 'event': "step_line" }, {'ordered_globals': [ "x" ], 'stdout': '',
                      'func_name': '<module>', 'stack_to_render': [], 'globals': {'x': 5 }, 'heap': {}, 'line': 2,
                      'event': "step_line" }, {'ordered_globals': [ "x" ], 'stdout': '5\n', 'func_name': '<module>',
                      'stack_to_render': [], 'globals': {'x': 5 }, 'heap': {}, 'line': 2, 'event': "return" } ] };

        if (options && options['trace']) {
            this.trace = options['trace'];
        }

        var html = this[this.name]['pythonTutor']({ id: this.id });
        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        $('#' + this.id).html(css + html);

        var verticalStack = options && options['verticalStack'];
        var showOnlyOutputs = options && options['showOnlyOutputs'];

        var visualizer = new ExecutionVisualizer('tutor' + this.id,
                                                 this.trace,
                                                 { embeddedMode : false,
                                                   verticalStack : verticalStack,
                                                   showOnlyOutputs: showOnlyOutputs });

        $('#' + this.id + ' #vcrControls button[type=button]').addClass('button');

        var self = this;
        $('#' + this.id).click(function() {
            if (!self.clicked) {
                var event = {
                    part: 0,
                    complete: true,
                    metadata: {
                        event: 'Python Tutor clicked'
                    }
                };
                self.resourceManager.postEvent(event);
            }
            self.clicked = true;
        });
    };

    // This is more required boilerplate.
    <%= grunt.file.read(hbs_output) %>
}

var pythonTutorExport = {
    create: function() {
        return new PythonTutor();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = pythonTutorExport;
