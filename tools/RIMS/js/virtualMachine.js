/*
    The simulator itself. This is the class that will execute the mips instructions, contains
    everything needed to simulate a microcontroller.
*/
function VirtualMachine() {
    this.state = new VMState();
    this.ip = null;
    this.valid = true;
    this.runID = -1;
    this.syncCallback = null;
    this.step = false;
    this.runMode = VM_RUN_MODE.asm;
    this.period = 50;
    this.instructionsPerPulse = VM_IPP[VM_SPEED_OPTIONS.NORMAL];
    this.dataIndexI1 = VM_CONSTANTS.I_BEGIN_INDEX;
    this.dataIndexO8 = this.dataIndexI1 + 15;
    this.dataIndexT = this.dataIndexO8 + 3;
    this.dataIndexR = this.dataIndexT + 1;

    this.dataIndexTimerPeriod = this.dataIndexR + 1;
    this.dataIndexTimerValue = this.dataIndexTimerPeriod + 4;

    this.dataIndexTimerEnabled = this.dataIndexTimerValue + 4;
    this.dataIndexUartEnabled = this.dataIndexTimerEnabled + 4;

    this.dataIndexISR1Location = this.dataIndexUartEnabled + 4;
    this.dataIndexISR2Location = this.dataIndexISR1Location + 4;

    this.dataIndexTimerState = this.dataIndexISR2Location + 4;
    this.dataIndexRxState = this.dataIndexTimerState + 4;

    this.dataIndexTxFlag = this.dataIndexRxState + 4;
    this.dataIndexRxFlag = this.dataIndexTxFlag + 1;

    this.dataIndexInterruptsEnabled = this.dataIndexRxFlag + 1;

    this.dataIndexFailFlag = this.dataIndexInterruptsEnabled + 4;
    this.dataIndexSleepToggle = this.dataIndexFailFlag + 1;
    this.signalLogger = new SignalLogger();
}

// Sets the current speed of the vm, |speedOption| - VM_SPEED_OPTIONS
VirtualMachine.prototype.setSpeed = function(speedOption) {
    // Go even slower
    if (speedOption === VM_SPEED_OPTIONS.SLOWEST) {
        var self = this;
        this.period = 250;
        if (this.isRunning()) {
            clearInterval(this.runID);
            this.runID = setInterval(function() {
                self.executeTick();
            }, this.period);
        }
    }

    // We were previously running at 1 ipp
    else if (this.instructionsPerPulse === 1) {
        var self = this;
        this.period = 50;
        if (this.isRunning()) {
            clearInterval(this.runID);
            this.runID = setInterval(function() {
                self.executeTick();
            }, this.period);
        }
    }
    this.instructionsPerPulse = VM_IPP[speedOption];
};

// Sets the console, |Console| - Console
VirtualMachine.prototype.setConsole = function(Console) {
    this.state.Console = Console;
};

// Sets the run mode, |runMode| - VM_RUN_MODE
VirtualMachine.prototype.setRunMode = function(runMode) {
    this.runMode = runMode;
};

// Check whether the VM has failed.
VirtualMachine.prototype.failed = function() {
    return this.state.data[this.dataIndexFailFlag];
};

// Initialize the A pins to the passed in value |A| - integer and the B pins to 0
VirtualMachine.prototype.initPins = function(A) {
    this.state.data[PINS.A] = A;
    this.state.data[PINS.A0] = A & 0x01;
    this.state.data[PINS.A1] = (A >> 1) & 0x01;
    this.state.data[PINS.A2] = (A >> 2) & 0x01;
    this.state.data[PINS.A3] = (A >> 3) & 0x01;
    this.state.data[PINS.A4] = (A >> 4) & 0x01;
    this.state.data[PINS.A5] = (A >> 5) & 0x01;
    this.state.data[PINS.A6] = (A >> 6) & 0x01;
    this.state.data[PINS.A7] = (A >> 7) & 0x01;
    for (var i = 8; i < 16; i++) {
        this.state.data[VM_CONSTANTS.I_BEGIN_INDEX + i] = 0;
    }
    this.state.data[PINS.B] = 0;
};

