/*
    Class contains the current state of the virtual machine.
*/
function VMState() {
    this.dataSize = VM_CONSTANTS.DATASPACE_SIZE;
    this.codeSize = VM_CONSTANTS.CODESPACE_SIZE;
    this.pc = 0;
    this.currentTicks = 0;
    this.floatConditionalFlag = false;
    this.broken = false;
    this.atBreakpoint = false;
    this.steps = 0;
    this.usedCodespace = 0;
    this.data = new Array(VM_CONSTANTS.DATASPACE_SIZE);
    this.code = new Array(VM_CONSTANTS.CODESPACE_SIZE);
    this.heap = new Heap(VM_CONSTANTS.HEAP_BEGIN, VM_CONSTANTS.HEAP_SIZE);
    this.symbols = new SymbolTable();
    this.stackRegisters = [];
    this.stackPc = [];
    this.ips = VM_CONSTANTS.INSTR_PER_SEC;
    this.registers = new VMRegisters();
    this.breakpoints = {};
    this.ISR1State = 0;
}

// VM fired an interrupt, need to save the state of the pc and the registers
VMState.prototype.beginInterrupt = function() {
    this.stackRegisters.push(this.registers.copy());
    this.stackPc.push(this.pc);
};

// interrupt is over, pop the old state of the pc and registers
VMState.prototype.endInterrupt = function() {
    this.registers = this.stackRegisters.pop();
    this.pc = this.stackPc.pop();
};

// Used to see when an interrupt has finished, we know when the current PC has returned to the mostRecentCalle.
VMState.prototype.mostRecentCallee = function() {
    if(this.stackPc.length === 0) {
        this.state.Console('Fatal internal error:\r\nNo ISR executing yet we think there is!');
        this.pc = 0;
    }
    return this.stackPc[this.stackPc.length - 1];
};
