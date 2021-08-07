// Labels is an Array of Label.
function Labels() {}
Labels.prototype = new Array();

/*
    Return the program counter for |label|. If |label| doesn't exist, return null.
    |labelName| is required and a string.
*/
Labels.prototype.lookupProgramCounter = function(labelName) {
    var filteredLabels = this.filter(function(label) {
        return (label.name === labelName);
    });
    return ((filteredLabels.length === 0) ? null : filteredLabels[0].instructionIndex);
};

/*
    Return an array of label names for |instructionIndex|.
    |instructionIndex| is required and a number.
*/
Labels.prototype.lookupLabelNames = function(instructionIndex) {
    return this.filter(function(label) {
        return (label.instructionIndex === instructionIndex);
    });
};

/*
    Return the label name for |instructionIndex|. If |instructionIndex| doesn't exist, return null.
    |instructionIndex| is required and a number.
*/
Labels.prototype.lookupLabelName = function(instructionIndex) {
    var filterLabelNames = this.lookupLabelNames(instructionIndex);
    return ((filterLabelNames.length === 0) ? null : filterLabelNames[0].name);
};

/*
    Add a Label with |name| and |instructionIndex| properties.
    |name| is required and a string.
    |instructionIndex| is required and a number.
*/
Labels.prototype.addLabel = function(name, instructionIndex) {
    return this.push(new Label(name, instructionIndex));
};
