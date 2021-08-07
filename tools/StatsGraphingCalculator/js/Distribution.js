'use strict';

/* global jStat */
/* exported Distribution */

/**
    A class that defines a distribution and the methods to get Z-score from probability and viceversa.
    @class Distribution
*/
class Distribution {

    /**
        @constructor
        @param {String} distributionName The name of the distribution. Ex: 'normal', 'student-t'.
        @param {Object} parameters The parameters of the distribution. For normal distribution: mean and std; for student-t: dof, etc.
    */
    constructor(distributionName, parameters) {

        /**
            The mean of this distribution. Default is 0, because standard normal distribution has mean 0.
            @property mean
            @type {Number}
            @default 0
        */
        this.mean = parameters.mean ? parameters.mean : 0;

        /**
            The standard deviation of this distribution. Default is 1, because standard normal distribution has standard distribution 1.
            @property std
            @type {Number}
            @default 1
        */
        this.std = parameters.std || 1;

        /**
            The distribution object provided by jStat. Depends on the type of distribution we want. Only normal distribution supported for now.
            @property distribution
            @type {jStat.normal}
        */
        this.distribution = jStat.normal(this.mean, this.std);
    }

    /**
        Calculates the z-score given a probability.
        @method probabilityToZ
        @param {Number} probability The probability to calculate the z-score.
        @return {Number} The z-score
    */
    probabilityToZ(probability) {
        return this.distribution.inv(probability);
    }

    /**
        Calculates the probability given a z-score.
        @method zToProbability
        @param {Number} zScore The z-score to calculate the probability.
        @return {Number} The probability.
    */
    zToProbability(zScore) {
        return this.distribution.cdf(zScore);
    }

    /**
        Calculates a value using the probability distribution function.
        @method probabilityDistributionFunction
        @param {Number} value The value to calculate the PDF.
        @return {Number}
    */
    probabilityDistributionFunction(value) {
        return this.distribution.pdf(value);
    }
}