/*
    Set the value of a pin.
    |index| - integer
    |value| - integer
*/
VirtualMachine.prototype.setPin = function(index, value) {
    if (index > PINS.B) {
        return;
    }
    var trueIndex = VM_CONSTANTS.I_BEGIN_INDEX + index;

    // If this is an 8 bit pin take in the full value
    if (index >= PINS.A) {
        this.state.data[trueIndex] = value & 0xFF;
    }
    else {
        if (index >= PINS.A0 && index <= PINS.A7) {
            this.signalLogger.emitSignal(this.state.currentTicks, value, 'A' + index);
        }
        else {
            this.signalLogger.emitSignal(this.state.currentTicks, value, 'B' + (index - 8));
        }
        this.state.data[trueIndex] = value & 0x01;
    }
};

// If any individual pin changed during the execution of the VM we need to update the A and B pins that contain them.
VirtualMachine.prototype.syncPins = function() {
    this.state.data[PINS.A] = 0;
    for (var i = 0; i < 8; i++) {
        this.state.data[PINS.A] |= (this.state.data[VM_CONSTANTS.I_BEGIN_INDEX + i] & 0x01) << i;
    }
    this.state.data[PINS.B] = 0;
    for (var i = 8; i < 16; i++) {
        this.state.data[PINS.B] |= (this.state.data[VM_CONSTANTS.I_BEGIN_INDEX + i] & 0x01) << (i - 8);
    }
};

// Gets the value of the pin at |index| - integer
VirtualMachine.prototype.getPin = function(index) {
    if (index > PINS.B) {
        return;
    }
    return this.state.data[VM_CONSTANTS.I_BEGIN_INDEX + index];
};

// Gets information about the registers, useful for debugging
VirtualMachine.prototype.getRegisterStateAsString = function() {
    var vmStateString = '';
    for (var i = 0; i < VM_CONSTANTS.INTEGER_REGISTERS; i++) {
        vmStateString += GiveRegisterName(i) + ': ' + this.state.registers.regI[i] + '\n';
    }
    return vmStateString;
};

// Gets information about the memory, useful for debugging
VirtualMachine.prototype.getMemoryStateAsString = function() {
    var vmStateString = '';
    this.state.data.forEach(function(value, i) {
        vmStateString += i + ': 0x' + ((value & 0xF0) >> 4).toString(16) + (value & 0x0F).toString(16) + '<br>';
    });
    return vmStateString;
};

/*
    Creates an object that contains all of the pc locations where a breakpoint occurs.
    |editorBreakpoints| - list of integers
*/
VirtualMachine.prototype.createBreakpointsFromEditor = function(editorBreakpoints) {
    this.state.breakpoints = {};
    var self = this;
    editorBreakpoints.forEach(function(breakpoint, i) {
        self.state.code.forEach(function(code, j) {
            if (code == undefined) {
                return;
            }
            if ((self.runMode === VM_RUN_MODE.asm) && (code.instructionInfo.assemblyLine === breakpoint) && (code.instructionInfo.filename.indexOf('RIMS.h') === -1)) {
                self.state.breakpoints[j] = true;
                return;
            }
            else if ((self.runMode === VM_RUN_MODE.c) && (code.instructionInfo.line === breakpoint) && (code.instructionInfo.filename.indexOf('RIMS.h') === -1)) {
                self.state.breakpoints[j] = true;
            }
        });
    });
};

