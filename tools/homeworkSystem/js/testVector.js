/* global Spinner */
/* exported TestVector */
'use strict';

/**
    A class representing an individual test vector. Able to render itself into a div.
    @class TestVector
    @return {void}
*/
class TestVector {

    /**
        Initialize this test vector.
        @param {Object} args Object containing all the parameters for TestVector object.
        @param {String} args.containerId The id of the DOM element in which this test vector should be rendered.
        @param {Object} args.parentResource A dictionary of functions given by the parent resource.
        @param {Function} args.template The HBS template used to render this test vector.
        @param {String} args.checkmarkImageURL A URL pointing to the checkmark image.
        @param {String} args.description The description of this test vector.
        @param {String} args.expected The expected output of this test vector.
        @param {String} args.actual The actual output of this test vector.
        @param {Boolean} args.pass Boolean representing if this test vector passed or not.
        @param {Boolean} args.aborted Boolean representing if this test vector was aborted or not.
        @param {String} args.vectorType String representing the type of this test vector. Either "output" or "value".
        @param {Utilities} args.utilities The utilities zyTool.
        @return {void}
    */
    init(args) {
        this.utilities = args.utilities;
        this.containerId = args.containerId;
        this.parentResource = args.parentResource;
        this.template = args.template;
        this.checkmarkImageURL = args.checkmarkImageURL;
        this.description = args.description;
        this.expected = args.expected;
        this.actual = args.actual;
        this.pass = args.pass;
        this.aborted = args.aborted;
        this.vectorType = args.vectorType;

        this.collapsed = true;
        this.spinning = true;
        this.hidden = true;

        this.render();
    }

    render() {

        // If |pass| or |aborted| are true, then suppress output by setting |expectedValue| to null.
        const expectedValue = (this.pass || this.aborted) ? null : this.expected;
        const diffData = this.utilities.manageDiffHighlighting(this.parentResource, expectedValue, this.actual);
        const html = this.template({
            description: this.description,
            expected: diffData.highlightedExpectedOutput,
            actual: diffData.highlightedActualOutput,
            pass: this.pass,
            aborted: this.aborted,
            collapsed: this.collapsed,
            checkmarkImageURL: this.checkmarkImageURL,
            spinning: this.spinning,
            hidden: this.hidden,
            vectorType: this.vectorType,
            whitespaceDiffers: diffData.doesOnlyWhitespaceDiffer,
        });

        $(`#${this.containerId}`).html(html);

        /*
            Initialize spinner.
            - The number of lines to draw
            - The length of each line
            - The line thickness
            - The radius of the inner circle
            - Corner roundness (0..1)
            - The rotation offset
            - 1: clockwise, -1: counterclockwise
            - #rgb or #rrggbb or array of colors
            - Rounds per second
            - Afterglow percentage
            - Whether to render a shadow
            - Whether to use hardware acceleration
            - The CSS class to assign to the spinner
            - The z-index (defaults to 2000000000)
            - Top position relative to parent
            - Left position relative to parent
        */
        const opts = {
            lines: 13,
            length: 3,
            width: 2,
            radius: 4,
            corners: 1,
            rotate: 0,
            direction: 1,
            color: '#CC6600',
            speed: 1,
            trail: 60,
            shadow: false,
            hwaccel: false,
            className: 'spinner',
            zIndex: 2e9,
            top: '50%',
            left: '50%',
        };
        const spinnerTarget = $(`#${this.containerId} .test-vector-spinner`)[0];

        new Spinner(opts).spin(spinnerTarget);

        // Record the user clicking the whitespace differs message.
        $(`#${this.containerId} .whitespace-differs-message a`).click(() => {
            this.parentResource.postEvent({
                answer: '',
                complete: false,
                metadata: {
                    event: 'Clicked whitespace differs link',
                },
                part: 0,
            });
        });
    }

    setCollapsed(collapsed) {
        this.collapsed = collapsed;
        this.render();
    }

    setSpinning(spinning) {
        this.spinning = spinning;
        this.render();
    }

    setHidden(hidden) {
        this.hidden = hidden;
        this.render();
    }
}
