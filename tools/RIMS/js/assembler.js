/*
    Class that assembles the assembly code.
    |code| is required and a list of strings, assembly file as a list of strings.
    |vm| is required and a VirtualMachine, the vm that will be running this code
    |Console| is required and a Console, console to write out errors.
*/
function Assembler(code, vm, Console) {
    this.currentLine = 0;
    this.currentAssemblyLine = 0;
    this.currentFile = '';
    this.dataAddress = VM_CONSTANTS.DATASEG_BEGIN;
    this.codeAddress = VM_CONSTANTS.CODESEG_BEGIN;
    this.isText = true;
    this.assembled = false;
    this.symbols = new SymbolTable();
    this.fixes = [];
    this.vm = vm;
    this.code = code;
    this.Console = Console;
}

/*
    These will be inserted into the symbol table and have
    reserved space in the data segment... They are essentially
    compiler-defined variables that the programmer can use by name,
    and we can use by known address within the data segment.
*/
Assembler.__I = 'A';
Assembler.__O = 'B';
Assembler.__R = 'R';
Assembler.__T = 'T';
Assembler.__I1 = 'A0';
Assembler.__I2 = 'A1';
Assembler.__I3 = 'A2';
Assembler.__I4 = 'A3';
Assembler.__I5 = 'A4';
Assembler.__I6 = 'A5';
Assembler.__I7 = 'A6';
Assembler.__I8 = 'A7';
Assembler.__O1 = 'B0';
Assembler.__O2 = 'B1';
Assembler.__O3 = 'B2';
Assembler.__O4 = 'B3';
Assembler.__O5 = 'B4';
Assembler.__O6 = 'B5';
Assembler.__O7 = 'B6';
Assembler.__O8 = 'B7';
Assembler.__MAXTICKS = '__timer_ticks';
Assembler.__CURTICKS = '__cur_ticks';
Assembler.__TENABLED = '__timer_enabled';
Assembler.__UENABLED = '__uart_enabled';
Assembler.__ISR1_OC = '__ISR1_address';
Assembler.__ISR2_OC = '__ISR2_address';
Assembler.__ISR1_EXEC = '__ISR1_isexecuting';
Assembler.__ISR2_EXEC = '__ISR2_isexecuting';
Assembler.__TX_FLAG = 'TxReady';
Assembler.__RX_FLAG = 'RxComplete';
Assembler.__FAIL_FLAG = '__fail_flag';
Assembler.__SLEEP_TOGGLE = '__has_executed';
Assembler.__INTERRUPTS_ENABLED = '__interrupts_enabled';
Assembler.__SETJMP = 'setjmp';
Assembler.__LONGJMP = 'longjmp';
Assembler.__MALLOC = 'malloc';
Assembler.__FREE = 'free';
Assembler.__TIMERREAD = 'TimerRead';