// Initialize the VM, |code| - string
VirtualMachine.prototype.init = function(code) {
    this.state.pc = 0;
    this.state.broken = false;
    this.state.atBreakpoint = false;
    this.state.ISR1State = 0;
    this.state.currentTicks = 0;
    this.step = false;
    this.breakpoints = {};
    this.state.data[this.dataIndexFailFlag] = 0;
    this.valid = true;
    this.state.heap.reset();
    this.signalLogger.reset();
    for (var i = 0; i < (Object.keys(PINS).length - 2); i++) {
        if (i >= PINS.A0 && i <= PINS.A7) {
            this.signalLogger.emitSignal(this.state.currentTicks, this.getPin(i), 'A' + i);
        }
        else {
            this.signalLogger.emitSignal(this.state.currentTicks, this.getPin(i), 'B' + (i - 8));
        }
    }
    if (code) {
        for (var symbolName in PINS) {
            if ((symbolName === 'A') || (symbolName === 'B')) {
                continue;
            }
            if (code.indexOf(symbolName) !== -1) {
                this.signalLogger.addNeededSignal('*' + symbolName);
            }
        }
    }
    this.state.registers.reset();
    var self = this;
    this.hasExecuted = true;
    if (this.oldData) {
        // Copy all data that changes between executions
        for (var i = this.dataIndexT; i < this.state.data.length; i++) {
            this.state.data[i] = this.oldData[i];
        }
    }
    else {
        this.oldData = this.state.data.slice();
    }
};

// Begin the execution of the vm, |code| - string, |editorBreakpoints| - list of breakpoints
VirtualMachine.prototype.startExecution = function(code, editorBreakpoints) {
    this.init(code);
    this.createBreakpointsFromEditor(editorBreakpoints);
    var self = this;
    this.runID = setInterval(function() {
        self.executeTick();
    }, this.period);
};

// Begin vm execution and don't return until finished
VirtualMachine.prototype.runToCompletion = function() {
    this.init();
    return this.executeAllInstructions();
};

// Begin vm execution and don't return until |lineNumber| - integer - c code line - has been reached
VirtualMachine.prototype.runTillLine = function(lineNumber) {
    this.init();
    while (this.ip && (this.ip.instructionInfo.line !== lineNumber)) {
        this.executeSingleInstruction();
    }
};

// Run the vm starting from pc value |minAssemblyLine| and ending with pc value |maxAssemblyLine|
VirtualMachine.prototype.runInstructionsBetween = function(minAssemblyLine, maxAssemblyLine) {
    this.state.pc = minAssemblyLine;
    var failedToFinish = false;
    var maxTime = 5000;
    var then = Date.now();
    var now;
    var elapsed = 0;

    // Keep running until failure or we finished
    while ((this.state.pc !== maxAssemblyLine) && !failedToFinish) {
        this.executeInstruction();
        now = Date.now();
        elapsed += now - then;
        then = now;
        if (elapsed >= maxTime) {
            failedToFinish = true;
        }
    }

    if (failedToFinish) {
        return 'Code took too long to execute';
    }
    if (this.state.data[this.dataIndexFailFlag]) {
        return 'Code execution failed';
    }
    else {
        return '';
    }
};

// Executes everything
VirtualMachine.prototype.executeAllInstructions = function() {
    var failedToFinish = false;
    var maxTime = 5000;
    var then = Date.now();
    var now;
    var elapsed = 0;

    // Keep running until failure or we finished
    while (this.executeSingleInstruction() && !failedToFinish) {
        now = Date.now();
        elapsed += now - then;
        then = now;
        if (elapsed >= maxTime) {
            failedToFinish = true;
        }
    }

    if (failedToFinish) {
        return 'Code took too long to execute';
    }
    else if (this.state.data[this.dataIndexFailFlag]) {
        return 'Code execution failed';
    }
    else {
        return '';
    }
};

// Returns true if the vm has been run before but is not currently running
VirtualMachine.prototype.notCurrentlyExecuting = function() {
    return this.hasExecuted && ((!this.step && this.isBroken()) || !this.isRunning());
};

// Import the symbol table from the assembler, |symbols| - dictionary containing names and addresses
VirtualMachine.prototype.importSymbolTable = function(symbols) {
    this.state.symbols.import(symbols);
};

// Temporarily suspend vm execution
VirtualMachine.prototype.breakVM = function() {
    this.state.broken = true;
};

