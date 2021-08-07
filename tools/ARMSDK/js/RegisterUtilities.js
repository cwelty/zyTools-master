var REGISTER_NAME_TO_ADDRESS;
var REGISTER_NAME_ORDER;

// Assign values to |REGISTER_NAME_TO_ADDRESS| and |REGISTER_NAME_ORDER|.
function buildRegisterUtilities() {
    // Array of register names in order.
    REGISTER_NAME_ORDER = [
        'X0', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7',
        'X8', 'X9', 'X10', 'X11', 'X12', 'X13', 'X14', 'X15',
        'X16', 'X17', 'X18', 'X19', 'X20', 'X21', 'X22', 'X23',
        'X24', 'X25', 'X26', 'X27', 'X28', 'X29', 'X30', 'XZR'
    ];

    // Map of each register name to address.
    REGISTER_NAME_TO_ADDRESS = {};
    var bytesPerRegister = 8;
    REGISTER_NAME_ORDER.forEach(function(registerName, index) {
        REGISTER_NAME_TO_ADDRESS[registerName] = index * bytesPerRegister;
    });
}