// Assembles the code, will return true if no error occured
Assembler.prototype.assemble = function() {
    this.symbols.reset();
    this.fixes = [];
    this.errorExists = false;
    this.codeAddress = VM_CONSTANTS.CODESEG_BEGIN;
    this.dataAddress = VM_CONSTANTS.I_BEGIN_INDEX;
    this.isText = false;
    /*
        Insert the 8 inputs and 8 outputs symbol names at the top of dataSeg, so the
        C program can easily reference the vars
        and we always know where they are (so we can use them)
    */
    // Address: 0
    this.symbols.modify(Assembler.__I1, this.dataAddress++, 1, true);
    this.symbols.modify(Assembler.__I2, this.dataAddress++, 1, true);
    this.symbols.modify(Assembler.__I3, this.dataAddress++, 1, true);
    this.symbols.modify(Assembler.__I4, this.dataAddress++, 1, true);
    this.symbols.modify(Assembler.__I5, this.dataAddress++, 1, true);
    this.symbols.modify(Assembler.__I6, this.dataAddress++, 1, true);
    this.symbols.modify(Assembler.__I7, this.dataAddress++, 1, true);
    this.symbols.modify(Assembler.__I8, this.dataAddress++, 1, true);
    // Address: 8
    this.symbols.modify(Assembler.__O1, this.dataAddress++, 1, true);
    this.symbols.modify(Assembler.__O2, this.dataAddress++, 1, true);
    this.symbols.modify(Assembler.__O3, this.dataAddress++, 1, true);
    this.symbols.modify(Assembler.__O4, this.dataAddress++, 1, true);
    this.symbols.modify(Assembler.__O5, this.dataAddress++, 1, true);
    this.symbols.modify(Assembler.__O6, this.dataAddress++, 1, true);
    this.symbols.modify(Assembler.__O7, this.dataAddress++, 1, true);
    this.symbols.modify(Assembler.__O8, this.dataAddress++, 1, true);
    /*
        Points to beginning of inputs
        address: 16
    */
    this.symbols.modify(Assembler.__I, this.dataAddress++, 1, true);
    /*
        Points to beginning of outputs
        address: 17
    */
    this.symbols.modify(Assembler.__O, this.dataAddress++, 1, true);
    this.symbols.modify(Assembler.__T, this.dataAddress++, 1, true);
    this.symbols.modify(Assembler.__R, this.dataAddress++, 1, true);
    // address 22
    this.symbols.modify(Assembler.__MAXTICKS, this.dataAddress, 4, true); this.dataAddress += 4;
    // address 26
    this.symbols.modify(Assembler.__CURTICKS, this.dataAddress, 4, true); this.dataAddress += 4;
    this.symbols.modify(Assembler.__TENABLED, this.dataAddress, 4, true); this.dataAddress += 4;
    // Insert the symbols for the timer and reserve space for them
    this.symbols.modify(Assembler.__UENABLED, this.dataAddress, 4, true); this.dataAddress += 4;
    this.symbols.modify(Assembler.__ISR1_LOC, this.dataAddress, 4, true); this.dataAddress += 4;
    this.symbols.modify(Assembler.__ISR2_LOC, this.dataAddress, 4, true); this.dataAddress += 4;
    this.symbols.modify(Assembler.__ISR1_EXEC, this.dataAddress, 4, true); this.dataAddress += 4;
    this.symbols.modify(Assembler.__ISR2_EXEC, this.dataAddress, 4, true); this.dataAddress += 4;
    this.symbols.modify(Assembler.__TX_FLAG, this.dataAddress, 1, true); this.dataAddress += 1;
    this.symbols.modify(Assembler.__RX_FLAG, this.dataAddress, 1, true); this.dataAddress += 1;
    this.symbols.modify(Assembler.__INTERRUPTS_ENABLED, this.dataAddress, 4, true); this.dataAddress += 4;
    this.symbols.modify(Assembler.__FAIL_FLAG, this.dataAddress, 1, true); this.dataAddress += 1;
    this.symbols.modify(Assembler.__SLEEP_TOGGLE, this.dataAddress, 1, true); this.dataAddress += 1;
    this.symbols.modify(Assembler.__SETJMP, this.dataAddress, 4, false); this.dataAddress += 4;
    this.symbols.modify(Assembler.__LONGJMP, this.dataAddress, 4, false); this.dataAddress += 4;
    this.symbols.modify(Assembler.__MALLOC, this.dataAddress, 4, false); this.dataAddress += 4;
    this.symbols.modify(Assembler.__FREE, this.dataAddress, 4, false); this.dataAddress += 4;
    this.symbols.modify(Assembler.__TIMERREAD, this.dataAddress, 4, false); this.dataAddress += 4;

    if (this.dataAddress > VM_CONSTANTS.DATASEG_BEGIN) {
        this.Console.error('Reserved symbols overstepped the reserved space boundary... \n');
        this.Console.error('Please allocate more space for the reserved section or remove\n');
        this.Console.error('some of the symbols in the reserved section.\n');
        this.errorExists = true;
    }
    // End reserved space symbols.
    this.dataAddress = VM_CONSTANTS.DATASEG_BEGIN;
    return this.execute();
};

// Reset the assembler
Assembler.prototype.reset = function() {
    this.symbols.reset();
    this.currentFile = '';
    this.currentLine = 0;
    this.codeAddress = VM_CONSTANTS.CODESEG_BEGIN;
    this.dataAddress = VM_CONSTANTS.DATASEG_BEGIN;
};

