/*
    Class for each mips instruction contains everything needed to execute an instruction.
    |line| is required and a string, line of assembly that makes up this instruction.
    |filename| is required and a string, name of c file.
    |vm| is required and a VirtualMachine, vm that this instruction will be executed by.
*/
function MipsInstruction(line, filename, vm) {
    // Break down instructions ex. add $1 $2 $3
    var matches = line.match(/[\*\+\-\(\)\w$\.\<\>]+/g);
    if (matches) {
        this.args = matches.slice(1);
        this.opCode = giveOpCode(matches[0], this.args);
    }
    else {
        this.args = [];
        this.opCode = MIPS_OPCODES.OPC_LAST;
    }
    this.instructionInfo = new InstructionInfo();
    this.instructionInfo.filename = filename;
    this.instructionInfo.line = 0;
    this.instructionInfo.vm = vm;
    // Gather information about the args this will also simplify them
    this.argumentInfo = new ArgumentInfo(this.args, vm);
    this.createExecute();
}

/*
    Identifies what kind of argument |arg| is.
    This can be any of the choices from ARGUMENT_TYPE.
    |arg| - string
*/
function identifyArgumentType(arg) {
    if (!isNaN(arg)) {
        return ARGUMENT_TYPE.CONSTANT;
    }
    if (arg.trim().length === 0) {
        return ARGUMENT_TYPE.INVALID;
    }
    var argumentType;
    var regPos = arg.indexOf('$');
    var pos = arg.indexOf('(');
    if (pos !== -1) {
        pos = arg.indexOf(')');
        if (pos !== -1) {
            argumentType = ARGUMENT_TYPE.ADDRESS;
        }
        else {
            argumentType = ARGUMENT_TYPE.INVALID;
        }
    }
    else if (regPos !== -1) {
        if ((arg.length === 2) || (arg.length === 3) || ((arg[regPos + 1] === 'f') && ((arg.length === 3) || (arg.length === 4)))) {
            argumentType = ARGUMENT_TYPE.REGISTER;
        }
        else {
            argumentType = ARGUMENT_TYPE.INVALID;
        }
    }
    else if ((arg.length > 2) && (arg[0] === '0') && (arg[1] === 'x')) {
        argumentType = ARGUMENT_TYPE.CONSTANT;
    }
    else if (!isNaN(parseFloat(arg))) {
        argumentType = ARGUMENT_TYPE.CONSTANT;
    }
    else {
        argumentType = ARGUMENT_TYPE.SYMBOL;
    }
    return argumentType;
}

/*
    Returns opcode value from MIPS_OPCODES for the opcode given by |opCodeString|.
    |opCodeString| - string
*/
function giveOpCode(opCodeString) {
    switch (opCodeString.toLowerCase()) {
        case 'add':
            return MIPS_OPCODES.OPC_ADD;
        case 'addi':
            return MIPS_OPCODES.OPC_ADDI;
        case 'addiu':
            return MIPS_OPCODES.OPC_ADDIU;
        case 'move':
            return MIPS_OPCODES.OPC_ADDIU;
        case 'addu':
            return MIPS_OPCODES.OPC_ADDU;
        case 'and':
            return MIPS_OPCODES.OPC_AND;
        case 'andi':
            return MIPS_OPCODES.OPC_ANDI;
        case 'bc1t':
            return MIPS_OPCODES.OPC_BC1T;
        case 'bc1f':
            return MIPS_OPCODES.OPC_BC1F;
        case 'beq':
            return MIPS_OPCODES.OPC_BEQ;
        case 'bgez':
            return MIPS_OPCODES.OPC_BGEZ;
        case 'bgezal':
            return MIPS_OPCODES.OPC_BGEZAL;
        case 'bgtz':
            return MIPS_OPCODES.OPC_BGTZ;
        case 'blez':
            return MIPS_OPCODES.OPC_BLEZ;
        case 'bltz':
            return MIPS_OPCODES.OPC_BLTZ;
        case 'bltzal':
            return MIPS_OPCODES.OPC_BLTZAL;
        case 'bne':
            return MIPS_OPCODES.OPC_BNE;
        case 'div':
            return MIPS_OPCODES.OPC_DIV;
        case 'divu':
            return MIPS_OPCODES.OPC_DIVU;
        case 'b':
            return MIPS_OPCODES.OPC_J;
        case 'j':
            return MIPS_OPCODES.OPC_J;
        case 'jal':
            return MIPS_OPCODES.OPC_JAL;
        case 'jalr':
            return MIPS_OPCODES.OPC_JALR;
        case 'jr':
            return MIPS_OPCODES.OPC_JR;
        case 'lb':
            return MIPS_OPCODES.OPC_LB;
        case 'lbu':
            return MIPS_OPCODES.OPC_LBU;
        case 'lh':
            return MIPS_OPCODES.OPC_LH;
        case 'ulh':
            return MIPS_OPCODES.OPC_LH;
        case 'lhu':
            return MIPS_OPCODES.OPC_LHU;
        case 'ulhu':
            return MIPS_OPCODES.OPC_LHU;
        case 'lw':
            return MIPS_OPCODES.OPC_LW;
        case 'ulw':
            return MIPS_OPCODES.OPC_LW;
        case 'lui':
            return MIPS_OPCODES.OPC_LUI;
        case 'mfhi':
            return MIPS_OPCODES.OPC_MFHI;
        case 'mflo':
            return MIPS_OPCODES.OPC_MFLO;
        case 'mthi':
            return MIPS_OPCODES.OPC_MTHI;
        case 'mtlo':
            return MIPS_OPCODES.OPC_MTLO;
        case 'mfc1':
            return MIPS_OPCODES.OPC_MFC1;
        case 'mtc1':
            return MIPS_OPCODES.OPC_MTC1;
        case 'mul':
            return MIPS_OPCODES.OPC_MULT;
        case 'mulu':
            return MIPS_OPCODES.OPC_MULTU;
        case 'noop':
            return MIPS_OPCODES.OPC_NOOP;
        case 'not':
            return MIPS_OPCODES.OPC_NOT;
        case 'or':
            return MIPS_OPCODES.OPC_OR;
        case 'ori':
            return MIPS_OPCODES.OPC_ORI;
        case 'sb':
            return MIPS_OPCODES.OPC_SB;
        case 'sh':
            return MIPS_OPCODES.OPC_SH;
        case 'ush':
            return MIPS_OPCODES.OPC_SH;
        case 'sll':
            return MIPS_OPCODES.OPC_SLL;
        case 'sllv':
            return MIPS_OPCODES.OPC_SLLV;
        case 'slt':
            return MIPS_OPCODES.OPC_SLT;
        case 'slti':
            return MIPS_OPCODES.OPC_SLTI;
        case 'sltu':
            return MIPS_OPCODES.OPC_SLTU;
        case 'sltiu':
            return MIPS_OPCODES.OPC_SLTIU;
        case 'sra':
            return MIPS_OPCODES.OPC_SRA;
        case 'srav':
            return MIPS_OPCODES.OPC_SRAV;
        case 'srl':
            return MIPS_OPCODES.OPC_SRL;
        case 'srlv':
            return MIPS_OPCODES.OPC_SRLV;
        case 'sub':
            return MIPS_OPCODES.OPC_SUB;
        case 'subu':
            return MIPS_OPCODES.OPC_SUBU;
        case 'sw':
            return MIPS_OPCODES.OPC_SW;
        case 'usw':
            return MIPS_OPCODES.OPC_SW;
        case 'xor':
            return MIPS_OPCODES.OPC_XOR;
        case 'xoi':
            return MIPS_OPCODES.OPC_XORI;
        case 'abs.d':
            return MIPS_OPCODES.OPC_ABS_D;
        case 'abs.s':
            return MIPS_OPCODES.OPC_ABS_S;
        case 'add.d':
            return MIPS_OPCODES.OPC_ADD_D;
        case 'add.s':
            return MIPS_OPCODES.OPC_ADD_S;
        case 'c.eq.d':
            return MIPS_OPCODES.OPC_C_EQ_D;
        case 'c.eq.s':
            return MIPS_OPCODES.OPC_C_EQ_S;
        case 'c.le.d':
            return MIPS_OPCODES.OPC_C_LE_D;
        case 'c.le.s':
            return MIPS_OPCODES.OPC_C_LE_S;
        case 'c.lt.d':
            return MIPS_OPCODES.OPC_C_LT_D;
        case 'c.lt.s':
            return MIPS_OPCODES.OPC_C_LT_S;
        case 'cvt.d.s':
            return MIPS_OPCODES.OPC_CVT_D_S;
        case 'cvt.d.w':
            return MIPS_OPCODES.OPC_CVT_D_W;
        case 'cvt.s.d':
            return MIPS_OPCODES.OPC_CVT_S_D;
        case 'cvt.s.w':
            return MIPS_OPCODES.OPC_CVT_S_W;
        case 'trunc.w.d':
            return MIPS_OPCODES.OPC_CVT_W_D;
        case 'trunc.w.s':
            return MIPS_OPCODES.OPC_CVT_W_S;
        case 'cvt.w.d':
            return MIPS_OPCODES.OPC_CVT_W_D;
        case 'cvt.w.s':
            return MIPS_OPCODES.OPC_CVT_W_S;
        case 'div.d':
            return MIPS_OPCODES.OPC_DIV_D;
        case 'div.s':
            return MIPS_OPCODES.OPC_DIV_S;
        case 'l.d':
            return MIPS_OPCODES.OPC_L_D;
        case 'l.s':
            return MIPS_OPCODES.OPC_L_S;
        case 'mov.d':
            return MIPS_OPCODES.OPC_MOV_D;
        case 'mov.s':
            return MIPS_OPCODES.OPC_MOV_S;
        case 'mul.d':
            return MIPS_OPCODES.OPC_MUL_D;
        case 'mul.s':
            return MIPS_OPCODES.OPC_MUL_S;
        case 'neg.d':
            return MIPS_OPCODES.OPC_NEG_D;
        case 'neg.s':
            return MIPS_OPCODES.OPC_NEG_S;
        case 's.d':
            return MIPS_OPCODES.OPC_S_D;
        case 's.s':
            return MIPS_OPCODES.OPC_S_S;
        case 'sub.d':
            return MIPS_OPCODES.OPC_SUB_D;
        case 'sub.s':
            return MIPS_OPCODES.OPC_SUB_S;
        case 'negu':
            return MIPS_OPCODES.OPC_NEGU;
        // VuC Extension:
        case 'la':
            return MIPS_OPCODES.OPC_LA;
        case 'bgt':
            return MIPS_OPCODES.OPC_BGT;
        case 'bgtu':
            return MIPS_OPCODES.OPC_BGTU;
        case 'bge':
            return MIPS_OPCODES.OPC_BGE;
        case 'bgeu':
            return MIPS_OPCODES.OPC_BGEU;
        case 'blt':
            return MIPS_OPCODES.OPC_BLT;
        case 'bltu':
            return MIPS_OPCODES.OPC_BLTU;
        case 'ble':
            return MIPS_OPCODES.OPC_BLE;
        case 'bleu':
            return MIPS_OPCODES.OPC_BLEU;
        case 'rem':
            return MIPS_OPCODES.OPC_REM;
        case 'remu':
            return MIPS_OPCODES.OPC_REMU;
        // Additional floating point.
        case 'c.ult.d':
            return MIPS_OPCODES.OPC_C_ULT_D;
        case 'c.ult.s':
            return MIPS_OPCODES.OPC_C_ULT_S;
        case 'mfc1.d':
            return MIPS_OPCODES.OPC_MFC1_D;
        case 'mtc1.d':
            return MIPS_OPCODES.OPC_MTC1_D;
        case 'mfc1':
            return MIPS_OPCODES.OPC_MFC1;
        case 'mtc1':
            return MIPS_OPCODES.OPC_MTC1;
        case 'c.ule.d':
            return MIPS_OPCODES.OPC_C_ULE_D;
        case 'c.ule.s':
            return MIPS_OPCODES.OPC_C_ULE_S;
        // End VuC Extension.
        case '':
        default:
            return MIPS_OPCODES.OPC_LAST;
    }
}