// VM could be broken from a breakpoint or an external command to break it.
VirtualMachine.prototype.isBroken = function() {
    return this.state.broken || this.state.atBreakpoint;
};

// VM is running as long as the pc is not 0.
VirtualMachine.prototype.isRunning = function() {
    return this.state.pc !== 0;
};

// Continue execution of a broken vm
VirtualMachine.prototype.resume = function() {
    this.state.broken = false;
    this.step = true;
};

// Take a step, execute a single line of code while being broken
VirtualMachine.prototype.takeStep = function() {
    this.step = true;
};

// Stops the vm, have to call one of the start execution functions to run again
VirtualMachine.prototype.stop = function() {
    this.state.pc = 0;
    this.broken = false;
    clearInterval(this.runID);
    this.runID = -1;
};

/*
    an unRecoverableError has occured output the error message and update the error flag.
    |str| - string, contains error message
*/
VirtualMachine.prototype.unRecoverableError = function(str) {
    this.writeByte(this.dataIndexFailFlag, 1, false);
    this.state.Console.error(str);
};

/*
    |syncCallback|, function to be called everytime execute finishes.
*/
VirtualMachine.prototype.setSyncCallback = function(syncCallback) {
    this.syncCallback = syncCallback;
};

// Returns the current mipsInstruction that will be run next
VirtualMachine.prototype.currentInstruction = function() {
    if (this.state.pc < this.state.code.length) {
        return this.state.code[this.state.pc];
    }
};

// Execute a free system call
VirtualMachine.prototype.executeFree = function() {
    var instructionToExecute = new MipsInstruction('addiu $ra, $0, ' + this.state.pc, 'VM', this);
    instructionToExecute.execute();
    this.state.heap.free(this.state.registers.regI[4]);
    instructionToExecute = new MipsInstruction('jr $ra', 'VM', this);
    instructionToExecute.execute();
};

// Execute a malloc system call
VirtualMachine.prototype.executeMalloc = function() {
    var instructionToExecute = new MipsInstruction('addiu $ra, $0, ' + this.state.pc, 'VM', this);
    instructionToExecute.execute();
    var address = this.state.heap.malloc(this.state.registers.regI[4]);
    instructionToExecute = new MipsInstruction('jr $ra', 'VM', this);
    instructionToExecute.execute();
    instructionToExecute = new MipsInstruction('addiu $v0, $0, ' + address, 'VM', this);
    instructionToExecute.execute();
};

// Execute a timer read system call
VirtualMachine.prototype.executeTimerRead = function() {
    var instructionToExecute = new MipsInstruction('addiu $ra, $0, ' + this.state.pc, 'VM', this);
    instructionToExecute.execute();
    var ticks = this.readWord(this.dataIndexTimerValue, false) / (this.state.ips / 1000);
    instructionToExecute = new MipsInstruction('jr $ra', 'VM', this);
    instructionToExecute.execute();
    instructionToExecute = new MipsInstruction('addiu $v0, $0, ' + ticks, 'VM', this);
    instructionToExecute.execute();
};

// Returns timing information used by the timer bar, includes |max| - integer - timer period, |currentValue| - integer - current value of the timer, |currentElapsed| - integer - total elapsed time.
VirtualMachine.prototype.getTimerInfo = function() {
    return {
        max:this.readWord(this.dataIndexTimerPeriod, false),
        currentValue: this.readWord(this.dataIndexTimerValue, false) / (this.state.ips / 1000),
        currentElapsed: this.state.currentTicks / (this.state.ips / 1000)
    };
};

// Executes the current instruction
VirtualMachine.prototype.executeInstruction = function() {
    this.ip = this.state.code[this.state.pc];
    this.state.pc++;
    if (typeof this.ip == 'undefined') {
        this.state.data[this.dataIndexFailFlag] = 1;
    }
    else if (this.ip.args[0] === 'malloc') {
        this.executeMalloc();
    }
    else if (this.ip.args[0] === 'free') {
        this.executeFree();
    }
    else if (this.ip.args[0] === 'TimerRead') {
        this.executeTimerRead();
    }
    else {
        this.ip.execute();
    }
    this.syncPins();
};