// Begins the assembly process
Assembler.prototype.execute = function() {
    this.read();
    /*
        Then go for broke... assemble it
        Now we have the code in raw assembly... but aren't you curious as to why
        we had codeAddress start at index 4 instead of 0?  Why's that?
        Well, we have code that could execute, but we don't have any code calling
        it!  We need to make it a real program.  Let's do it.
    */
    var tempCode;
    // $SP = $0 + (INITIAL_SP)
    tempCode = 'addiu $sp, $0, ' + VM_CONSTANTS.INITIAL_SP;
    this.vm.state.code[0] = new MipsInstruction(tempCode, this.currentFile, this.vm);
    /*
        $RA = $0 + 3
        point $ra to code that sets $ra to 0
        in other words, when the next function returns,
        it will return and execute code that sets the next
        return to end execution (because PC will be 0).
    */
    tempCode = 'addiu $ra, $0, 3';
    this.vm.state.code[1] = new MipsInstruction(tempCode, this.currentFile, this.vm);
    /*
        j __initialize__
        Jumps to our initialize function, which currently does nothing
        __initialize__ calls 'j $ra' at the end, and since $ra is 3,
        once __initialize__ is done, it returns to code[3], which is the next
        instruction (these two instructions are like a jal).
    */
    tempCode = 'j __initialize__';
    this.vm.state.code[2] = new MipsInstruction(tempCode, this.currentFile, this.vm);
    this.markForFixing('__initialize__', new Address(2, false));
    /*
        $ra = 0
        So the next j $ra will return PC to 0, which ends execution.
    */
    tempCode = 'addiu $ra, $0';
    this.vm.state.code[3] = new MipsInstruction(tempCode, this.currentFile, this.vm);
    /*
        j main
        jump to our main function... when main returns we're finished executing.
    */
    tempCode = 'j main';
    this.vm.state.code[4] = new MipsInstruction(tempCode, this.currentFile, this.vm);
    this.markForFixing('main', new Address(4, false));
    // Now we've assembled the whole source file
    this.assembled = true;
    // Now go back-annotate all the references to undefined labels
    return this.doAllFixes();
};

// Reads the file and does the grunt assembly work.
Assembler.prototype.read = function() {

    // Assembly line counter
    var linecount = 1;
    var found = -1;
    for (var i = 0; i < this.code.length; i++) {
        var buffer = this.code[i];

        // Separate line comments.
        if (buffer.length > 0 && buffer[0] === '#') {
            linecount++;
            continue;
        }

        // Allows for blank lines with only newline.
        if (buffer.trim().length <= 0) {
            linecount++;
            continue;
        }
        found = buffer.indexOf('#');

        // Mid line comments.
        if (found >= 0 && found < buffer.length) {
            buffer = buffer.substr(0, found);
        }
        if (buffer[0] !== '\'') {
            var tokens = buffer.split(';');
            for(var j = 0; j < tokens.length; j++) {
                buffer = tokens[j];

                if (!this.directive(buffer, linecount)) {
                    if (!this.label(buffer)) {
                        this.instruction(buffer);
                    }
                }

                if (this.dataAddress > VM_CONSTANTS.DATASPACE_SIZE - 4) {
                    this.Console.error('Ran out of data segment space.  Either increase the size of the\n');
                    this.Console.error('VM\'s data segment (defined as DATASPACE_SIZE in Miscellaneous.h)\n');
                    this.Console.error('or use fewer local variables and arrays in your program.\n');
                    this.errorExists = true;
                }

                if (this.codeAddress >= VM_CONSTANTS.CODESPACE_SIZE - 4) {
                    this.Console.error('Ran out of code segment space.  Either increase the size of the\n');
                    this.Console.error('VM\'s code segment (defined as CODESPACE_SIZE in Miscellaneous.h)\n');
                    this.Console.error(', simplify long code segments, or enable size optimization in your compiler.\n');
                    this.errorExists = true;
                }
            }
        }
        linecount++;
    }
    return 0;
};

