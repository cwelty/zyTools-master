/*
    Wraps the two different types of registers into a single object.
*/
function VMRegisters() {
    this.regI = [];
    this.regF = [];
    for (var i = 0; i < VM_CONSTANTS.INTEGER_REGISTERS; i++) {
        this.regI[i] = 0;
    }
    for (var i = 0; i < VM_CONSTANTS.FLOAT_REGISTERS; i++) {
        this.regF[i] = 0.0;
    }
}

// Make a copy of the registers
VMRegisters.prototype.copy = function() {
    var copy = new VMRegisters();
    for (var i = 0; i < VM_CONSTANTS.INTEGER_REGISTERS; i++) {
        copy.regI[i] = this.regI[i];
    }
    for (var i = 0; i < VM_CONSTANTS.FLOAT_REGISTERS; i++) {
        copy.regF[i] = this.regF[i];
    }
    return copy;
};

// Resets all of the registers' values to 0
VMRegisters.prototype.reset = function() {
    for (var i = 0; i < VM_CONSTANTS.INTEGER_REGISTERS; i++) {
        this.regI[i] = 0;
    }
    for (var i = 0; i < VM_CONSTANTS.FLOAT_REGISTERS; i++) {
        this.regF[i] = 0.0;
    }
};
