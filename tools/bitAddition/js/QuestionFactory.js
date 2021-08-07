/*
    Build a Question, such as: Add 3 and 7
    |utilities| is required and the Utilities zyTool.
*/
function QuestionFactory(utilities) {
    this._numberOfInteractiveBits = 5;
    this.numberOfQuestions = 5;
    this._utilities = utilities;
}

QuestionFactory.prototype = {
    /*
        Make a Question based on the |currentQuestionNumber|.
        |currentQuestionNumber| is required and a number.
    */
    make: function(currentQuestionNumber) {
        /*
            Pick two numbers. Store numbers in |numberChoices|.
            Element 0 is first number. Element 1 is second number.
        */
        var numberChoices;
        switch (currentQuestionNumber) {
            // Add two small positive numbers
            case 0:
                numberChoices = this._pickTwoUniqueNumbersInRange(2, 4);
                break;

            // Add two larger positive numbers
            case 1:
                numberChoices = this._pickTwoUniqueNumbersInRange(12, 15);
                break;

            /*
                Add a positive and negative number, resulting in a positive number.
                The second number will be negative, but have a smaller magnitude than the first number,
                so, the result will be a positive number.
            */
            case 2:
                numberChoices = this._pickTwoUniqueNumbersInRange(5, 9);

                // Sort in descending order
                numberChoices.sort(function(a, b) {
                    return (b - a);
                });

                // Make the second number negative
                numberChoices[1] *= -1;
                break;

            /*
                Add a positive and negative number, resulting in a negative number.
                The second number will be negative and have a larger magnitude than the first number,
                so, the result will be a negative number.
            */
            case 3:
                numberChoices = this._pickTwoUniqueNumbersInRange(5, 9);

                // Sort in ascending order
                numberChoices.sort(function(a, b) {
                    return (a - b);
                });

                // Make the second number negative
                numberChoices[1] *= -1;
                break;

            // Add two negative numbers
            case 4:
                numberChoices = this._pickTwoUniqueNumbersInRange(-8, -4);
                break;
        }

        var firstNumber = numberChoices[0];
        var secondNumber = numberChoices[1];
        var carryBitsNumber = this._computeCarryBitNumber(firstNumber, secondNumber);
        var resultNumber = firstNumber + secondNumber;

        return new Question(
            'Add ' + firstNumber + ' and ' + secondNumber + '. Work from right to left.',
            this._makePrefixBit(carryBitsNumber),
            this._numberToBitArray(carryBitsNumber),

            firstNumber,
            this._makePrefixBit(firstNumber),
            this._numberToBitArray(firstNumber),

            secondNumber,
            this._makePrefixBit(secondNumber),
            this._numberToBitArray(secondNumber),

            this._makePrefixBit(resultNumber),
            this._numberToBitArray(resultNumber)
        );
    },

    /*
        Return an array of two unique numbers chosen from |start| to |end|, inclusively.
        |start| and |end| are required and a number, where |end| > |start|.
    */
    _pickTwoUniqueNumbersInRange: function(start, end) {
        // Build an array of numbers from |start| to |end.
        var arrayOfOptions = [];
        for (var i = start; i <= end; i++) {
            arrayOfOptions.push(i);
        }

        // Return 2 numbers from |arrayOfOptions|.
        return this._utilities.pickNElementsFromArray(arrayOfOptions, 2);
    },

    /*
        Return the numerical value of the carry bits when adding |firstNumber| and |secondNumber|.
        Ex: If adding 3 (011) + 2 (010), then return 4 (100).
        |firstNumber| and |secondNumber| are required and a number.
    */
    _computeCarryBitNumber: function(firstNumber, secondNumber) {
        // JavaScript integers are 32 bits.
        var bitsInJSInteger = 32;

        // Iterate from 0 to |bitsInJSInteger| - 2.
        var carryBitsNumber = 0;
        var previousCarryBit = 0;
        for (var i = 0; i < (bitsInJSInteger - 1); i++) {
            var firstNumberBit = this._bitAtIndex(firstNumber, i);
            var secondNumberBit = this._bitAtIndex(secondNumber, i);

            // If sum of bits is 2+, then the |carryBit| is 1. Otherwise, |carryBit| is 0.
            var bitSum = firstNumberBit + secondNumberBit + previousCarryBit;
            carryBit = (bitSum >= 2) ? 1 : 0;

            // The carry bit is index |i| + 1 since the sum was for index |i|.
            var indexOfCarryBitToUpdate = i + 1;

            // Set |carryBit| in |carryBitsNumber| at index |indexOfCarryBitToUpdate|.
            carryBitsNumber = carryBitsNumber | (carryBit << indexOfCarryBitToUpdate);

            previousCarryBit = carryBit;
        }
        return carryBitsNumber;
    },

    /*
        Return 0 if |number| is non-negative. Otherwise, return 1.
        |number| is required and a number.
    */
    _makePrefixBit: function(number) {
        // Positive signed numbers are prefixed with 0. Negative are prefixed with 1.
        return ((number >= 0) ? 0 : 1);
    },

    /*
        Return an array of bits that represent |number|.
        Ex: If |number| is 7 and |_numberOfInteractiveBits| is 5, return [0, 0, 1, 1, 1].
        |number| is required and a number.
    */
    _numberToBitArray: function(number) {
        var bitArray = [];
        for (var i = 0; i < this._numberOfInteractiveBits; ++i) {
            var bit = this._bitAtIndex(number, i);
            bitArray.push(bit);
        }
        return bitArray.reverse();
    },

    /*
        Return the bit at |index| of |number|.
        |number| and |index| are required and a number.
    */
    _bitAtIndex: function(number, index) {
        var mask = 1 << index;
        return ((number & mask) > 0) ? 1 : 0;
    }
};