/*
    Handles directives in the assembly code.
    |line| - string, line of assembly code.
    |linecount| - integer, current line.
*/
Assembler.prototype.directive = function(line, linecount) {
    var helper = line.split(/[\s,]+/);
    var helperNext = 1;
    var directive = helper[0];
    this.currentAssemblyLine = linecount;
    var tmp;
    switch(directive) {
        case '.rdata':
        case '.sdata':
        case '.data':
            this.isText = false;
            break;
        case '.text':
            this.isText = true;
            break;
        case '.align':
            tmp = helper[helperNext++];
            var align = (1 << parseInt(tmp));

            if (this.dataAddress % align !== 0) {
                this.dataAddress += (4 - (this.dataAddress % align));
            }
            break;
        case '.ent':
            tmp = helper[helperNext++];
            this.symbols.modify(tmp, this.codeAddress);
            break;
        case '.byte':
            var tmp = helper[helperNext++];
            var original = tmp;
            var argType = identifyArgumentType(tmp);
            var symbolData = this.symbols.lookUp(tmp);

            if (argType === ARGUMENT_TYPE.SYMBOL && (symbolData.address === -1)) {
                this.markForFixing(original, new Address(this.dataAddress));
            }
            else if (argType === ARGUMENT_TYPE.SYMBOL && (symbolData.address !== -1)) {
                tmp = this.symbols.lookUp(original).address;
            }

            if (this.symbols.reverseContains(this.dataAddress)) {
                // There is a symbol in the table already with this address
                var name = this.symbols.reverseLookup(this.dataAddress);
                if (this.symbols.lookUp(name).inDataSegment) {
                    // Mark it as a 1-byte data type if this is obviously the symbol we want
                    this.symbols.modify(name, this.dataAddress, 1, true);
                }
                else {
                    /*
                        The symbol we just got had the same address as we wanted, but it wasn't in the data segment (it was an address
                        referring to the code segment).  There's probably another symbol in here with the same address AND is in
                        the data segment.  That one is the one we want.  So let's take a deep look at the symbol table to find it.
                    */
                    for (var symbol in this.symbols.symbolLut) {
                        if (this.symbols.symbolLut[symbol].inDataSegment && this.symbols.symbolLut[symbol].address == this.dataAddress) {
                            this.symbols.modify(this.symbols.symbolLut[symbol].first, this.dataAddress, 1, true);
                        }
                    }
                }
            }
            this.vm.writeByte(this.dataAddress, parseInt(tmp));
            this.dataAddress++;
            break;
        case '.half':
            tmp = helper[helperNext++];
            var original = tmp;
            var argType = identifyArgumentType(tmp);
            var symbolData = this.symbols.lookUp(tmp);

            if (argType === ARGUMENT_TYPE.SYMBOL && (symbolData.address === -1)) {
                this.markForFixing(original, new Address(this.dataAddress));
            }
            else if (argType === ARGUMENT_TYPE.SYMBOL && (symbolData.address !== -1)) {
                tmp = this.symbols.lookUp(original).address;
            }

            if (this.symbols.reverseContains(this.dataAddress)) {
                // There is a symbol in the table already with this address
                var name = this.symbols.reverseLookup(this.dataAddress);
                if (this.symbols.lookUp(name).inDataSegment) {
                    // Mark it as a 2-byte data type if this is obviously the symbol we want
                    this.symbols.modify(name, this.dataAddress, 2, true);
                }
                else {
                    /*
                        The symbol we just got had the same address as we wanted, but it wasn't in the data segment (it was an address
                        referring to the code segment).  There's probably another symbol in here with the same address AND is in
                        the data segment.  That one is the one we want.  So let's take a deep look at the symbol table to find it.
                    */
                    for (var symbol in this.symbols.symbolLut) {
                        if (this.symbols.symbolLut[symbol].inDataSegment && this.symbols.symbolLut[symbol].address === this.dataAddress) {
                            this.symbols.modify(this.symbols.symbolLut[symbol].first, this.dataAddress, 2, true);
                        }
                    }
                }
            }
            this.vm.writeHalf(this.dataAddress, parseInt(tmp));
            this.dataAddress += 2;
            break;
        case '.word':
        case '.gpword':
            tmp = helper[helperNext++];
            var original = tmp;
            var argType = identifyArgumentType(tmp);
            var symbolData = this.symbols.lookUp(tmp);

            if (argType === ARGUMENT_TYPE.SYMBOL && (symbolData.address === -1)) {
                this.markForFixing(original, new Address(this.dataAddress, true));
            }
            else if (argType === ARGUMENT_TYPE.SYMBOL && (symbolData.address !== -1)) {
                tmp = this.symbols.lookUp(original).address;
            }

            if (this.symbols.reverseContains(this.dataAddress)) {
                // There is a symbol in the table already with this address
                var name = this.symbols.reverseLookup(this.dataAddress);
                if (this.symbols.lookUp(name).inDataSegment) {
                    // Mark it as a 4-byte data type if this is obviously the symbol we want
                    this.symbols.modify(name, this.dataAddress, 4, true);
                }
                else {
                    /*
                        The symbol we just got had the same address as we wanted, but it wasn't in the data segment (it was an address
                        referring to the code segment).  There's probably another symbol in here with the same address AND is in
                        the data segment.  That one is the one we want.  So let's take a deep look at the symbol table to find it.
                    */
                    for (var symbol in this.symbols.symbolLut) {
                        if (this.symbols.symbolLut[symbol].inDataSegment && this.symbols.symbolLut[symbol].address === this.dataAddress) {
                            this.symbols.modify(this.symbols.symbolLut[symbol].first, this.dataAddress, 4, true);
                        }
                    }
                }
            }
            this.vm.writeWord(this.dataAddress, parseInt(tmp));
            this.dataAddress += 4;
            break;
        case '.comm':
        case '.lcomm':
            var symbolName = helper[helperNext++];
            var size = helper[helperNext++];
            this.symbols.modify(symbolName, this.dataAddress, parseInt(size), true);
            this.dataAddress += parseInt(size);
            break;
        case '.space':
            tmp = helper[helperNext++];
            this.dataAddress += parseInt(tmp);
            break;
        case '.file':
            helperNext++;
            this.currentFile = helper[helperNext++];
            break;
        case '.loc':
            helperNext++;
            tmp = helper[helperNext++];
            this.currentLine = parseInt(tmp);
            break;
        case '.set':
        case '.fmask':
        case '.frame':
        case '.globl':
        case '.end':
        case '.extern':
        case '.mask':
        case '.cpload':
        case '.cprestore':
        case '.ascii':
        case '.asciiz':
        case '.cpadd':
            break;
        default:
            return false;
    }
    return true;
};

