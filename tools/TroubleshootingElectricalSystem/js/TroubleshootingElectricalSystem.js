'use strict';

/* global Component, Experiment */

/**
    Tool that walks a user through the steps of troubleshooting.
    @module TroubleshootingElectricalSystem
    @return {void}
*/
class TroubleshootingElectricalSystem {

    /**
        Store templates and declare member variables.
        @constructor
    */
    constructor() {

        <%= grunt.file.read(hbs_output) %>

        /**
            The DOM id for the tool.
            @property id
            @type {String}
            @default null
        */
        this.id = null;

        /**
            A dictionary of functions given by the parent resource.
            @property parentResource
            @type {Object}
            @default null
        */
        this.parentResource = null;

        /**
            The current level of this tool.
            @property currentLevel
            @type {Number}
            @default 1
        */
        this.currentLevel = 1;

        /**
            Whether the current level has been completed.
            @property isDoneWithLevel
            @type {Boolean}
            @default false
        */
        this.isDoneWithLevel = false;

        /**
            List of components in the electrical system.
            @property components
            @type {Array}
            @default null
        */
        this.components = null;

        /**
            List of experiments to run.
            @property experiments
            @type {Array}
            @default []
        */
        this.experiments = [];

        /**
            The user's total score.
            @property totalScore
            @type {Number}
            @default 0
        */
        this.totalScore = 0;

        /**
            The number of levels in this tool.
            @property numberOfLevels
            @type {Number}
            @default 4
        */
        this.numberOfLevels = 4;

        /**
            The broken component for the current level.
            @property brokenComponent
            @type {Component}
            @default null
        */
        this.brokenComponent = null;

        require('utilities').addIfConditionalHandlebars();

        /**
            Handlebars helper for converting a decimal to a percent. Ex: 0.15 -> 15%
            @method decimalToPercent
            @param {String} decimal The decimal value to convert to a percent.
            @return {String} The percent made from the decimal value.
        */
        Handlebars.registerHelper('decimalToPercent', decimal => {
            const percent = parseFloat(decimal) * 100.0; // eslint-disable-line no-magic-numbers

            return `${percent}%`;
        });
    }

    /**
        Initialize the tool.
        @method init
        @param {String} id The unique identifier given to this module.
        @param {Object} parentResource A dictionary of functions given by the parent resource.
        @return {void}
    */
    init(id, parentResource) {
        this.id = id;
        this.parentResource = parentResource;
        this.makeLevel();
    }

    /**
        Make and generate a level.
        @method makeLevel
        @return {void}
    */
    makeLevel() {
        const componentNames = [ 'a', 'b', 'c', 'd' ];
        const times = [ 1, 2, 3, 5 ]; // eslint-disable-line no-magic-numbers
        let likelihoods = [ 0.25, 0.25, 0.25, 0.25 ]; // eslint-disable-line no-magic-numbers

        if (this.currentLevel > 2) { // eslint-disable-line no-magic-numbers
            likelihoods = [ 0.15, 0.15, 0.3, 0.4 ]; // eslint-disable-line no-magic-numbers
        }

        require('utilities').shuffleArray(componentNames);
        this.components = componentNames.map((name, index) => new Component(name, times[index], likelihoods[index], false));

        // Randomly choose one component to be bad based on likelihood.
        const randomValue = Math.random();

        if (randomValue <= likelihoods[0]) {
            this.components[0].isBroken = true;
        }
        else if (randomValue <= (likelihoods[0] + likelihoods[1])) {
            this.components[1].isBroken = true;
        }
        else if (randomValue <= (likelihoods[0] + likelihoods[1] + likelihoods[2])) {
            this.components[2].isBroken = true;
        }
        else {
            this.components[3].isBroken = true;
        }

        require('utilities').shuffleArray(this.components);
        this.experiments = [];
        this.isDoneWithLevel = false;
        this.brokenComponent = this.components.find(component => component.isBroken);
        this.render();
    }