// Executes the current instruction and takes care of any state changes, also manages the execution of the timer
VirtualMachine.prototype.executeSingleInstruction = function() {
    this.state.registers.regI[0] = 0;
    this.executeInstruction();

    // Don't break on the same line of code we are already broken on.
    if ((this.state.pc in this.state.breakpoints) && !(this.brokeAtCurrentLine && (this.currentCLine === this.state.code[this.state.pc].instructionInfo.line))) {
        this.state.atBreakpoint = true;
        this.state.broken = true;
    }
    else {
        this.state.atBreakpoint = false;
    }

    this.state.currentTicks++;
    if ((this.state.pc == 0) || (this.state.data[this.dataIndexFailFlag])) {
        this.valid = false;
        this.state.pc = 0;
        return false;
    }

    if (this.state.atBreakpoint) {
        return false;
    }

    // Begin ISR handler code
    if (this.readWord(this.dataIndexTimerEnabled, false)) {
        if ((this.readWord(this.dataIndexTimerValue, false) >= (this.readWord(this.dataIndexTimerPeriod, false) * (this.state.ips / 1000))) && (this.readWord(this.dataIndexTimerPeriod, false) != 0)) {
            // We're in here if we need to service ISR1
            this.writeWord(this.dataIndexTimerValue, 0, false);// Reset the current counter, just so we don't jump back in here
            if (this.readWord(this.dataIndexInterruptsEnabled, false)) {
                if (this.state.ISR1State > 0) {
                    // We're already executing an ISR, but we need to service it again! uh-oh!
                    this.unRecoverableError('TimerISR is interrupting itself.  This means the ISR code is too long for the current timer interval.\n');
                    this.valid = false;
                    return false;
                }
                // Save the register & pc state
                this.state.beginInterrupt();
                // We should expect *ISR_executing to = 0 any time now
                this.state.ISR1State++;
                this.signalLogger.emitSignal(this.state.currentTicks, 1, 'TMR');
                var handlerToRun = new MipsInstruction('jal __ISR1_Handler', 'VM', this);
                handlerToRun.argumentInfo.argument[0] = this.state.symbols.lookUp('__ISR1_Handler').address;
                handlerToRun.execute();
                this.state.timerBreak = false;
                // So when the ISR is done, it jumps back to the location we were at before the ISR.
                // Force a re-load of the instruction to execute (PC changed since load).
                return true;
            }
        }
        this.writeWord(this.dataIndexTimerValue, this.readWord(this.dataIndexTimerValue, false) + 1, false);
    }

    if ((this.state.ISR1State > 0) && (this.readWord(this.dataIndexTimerState, false) < this.state.ISR1State)) {
        // If last we checked the ISR is still executing but it's not.
        if (this.state.pc == this.state.mostRecentCallee()) {
            // We're in here if we just finished executing the ISR and are jumping back to the code we were executing.
            this.state.endInterrupt();
            // So we don't trip this again until another ISR invocation finishes.
            this.state.ISR1State--;
            // We inserted an artificial instruction (the JAL __ISR1_Handler), so we need to account for that.
            this.state.currentTicks++;
            this.signalLogger.emitSignal(this.state.currentTicks, 0, 'TMR');
            return true;
        }
    }
    return true;
};