/*
    Handles all of the generation of assembly instructions.
    |line| - string, line of assembly code.
*/
Assembler.prototype.instruction = function(line) {
    var tmp = new MipsInstruction(line, this.currentFile, this.vm);

    // If a valid instruction was generated
    if (tmp.opCode !== undefined && tmp.opCode !== MIPS_OPCODES.OPC_LAST) {
        for(var i = 0; i < tmp.argumentInfo.argument.length; i++) {
            var temp = tmp.argumentInfo.argument[i];
            if (tmp.argumentInfo.argumentType[i] === ARGUMENT_TYPE.SYMBOL || (tmp.argumentInfo.argumentType[i] === ARGUMENT_TYPE.ADDRESS && identifyArgumentType(temp) === ARGUMENT_TYPE.SYMBOL)) {
                if (this.symbols.lookUp(temp).address === -1) {
                    this.markForFixing(temp, new Address(this.codeAddress, false));
                }
                else if (this.symbols.lookUp(temp).address !== -1) {
                    tmp.argumentInfo.argument[i] = this.symbols.lookUp(temp).address;
                }
            }
        }
        tmp.instructionInfo.filename = this.currentFile;
        tmp.instructionInfo.line = this.currentLine;
        tmp.instructionInfo.assemblyLine = this.currentAssemblyLine;// for assembly stepping points to the assembly line
        tmp.instructionInfo.vm = this.vm;
        this.vm.state.code[this.codeAddress++] = tmp;
        return true;
    }
    this.Console.error(this.currentFile + ':' + this.currentAssemblyLine + ': Invalid instruction: ' + line + '\n');
    this.errorExists = true;
    return false;
};

/*
    Handles the labels.
    |line| - string, line of assembly code.
*/
Assembler.prototype.label = function(line) {
    var trimmedLine = line.trim();

    if (trimmedLine[trimmedLine.length - 1] === ':') {
        trimmedLine = trimmedLine.substr(0, trimmedLine.length - 1);
        this.symbols.modify(trimmedLine, (this.isText ? this.codeAddress : this.dataAddress), 0, !this.isText);
        return true;
    }
    return false;
};

/*
    Marks for fixing and symbol that has not been declared yet.
*/
Assembler.prototype.markForFixing = function(symbol, address) {
    this.fixes.push({ first: address, second: symbol });
};

