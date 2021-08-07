/*
    InstructionSetSDKError stores:
        |message| is required and a string.
        |type| is required and a string.
*/
function InstructionSetSDKError(message, type) {
    this.message = message;
    this.type = type;
}
InstructionSetSDKError.prototype = new Error();
InstructionSetSDKError.prototype.constructor = InstructionSetSDKError;
