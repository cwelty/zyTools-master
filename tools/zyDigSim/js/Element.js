// Possible values returned by gate functions
var ELEMENT_VALUES = {
    FALSE: 0,
    TRUE: 1,
    UNDEFINED: -1
};

/*  Operation function constants allows the operation to be set when the element is built instead of having to build separate gate classes.
    Access to these functions can be done through the dot operator
    ex. ELEMENT_FUNCTIONS.AND(element)
 */
var ELEMENT_FUNCTIONS = (function() {
    // Can have 0,1, or 2 inputs and many outputs
    function AND(element) {
        var inputVal = ELEMENT_VALUES.TRUE;
        var isOneMissing = false;
        for (var i = 0; i < element.inputPorts.length; i++) {
            if (element.inputPorts[i] == null) {
                isOneMissing = true;
                continue;
            }
            if (element.inputPorts[i].connectors[0].value == ELEMENT_VALUES.UNDEFINED) {
                isOneMissing = true;
                continue;
            }
            inputVal = inputVal && element.inputPorts[i].connectors[0].value;
        }
        // If an input is missing, (there is no connection), we will output a ?
        if (isOneMissing && inputVal == ELEMENT_VALUES.TRUE) {
            inputVal = ELEMENT_VALUES.UNDEFINED;
        }
        element.value = inputVal;
    }
    // Can have 0,1, or 2 inputs and many outputs
    function NAND(element) {
        var inputVal = 1;
        var isOneMissing = false;
        for (var i = 0; i < element.inputPorts.length; i++) {
            if (element.inputPorts[i] == null) {
                isOneMissing = true;
                continue;
            }
            if (element.inputPorts[i].connectors[0].value == ELEMENT_VALUES.UNDEFINED) {
                isOneMissing = true;
                continue;
            }
            inputVal = inputVal && element.inputPorts[i].connectors[0].value;
        }
        // If an input is missing, (there is no connection), we will output a ?
        if (isOneMissing && inputVal == ELEMENT_VALUES.TRUE) {
            inputVal = ELEMENT_VALUES.UNDEFINED;
        }
        if (inputVal == ELEMENT_VALUES.TRUE) {
            inputVal = ELEMENT_VALUES.FALSE;
        }
        else if (inputVal == ELEMENT_VALUES.FALSE) {
            inputVal = ELEMENT_VALUES.TRUE;
        }
        element.value = inputVal;
    }
    // Can have 0,1, or 2 inputs and many outputs
    function OR(element) {
        var inputVal = 0;
        var isOneMissing = false;
        for (var i = 0; i < element.inputPorts.length; i++) {
            if (element.inputPorts[i] == null) {
                isOneMissing = true;
                continue;
            }
            if (element.inputPorts[i].connectors[0].value == ELEMENT_VALUES.UNDEFINED) {
                isOneMissing = true;
                continue;
            }
            inputVal = inputVal || element.inputPorts[i].connectors[0].value;
        }
        // If an input is missing, (there is no connection), we will output a ?
        if (isOneMissing && inputVal == ELEMENT_VALUES.FALSE) {
            inputVal = ELEMENT_VALUES.UNDEFINED;
        }
        element.value = inputVal;
    }
    // Can have 0,1, or 2 inputs and many outputs
    function NOR(element) {
        var inputVal = 0;
        var isOneMissing = false;
        for (var i = 0; i < element.inputPorts.length; i++) {
            if (element.inputPorts[i] == null) {
                isOneMissing = true;
                continue;
            }
            if (element.inputPorts[i].connectors[0].value == ELEMENT_VALUES.UNDEFINED) {
                isOneMissing = true;
                continue;
            }
            inputVal = inputVal || element.inputPorts[i].connectors[0].value;
        }
        // If an input is missing, (there is no connection), we will output a ?
        if (isOneMissing && inputVal == ELEMENT_VALUES.FALSE) {
            inputVal = ELEMENT_VALUES.UNDEFINED;
        }
        if (inputVal == ELEMENT_VALUES.TRUE) {
            inputVal = ELEMENT_VALUES.FALSE;
        }
        else if (inputVal == ELEMENT_VALUES.FALSE) {
            inputVal = ELEMENT_VALUES.TRUE;
        }
        element.value = inputVal;
    }
    // Can have 0,1, or 2 inputs and many outputs
    function XOR(element) {
        var i = 0;
        for (; i < element.inputPorts.length; i++) {
            if (element.inputPorts[i] == null) {
                element.value = ELEMENT_VALUES.UNDEFINED;
                return;
            }
            if (element.inputPorts[i].connectors[0].value == ELEMENT_VALUES.UNDEFINED) {
                element.value = ELEMENT_VALUES.UNDEFINED;
                return;
            }
        }
        for (i = 0; i < element.inputPorts.length; i++) {
            element.value = element.inputPorts[i].connectors[0].value;
            i++;
            break;
        }
        for (; i < element.inputPorts.length; i++) {
            if (element.value == ELEMENT_VALUES.TRUE && element.inputPorts[i].connectors[0].value == ELEMENT_VALUES.TRUE) {
                element.value = ELEMENT_VALUES.FALSE;
                break;
            }
            else if (element.inputPorts[i].connectors[0].value == ELEMENT_VALUES.TRUE) {
                element.value = ELEMENT_VALUES.TRUE;
            }
        }
    }
    // NOT gates are single input
    function NOT(element) {
        if (element.inputPorts[0]) {
            if (element.inputPorts[0].connectors[0].value == ELEMENT_VALUES.TRUE) {
                element.value = ELEMENT_VALUES.FALSE;
            }
            else if (element.inputPorts[0].connectors[0].value == ELEMENT_VALUES.FALSE) {
                element.value = ELEMENT_VALUES.TRUE;
            }
            else {
                element.value = ELEMENT_VALUES.UNDEFINED;
            }
        }
        else {
            element.value = ELEMENT_VALUES.UNDEFINED;
        }
    }
    // In gates have no inputs only need to make sure the correct image is being displayed for the currnet value
    function IN(element) {
        if (element.value == 1) {
            element.img = ZyDigSim.imageAssets.oneImg;
        }
        else {
            element.img = ZyDigSim.imageAssets.zeroImg;
        }
    }
    // Out gates have only one input
    function OUT(element) {
        if (element.inputPorts[0]) {
            element.value = element.inputPorts[0].connectors[0].value;
        }
        else {
            element.value = ELEMENT_VALUES.UNDEFINED;
        }
        if (element.value == ELEMENT_VALUES.TRUE) {
            element.img = ZyDigSim.imageAssets.oneImg;
        }
        else if (element.value == ELEMENT_VALUES.FALSE) {
            element.img = ZyDigSim.imageAssets.zeroImg;
        }
        else if (element.value == ELEMENT_VALUES.UNDEFINED) {
            element.img = ZyDigSim.imageAssets.undefinedImg;
        }
    }
    function PASS(element) {
        if (element.inputPorts[0]) {
            element.value = element.inputPorts[0].connectors[0].value;
        }
        else {
            element.value = ELEMENT_VALUES.UNDEFINED;
        }
    }
    function LABEL(element) {
        element.img = ZyDigSim.imageAssets.labelImg;
    }
    function NONE(element) {
        return;
    }
    return {
        AND:     AND,
        IN:       IN,
        OR:       OR,
        NOT:     NOT,
        XOR:     XOR,
        PASS:   PASS,
        OUT:     OUT,
        NAND:   NAND,
        NOR:     NOR,
        LABEL: LABEL,
        NONE:   NONE
    };
})();

