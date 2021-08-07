/*
    ARMInstructionController inherits InstructionSetSDK's InstructionController.
    See InstructionSetSDK's InstructionController for details.
*/
function ARMCodeController() {
    this.newCodeController.constructor.apply(this, arguments);
}

/*
    Inherit InstructionSetSDK's CodeController and attach prototype functions to ARMCodeController.
    |instructionSetSDK| is required and an InstructionSetSDK.
*/
function buildARMCodeControllerPrototype(instructionSetSDK) {
    ARMCodeController.prototype = instructionSetSDK.inheritCodeController();
    ARMCodeController.prototype.constructor = ARMCodeController;
    ARMCodeController.prototype.newCodeController = instructionSetSDK.inheritCodeController();
    ARMCodeController.prototype.instructionFactory = new InstructionFactory();
}
