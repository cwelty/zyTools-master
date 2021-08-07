/**
    Structure to store a special-case set that includes a set, negated set, and description.
    @class SpecialSet
    @constructor
    @param {Array} of {String} set The set of elements in 1 - 9 based on the description.
    @param {Array} of {String} negatedSet The negation of |set| with values in 1 - 9.
    @param {String} description Written descriptino of |set|.
*/
function SpecialSet(set, negatedSet, description) {
    this.set = set;
    this.negatedSet = negatedSet;
    this.description = description;
}
