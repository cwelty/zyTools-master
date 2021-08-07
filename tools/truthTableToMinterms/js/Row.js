/*
    The |Row| Object contains 3 properties:
        * |truthValues| - an array of strings
        * |expectedY|   - a string
        * |yourY|       - an Object containing 2 properties:
            * |isWrong| - a boolean. Default is false.
            * |value|   - a string. Default is ''.
*/
function Row(truthValues, expectedY) {
    this.truthValues = truthValues;
    this.expectedY = expectedY;
    this.yourY = {
        isWrong: false,
        value:   ''
    };
}

Row.prototype = {
    /*
        Update the yourY value with |isWrong| and |userYValue|.
        |isWrong| is required and boolean.
        |userYValue| is required and a string.
    */
    updateYourY: function(isWrong, userYValue) {
        this.yourY = {
            isWrong: isWrong,
            value:   userYValue
        };
    }
};