var ELEMENT_CONSTANTS = {
    nameFont: '16px Helvetica',
    nameFontColor: 'black',
    valueFont: '12px Heletica'
};

/*
    Every gate/label is an element
    |x|, |y|, and |maxInput| are required and are numbers.
    |img| is an image and is required.
    |elementType| and |name| are required and are strings.
    |operation| is a function from ELEMENT_FUNCTIONS, this implements what the gate does.
    |inToolBox| is not required and boolean.
*/
function Element(x, y, img, operation, maxInput, elementType, name, inToolBox) {
    this.x = x;
    this.y = y;
    this.img = img;
    this.inputs = new Array();
    this.outputs = new Array();
    this.maxInput = maxInput;
    this.operation = operation;
    this.value = 0;
    this.elementType = elementType;
    this.name = name;
    this.labelID = null;
    this.width = (img ? img.width : 64);
    this.height = (img ? img.height : 48);
    this.bitWidth = 1;
    this.inputPorts = [];
    this.outputPorts = [];
    this.shouldDraw = true;
    // Create input ports for this element and put them in the correct spot
    var offset = this.height / (this.maxInput + 1);
    for (var i = 0, newOffset = offset; i < this.maxInput; i++, newOffset += offset) {
        this.inputPorts.push(new Port(this.x - HALF_WIRE_LENGTH, this.y + newOffset, 1));
        this.inputs.push(null);
    }
    // Create output port for this element and put it in the correct spot
    if (elementType != Element.OUT) {
        this.outputPorts.push(new Port(this.x + this.width - HALF_WIRE_LENGTH, this.y + (this.height / 2), 1));
        this.outputPorts[0].updateName('', true);
    }
    this.inToolBox = (inToolBox !== undefined ? inToolBox : true);
}
Element.IN = 'in';
Element.OUT = 'out';
Element.AND = 'and';
Element.OR = 'or';
Element.PASS = 'pass';
Element.LABEL = 'label';
Element.NAND = 'nand';
Element.NOR = 'nor';
Element.XOR = 'xor';
Element.NOT = 'not';
Element.NONE = 'none';

// Updates the value of the gate, pulls in values from inputs and calls the gate operation.
Element.prototype.update = function() {
    if (this.operation) {
        this.updateDimensions({ width:this.width, height:this.height });
        for (var i = 0; i < this.inputPorts.length; i++) {
            this.inputPorts[i].update();
        }
        this.operation(this);
        for (var i = 0; i < this.outputPorts.length; i++) {
            this.outputPorts[i].connectors[0].value = this.value;
        }
    }
};

