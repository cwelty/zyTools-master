function ExpectedTool() {
    this.init = function(id, eventManager, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.eventManager = eventManager;

        this.numberOfParts = 1;
        if (!!options) {
            if ('parts' in options) {
                this.numberOfParts = Number(options.parts);
            }
            else if ('points' in options) {
                this.numberOfParts = Number(options.points);
            }
        }

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['expectedTool']();

        $('#' + this.id).html(css + html);

        for (var i = 0; i < this.numberOfParts; i++) {
            this.eventManager.postEvent({
                answer:   null,
                part:     i,
                complete: true
            });
        }
    };

    <%= grunt.file.read(hbs_output) %>
}

var expectedToolExport = {
    create: function() {
        return new ExpectedTool();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = expectedToolExport;