/*
    Returns name of the register from MIPS_REGISTERS given by the |registerNumber|.
    |registerNumber| - integer
*/
function GiveRegisterName(registerNumber) {
    for (key in MIPS_REGISTERS) {
        if (MIPS_REGISTERS[key] === registerNumber) {
            return key;
        }
    }
    return null;
}

/*
    Returns number of the register from MIPS_REGISTERS given by the |stringRepresentation|.
    |stringRepresentation| - string
*/
function GiveRegister(stringRepresentation) {
    /*
        If they didn't specify a reg, try to use $0
        since $0 is constant (reads always = 0, writes
        have no effect).
    */
    if (stringRepresentation.length === 0) {
        return MIPS_REGISTERS.REG_ZR;
    }
    // Get rid of the leading $ if it exists
    if (stringRepresentation[0] === '$') {
        stringRepresentation = stringRepresentation.slice(1);
    }
    if (stringRepresentation[0] === 'f') {
        stringRepresentation = stringRepresentation.slice(1);
    }
    /*
        If they didn't specify a reg, try to use $0
        since $0 is constant (reads always = 0, writes
        have no effect).
    */
    if (stringRepresentation.length === 0) {
        return MIPS_REGISTERS.REG_ZR;
    }
    if (!isNaN(parseFloat(stringRepresentation))) {
        // uses the convention:
        // $32
        var registerNumber = parseFloat(stringRepresentation);
        if (registerNumber >= MIPS_REGISTERS.REG_ZR && registerNumber < MIPS_REGISTERS.REG_LAST) {
            return registerNumber;
        }
        return null;
    }
    else {
        // uses the convention:
        // $ra
        switch (stringRepresentation.toUpperCase()) {
            case 'ZR':
                return MIPS_REGISTERS.REG_ZR;
            case 'AT':
                return MIPS_REGISTERS.REG_AT;
            case 'V0':
                return MIPS_REGISTERS.REG_V0;
            case 'V1':
                return MIPS_REGISTERS.REG_V1;
            case 'A0':
                return MIPS_REGISTERS.REG_A0;
            case 'A1':
                return MIPS_REGISTERS.REG_A1;
            case 'A2':
                return MIPS_REGISTERS.REG_A2;
            case 'A3':
                return MIPS_REGISTERS.REG_A3;
            case 'T0':
                return MIPS_REGISTERS.REG_T0;
            case 'T1':
                return MIPS_REGISTERS.REG_T1;
            case 'T2':
                return MIPS_REGISTERS.REG_T2;
            case 'T3':
                return MIPS_REGISTERS.REG_T3;
            case 'T4':
                return MIPS_REGISTERS.REG_T4;
            case 'T5':
                return MIPS_REGISTERS.REG_T5;
            case 'T6':
                return MIPS_REGISTERS.REG_T6;
            case 'T7':
                return MIPS_REGISTERS.REG_T7;
            case 'S0':
                return MIPS_REGISTERS.REG_S0;
            case 'S1':
                return MIPS_REGISTERS.REG_S1;
            case 'S2':
                return MIPS_REGISTERS.REG_S2;
            case 'S3':
                return MIPS_REGISTERS.REG_S3;
            case 'S4':
                return MIPS_REGISTERS.REG_S4;
            case 'S5':
                return MIPS_REGISTERS.REG_S5;
            case 'S6':
                return MIPS_REGISTERS.REG_S6;
            case 'S7':
                return MIPS_REGISTERS.REG_S7;
            case 'T8':
                return MIPS_REGISTERS.REG_T8;
            case 'T9':
                return MIPS_REGISTERS.REG_T9;
            case 'K0':
                return MIPS_REGISTERS.REG_K0;
            case 'K1':
                return MIPS_REGISTERS.REG_K1;
            case 'GP':
                return MIPS_REGISTERS.REG_GP;
            case 'SP':
                return MIPS_REGISTERS.REG_SP;
            case 'FP':
                return MIPS_REGISTERS.REG_FP;
            case 'RA':
                return MIPS_REGISTERS.REG_RA;
            case 'LO':
                return MIPS_REGISTERS.REG_LO;
            case 'HI':
                return MIPS_REGISTERS.REG_HI;
        }
        return null;
    }
}