    /**
        Render the current level.
        @method render
        @return {void}
    */
    render() {
        const css = '<style><%= grunt.file.read(css_filename) %></style>';
        const html = this['<%= grunt.option("tool") %>'].level({
            brokenComponent: this.brokenComponent,
            components: this.components,
            currentLevel: this.currentLevel,
            experiments: this.experiments,
            isDoneWithLevel: this.isDoneWithLevel,
            isAnyTestRunning: this.experiments.some(experiment => experiment.isRunningTest),
            numberOfLevels: this.numberOfLevels,
            totalScore: this.totalScore,
        });

        $(`#${this.id}`).empty().html(css + html);

        this.addComponentDataAndListeners();
        this.addRunTestDataAndListeners();
        this.addNextLevelListener();
        this.addPlayAgainListener();
    }

    /**
        Add data and event listeners for components.
        @method addComponentDataAndListeners
        @return {void}
    */
    addComponentDataAndListeners() {
        const $components = this.findClassName('component');

        $components.each((index, component) => {
            $(component).data('component', this.components[index]);
        });

        $components.click(event => {
            const component = $(event.currentTarget).data('component');
            const newExperiment = new Experiment(component);

            this.experiments.push(newExperiment);
            this.totalScore++;
            this.render();
        });
    }

    /**
        Add data and event listeners for run test buttons.
        @method addRunTestDataAndListeners
        @return {void}
    */
    addRunTestDataAndListeners() {
        const $runTests = this.findClassName('run-test');

        $runTests.each((index, runTest) => {
            $(runTest).data('experiment', this.experiments[index]);
        });

        $runTests.click(event => {
            const experiment = $(event.currentTarget).data('experiment');

            if (this.currentLevel > 1) {
                experiment.isRunningTest = true;
                experiment.result = experiment.component.time;
                this.runExperiment(experiment);
            }
            else {
                this.totalScore++;
                this.determineResultOfExperiment(experiment);
            }

            this.render();
        });
    }

    /**
        Run the given experiment.
        @method runExperiment
        @param {Experiment} experiment The experiment to run.
        @return {void}
    */
    runExperiment(experiment) {
        const oneSecond = 1000;

        const timer = window.setInterval(() => {
            const timeLeft = parseInt(experiment.result, 10) - 1;

            if (timeLeft > 0) {
                experiment.result = timeLeft;
            }

            // Experiment is over. Determine result of the experiment.
            else {
                window.clearInterval(timer);
                experiment.isRunningTest = false;
                this.determineResultOfExperiment(experiment);
            }

            this.totalScore++;
            this.render();
        }, oneSecond);
    }

    /**
        Determine the result of an experiment.
        @method determineResultOfExperiment
        @param {Experiment} experiment The experiment to evaluate.
        @return {void}
    */
    determineResultOfExperiment(experiment) {
        const isBroken = experiment.component.isBroken;

        experiment.testFinishedRunning = true;
        experiment.result = isBroken ? 'No' : 'Yes';
        experiment.resultNote = isBroken ? 'Validates hypothesis' : 'Invalidates hypothesis';
        this.isDoneWithLevel = isBroken;

        if (isBroken) {
            this.parentResource.postEvent({
                part: this.currentLevel - 1,
                complete: true,
                metadata: {
                    totalScore: this.totalScore,
                },
            });
        }
    }

    /**
        Add listener for next level button.
        @method addNextLevelListener
        @return {void}
    */
    addNextLevelListener() {
        this.findClassName('next-level').click(() => {
            this.currentLevel++;
            this.makeLevel();
        });
    }

    /**
        Add listener for play again button.
        @method addPlayAgainListener
        @return {void}
    */
    addPlayAgainListener() {
        this.findClassName('play-again').click(() => {
            this.currentLevel = 1;
            this.totalScore = 0;
            this.makeLevel();
        });
    }

    /**
        Find the given class name in the tool.
        @method findClassName
        @param {String} className The class name to find.
        @return {Object} jQuery reference to the given class name.
    */
    findClassName(className) {
        return $(`#${this.id}`).find(`.${className}`);
    }
}

module.exports = {
    create: function() {
        return new TroubleshootingElectricalSystem();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
};
