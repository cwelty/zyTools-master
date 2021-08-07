/*
    This class simplifies the arguments to make them easier to work with.
    We have register numbers in the registers array, argument will contain the values instead of the strings etc.
    |args| is required and a list of strings
    |vm| is required and a reference to the virtual machine
*/
function ArgumentInfo(args, vm) {
    this.argumentType = new Array(args.length);
    this.registers = new Array(args.length);
    this.argument = new Array(args.length);

    var self = this;
    // Identifies the argument types and then simplifies the args
    args.forEach(function(value, i) {

        // Identify type
        self.argumentType[i] = identifyArgumentType(value);

        // Simplify
        // Handle constants
        if (self.argumentType[i] === ARGUMENT_TYPE.CONSTANT) {
            if (value.length > 2 && value[0] === '0' && value[1] === 'x') {
                self.argument[i] = parseInt(value, 16);
            }
            else {
                self.argument[i] = parseInt(value);
            }
            self.registers[i] = MIPS_REGISTERS.REG_LAST;
        }

        // Handle symbols
        else if (self.argumentType[i] === ARGUMENT_TYPE.SYMBOL) {
            if (vm.state.symbols.lookUp(value).address === -1) {
                self.argument[i] = value;
                self.registers[i] = MIPS_REGISTERS.REG_LAST;
            }
            else {
                self.argument[i] = vm.state.symbols.lookUp(value).address;
                self.registers[i] = MIPS_REGISTERS.REG_LAST;
            }
        }

        // Handle registers
        else if (self.argumentType[i] === ARGUMENT_TYPE.REGISTER) {
            self.argument[i] = 0;
            self.registers[i] = GiveRegister(value);
        }

        // Handle addresses
        else if (self.argumentType[i] === ARGUMENT_TYPE.ADDRESS) {
            var argumentCopy = value;
            var tokens = value.split(/[\s\+\-\/\*\(]/);
            self.argument[i] = -1;
            var lookUpFailed = false;
            for (var j = 0; j < tokens.length; j++) {
                if (vm.state.symbols.lookUp(tokens[j]).address !== -1) {
                    argumentCopy = argumentCopy.replace(tokens[j], vm.state.symbols.lookUp(tokens[j]).address);
                }
                else if (identifyArgumentType(tokens[j]) === ARGUMENT_TYPE.SYMBOL) {
                    self.argument[i] = tokens[j];
                    argumentCopy = argumentCopy.replace(tokens[j], '');
                    lookUpFailed = true;
                }
            }
            var pos = argumentCopy.indexOf('($');
            if (pos != -1) {
                var fullRegName = argumentCopy.substr(pos);
                var regName = argumentCopy.slice(pos + 1, argumentCopy.length - 1);
                self.registers[i] = GiveRegister(regName);
                argumentCopy = argumentCopy.replace(fullRegName, '');
            }
            if (self.argument[i] === -1) {
                if (argumentCopy.length === 0) {
                    self.argument[i] = 0;
                }
                else {
                    self.argument[i] = parseFloat(eval(argumentCopy));
                }
            }
            else if (!lookUpFailed) {
                self.argument[i] += parseFloat(eval(argumentCopy));
            }
            else if (lookUpFailed && pos !== -1) {
                self.argument[i] += argumentCopy;
            }
        }
    });
}
