/*
    MIPSInstructionController inherits InstructionSetSDK's InstructionController.
    See InstructionSetSDK's InstructionController for details.
*/
function MIPSCodeController() {
    this.newCodeController.constructor.apply(this, arguments);
}

/*
    Inherit InstructionSetSDK's CodeController and attach prototype functions to MIPSCodeController.
    |instructionSetSDK| is required and an InstructionSetSDK.
*/
function buildMIPSCodeControllerPrototype(instructionSetSDK) {
    MIPSCodeController.prototype = instructionSetSDK.inheritCodeController();
    MIPSCodeController.prototype.constructor = MIPSCodeController;
    MIPSCodeController.prototype.newCodeController = instructionSetSDK.inheritCodeController();
    MIPSCodeController.prototype.instructionFactory = new InstructionFactory();
}