/*
    Move this element to |x|, |y|, this moves the ports along with it.
    |x| and |y| are numbers and are required.
*/
Element.prototype.moveTo = function(x, y) {
    var deltaX = x - this.x;
    var deltaY = y - this.y;
    this.x = x;
    this.y = y;
    for (var i = 0; i < this.inputPorts.length; i++) {
        this.inputPorts[i].x += deltaX;
        this.inputPorts[i].y += deltaY;
    }

    for (var i = 0; i < this.outputPorts.length; i++) {
        this.outputPorts[i].x += deltaX;
        this.outputPorts[i].y += deltaY;
    }
};

/*
    Updates the height and width of the element
    |dimensions| is an object with properties |width| and |height| which are numbers.
*/
Element.prototype.updateDimensions = function(dimensions) {
    // This is an element with ports
    if (this.inputPorts && this.outputPorts) {
        this.width = dimensions.width;
        this.height = dimensions.height;
        var offset = this.height / (this.maxInput + 1);
        for (var i = 0, newOffset = offset; i < this.inputPorts.length; i++, newOffset += offset) {
            this.inputPorts[i].x = this.x - HALF_WIRE_LENGTH;
            this.inputPorts[i].y = this.y + newOffset;
        }
        if (this.outputPorts.length >= 1) {
            this.outputPorts[0].x = this.x + this.width - HALF_WIRE_LENGTH;
            this.outputPorts[0].y = this.y + (this.height / 2);
        }
    }
};

/*
    Draws this element
    |context| is a canvas type that supplies the drawing api.
*/
Element.prototype.draw = function(context) {
    if (this.img != null && this.shouldDraw) {
        for (var i = 0; i < this.inputPorts.length; i++) {
            this.inputPorts[i].draw(context);
        }
        for (var i = 0; i < this.outputPorts.length; i++) {
            this.outputPorts[i].draw(context);
        }
        context.save();
        context.fillStyle = ELEMENT_CONSTANTS.nameFontColor;
        context.font = ELEMENT_CONSTANTS.nameFont;
        context.drawImage(this.img, this.x, this.y);
        var LABEL_OFFSET = 20;
        if (this.name) {
            if (this.elementType == Element.IN) {
                context.fillText(this.name, this.x - LABEL_OFFSET - (context.measureText(this.name).width / 2), this.y + (this.height / 2));
            }
            else if (this.elementType == Element.OUT) {
                context.fillText(this.name, this.x + this.width + LABEL_OFFSET - (context.measureText(this.name).width / 2), this.y + (this.height / 2));
            }
        }
        var outputVal;
        var offsetX = 5;
        var offsetY = -5;
        if (this.elementType != Element.OUT && !this.inToolBox) {
            if (this.value == ELEMENT_VALUES.TRUE) {
                context.fillStyle = ZYANTE_GREEN;
                outputVal = this.value;
            }
            else if (this.value == ELEMENT_VALUES.FALSE) {
                context.fillStyle = ZYANTE_MEDIUM_RED;
                outputVal = this.value;
            }
            else if (this.value == ELEMENT_VALUES.UNDEFINED) {
                context.fillStyle = DEFAULT_TEXT_COLOR;
                outputVal = '?';
            }
            context.font = ELEMENT_CONSTANTS.valueFont;
            context.fillText(outputVal + '', this.x + this.width + offsetX, this.y + (this.height / 2) + offsetY);
        }
        context.restore();

    }
};

/*
    Connect an element to the input of this element
    |inputElement| is a element and is required.
    |index| is a number and is required.
    |portIndex| is a number and is not required.
*/
Element.prototype.connectInput = function(inputElement, index, portIndex) {
    if (portIndex == undefined) {
        portIndex = 0;
    }
    this.inputPorts[index].connectInput(inputElement.outputPorts[portIndex]);
    this.inputs[index] = inputElement;
};

/*
    Connect an element to the output of this element
    |outputElement| is a element and is required.
    |index| is a number and is required.
    |portIndex| is a number and is not required.
*/
Element.prototype.connectOutput = function(outputElement, index, portIndex) {
    if (portIndex == undefined) {
        portIndex = 0;
    }
    this.outputPorts[portIndex].connectOutput(outputElement.inputPorts[index]);
    this.outputs.push({
        outputEle: outputElement,
        inputIndex: index
    });
};

/*
    |x1|, |y1|, |x2|, |y2|, and |dashlen| are numbers and are required.
*/
CanvasRenderingContext2D.prototype.dashedLine = function(x1, y1, x2, y2, dashLen) {
    if (dashLen == undefined) dashLen = 2;
    this.moveTo(x1, y1);
    var dX = x2 - x1;
    var dY = y2 - y1;
    var dashes = Math.floor(Math.sqrt(dX * dX + dY * dY) / dashLen);
    var dashX = dX / dashes;
    var dashY = dY / dashes;
    var q = 0;
    while (q++ < dashes) {
        x1 += dashX;
        y1 += dashY;
        this[q % 2 == 0 ? 'moveTo' : 'lineTo'](x1, y1);
    }
    this[q % 2 == 0 ? 'moveTo' : 'lineTo'](x2, y2);
};