// Every tick |instructionsPerPulse| instructions are executed, after this the ui will get a callback executed syncing up information
VirtualMachine.prototype.executeTick = function() {
    var tookStep = this.step;
    this.currentCLine = this.state.code[this.state.pc].instructionInfo.line;
    this.brokeAtCurrentLine = this.state.atBreakpoint;
    for (var i = 0; i < this.instructionsPerPulse; i++) {
        if ((this.state.broken && this.step) || (this.state.atBreakpoint && this.step) || (!this.state.broken && !this.state.atBreakpoint)) {
            this.executeSingleInstruction();
            // Taking a step at a breakpoint.
            if (tookStep && (this.runMode === VM_RUN_MODE.asm)) {
                this.step = false;
                break;
            }
            // Taking a step at a breakpoint.
            if (tookStep && (this.runMode === VM_RUN_MODE.c) && (this.currentCLine !== this.state.code[this.state.pc].instructionInfo.line) && (this.state.code[this.state.pc].instructionInfo.filename.indexOf('RIMS.h') === -1)) {
                this.step = false;
                break;
            }
            if (!this.valid || this.state.atBreakpoint) {
                break;
            }
        }
    }
    if ((!this.valid) || (this.state.pc === 0) || ((this.state.data[this.dataIndexFailFlag] != undefined) && (this.state.data[this.dataIndexFailFlag] == 1))) {
        this.stop();
    }
    if (this.syncCallback != null) {
        this.syncCallback();
    }
};

// |address| - integer, address to read.
VirtualMachine.prototype.internalReadByte = function(address) {
    return this.state.data[address];
};

// |address| - integer, address to read.
VirtualMachine.prototype.internalReadHalf = function(address) {
    return this.state.data[address] | (this.state.data[address + 1] << 8);
};

// |address| - integer, address to read.
VirtualMachine.prototype.internalReadWord = function(address) {
    return this.state.data[address] | (this.state.data[address + 1] << 8) | (this.state.data[address + 2] << 16) | (this.state.data[address + 3] << 24);
};

// |address| - integer, address to read.
VirtualMachine.prototype.internalReadWordF = function(address) {
    var asInteger = this.state.data[address] | (this.state.data[address + 1] << 8) | (this.state.data[address + 2] << 16) | (this.state.data[address + 3] << 24);
    var theFloat = IEEEToFloat(asInteger);
    return theFloat;
};

// |address| - integer, address to read.
VirtualMachine.prototype.internalReadWordD = function(address) {
    var bothHalves = [ this.state.data[address + 4] | (this.state.data[address + 5] << 8) | (this.state.data[address + 6] << 16) | (this.state.data[address + 7] << 24), this.state.data[address] | (this.state.data[address + 1] << 8) | (this.state.data[address + 2] << 16) | (this.state.data[address + 3] << 24) ];
    var theDouble = IEEEToDouble(bothHalves);
    return theDouble;
};

// Convert float to IEEE reprensetation of the float, |f| the float to convert
function floatToIEEE(f) {
    var buf = new ArrayBuffer(8);
    (new Float32Array(buf))[0] = f;
    return (new Uint32Array(buf))[0];
}

// Convert double to IEEE reprensetation of the double, |d| the double to convert
function doubleToIEEE(d) {
    var buf = new ArrayBuffer(8);
    (new Float64Array(buf))[0] = d;
    return [ (new Uint32Array(buf))[0], (new Uint32Array(buf))[1] ];
}

// Convert from the IEEE reprensetation of the double to the double's value, |d| the double to convert
function IEEEToDouble(d) {
    var buffer = new ArrayBuffer(8);
    (new Uint32Array(buffer))[0] = d[0];
    (new Uint32Array(buffer))[1] = d[1];
    return new Float64Array(buffer)[0];
}

// Convert from the IEEE reprensetation of the float to the float's value, |f| the float to convert
function IEEEToFloat(f) {
    var buffer = new ArrayBuffer(8);
    (new Uint32Array(buffer))[0] = f;
    return new Float32Array(buffer)[0];
}

/*
    Writes a byte in memory
    |address| - integer, address to write to.
    |data| - integer, value to write.
*/
VirtualMachine.prototype.internalWriteByte = function(address, data) {
    this.state.data[address] = data;
};

/*
    Writes a half word in memory
    |address| - integer, address to write to.
    |data| - integer, value to write.
*/
VirtualMachine.prototype.internalWriteHalf = function(address, data) {
    this.state.data[address] = data & 0x000000FF;
    this.state.data[address + 1] = (data & 0x0000FF00) >> 8;
};

