'use strict';

/* exported CaptionController */
/* global ProgressionController */

/**
    Control the caption input.
    @class CaptionController
    @extends ProgressionController
    @constructor
*/
class CaptionController extends ProgressionController {

    /**
        Render the export and import area, then add listeners.
        @method render
        @return {void}
    */
    render() {
        const captionHTML = this._templates.Caption({ caption: this._zyTool.caption }); // eslint-disable-line new-cap

        this._$dom.html(captionHTML);

        const $captionInput = this._$dom.find('input');

        $captionInput.change(() => {
            this._zyTool.caption = $captionInput.val();
        });
    }
}
