'use strict';

/* exported RenderingIndicatorAndControllerPair */

/**
    Store a rendering indicator and the associated controller.
    @class RenderingIndicatorAndControllerPair
*/
class RenderingIndicatorAndControllerPair {

    /**
        @constructor
        @param {RenderingIndicator} indicator The rendering indicator to store.
        @param {FlowchartController} controller The associated controller.
    */
    constructor(indicator, controller) {

        /**
            The rendering indicator to store.
            @property indicator
            @type {RenderingIndicator}
        */
        this.indicator = indicator;

        /**
            The associated controller.
            @property controller
            @type {FlowchartController}
        */
        this.controller = controller;
    }
}
