function LightSwitch() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;
        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['lightSwitch']({ id: this.id });
        $('#' + this.id).html(css + html);

        var lightOn = parentResource.getResourceURL('pic_lightswitch_on.jpg', this.name);
        var lightOff = parentResource.getResourceURL('pic_lightswitch_off.jpg', this.name);

        var self = this;
        $('#lightSwitch_' + this.id).attr('src', lightOn).click(function() {
            var $this = $(this);
            if ($this.attr('src') === lightOn) {
                $this.attr('src', lightOff);
            } else {
                $this.attr('src', lightOn);
            }

            if (!self.beenClicked) {
                var event = {
                    part: 0,
                    complete: true,
                    answer: 'light switch tool',
                    metadata: {
                        event: 'light switch tool clicked'
                    }
                };

                self.parentResource.postEvent(event);
            }

            self.beenClicked = true;

            return;
        });
    };

    <%= grunt.file.read(hbs_output) %>
}

var lightSwitchExport = {
    create: function() {
        return new LightSwitch();
    }
};
module.exports = lightSwitchExport;
