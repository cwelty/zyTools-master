'use strict';

/* exported TinkerRecorder */

/**
    Make a tinker recorder that records periodically, but doesn't spam the server.
    @class TinkerRecorder
*/
class TinkerRecorder {

    /**
        @constructor
        @param {Object} parentResource A dictionary of functions given by the parent resource.
    */
    constructor(parentResource) {

        /**
            A dictionary of functions given by the parent resource.
            @property parentResource
            @type {Object}
        */
        this.parentResource = parentResource;

        /**
            Whether enough time has passed since the last recording.
            @property beenLongEnough
            @type {Boolean}
            @default true
        */
        this.beenLongEnough = true;

        /**
            The backlog of interactions to record.
            @property backlog
            @type {Array} of {Object}
            @default []
        */
        this.backlog = [];
    }

    /**
        Record the student's interaction.
        @method record
        @param {Object} interaction What to record.
        @return {void}
    */
    record(interaction) {
        this.backlog.push(interaction);

        if (this.beenLongEnough) {
            this.beenLongEnough = false;

            const waitTime = 10000;

            window.setTimeout(() => {
                this.beenLongEnough = true;
                this.parentResource.postEvent({
                    part: 0,
                    complete: true,
                    answer: '',
                    metadata: {
                        interactions: JSON.stringify(this.backlog),
                    },
                });
                this.backlog.length = 0;
            }, waitTime);
        }
    }
}
