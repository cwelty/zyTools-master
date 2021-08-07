'use strict';

/* global Bit */

/**
    Interactive bits that user can toggle. Also, show corresponding decimal value.
    @module BinaryNum
*/
class BinaryNum {

    /**
        Initialize the tool.
        @method init
        @param {String} id The unique identifier given to this module.
        @param {Object} parentResource A dictionary of functions given by the parent resource.
        @param {Object} options The options passed to this instance of the tool.
        @return {void}
    */
    init(id, parentResource, options) {

        <%= grunt.file.read(hbs_output) %>

        const toolName = '<%= grunt.option("tool") %>';
        const defaultNumberOfBits = 8;
        const useNewStyling = (options && options.newVersion);

        this.numberOfBits = (options && options.numberOfBits) ? options.numberOfBits : defaultNumberOfBits;

        const bits = [];

        // Range from |this.numberOfBits - 1| to 0.
        for (let index = this.numberOfBits - 1; index >= 0; index--) {
            bits.push(new Bit(index));
        }

        const html = this[toolName].template({ bits, useNewStyling });
        const css = '<style><%= grunt.file.read(css_filename) %></style>';

        this.$thisTool = $(`#${id}`);
        this.$thisTool.html(css + html);

        this.$thisTool.find('.bit').click(event => {
            this._bitClicked(event);
        });

        this.$thisTool.click(() => {
            if (!this.beenClicked) {
                parentResource.postEvent({
                    part: 0,
                    complete: true,
                    answer: 'clicked',
                    metadata: {
                        event: 'Binary number tool clicked',
                    },
                });
            }

            this.beenClicked = true;
        });
    }

    /**
        Handle a bit click.
        @method _bitClicked
        @private
        @param {Event} event The  event from a bit being clicked.
        @return {void}
    */
    _bitClicked(event) {
        const $target = $(event.target);

        if ($target.text() === '0') {
            $target.text('1').removeClass('zero-bit-color').addClass('one-bit-color');
        }
        else {
            $target.text('0').removeClass('one-bit-color').addClass('zero-bit-color');
        }

        let sum = 0;
        let binaryVal = Math.pow(2, this.numberOfBits - 1); // eslint-disable-line no-magic-numbers

        this.$thisTool.find('.bit').each((index, bit) => {
            sum += (parseInt($(bit).text(), 10) * binaryVal);
            binaryVal /= 2;
        });

        this.$thisTool.find('.decimal-value').text(sum);
    }
}

module.exports = {
    create: function() {
        return new BinaryNum();
    },
};