/*
    Writes a word in memory
    |address| - integer, address to write to.
    |data| - integer, value to write.
*/
VirtualMachine.prototype.internalWriteWord = function(address, data) {
    this.state.data[address] = data & 0x000000FF;
    this.state.data[address + 1] = (data & 0x0000FF00) >> 8;
    this.state.data[address + 2] = (data & 0x00FF0000) >> 16;
    this.state.data[address + 3] = (data & 0xFF000000) >> 24;
};

/*
    Writes a float in memory
    |address| - integer, address to write to.
    |data| - integer, value to write.
*/
VirtualMachine.prototype.internalWriteWordF = function(address, data) {
    var asInteger = floatToIEEE(data);
    this.state.data[address] = asInteger & 0x000000FF;
    this.state.data[address + 1] = (asInteger & 0x0000FF00) >> 8;
    this.state.data[address + 2] = (asInteger & 0x00FF0000) >> 16;
    this.state.data[address + 3] = (asInteger & 0xFF000000) >> 24;
};

/*
    Writes a double in memory
    |address| - integer, address to write to.
    |data| - integer, value to write.
*/
VirtualMachine.prototype.internalWriteWordD = function(address, data) {
    var asInteger = doubleToIEEE(data);
    this.state.data[address] = asInteger[1] & 0xFF;
    this.state.data[address + 1] = (asInteger[1] & 0xFF00) >> 8;
    this.state.data[address + 2] = (asInteger[1] & 0xFF0000) >> 16;
    this.state.data[address + 3] = (asInteger[1] & 0xFF000000) >> 24;
    this.state.data[address + 4] = asInteger[1] & 0xFF;
    this.state.data[address + 5] = (asInteger[1] & 0xFF00) >> 8;
    this.state.data[address + 6] = (asInteger[1] & 0xFF0000) >> 16;
    this.state.data[address + 7] = (asInteger[1] & 0xFF000000) >> 24;
};

/*
    Reads a byte from memory
    |address| - integer, address to read.
    |isDebug| - boolean, true if running in debug mode.
*/
VirtualMachine.prototype.readByte = function(address, isDebug) {
    if (address <= this.state.dataSize) {
        return this.internalReadByte(address);
    }
    else if (!isDebug) {
        this.unRecoverableError(this.ip.instructionInfo.line + ': Byte read not within data segment boundaries!\n');
        this.state.pc = 0;
    }
    return 0;
};

/*
    Reads a half word from memory
    |address| - integer, address to read.
    |isDebug| - boolean, true if running in debug mode.
*/
VirtualMachine.prototype.readHalf = function(address, isDebug) {
    if (address <= this.state.dataSize) {
        return this.internalReadHalf(address);
    }
    else if (!isDebug) {
        this.unRecoverableError(this.ip.instructionInfo.line + ': Half read not within data segment boundaries!\n');
        this.state.pc = 0;
    }
    return 0;
};

/*
    Reads a word from memory
    |address| - integer, address to read.
    |isDebug| - boolean, true if running in debug mode.
*/
VirtualMachine.prototype.readWord = function(address, isDebug) {
    if (address <= this.state.dataSize) {
        return this.internalReadWord(address);
    }
    else if (!isDebug) {
        this.unRecoverableError(this.ip.instructionInfo.line + ': Word read not within data segment boundaries!\n');
        this.state.pc = 0;
    }
    return 0;
};

/*
    Reads a float from memory
    |address| - integer, address to read.
    |isDebug| - boolean, true if running in debug mode.
*/
VirtualMachine.prototype.readWordF = function(address, isDebug) {
    if (address <= this.state.dataSize) {
        return this.internalReadWordF(address);
    }
    else if (!isDebug) {
        this.unRecoverableError(this.ip.instructionInfo.line + ': Word read not within data segment boundaries!\n');
        this.state.pc = 0;
    }
    return 0;
};

