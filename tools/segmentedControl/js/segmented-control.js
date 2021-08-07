/*
  An object that builds and displays a segmented control.
*/

function SegmentedControl() {
    /*
        Initialize this segmented control.

        * |segments| - A list of segment titles.
        * |containerId| -  The id of the container that this segmented control should insert itself in.
        * |segmentSelectedCallback| - A callback function that is called when a segment is selected, and passes two arguments:
            * The index of the selected segment.
            * The title of the selected segment.
            * Whether the callback was called because of user interaction.
    */
    this.init = function(segments, containerId, segmentSelectedCallback) {
        this.name = '<%= grunt.option("tool") %>';
        this.containerId = containerId;
        this.segmentSelectedCallback = segmentSelectedCallback;

        // Initialize an internal list of segments and their indices.
        this._segments = segments.map((segment, index) => this._makeSegment(segment, index, index === 0));

        this.render();
    };

    /**
        Makes and returns a new segment.
        @method _makeSegment
        @param {String} title The new segment's title.
        @param {Integer} index The new segment's index.
        @param {Boolean} selected Whether the new segment is selected.
        @return {Object} The new segment
    */
    this._makeSegment = function(title, index, selected = false) {
        return { title, index, selected };
    };

    /**
        Renders the segmented control.
        @method render
        @return {void}
    */
    this.render = function() {
        const css = '<style><%= grunt.file.read(css_filename) %></style>';
        const html = this[this.name]['segmented-control']({
            segments: this._segments,
        });

        // Inject the HTML into the specified container.
        $(`#${this.containerId}`).html(css + html);
        this.$segmentButtons = $(`#${this.containerId} .segment-button`);

        // Find the segment button with the largest width.
        let maxSegmentButtonWidth = 0;

        this.$segmentButtons.each(function() {
            var segmentButtonWidth = $(this).width();

            if (segmentButtonWidth > maxSegmentButtonWidth) {
                maxSegmentButtonWidth = segmentButtonWidth;
            }
        });

        // Account for rounding errors with largest segment width.
        ++maxSegmentButtonWidth;

        // Change all segment buttons to have the same width as the largest width.
        this.$segmentButtons.each(function() {
            $(this).css('width', maxSegmentButtonWidth + 'px');
        });

        // Keep track of whether the segmented control is enabled
        this.segmentedControlIsEnabled = true;

        // Add click listeners.
        var self = this;
        this.$segmentButtons.click(function() {
            if (self.segmentedControlIsEnabled) {

                // Get the index of the clicked segment.
                const segmentIndex = parseInt($(this).attr('data-index'), 10);
                const hadInteraction = true;

                self.selectSegmentByIndex(segmentIndex, hadInteraction);
            }
        });
    };

    // Get the index of the selected segment.
    this.getSelectedSegmentIndex = function() {
        var $selectedSegment = $('#' + this.containerId + ' .segment-button-selected');
        if ($selectedSegment.length === 0) {
            return null;
        }
        else {
            return parseInt($selectedSegment.attr('data-index'), 10);
        }
    };

    // Remove the selection from all segments.
    this.deselectSegments = function() {
        this.$segmentButtons.removeClass('segment-button-selected');
    };

    /**
      Selects the segment in index |segmentIndex|.
      Note that calling this function does invoke the "clicked" callback.
      @method selectSegmentByIndex
      @param {Integer} segmentIndex The index of the segment to select.
      @param {Boolean} [hadInteraction=false] Whether the segment changes because a user interacted with it.
      @return {void}
    */
    this.selectSegmentByIndex = function(segmentIndex, hadInteraction = false) {
        this.deselectSegments();

        // Add selection to the clicked segment.
        this.$segmentButtons.filter(`[data-index=${segmentIndex}]`).addClass('segment-button-selected');

        // Call the callback.
        if (this.segmentSelectedCallback) {
            this.segmentSelectedCallback(segmentIndex, this._segments[segmentIndex].title, hadInteraction);
        }
    };

    /*
      Selects the segment with the title |segmentTitle|.

      Note that calling this function does invoke the "clicked" callback.
    */
    this.selectSegmentByTitle = function(segmentTitle) {
        // Get the index of the segment with |segmentTitle|.
        var segment = this._segments.filter(function(segment) {
            return (segment.title === segmentTitle);
        })[0];

        if (segment) {
            this.selectSegmentByIndex(segment.index);
        }
    };

    this.disable = function() {
        $('#' + this.containerId + ' .segmented-control').addClass('disabled');
        this.segmentedControlIsEnabled = false;
    };

    this.enable = function() {
        $('#' + this.containerId + ' .segmented-control').removeClass('disabled');
        this.segmentedControlIsEnabled = true;
    };

    /**
        Removes the last segment.
        @method removeLastSegment
        @param {Integer} index The index of the segment to be removed.
        @return {void}
    */
    this.removeSegmentByIndex = function(index) {
        this._segments.splice(index, 1);
        this.render();
    };

    /**
        Adds a segment with the passed |title| in the passed |index|.
        @method addSegmentAtIndex
        @param {String} title The new segment's title.
        @param {Integer} [index=-1] The index at which to place the segment.
        @return {void}
    */
    this.addSegmentAtIndex = function(title, index = -1) {
        const segment = this._makeSegment(title, this._segments.length, false);

        this._segments.splice(index, 0, segment);
        this.render();
    };

    // This is more required boilerplate.
    <%= grunt.file.read(hbs_output) %>
}

module.exports = {
    create: function() {
        return new SegmentedControl();
    },
};
