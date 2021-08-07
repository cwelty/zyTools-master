/* exported exampleToOptions */
/* global makeScissorsAnnotation, makeSurgeriesAnnotation */
'use strict';

const exampleToOptions = {
    Buzz: {
        probability: {
            initial: 0.5,
            editable: false,
            label: 'Probability of correct button push',
        },
        attempts: {
            initial: 16,
            editable: false,
            label: 'Number of button pushes',
        },
        repetitions: {
            initial: 100,
            editable: true,
        },
        plotTitle: 'Possible values for Buzz\'s number of correct pushes assuming chance model is true',
        xAxisTitle: 'Number of correct pushes',
        isXAxisProportion: false,
        annotationFunction: null,
        useDotPlot: true,
        autoZoom: false,
        highlightDirection: 'right',
        validationWording: {
            noun: 'dolphin',
            actionSingular: 'button push',
            actionPlural: 'button pushes',
            modelName: 'Buzz\'s selection process',
        },
    },
    scissors: {
        probability: {
            initial: 0.33,
            editable: true,
            label: 'Long-run proportion of scissors',
        },
        attempts: {
            initial: 12,
            editable: false,
            label: 'Number of rounds',
        },
        repetitions: {
            initial: 100,
            editable: true,
        },
        plotTitle: 'Possible values for the proportion of scissors assuming the null hypothesis is true',
        xAxisTitle: '$\\text{Proportion of scissors (} \\hat{p} \\text{)}$',
        isXAxisProportion: true,
        annotationFunction: makeScissorsAnnotation,
        hoverformat: '.3f',
        useDotPlot: true,
        autoZoom: false,
        highlightDirection: 'left',
        validationWording: {
            noun: 'scissors',
            actionSingular: 'round',
            actionPlural: 'rounds',
            modelName: 'scissors played by novices',
        },
    },
    surgeries: {
        probability: {
            initial: 0.15,
            editable: true,
            label: 'Long-run proportion of fatal surgeries',
        },
        attempts: {
            initial: 361,
            editable: false,
            label: 'Number of surgeries',
        },
        repetitions: {
            initial: 1000,
            editable: true,
        },
        plotTitle: 'Possible values for the proportion of fatal heart surgeries assuming the null hypothesis is true',
        xAxisTitle: '$\\text{Proportion of fatal heart surgeries (} \\hat{p} \\text{)}$',
        isXAxisProportion: true,
        annotationFunction: makeSurgeriesAnnotation,
        hoverformat: '.3f',
        useDotPlot: false,
        autoZoom: true,
        highlightDirection: 'left',
        validationWording: {
            noun: 'surgery',
            actionSingular: 'heart surgery',
            actionPlural: 'heart surgeries',
            modelName: 'fatal heart surgeries',
        },
    },
};