/*
    Generates the function for executing this instruction.
    The function can be found at this.execute.
*/
MipsInstruction.prototype.createExecute = function() {
    switch (this.opCode) {
        case MIPS_OPCODES.OPC_ADD:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (this.args.length === 2) {
                    this.args[2] = '0';
                    this.argumentInfo.argument[2] = 0;
                }
                if (this.args[2][0] === '$') {
                    IntegerRegister[(this.argumentInfo.registers[0])] = parseInt(IntegerRegister[(this.argumentInfo.registers[1])]) + parseInt(IntegerRegister[(this.argumentInfo.registers[2])]);
                }
                else {
                    IntegerRegister[(this.argumentInfo.registers[0])] = parseInt(IntegerRegister[(this.argumentInfo.registers[1])]) + this.argumentInfo.argument[2];
                }
            };
            break;
        case MIPS_OPCODES.OPC_ADDI:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                /*
                    If someone used the shortcut, where we don't specify
                    immediate, then assume it's 0.
                */
                if (this.args.length === 2) {
                    this.args[2] = '0';
                    this.argumentInfo.argument[2] = 0;
                }
                IntegerRegister[(this.argumentInfo.registers[0])] = parseInt(IntegerRegister[(this.argumentInfo.registers[1])]) + this.argumentInfo.argument[2];
            };
            break;
        case MIPS_OPCODES.OPC_ADDIU:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                /*
                    If someone used the shortcut, where we don't specify
                    immediate, then assume it's 0.
                */
                if (this.args.length === 2) {
                    this.args[2] = '0';
                    this.argumentInfo.argument[2] = 0;
                }
                IntegerRegister[(this.argumentInfo.registers[0])] = parseInt(IntegerRegister[(this.argumentInfo.registers[1])]) + this.argumentInfo.argument[2];
            };
            break;
        case MIPS_OPCODES.OPC_ADDU:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (this.args.length === 2) {
                    this.args[2] = '0';
                    this.argumentInfo.argument[2] = 0;
                }
                if (this.args[2][0] === '$') {
                    IntegerRegister[(this.argumentInfo.registers[0])] = parseInt(IntegerRegister[(this.argumentInfo.registers[1])]) + parseInt(IntegerRegister[(this.argumentInfo.registers[2])]);
                }
                else {
                    IntegerRegister[(this.argumentInfo.registers[0])] = parseInt(IntegerRegister[(this.argumentInfo.registers[1])]) + this.argumentInfo.argument[2];
                }
            };
            break;
        case MIPS_OPCODES.OPC_AND:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (this.args[2][0] === '$') {
                    IntegerRegister[(this.argumentInfo.registers[0])] = parseInt(IntegerRegister[(this.argumentInfo.registers[1])]) & parseInt(IntegerRegister[(this.argumentInfo.registers[2])]);
                }
                else {
                    IntegerRegister[(this.argumentInfo.registers[0])] = parseInt(IntegerRegister[(this.argumentInfo.registers[1])]) & this.argumentInfo.argument[2];
                }
            };
            break;
        case MIPS_OPCODES.OPC_ANDI:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                IntegerRegister[(this.argumentInfo.registers[0])] = parseInt(IntegerRegister[(this.argumentInfo.registers[1])]) & this.argumentInfo.argument[2];
            };
            break;
        case MIPS_OPCODES.OPC_BEQ:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (IntegerRegister[(this.argumentInfo.registers[0])] === IntegerRegister[(this.argumentInfo.registers[1])]) {
                    if ((this.argumentInfo.argumentType[2] === ARGUMENT_TYPE.SYMBOL)) {
                        this.instructionInfo.vm.state.pc = this.argumentInfo.argument[2];
                    }
                    else {
                        this.instructionInfo.vm.state.pc += this.argumentInfo.argument[2];
                    }
                }
            };
            break;
        case MIPS_OPCODES.OPC_BGEZ:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (IntegerRegister[(this.argumentInfo.registers[0])] >= 0) {
                    if ((this.argumentInfo.argumentType[1] === ARGUMENT_TYPE.SYMBOL)) {
                        this.instructionInfo.vm.state.pc = this.argumentInfo.argument[1];
                    }
                    else {
                        this.instructionInfo.vm.state.pc += this.argumentInfo.argument[1];
                    }
                }
            };
            break;
        case MIPS_OPCODES.OPC_BGEZAL:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (IntegerRegister[(this.argumentInfo.registers[0])] >= 0) {
                    IntegerRegister[MIPS_REGISTERS.REG_RA] = this.instructionInfo.vm.state.pc;
                    if ((this.argumentInfo.argumentType[1] === ARGUMENT_TYPE.SYMBOL)) {
                        this.instructionInfo.vm.state.pc = this.argumentInfo.argument[1];
                    }
                    else {
                        this.instructionInfo.vm.state.pc += this.argumentInfo.argument[1];
                    }
                }
            };
            break;
        case MIPS_OPCODES.OPC_BGT:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (IntegerRegister[(this.argumentInfo.registers[0])] > IntegerRegister[(this.argumentInfo.registers[1])]) {
                    if ((this.argumentInfo.argumentType[2] === ARGUMENT_TYPE.SYMBOL)) {
                        this.instructionInfo.vm.state.pc = this.argumentInfo.argument[2];
                    }
                    else {
                        this.instructionInfo.vm.state.pc += this.argumentInfo.argument[2];
                    }
                }
            };
            break;
        case MIPS_OPCODES.OPC_BGTU:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (IntegerRegister[(this.argumentInfo.registers[0])] > IntegerRegister[(this.argumentInfo.registers[1])]) {
                    if ((this.argumentInfo.argumentType[2] === ARGUMENT_TYPE.SYMBOL)) {
                        this.instructionInfo.vm.state.pc = this.argumentInfo.argument[2];
                    }
                    else {
                        this.instructionInfo.vm.state.pc += this.argumentInfo.argument[2];
                    }
                }
            };
            break;
        case MIPS_OPCODES.OPC_BGE:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (IntegerRegister[(this.argumentInfo.registers[0])] >= IntegerRegister[(this.argumentInfo.registers[1])]) {
                    if ((this.argumentInfo.argumentType[2] === ARGUMENT_TYPE.SYMBOL)) {
                        this.instructionInfo.vm.state.pc = this.argumentInfo.argument[2];
                    }
                    else {
                        this.instructionInfo.vm.state.pc += this.argumentInfo.argument[2];
                    }
                }
            };
            break;
        case MIPS_OPCODES.OPC_BGEU:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (IntegerRegister[(this.argumentInfo.registers[0])] >= IntegerRegister[(this.argumentInfo.registers[1])]) {
                    if ((this.argumentInfo.argumentType[2] === ARGUMENT_TYPE.SYMBOL)) {
                        this.instructionInfo.vm.state.pc = this.argumentInfo.argument[2];
                    }
                    else {
                        this.instructionInfo.vm.state.pc += this.argumentInfo.argument[2];
                    }
                }
            };
            break;
        case MIPS_OPCODES.OPC_BGTZ:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (IntegerRegister[(this.argumentInfo.registers[0])] >= 0) {
                    if ((this.argumentInfo.argumentType[1] === ARGUMENT_TYPE.SYMBOL)) {
                        this.instructionInfo.vm.state.pc = this.argumentInfo.argument[1];
                    }
                    else {
                        this.instructionInfo.vm.state.pc += this.argumentInfo.argument[1];
                    }
                }
            };
            break;
        case MIPS_OPCODES.OPC_BLEZ:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (IntegerRegister[(this.argumentInfo.registers[0])] <= 0) {
                    if ((this.argumentInfo.argumentType[1] === ARGUMENT_TYPE.SYMBOL)) {
                        this.instructionInfo.vm.state.pc = this.argumentInfo.argument[1];
                    }
                    else {
                        this.instructionInfo.vm.state.pc += this.argumentInfo.argument[1];
                    }
                }
            };
            break;
        case MIPS_OPCODES.OPC_BLT:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (IntegerRegister[(this.argumentInfo.registers[0])] < IntegerRegister[(this.argumentInfo.registers[1])]) {
                    if ((this.argumentInfo.argumentType[2] === ARGUMENT_TYPE.SYMBOL)) {
                        this.instructionInfo.vm.state.pc = this.argumentInfo.argument[2];
                    }
                    else {
                        this.instructionInfo.vm.state.pc += this.argumentInfo.argument[2];
                    }
                }
            };
            break;
        case MIPS_OPCODES.OPC_BLTU:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (IntegerRegister[(this.argumentInfo.registers[0])] < IntegerRegister[(this.argumentInfo.registers[1])]) {
                    if ((this.argumentInfo.argumentType[2] === ARGUMENT_TYPE.SYMBOL)) {
                        this.instructionInfo.vm.state.pc = this.argumentInfo.argument[2];
                    }
                    else {
                        this.instructionInfo.vm.state.pc += this.argumentInfo.argument[2];
                    }
                }
            };
            break;
        case MIPS_OPCODES.OPC_BLE:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (IntegerRegister[(this.argumentInfo.registers[0])] <= IntegerRegister[(this.argumentInfo.registers[1])]) {
                    if ((this.argumentInfo.argumentType[2] === ARGUMENT_TYPE.SYMBOL)) {
                        this.instructionInfo.vm.state.pc = this.argumentInfo.argument[2];
                    }
                    else {
                        this.instructionInfo.vm.state.pc += this.argumentInfo.argument[2];
                    }
                }
            };
            break;
        case MIPS_OPCODES.OPC_BLEU:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (IntegerRegister[(this.argumentInfo.registers[0])] <= IntegerRegister[(this.argumentInfo.registers[1])]) {
                    if ((this.argumentInfo.argumentType[2] === ARGUMENT_TYPE.SYMBOL)) {
                        this.instructionInfo.vm.state.pc = this.argumentInfo.argument[2];
                    }
                    else {
                        this.instructionInfo.vm.state.pc += this.argumentInfo.argument[2];
                    }
                }
            };
            break;
        case MIPS_OPCODES.OPC_BLTZ:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (IntegerRegister[(this.argumentInfo.registers[0])] < 0) {
                    if ((this.argumentInfo.argumentType[1] === ARGUMENT_TYPE.SYMBOL)) {
                        this.instructionInfo.vm.state.pc = this.argumentInfo.argument[1];
                    }
                    else {
                        this.instructionInfo.vm.state.pc += this.argumentInfo.argument[1];
                    }
                }
            };
            break;
        case MIPS_OPCODES.OPC_BLTZAL:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (IntegerRegister[(this.argumentInfo.registers[0])] < 0) {
                    IntegerRegister[MIPS_REGISTERS.REG_RA] = this.instructionInfo.vm.state.pc;
                    if ((this.argumentInfo.argumentType[1] === ARGUMENT_TYPE.SYMBOL)) {
                        this.instructionInfo.vm.state.pc = this.argumentInfo.argument[1];
                    }
                    else {
                        this.instructionInfo.vm.state.pc += this.argumentInfo.argument[1];
                    }
                }
            };
            break;
        case MIPS_OPCODES.OPC_BNE:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (IntegerRegister[(this.argumentInfo.registers[0])] != IntegerRegister[(this.argumentInfo.registers[1])]) {
                    if ((this.argumentInfo.argumentType[2] === ARGUMENT_TYPE.SYMBOL)) {
                        this.instructionInfo.vm.state.pc = this.argumentInfo.argument[2];
                    }
                    else {
                        this.instructionInfo.vm.state.pc += this.argumentInfo.argument[2];
                    }
                }
            };
            break;
        case MIPS_OPCODES.OPC_DIV:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                IntegerRegister[(this.argumentInfo.registers[0])] = parseInt(IntegerRegister[(this.argumentInfo.registers[1])]) / parseInt(IntegerRegister[(this.argumentInfo.registers[2])]);
            };
            break;
        case MIPS_OPCODES.OPC_DIVU:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                IntegerRegister[(this.argumentInfo.registers[0])] = parseInt(IntegerRegister[(this.argumentInfo.registers[1])]) / parseInt(IntegerRegister[(this.argumentInfo.registers[2])]);
            };
            break;
        case MIPS_OPCODES.OPC_J:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                this.instructionInfo.vm.state.pc = parseInt(this.argumentInfo.argument[0]);
                if (this.args[0][0] !== '$') {
                    return;
                }
                /*
                    Basically, we only break out if the argument doesn't start with $
                    in other words, we keep going and do MIPS_OPCODES.OPC_JR if the first argument was
                    a register (the name begins with an '$').  This is only necessary
                    because the 2001 version of LCC emitted incorrect instructions:
                     J $31
                    instead of
                     JR $31
                    We'll keep this here even for the 2007/2008 version, though
                    just in case we want to go back to the old version at some point (7/29/08)
                    but if it does start with $, or we go directly here, then do this:
                */
                this.instructionInfo.vm.state.pc = IntegerRegister[(this.argumentInfo.registers[0])];
                /*
                    This way LCC's misuse of MIPS instructions
                    (it puts 'j $31' instead of the correct 'jr $31') doesn't
                    affect our execution.
                */
            };
            break;
        case MIPS_OPCODES.OPC_JR:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                this.instructionInfo.vm.state.pc = IntegerRegister[(this.argumentInfo.registers[0])];
                /*
                    This way LCC's misuse of MIPS instructions
                    (it puts 'j $31' instead of the correct 'jr $31') doesn't
                    affect our execution.
                */
            };
            break;
        // Same with JAL and JALR
        case MIPS_OPCODES.OPC_JAL:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (this.args[0][0] !== '$') {
                    IntegerRegister[MIPS_REGISTERS.REG_RA] = this.instructionInfo.vm.state.pc;
                    this.instructionInfo.vm.state.pc = this.argumentInfo.argument[0];
                    return;
                }
                IntegerRegister[MIPS_REGISTERS.REG_RA] = this.instructionInfo.vm.state.pc;
                this.instructionInfo.vm.state.pc = IntegerRegister[(this.argumentInfo.registers[0])];
            };
            break;
        case MIPS_OPCODES.OPC_JALR:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                IntegerRegister[MIPS_REGISTERS.REG_RA] = this.instructionInfo.vm.state.pc;
                this.instructionInfo.vm.state.pc = IntegerRegister[(this.argumentInfo.registers[0])];
            };
            break;
        case MIPS_OPCODES.OPC_LB:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                var addr;
                switch (this.argumentInfo.argumentType[1]) {
                    case ARGUMENT_TYPE.ADDRESS:
                        addr = this.argumentInfo.argument[1] + IntegerRegister[(this.argumentInfo.registers[1])];
                        break;
                    default:
                        addr = this.argumentInfo.argument[1];
                        break;
                }
                IntegerRegister[(this.argumentInfo.registers[0])] = this.instructionInfo.vm.readByte(addr);
            };
            break;
        case MIPS_OPCODES.OPC_LBU:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                var addr;
                switch (this.argumentInfo.argumentType[1]) {
                    case ARGUMENT_TYPE.ADDRESS:
                        addr = this.argumentInfo.argument[1] + IntegerRegister[(this.argumentInfo.registers[1])];
                        break;
                    default:
                        addr = this.argumentInfo.argument[1];
                        break;
                }
                IntegerRegister[(this.argumentInfo.registers[0])] = this.instructionInfo.vm.readByte(addr);
            };
            break;
        case MIPS_OPCODES.OPC_LH:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                var addr;
                switch (this.argumentInfo.argumentType[1]) {
                    case ARGUMENT_TYPE.ADDRESS:
                        addr = this.argumentInfo.argument[1] + IntegerRegister[(this.argumentInfo.registers[1])];
                        break;
                    default:
                        addr = this.argumentInfo.argument[1];
                        break;
                }
                IntegerRegister[(this.argumentInfo.registers[0])] = this.instructionInfo.vm.readHalf(addr);
            };
            break;
        case MIPS_OPCODES.OPC_LHU:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                var addr;
                switch (this.argumentInfo.argumentType[1]) {
                    case ARGUMENT_TYPE.ADDRESS:
                        addr = this.argumentInfo.argument[1] + IntegerRegister[(this.argumentInfo.registers[1])];
                        break;
                    default:
                        addr = this.argumentInfo.argument[1];
                        break;
                }
                IntegerRegister[(this.argumentInfo.registers[0])] = this.instructionInfo.vm.readHalf(addr);
            };
            break;
        case MIPS_OPCODES.OPC_LW:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                var addr;
                switch (this.argumentInfo.argumentType[1]) {
                    case ARGUMENT_TYPE.ADDRESS:
                        addr = this.argumentInfo.argument[1] + IntegerRegister[(this.argumentInfo.registers[1])];
                        break;
                    default:
                        addr = this.argumentInfo.argument[1];
                        break;
                }
                IntegerRegister[(this.argumentInfo.registers[0])] = this.instructionInfo.vm.readWord(addr);
            };
            break;
        case MIPS_OPCODES.OPC_LUI:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                var im = this.argumentInfo.argument[1];
                im &= 0x0000FFFF;
                im <<= 16;
                IntegerRegister[(this.argumentInfo.registers[0])] = im;
            };
            break;
        case MIPS_OPCODES.OPC_MFHI:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                IntegerRegister[(this.argumentInfo.registers[0])] = IntegerRegister[MIPS_REGISTERS.REG_HI];
            };
            break;
        case MIPS_OPCODES.OPC_MFLO:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                IntegerRegister[(this.argumentInfo.registers[0])] = IntegerRegister[MIPS_REGISTERS.REG_LO];
            };
            break;
        case MIPS_OPCODES.OPC_MTHI:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                IntegerRegister[MIPS_REGISTERS.REG_HI] = IntegerRegister[(this.argumentInfo.registers[0])];
            };
            break;
        case MIPS_OPCODES.OPC_MTLO:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                IntegerRegister[MIPS_REGISTERS.REG_LO] = IntegerRegister[(this.argumentInfo.registers[0])];
            };
            break;
        case MIPS_OPCODES.OPC_MULT:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                IntegerRegister[(this.argumentInfo.registers[0])] = parseInt(IntegerRegister[(this.argumentInfo.registers[1])]) * parseInt(IntegerRegister[(this.argumentInfo.registers[2])]);
            };
            break;
        case MIPS_OPCODES.OPC_MULTU:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                IntegerRegister[(this.argumentInfo.registers[0])] = parseInt(IntegerRegister[(this.argumentInfo.registers[1])]) * parseInt(IntegerRegister[(this.argumentInfo.registers[2])]);
            };
            break;
        case MIPS_OPCODES.OPC_NEGU:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                IntegerRegister[(this.argumentInfo.registers[0])] = -parseInt(IntegerRegister[(this.argumentInfo.registers[1])]);
            };
            break;
        case MIPS_OPCODES.OPC_NOOP:
            // no-op
            this.execute = function() {
            };
            break;
        case MIPS_OPCODES.OPC_NOT:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                IntegerRegister[(this.argumentInfo.registers[0])] = ~parseInt(IntegerRegister[(this.argumentInfo.registers[1])]);
            };
            break;
        case MIPS_OPCODES.OPC_OR:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (this.args[2][0] === '$') {
                    IntegerRegister[(this.argumentInfo.registers[0])] = parseInt(IntegerRegister[(this.argumentInfo.registers[1])]) | parseInt(IntegerRegister[(this.argumentInfo.registers[2])]);
                }
                else {
                    IntegerRegister[(this.argumentInfo.registers[0])] = parseInt(IntegerRegister[(this.argumentInfo.registers[1])]) | this.argumentInfo.argument[2];
                }
            };
            break;
        case MIPS_OPCODES.OPC_ORI:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                IntegerRegister[(this.argumentInfo.registers[0])] = parseInt(IntegerRegister[(this.argumentInfo.registers[1])]) | this.argumentInfo.argument[2];
            };
            break;
        case MIPS_OPCODES.OPC_SB:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                var addr;
                switch (this.argumentInfo.argumentType[1]) {
                    case ARGUMENT_TYPE.ADDRESS:
                        addr = this.argumentInfo.argument[1] + IntegerRegister[(this.argumentInfo.registers[1])];
                        break;
                    default:
                        addr = this.argumentInfo.argument[1];
                        break;
                }
                this.instructionInfo.vm.writeByte(addr, IntegerRegister[(this.argumentInfo.registers[0])]);
            };
            break;
        case MIPS_OPCODES.OPC_SH:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                var addr;
                switch (this.argumentInfo.argumentType[1]) {
                    case ARGUMENT_TYPE.ADDRESS:
                        addr = this.argumentInfo.argument[1] + IntegerRegister[(this.argumentInfo.registers[1])];
                        break;
                    default:
                        addr = this.argumentInfo.argument[1];
                        break;
                }
                this.instructionInfo.vm.writeHalf(addr, IntegerRegister[(this.argumentInfo.registers[0])]);
            };
            break;
        case MIPS_OPCODES.OPC_SLL:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (this.args[2][0] !== '$') {
                    IntegerRegister[(this.argumentInfo.registers[0])] = IntegerRegister[(this.argumentInfo.registers[1])];
                    IntegerRegister[(this.argumentInfo.registers[0])] <<= this.argumentInfo.argument[2];
                }// fix for LCC bug (SLL should be SLLV)
                else{
                    IntegerRegister[(this.argumentInfo.registers[0])] = IntegerRegister[(this.argumentInfo.registers[1])];
                    IntegerRegister[(this.argumentInfo.registers[0])] <<= IntegerRegister[(this.argumentInfo.registers[2])];
                }
            };
            break;
        case MIPS_OPCODES.OPC_SLLV:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                IntegerRegister[(this.argumentInfo.registers[0])] = parseInt(IntegerRegister[(this.argumentInfo.registers[1])]) << parseInt(IntegerRegister[(this.argumentInfo.registers[2])]);
            };
            break;
        case MIPS_OPCODES.OPC_SLT:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (parseInt(IntegerRegister[(this.argumentInfo.registers[1])]) < parseInt(IntegerRegister[(this.argumentInfo.registers[2])])) {
                    IntegerRegister[(this.argumentInfo.registers[0])] = 1;
                }
                else {
                    IntegerRegister[(this.argumentInfo.registers[0])] = 0;
                }
            };
            break;
        case MIPS_OPCODES.OPC_SLTI:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (parseInt(IntegerRegister[(this.argumentInfo.registers[1])]) < this.argumentInfo.argument[2]) {
                    IntegerRegister[(this.argumentInfo.registers[0])] = 1;
                }
                else {
                    IntegerRegister[(this.argumentInfo.registers[0])] = 0;
                }
            };
            break;
        case MIPS_OPCODES.OPC_SLTU:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (parseInt(IntegerRegister[(this.argumentInfo.registers[1])]) < parseInt(IntegerRegister[(this.argumentInfo.registers[2])])) {
                    IntegerRegister[(this.argumentInfo.registers[0])] = 1;
                }
                else {
                    IntegerRegister[(this.argumentInfo.registers[0])] = 0;
                }
            };
            break;
        case MIPS_OPCODES.OPC_SLTIU:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (parseInt(IntegerRegister[(this.argumentInfo.registers[1])]) < this.argumentInfo.argument[2]) {
                    IntegerRegister[(this.argumentInfo.registers[0])] = 1;
                }
                else {
                    IntegerRegister[(this.argumentInfo.registers[0])] = 0;
                }
            };
            break;
        case MIPS_OPCODES.OPC_SRA:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (this.args[2][0] !== '$') {
                    IntegerRegister[(this.argumentInfo.registers[0])] = IntegerRegister[(this.argumentInfo.registers[1])];
                    IntegerRegister[(this.argumentInfo.registers[0])] >>= this.argumentInfo.argument[2];
                }
                // Fix for LCC bug (SRA should be SRAV)
                else{
                    IntegerRegister[(this.argumentInfo.registers[0])] = IntegerRegister[(this.argumentInfo.registers[1])];
                    IntegerRegister[(this.argumentInfo.registers[0])] >>= IntegerRegister[(this.argumentInfo.registers[2])];
                }
            };
            break;
        case MIPS_OPCODES.OPC_SRAV:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                IntegerRegister[(this.argumentInfo.registers[0])] = IntegerRegister[(this.argumentInfo.registers[1])] >> IntegerRegister[(this.argumentInfo.registers[2])];
            };
            break;
        case MIPS_OPCODES.OPC_SRL:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (this.args[2][0] !== '$') {
                    IntegerRegister[(this.argumentInfo.registers[0])] = IntegerRegister[(this.argumentInfo.registers[1])];
                    IntegerRegister[(this.argumentInfo.registers[0])] >>= this.argumentInfo.argument[2];
                }
                // Fix for LCC bug (SRL should be SRLV)
                else{
                    IntegerRegister[(this.argumentInfo.registers[0])] = IntegerRegister[(this.argumentInfo.registers[1])];
                    IntegerRegister[(this.argumentInfo.registers[0])] >>= IntegerRegister[(this.argumentInfo.registers[2])];
                }
            };
            break;
        case MIPS_OPCODES.OPC_SRLV:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                IntegerRegister[(this.argumentInfo.registers[0])] = IntegerRegister[(this.argumentInfo.registers[1])] >> IntegerRegister[(this.argumentInfo.registers[2])];
            };
            break;
        case MIPS_OPCODES.OPC_SUB:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (this.args.length === 2) {
                    this.args[2] = '0';
                    this.argumentInfo.argument[2] = 0;
                }
                if (this.args[2][0] === '$') {
                    IntegerRegister[(this.argumentInfo.registers[0])] = parseInt(IntegerRegister[(this.argumentInfo.registers[1])]) - parseInt(IntegerRegister[(this.argumentInfo.registers[2])]);
                }
                else {
                    IntegerRegister[(this.argumentInfo.registers[0])] = parseInt(IntegerRegister[(this.argumentInfo.registers[1])]) - this.argumentInfo.argument[2];
                }
            };
            break;
        case MIPS_OPCODES.OPC_SUBU:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (this.args.length === 2) {
                    this.args[2] = '0';
                    this.argumentInfo.argument[2] = 0;
                }
                if (this.args[2][0] === '$') {
                    IntegerRegister[(this.argumentInfo.registers[0])] = parseInt(IntegerRegister[(this.argumentInfo.registers[1])]) - parseInt(IntegerRegister[(this.argumentInfo.registers[2])]);
                }
                else {
                    IntegerRegister[(this.argumentInfo.registers[0])] = parseInt(IntegerRegister[(this.argumentInfo.registers[1])]) - this.argumentInfo.argument[2];
                }
            };
            break;
        case MIPS_OPCODES.OPC_SW:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                var addr;
                switch (this.argumentInfo.argumentType[1]) {
                    case ARGUMENT_TYPE.ADDRESS:
                        addr = this.argumentInfo.argument[1] + IntegerRegister[(this.argumentInfo.registers[1])];
                        break;
                    default:
                        addr = this.argumentInfo.argument[1];
                        break;
                }
                this.instructionInfo.vm.writeWord(addr, IntegerRegister[(this.argumentInfo.registers[0])]);
            };
            break;
        case MIPS_OPCODES.OPC_XOR:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                if (this.args[2][0] !== '$') {
                    IntegerRegister[(this.argumentInfo.registers[0])] = IntegerRegister[(this.argumentInfo.registers[1])];
                    IntegerRegister[(this.argumentInfo.registers[0])] ^= this.argumentInfo.argument[2];
                }
                // Fix for LCC bug (XOR should be XORI)
                else{
                    IntegerRegister[(this.argumentInfo.registers[0])] = IntegerRegister[(this.argumentInfo.registers[1])];
                    IntegerRegister[(this.argumentInfo.registers[0])] ^= IntegerRegister[(this.argumentInfo.registers[2])];
                }
            };
            break;
        case MIPS_OPCODES.OPC_XORI:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                IntegerRegister[(this.argumentInfo.registers[0])] = parseInt(IntegerRegister[(this.argumentInfo.registers[1])]) ^ this.argumentInfo.argument[2];
            };
            break;
        case MIPS_OPCODES.OPC_LA:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                var addr;
                switch (this.argumentInfo.argumentType[1]) {
                    case ARGUMENT_TYPE.ADDRESS:
                        addr = this.argumentInfo.argument[1] + IntegerRegister[(this.argumentInfo.registers[1])];
                        break;
                    case ARGUMENT_TYPE.SYMBOL:
                        if (this.instructionInfo.vm.state.symbols.contains(this.args[1])) {
                            addr = this.instructionInfo.vm.state.symbols.lookUp(this.args[1]).address;
                        }
                        else {
                            addr = this.argumentInfo.argument[1];
                        }
                    default:
                        addr = this.argumentInfo.argument[1];
                        break;
                }
                IntegerRegister[(this.argumentInfo.registers[0])] = addr;
            };
            break;
        case MIPS_OPCODES.OPC_REM:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                IntegerRegister[(this.argumentInfo.registers[0])] = IntegerRegister[(this.argumentInfo.registers[1])] % IntegerRegister[(this.argumentInfo.registers[2])];
            };
            break;
        case MIPS_OPCODES.OPC_REMU:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                IntegerRegister[(this.argumentInfo.registers[0])] = IntegerRegister[(this.argumentInfo.registers[1])] % IntegerRegister[(this.argumentInfo.registers[2])];
            };
            break;
        case MIPS_OPCODES.OPC_L_S:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                var addr;
                switch (this.argumentInfo.argumentType[1]) {
                    case ARGUMENT_TYPE.ADDRESS:
                        addr = this.argumentInfo.argument[1] + IntegerRegister[(this.argumentInfo.registers[1])];
                        break;
                    default:
                        addr = this.argumentInfo.argument[1];
                        break;
                }
                FloatRegister[(this.argumentInfo.registers[0])] = this.instructionInfo.vm.readWordF(addr);
            };
            break;
        case MIPS_OPCODES.OPC_L_D:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                var addr;
                switch (this.argumentInfo.argumentType[1]) {
                    case ARGUMENT_TYPE.ADDRESS:
                        addr = this.argumentInfo.argument[1] + IntegerRegister[(this.argumentInfo.registers[1])];
                        break;
                    default:
                        addr = this.argumentInfo.argument[1];
                        break;
                }
                FloatRegister[(this.argumentInfo.registers[0])] = this.instructionInfo.vm.readWordD(addr);
            };
            break;
        case MIPS_OPCODES.OPC_S_S:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                var addr;
                switch (this.argumentInfo.argumentType[1]) {
                    case ARGUMENT_TYPE.ADDRESS:
                        addr = this.argumentInfo.argument[1] + IntegerRegister[(this.argumentInfo.registers[1])];
                        break;
                    default:
                        addr = this.argumentInfo.argument[1];
                        break;
                }
                var data = FloatRegister[(this.argumentInfo.registers[0])];
                this.instructionInfo.vm.writeWordF(addr, data);
            };
            break;
        case MIPS_OPCODES.OPC_S_D:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                var addr;
                switch (this.argumentInfo.argumentType[1]) {
                    case ARGUMENT_TYPE.ADDRESS:
                        addr = this.argumentInfo.argument[1] + IntegerRegister[(this.argumentInfo.registers[1])];
                        break;
                    default:
                        addr = this.argumentInfo.argument[1];
                        break;
                }
                this.instructionInfo.vm.writeWordD(addr, FloatRegister[(this.argumentInfo.registers[0])]);
            };
            break;
        case MIPS_OPCODES.OPC_ADD_S:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                if (this.args.length === 2) {
                    this.args[2] = '0';
                    this.argumentInfo.argument[2] = 0;
                }
                if (this.args[2][0] === '$') {
                    FloatRegister[(this.argumentInfo.registers[0])] = FloatRegister[(this.argumentInfo.registers[1])] + FloatRegister[(this.argumentInfo.registers[2])];
                }
                else {
                    FloatRegister[(this.argumentInfo.registers[0])] = FloatRegister[(this.argumentInfo.registers[1])] + this.argumentInfo.argument[2];
                }
            };
            break;
        case MIPS_OPCODES.OPC_C_ULT_D:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                if (FloatRegister[(this.argumentInfo.registers[0])] < FloatRegister[(this.argumentInfo.registers[1])]) {
                    this.instructionInfo.vm.state.floatConditionalFlag = true;
                } else {
                    this.instructionInfo.vm.state.floatConditionalFlag = false;
                }
            };
            break;
        case MIPS_OPCODES.OPC_C_ULT_S:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                if (FloatRegister[(this.argumentInfo.registers[0])] < FloatRegister[(this.argumentInfo.registers[1])]) {
                    this.instructionInfo.vm.state.floatConditionalFlag = true;
                } else {
                    this.instructionInfo.vm.state.floatConditionalFlag = false;
                }
            };
            break;
        case MIPS_OPCODES.OPC_C_ULE_D:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                if (FloatRegister[(this.argumentInfo.registers[0])] <= FloatRegister[(this.argumentInfo.registers[1])]) {
                    this.instructionInfo.vm.state.floatConditionalFlag = true;
                } else {
                    this.instructionInfo.vm.state.floatConditionalFlag = false;
                }
            };
            break;
        case MIPS_OPCODES.OPC_C_ULE_S:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                if (FloatRegister[(this.argumentInfo.registers[0])] <= FloatRegister[(this.argumentInfo.registers[1])]) {
                    this.instructionInfo.vm.state.floatConditionalFlag = true;
                } else {
                    this.instructionInfo.vm.state.floatConditionalFlag = false;
                }
            };
            break;
        case MIPS_OPCODES.OPC_BC1T:
            this.execute = function() {
                if (this.instructionInfo.vm.state.floatConditionalFlag) {
                    if ((this.argumentInfo.argumentType[0] === ARGUMENT_TYPE.SYMBOL)) {
                        this.instructionInfo.vm.state.pc = this.argumentInfo.argument[0];
                    }
                    else {
                        this.instructionInfo.vm.state.pc += this.argumentInfo.argument[0];
                    }
                }
            };
            break;
        case MIPS_OPCODES.OPC_BC1F:
            this.execute = function() {
                if (!this.instructionInfo.vm.state.floatConditionalFlag) {
                    if ((this.argumentInfo.argumentType[0] === ARGUMENT_TYPE.SYMBOL)) {
                        this.instructionInfo.vm.state.pc = this.argumentInfo.argument[0];
                    }
                    else {
                        this.instructionInfo.vm.state.pc += this.argumentInfo.argument[0];
                    }
                }
            };
            break;
        case MIPS_OPCODES.OPC_SUB_S:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                if (this.args.length === 2) {
                    this.args[2] = '0';
                    this.argumentInfo.argument[2] = 0;
                }
                if (this.args[2][0] === '$') {
                    FloatRegister[(this.argumentInfo.registers[0])] = FloatRegister[(this.argumentInfo.registers[1])] - FloatRegister[(this.argumentInfo.registers[2])];
                }
                else {
                    FloatRegister[(this.argumentInfo.registers[0])] = FloatRegister[(this.argumentInfo.registers[1])] - this.argumentInfo.argument[2];
                }
            };
            break;
        case MIPS_OPCODES.OPC_MTC1:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                FloatRegister[(this.argumentInfo.registers[1])] = IntegerRegister[(this.argumentInfo.registers[0])];
            };
            break;
        case MIPS_OPCODES.OPC_MTC1_D:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                FloatRegister[(this.argumentInfo.registers[1])] = IntegerRegister[(this.argumentInfo.registers[0])];
                FloatRegister[(this.argumentInfo.registers[1]) + 1] = IntegerRegister[(this.argumentInfo.registers[0]) + 1];
            };
            break;
        case MIPS_OPCODES.OPC_MFC1:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                IntegerRegister[(this.argumentInfo.registers[0])] = FloatRegister[(this.argumentInfo.registers[1])];
            };
            break;
        case MIPS_OPCODES.OPC_MFC1_D:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                IntegerRegister[(this.argumentInfo.registers[0])] = FloatRegister[(this.argumentInfo.registers[1])];
                IntegerRegister[(this.argumentInfo.registers[0]) + 1] = FloatRegister[(this.argumentInfo.registers[1]) + 1];
            };
            break;
        case MIPS_OPCODES.OPC_MOV_S:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                FloatRegister[(this.argumentInfo.registers[0])] = FloatRegister[(this.argumentInfo.registers[1])];
            };
            break;
        case MIPS_OPCODES.OPC_MOV_D:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                FloatRegister[(this.argumentInfo.registers[0])] = FloatRegister[(this.argumentInfo.registers[1])];
            };
            break;
        case MIPS_OPCODES.OPC_CVT_D_S:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                FloatRegister[(this.argumentInfo.registers[0])] = FloatRegister[(this.argumentInfo.registers[1])];
            };
            break;
        case MIPS_OPCODES.OPC_CVT_D_W:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                FloatRegister[(this.argumentInfo.registers[0])] = FloatRegister[(this.argumentInfo.registers[1])];
            };
            break;
        case MIPS_OPCODES.OPC_CVT_S_D:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                FloatRegister[(this.argumentInfo.registers[0])] = FloatRegister[(this.argumentInfo.registers[1])];
            };
            break;
        case MIPS_OPCODES.OPC_CVT_S_W:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                FloatRegister[(this.argumentInfo.registers[0])] = FloatRegister[(this.argumentInfo.registers[1])];
            };
            break;
        case MIPS_OPCODES.OPC_CVT_W_D:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                FloatRegister[(this.argumentInfo.registers[0])] = FloatRegister[(this.argumentInfo.registers[1])];
            };
            break;
        case MIPS_OPCODES.OPC_CVT_W_S:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                FloatRegister[(this.argumentInfo.registers[0])] = FloatRegister[(this.argumentInfo.registers[1])];
            };
            break;
        case MIPS_OPCODES.OPC_ADD_D:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                if (this.args.length === 2) {
                    this.args[2] = '0';
                    this.argumentInfo.argument[2] = 0;
                }
                if (this.args[2][0] === '$') {
                    FloatRegister[(this.argumentInfo.registers[0])] = FloatRegister[(this.argumentInfo.registers[1])] + FloatRegister[(this.argumentInfo.registers[2])];
                }
                else {
                    FloatRegister[(this.argumentInfo.registers[0])] = FloatRegister[(this.argumentInfo.registers[1])] + this.argumentInfo.argument[2];
                }
            };
            break;
        case MIPS_OPCODES.OPC_SUB_D:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                if (this.args.length === 2) {
                    this.args[2] = '0';
                    this.argumentInfo.argument[2] = 0;
                }
                if (this.args[2][0] === '$') {
                    FloatRegister[(this.argumentInfo.registers[0])] = FloatRegister[(this.argumentInfo.registers[1])] - FloatRegister[(this.argumentInfo.registers[2])];
                }
                else {
                    FloatRegister[(this.argumentInfo.registers[0])] = FloatRegister[(this.argumentInfo.registers[1])] - this.argumentInfo.argument[2];
                }
            };
            break;
        case MIPS_OPCODES.OPC_MUL_S:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                FloatRegister[(this.argumentInfo.registers[0])] = FloatRegister[(this.argumentInfo.registers[1])] * FloatRegister[(this.argumentInfo.registers[2])];
            };
            break;
        case MIPS_OPCODES.OPC_MUL_D:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                FloatRegister[(this.argumentInfo.registers[0])] = FloatRegister[(this.argumentInfo.registers[1])] * FloatRegister[(this.argumentInfo.registers[2])];
            };
            break;
        case MIPS_OPCODES.OPC_DIV_S:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                FloatRegister[(this.argumentInfo.registers[0])] = FloatRegister[(this.argumentInfo.registers[1])] / FloatRegister[(this.argumentInfo.registers[2])];
            };
            break;
        case MIPS_OPCODES.OPC_DIV_D:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                FloatRegister[(this.argumentInfo.registers[0])] = FloatRegister[(this.argumentInfo.registers[1])] / FloatRegister[(this.argumentInfo.registers[2])];
            };
            break;
        case MIPS_OPCODES.OPC_NEG_S:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                FloatRegister[(this.argumentInfo.registers[0])] = -FloatRegister[(this.argumentInfo.registers[1])];
            };
            break;
        case MIPS_OPCODES.OPC_NEG_D:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                FloatRegister[(this.argumentInfo.registers[0])] = -FloatRegister[(this.argumentInfo.registers[1])];
            };
            break;
        case MIPS_OPCODES.OPC_ABS_S:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                FloatRegister[(this.argumentInfo.registers[0])] = Math.abs(FloatRegister[(this.argumentInfo.registers[1])]);
            };
            break;
        case MIPS_OPCODES.OPC_ABS_D:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                FloatRegister[(this.argumentInfo.registers[0])] = Math.abs(FloatRegister[(this.argumentInfo.registers[1])]);
            };
            break;
        case MIPS_OPCODES.OPC_C_EQ_S:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                if (FloatRegister[(this.argumentInfo.registers[0])] === FloatRegister[(this.argumentInfo.registers[1])]) {
                    this.instructionInfo.vm.state.floatConditionalFlag = true;
                }
                else {
                    this.instructionInfo.vm.state.floatConditionalFlag = false;
                }
            };
            break;
        case MIPS_OPCODES.OPC_C_EQ_D:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                if (FloatRegister[(this.argumentInfo.registers[0])] === FloatRegister[(this.argumentInfo.registers[1])]) {
                    this.instructionInfo.vm.state.floatConditionalFlag = true;
                }
                else {
                    this.instructionInfo.vm.state.floatConditionalFlag = false;
                }
            };
            break;
        case MIPS_OPCODES.OPC_C_LE_S:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                if (FloatRegister[(this.argumentInfo.registers[0])] <= FloatRegister[(this.argumentInfo.registers[1])]) {
                    this.instructionInfo.vm.state.floatConditionalFlag = true;
                }
                else {
                    this.instructionInfo.vm.state.floatConditionalFlag = false;
                }
            };
            break;
        case MIPS_OPCODES.OPC_C_LE_D:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                if (FloatRegister[(this.argumentInfo.registers[0])] <= FloatRegister[(this.argumentInfo.registers[1])]) {
                    this.instructionInfo.vm.state.floatConditionalFlag = true;
                }
                else {
                    this.instructionInfo.vm.state.floatConditionalFlag = false;
                }
            };
            break;
        case MIPS_OPCODES.OPC_C_LT_S:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                if (FloatRegister[(this.argumentInfo.registers[0])] < FloatRegister[(this.argumentInfo.registers[1])]) {
                    this.instructionInfo.vm.state.floatConditionalFlag = true;
                }
                else {
                    this.instructionInfo.vm.state.floatConditionalFlag = false;
                }
            };
            break;
        case MIPS_OPCODES.OPC_C_LT_D:
            this.execute = function() {
                var FloatRegister = this.instructionInfo.vm.state.registers.regF;
                if (FloatRegister[(this.argumentInfo.registers[0])] < FloatRegister[(this.argumentInfo.registers[1])]) {
                    this.instructionInfo.vm.state.floatConditionalFlag = true;
                }
                else {
                    this.instructionInfo.vm.state.floatConditionalFlag = false;
                }
            };
            break;
        case MIPS_OPCODES.OPC_LAST:
        default:
            this.execute = function() {
                var IntegerRegister = this.instructionInfo.vm.state.registers.regI;
                IntegerRegister[MIPS_REGISTERS.REG_ZR] = 0;
            };
            break;
    }
};