// |str| - string
function isValidArithmeticString(str) {
    return (str.indexOf('+') !== -1 || str.indexOf('-') !== -1 || str.indexOf('*') !== -1 || str.indexOf('/') !== -1 || str.indexOf('>>') !== -1 || str.indexOf('<<') !== -1);
}

// Fix all of the symbols that we marked previously.
Assembler.prototype.doAllFixes = function() {
    var success = true;
    if (this.vm.state.pc === 0) {
        if (this.assembled) {
            var self = this;
            this.fixes.forEach(function(value) {
                if (value.first.isData) {
                    var plusPos = value.second.indexOf('+');

                    if ((plusPos !== -1 && !self.symbols.contains(value.second.substr(0, pos))) || !self.symbols.contains(value.second)) {
                        self.Console.error('Undefined reference to symbol "' + value.second + '"!\n');
                        self.errorExists = true;
                        success = false;
                    }

                    if (value.second.indexOf('L.') !== -1) {
                        self.symbols.lookUp(value.second).contentLength = CONTENT_LENGTH.word;
                    }
                    switch (self.symbols.lookUp(value.second).contentLength) {
                        case CONTENT_LENGTH.byte:
                            self.vm.writeByte(value.first.address, self.symbols.lookUp(value.second).address, false);
                            break;
                        case CONTENT_LENGTH.half:
                            self.vm.writeHalf(value.first.address, self.symbols.lookUp(value.second).address, false);
                            break;
                        case CONTENT_LENGTH.word:
                            self.vm.writeWord(value.first.address, self.symbols.lookUp(value.second).address, false);
                            break;
                    }
                }
                else if (value.first.isCode) {

                    if (!self.symbols.contains(value.second.substr(0, value.second.indexOf('+'))) ||
                        self.symbols.lookUp(value.second).address === -1) {

                        if (isValidArithmeticString(value.second)) {
                                var pos = value.second.indexOf('+');

                                if (pos === -1) {
                                    pos = value.second.indexOf('-');
                                }
                                var symbolName = value.second.substr(0, pos);

                                if (self.symbols.lookUp(symbolName).address !== -1) {
                                    value.second = value.second.replace(symbolName, self.symbols.lookUp(symbolName).address);
                                }
                                var tmp = self.vm.state.code[value.first.address].argumentInfo.argument;
                                tmp[tmp.length - 1] = eval(value.second);
                            }
                            else if (value.second === 'RxISR' || value.second === 'TimerISR') {

                                if (!self.symbols.contains('DoNothing')) {
                                    self.Console.error('Please replace your RIMS.h file with the original file from the distribution package.\n');
                                    self.errorExists = true;
                                    success = false;
                                }

                                if (self.symbols.lookUp(value.second).address !== -1) {
                                    var tmp = self.vm.state.code[value.first.address].argumentInfo.argument;
                                    tmp[tmp.length - 1] = self.symbols.lookUp(value.second).address;
                                }
                                else {
                                    // link the ISR label to the DoNothing() function if the user didn't define an ISR function
                                    var tempInfo = self.symbols.lookUp('DoNothing');
                                    self.symbols.modify(value.second, tempInfo.address, tempInfo.contentLength, tempInfo.inDataSegment);
                                    var tmp = self.vm.state.code[value.first.address].argumentInfo.argument;
                                    tmp[tmp.length - 1] = tempInfo.address;
                                }
                            }
                            else if (self.symbols.lookUp(value.second).address !== -1) {
                                var tmp = self.vm.state.code[value.first.address].argumentInfo.argument;
                                tmp[tmp.length - 1] = self.symbols.lookUp(value.second).address;
                            }
                            else {
                                self.Console.error('Undefined reference to symbol "' + value.second + '"!\n');
                                self.errorExists = true;
                                success = false;
                            }
                    }
                }
            });
        }
    }
    if (!this.symbols.contains('main')) {
        this.Console.error('You must define a main() function.\n');
        this.errorExists = true;
        success = false;
    }
    if (this.errorExists) {
        success = false;
    }
    if (!success) {
        this.symbols.reset();
        this.Console.error('assembly failed.');
        this.errorExists = true;
    }
    this.assembled = success;
    return success;
};

// Get a copy of the generated symbol table.
Assembler.prototype.getSymbolTable = function() {
    return this.symbols.export();
};