/*
    Reads a double from memory
    |address| - integer, address to read.
    |isDebug| - boolean, true if running in debug mode.
*/
VirtualMachine.prototype.readWordD = function(address, isDebug) {
    if (address <= this.state.dataSize) {
        return this.internalReadWordD(address);
    }
    else if (!isDebug) {
        this.unRecoverableError(this.ip.instructionInfo.line + ': Word read not within data segment boundaries!\n');
        this.state.pc = 0;
    }
    return 0;
};

/*
    Writes a byte to memory
    |address| - integer, address to write to.
    |data| - integer, value to write.
    |isDebug| - boolean, true if running in debug mode.
*/
VirtualMachine.prototype.writeByte = function(address, data, isDebug) {
    if (!isDebug) {
        if (address === VM_CONSTANTS.O_MEM_ADDR) {
            this.state.Console.out(String.fromCharCode(data));
            return;
        }
        else if ((address >= PINS.A0 && address <= PINS.A7) || address === PINS.A) {
            this.unRecoverableError(this.ip.instructionInfo.line + ': Inputs should never be written to.\n');
        }
        else if (address >= PINS.B0 && address <= PINS.B7) {
            // One of B(0-7) changed; update B
            data &= 0x01;
            this.setPin(address, data);
        }
        else if (address === PINS.B) {
            // B changed; update B(0-7)
            for (var i = (this.dataIndexI1 + 8); i < ((this.dataIndexI1 + 8) + 8); i++) {
                this.setPin(VM_CONSTANTS.I_BEGIN_INDEX + i, (data >> (i - 8)) & 0x01);
            }
        }
    }
    if (address <= this.state.dataSize) {
        this.internalWriteByte(address, data);
    }
    else if (!isDebug) {
        this.unRecoverableError(this.ip.instructionInfo.line + ': Byte written not within data segment boundaries!\n');
        this.state.pc = 0;
    }
};

/*
    Writes a half word to memory
    |address| - integer, address to write to.
    |data| - integer, value to write.
    |isDebug| - boolean, true if running in debug mode.
*/
VirtualMachine.prototype.writeHalf = function(address, data, isDebug) {
    if (address <= this.state.dataSize) {
        this.internalWriteHalf(address, data);
    }
    else if (!isDebug) {
        this.unRecoverableError(this.ip.instructionInfo.line + ': Half written not within data segment boundaries!\n');
        this.state.pc = 0;
    }
};

/*
    Writes a word to memory
    |address| - integer, address to write to.
    |data| - integer, value to write.
    |isDebug| - boolean, true if running in debug mode.
*/
VirtualMachine.prototype.writeWord = function(address, data, isDebug) {
    if (address <= this.state.dataSize) {
        this.internalWriteWord(address, data);
    }
    else if (!isDebug) {
        this.unRecoverableError(this.ip.instructionInfo.line + ': Word written not within data segment boundaries!\n');
        this.state.pc = 0;
    }
};

/*
    Writes a float to memory
    |address| - integer, address to write to.
    |data| - integer, value to write.
    |isDebug| - boolean, true if running in debug mode.
*/
VirtualMachine.prototype.writeWordF = function(address, data, isDebug) {
    if (address <= this.state.dataSize) {
        this.internalWriteWordF(address, data);
    }
    else if (!isDebug) {
        this.unRecoverableError(this.ip.instructionInfo.line + ': Word written not within data segment boundaries!\n');
        this.state.pc = 0;
    }
};

/*
    Writes a double to memory
    |address| - integer, address to write to.
    |data| - integer, value to write.
    |isDebug| - boolean, true if running in debug mode.
*/
VirtualMachine.prototype.writeWordD = function(address, data, isDebug) {
    if (address <= this.state.dataSize) {
        this.internalWriteWordD(address, data);
    }
    else if (!isDebug) {
        this.unRecoverableError(this.ip.instructionInfo.line + ': Word written not within data segment boundaries!\n');
        this.state.pc = 0;
    }
};
