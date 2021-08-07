/*
    A |Factor| is a base and exponent, such as 7^2 where 7 is the base and 2 is the exponent.
    |base| and |exponent| are optional and a number.
*/
function Factor(base, exponent) {
    this.base = base || 0;
    this.exponent = exponent || 0;
}

Factor.prototype = {
    // Return the |Factor|'s value.
    getValue: function() {
        return Math.pow(this.base, this.exponent);
    },

    /*
        Return the Factor as a string, such as 3^5 or 7.
        |useCompleteDisplay| is optional and a boolean. If true, then return the base and exponent being displayed, such as 3^0.
    */
    display: function(useCompleteDisplay) {
        var completeDisplay = this.base + '<sup>' + this.exponent + '</sup>';
        var display = completeDisplay;

        if (!useCompleteDisplay) {
            if (this.exponent === 0) {
                display = '';
            }
            else if (this.exponent === 1) {
                display = String(this.base);
            }
        }

        return display;
    }
};

/*
    |Factors| stores a |Factor| array.
    |bases| and |exponents| are required and an array of numbers. The arrays must have equal length.
    |utilities| is required and the utilities zyTool.
*/
function Factors(bases, exponents, utilities) {
    this.utilities = utilities;

    var self = this;
    bases.forEach(function(base, index) {
        self.push(new Factor(base, exponents[index]));
    });
}

Factors.prototype = new Array();
Factors.prototype.constructor = Factors;

// Return the product of each |Factor|.
Factors.prototype.getValue = function() {
    var product = 1;
    this.forEach(function(factor) {
        product *= factor.getValue();
    });
    return product;
};

/*
    Return the Factors as a string. Ex: 3^4 * 5^7
    |useCompleteDisplay| is optional and a boolean.
*/
Factors.prototype.display = function(useCompleteDisplay) {
    var display = '';
    var self = this;
    this.forEach(function(factor, index) {
        var factorDisplay = factor.display(useCompleteDisplay);

        // |factor| had something to display and |display| is not empty.
        if (!!factorDisplay && !!display) {
            display += ' ' + self.utilities.multiplicationSymbol + ' ';
        }

        display += factorDisplay;
    });
    return display;
}
