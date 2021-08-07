/*
    Components have input and output which are connected to a list of gates.
    |x|, |y|, and |bitWidth| are required and are numbers.
    |elementType| is required and a string.
    |inToolBox| and |shouldDraw| are not required and are boolean.
*/
function Component(x, y, elementType, bitWidth, inToolBox, shouldDraw) {
    this.x = x;
    this.y = y;
    this.width = 0;
    this.height = 0;
    this.inputPorts = [];
    this.outputPorts = [];
    this.inputs = [];
    this.outputs = [];
    this.name = '';
    this.value = 0;
    this.elements = [];
    this.maxInput = 0;
    this.bitWidth = bitWidth;
    this.elementType = elementType;
    this.displayValue = false;
    this.inToolBox = (inToolBox !== undefined ? inToolBox : true);
    this.shouldDraw = (shouldDraw !== undefined ? shouldDraw : true);
    // Figure out which element this is and create the required connections
    switch(elementType) {
        case Component.IN:
            this.buildInput();
            break;
        case Component.OUT:
            this.buildOutput();
            break;
        case Component.ADDER:
            this.buildAdder();
            break;
        case Component.COMPARATOR:
            this.buildComparator();
            break;
        case Component.MUX:
            this.buildMux();
            break;
        case Component.LOAD_REGISTER:
            this.buildLoadRegister();
            break;
        case Component.CONSTANT:
            this.buildConstant();
            break;
    }
}

// Defined enums for components
Component.IN = 'in-component';
Component.OUT = 'out-component';
Component.ADDER = 'adder-component';
Component.MUX = 'mux-component';
Component.COMPARATOR = 'comparator-component';
Component.LOAD_REGISTER = 'load_register-component';
Component.CONSTANT = 'constant-component';

var COMPONENT_CONSTANTS = {
    TOOLBOX_DRAWING: {
        normalBackgroundColor: 'white',
        constantBackgroundColor: '#DCDCDC',
        nameFont: '14px Helvetica',
        nameFontcolor: 'black',
        borderColor: '#5780A6'
    },
    NORMAL_DRAWING: {
        normalBackgroundColor: 'white',
        constantBackgroundColor: '#DCDCDC',
        nameFont: '14px Helvetica',
        nameFontcolor: 'black',
        borderColor: '#5780A6',
        valueFont: '14px Helvetica',
        valueFontColor: '#5780A6'
    }
};

/*
    Connects this component to |component|, this connection is made between this components port at |index| and the |components|'s port at |portIndex|
    |component| is a component and is required.
    |index| is a number and is required.
    |portIndex| is a number and is not required.
*/
Component.prototype.connectInput = function(component, index, portIndex) {
    if (portIndex == undefined) {
        portIndex = 0;
    }
    this.inputPorts[index].connectInput(component.outputPorts[portIndex]);
    this.inputs[index] = component;
};

/*
    Connects this component to |component|, this connection is made between this components port at |portIndex| and the |components|'s port at |index|
    |component| is a component and is required.
    |index| is a number and is required.
    |portIndex| is a number and is not required.
*/
Component.prototype.connectOutput = function(component, index, portIndex) {
    if (portIndex == undefined) {
        portIndex = 0;
    }
    this.outputPorts[portIndex].connectOutput(component.inputPorts[index]);
    this.outputs.push({
        outputEle: component,
        inputIndex: index,
        portIndex: portIndex
    });
};

/*
    Move this component to |x|, |y|, this moves the ports along with it.
    |x| and |y| are numbers and are required.
*/
Component.prototype.moveTo = function(x, y) {
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

/* Updates the value of the component, either pulls from it's input ports or if it is input look at its assigned value,
  |context| is need by the load register in order to update the drawing of its animation when it is loaded.
  |context| is a canvas type that supplies the drawing api.
*/
Component.prototype.update = function(context) {
    // Inputs are different in that their value depends on an outside source (the user) and not other gates
    if (this.elementType === Component.IN || this.elementType === Component.CONSTANT) {
        for (var i = 0; i < this.outputPorts.length; i++) {
            for (var j = 0; j < this.outputPorts[i].connectors.length; j++) {
                this.outputPorts[i].connectors[j].value = (this.value >> j) & 0x01;
            }
            this.outputPorts[i].update();
        }
    }
    else {
        for (var i = 0; i < this.inputPorts.length; i++) {
            this.inputPorts[i].update();
        }
        if (this.elementType == Component.LOAD_REGISTER) {
            // Rising edge 0 -> 1
            if (this.previousClkValue == 0 && this.clk.connectors[0].value == 1) {
                this.previousClkValue = 1;
                this.e.value = 1;
                this.e.update();
                // If clk is high and loading is high
                if (this.ld.connectors[0].value == 1) {
                    this.loading = true;
                    var self = this;
                    setTimeout(function() {
                        self.loading = false;
                        self.draw(context);
                    }, 500);
                }
            }
            // 1 -> 0
            else if (this.clk.connectors[0].value == 0) {
                this.previousClkValue = 0;
                this.e.value = 0;
                this.e.update();
            }
            // 1 -> 1 still 1 rising edge is over
            else if (this.clk.connectors[0].value == 1) {
                this.e.value = 0;
                this.e.update();
            }
        }
        for (var i = 0; i < this.elements.length; i++) {
            this.elements[i].update();
        }
        for (var i = 0; i < this.outputPorts.length; i++) {
            this.outputPorts[i].update();
        }
        var partialValue = 0;
        var shouldUpdate = true;
        for (var i = 0; i < this.bitWidth; i++) {
            if (this.elementType == Component.OUT && this.inputPorts[0].connectors[i].value != ELEMENT_VALUES.UNDEFINED) {
                partialValue += this.inputPorts[0].connectors[i].value << i;
            }
            else if ((this.elementType == Component.ADDER) && this.outputPorts[0].connectors[i].value != ELEMENT_VALUES.UNDEFINED) {
                partialValue += this.outputPorts[0].connectors[i].value << i;
            }
            else {
                shouldUpdate = false;
                break;
            }
        }
        if (shouldUpdate) {
            this.value = partialValue;
        }
    }
};

Component.prototype.createAndPlaceInputPorts = function(offset, offsetStart, numberOfInputs, bitWidth) {
    for (var j = 0, newOffset = offsetStart; j < numberOfInputs; j++, newOffset += offset) {
        this.inputPorts[j] = new Port(this.x + newOffset, this.y - HALF_WIRE_LENGTH, bitWidth, true);
    }
};

Component.prototype.initInputs = function() {
    for (var i = 0; i < this.maxInput; i++) {
        this.inputs.push(null);
    }
};

function createInternalAND() {
    return new Element(0, 0, null, ELEMENT_FUNCTIONS.AND, 2, 'pass', '');
}

function createInternalOR() {
    return new Element(0, 0, null, ELEMENT_FUNCTIONS.OR, 2, 'pass', '');
}

function createInternalNOR() {
    return new Element(0, 0, null, ELEMENT_FUNCTIONS.NOR, 2, 'pass', '');
}

function createInternalNOT() {
    return new Element(0, 0, null, ELEMENT_FUNCTIONS.NOT, 1, 'pass', '');
}

function createInternalXOR() {
    return new Element(0, 0, null, ELEMENT_FUNCTIONS.XOR, 2, 'pass', '');
}

function createInternalStorage() {
    return new Element(0, 0, null, ELEMENT_FUNCTIONS.NONE, 1, 'pass', '');
}

/*
    actualWidth/actualHeight are the dimensions of the component when it is being displayed on the canvas. The height and width changes to different values when
    drawn in the toolbox.
*/
Component.prototype.intializeActualWidthHeight = function() {
    this.actualWidth = this.width;
    this.actualHeight = this.height;
};

Component.prototype.buildInput = function() {
    this.name = 'In';
    this.displayValue = true;
    this.width = 40;
    this.height = 40;
    this.intializeActualWidthHeight();
    this.inputPorts = [];
    this.outputPorts[0] = new Port(this.x + (this.width / 2), this.y + this.height - HALF_WIRE_LENGTH, this.bitWidth, true);
    this.outputPorts[0].updateName('', true);
};

Component.prototype.buildOutput = function() {
    this.name = 'Out';
    this.displayValue = true;
    this.width = 40;
    this.height = 40;
    this.intializeActualWidthHeight();
    this.maxInput = 1;
    this.initInputs();
    this.inputPorts[0] = new Port(this.x + (this.width / 2), this.y - HALF_WIRE_LENGTH, this.bitWidth, true);
    this.outputPorts = [];
};

Component.prototype.buildConstant = function() {
    this.name = 'Constant';
    this.displayValue = true;
    this.width = 30;
    this.height = 25;
    this.intializeActualWidthHeight();
    this.inputPorts = [];
    if (this.bitWidth === 1) {
        this.outputPorts[0] = new Port(this.x + this.width - HALF_WIRE_LENGTH, this.y + (this.height / 2), this.bitWidth, false);
    }
    else {
        this.outputPorts[0] = new Port(this.x + (this.width / 2), this.y + this.height - HALF_WIRE_LENGTH, this.bitWidth, true);
    }
    this.outputPorts[0].updateName('', true);
};

/*
    Implemented using N D flip-flops. D is the value coming in the E line is shared and tied to the external clock signal.
    Each of the flip-flops has a 2 input mux in front of it for choosing the new value or keeping the old value. The external
    load signal choosing which to take. This line is also shared between all N flip flops.
*/
Component.prototype.buildLoadRegister = function() {
    this.width = 130;
    this.height = 65;
    this.intializeActualWidthHeight();
    this.maxInput = 3;
    this.initInputs();
    this.name = 'Load Register';
    var offset = this.width / 2;
    this.createAndPlaceInputPorts(offset, offset, 1, this.bitWidth);
    this.inputPorts[0].updateName('D', false);
    this.inputPorts[1] = new Port(this.x - HALF_WIRE_LENGTH, this.y + (this.height) / 3, 1);
    this.inputPorts[1].updateName('ld', false);
    this.inputPorts[2] = new Port(this.x - HALF_WIRE_LENGTH, this.y + (2 * this.height) / 3, 1);
    this.inputPorts[2].updateName('clk', false);
    this.outputPorts[0] = new Port(this.x + (this.width / 2), this.y + this.height - HALF_WIRE_LENGTH, this.bitWidth, true);
    this.outputPorts[0].updateName('Q', true);
    this.previousClkValue = 0;
    this.clk = this.inputPorts[2];
    var e = createInternalStorage();
    e.value = 0;
    e.update();
    this.e = e;
    this.ld = this.inputPorts[1];
    for (var i = 0; i < this.bitWidth; i++) {
        var ld = this.inputPorts[1];
        var mux = new Component(0, 0, Component.MUX, 1, false, false);
        var D = mux.outputPorts[0];
        var DNot = createInternalNOT();

        D.connectOutput(DNot.inputPorts[0], 0, 0);
        DNot.inputPorts[0].connectInput(D, 0, 0);

        var DNotAnde = createInternalAND();
        DNot.connectOutput(DNotAnde, 0);
        DNotAnde.connectInput(DNot, 0);
        e.connectOutput(DNotAnde, 1);
        DNotAnde.connectInput(e, 1);

        var DAnde = createInternalAND();
        D.connectOutput(DAnde.inputPorts[0], 0, 0);
        DAnde.inputPorts[0].connectInput(D, 0, 0);
        e.connectOutput(DAnde, 1);
        DAnde.connectInput(e, 1);

        var QPrime = createInternalNOR();
        var Q = createInternalNOR();
        DAnde.connectOutput(QPrime, 0);
        QPrime.connectInput(DAnde, 0);
        Q.connectOutput(QPrime, 1);
        QPrime.connectInput(Q, 1);

        DNotAnde.connectOutput(Q, 0);
        Q.connectInput(DNotAnde, 0);
        QPrime.connectOutput(Q, 1);
        Q.connectInput(QPrime, 1);

        Q.outputPorts[0].connectOutput(mux.inputPorts[0], 0, 0);
        mux.inputPorts[0].connectInput(Q.outputPorts[0], 0, 0);
        this.inputPorts[0].connectOutput(mux.inputPorts[1], 0, i);
        mux.inputPorts[1].connectInput(this.inputPorts[0], 0, i);
        ld.connectOutput(mux.inputPorts[2], 0, 0);
        mux.inputPorts[2].connectInput(ld, 0, 0);

        this.outputPorts[0].connectInput(Q.outputPorts[0], i, 0);
        Q.outputPorts[0].connectOutput(this.outputPorts[0], i, 0);

        this.elements.push(mux);
        this.elements.push(DNot);
        this.elements.push(DNotAnde);
        this.elements.push(DAnde);
        this.elements.push(QPrime);
        this.elements.push(Q);
    }
};

// Z = (A*S') + (B*S)
Component.prototype.buildMux = function() {
    this.width = 95;
    this.height = 65;
    this.intializeActualWidthHeight();
    this.maxInput = 3;
    this.initInputs();
    this.name = 'Mux';
    var offset = this.width / this.maxInput;
    this.createAndPlaceInputPorts(offset, offset, this.maxInput - 1, this.bitWidth);
    this.inputPorts[0].updateName('A', false);
    this.inputPorts[1].updateName('B', false);
    this.inputPorts[2] = new Port(this.x - HALF_WIRE_LENGTH, this.y + this.height / 2, 1);
    this.inputPorts[2].updateName('s', false);
    this.outputPorts[0] = new Port(this.x + (this.width / 2), this.y + this.height - HALF_WIRE_LENGTH, this.bitWidth, true);
    this.outputPorts[0].updateName('Y', true);
    for (var i = 0; i < this.bitWidth; i++) {
        var S = this.inputPorts[2];
        var A = this.inputPorts[0];
        var B = this.inputPorts[1];

        var SNot = createInternalNOT();
        var BNot = createInternalNOT();
        var ANot = createInternalNOT();

        S.connectOutput(SNot.inputPorts[0], 0, 0);
        SNot.inputPorts[0].connectInput(S, 0, 0);

        A.connectOutput(ANot.inputPorts[0], 0, i);
        ANot.inputPorts[0].connectInput(A, 0, i);

        B.connectOutput(BNot.inputPorts[0], 0, i);
        BNot.inputPorts[0].connectInput(B, 0, i);

        var SNotAndA = createInternalAND();
        SNot.connectOutput(SNotAndA, 0);
        SNotAndA.connectInput(SNot, 0);
        A.connectOutput(SNotAndA.inputPorts[1], 0, i);
        SNotAndA.inputPorts[1].connectInput(A, 0, i);

        var SNotAndAAndB = createInternalAND();
        SNotAndA.connectOutput(SNotAndAAndB, 0);
        SNotAndAAndB.connectInput(SNotAndA, 0);
        B.connectOutput(SNotAndAAndB.inputPorts[1], 0, i);
        SNotAndAAndB.inputPorts[1].connectInput(B, 0, i);

        var SNotAndAAndBNot = createInternalAND();
        SNotAndA.connectOutput(SNotAndAAndBNot, 0);
        SNotAndAAndBNot.connectInput(SNotAndA, 0);
        BNot.connectOutput(SNotAndAAndBNot, 1);
        SNotAndAAndBNot.connectInput(BNot, 1);

        var SNotAndAAndBOrSNotAndAAndBNot = createInternalOR();
        SNotAndAAndB.connectOutput(SNotAndAAndBOrSNotAndAAndBNot, 0);
        SNotAndAAndBOrSNotAndAAndBNot.connectInput(SNotAndAAndB, 0);
        SNotAndAAndBNot.connectOutput(SNotAndAAndBOrSNotAndAAndBNot, 1);
        SNotAndAAndBOrSNotAndAAndBNot.connectInput(SNotAndAAndBNot, 1);


        var SAndA = createInternalAND();
        S.connectOutput(SAndA.inputPorts[0], 0, 0);
        SAndA.inputPorts[0].connectInput(S, 0, 0);
        A.connectOutput(SAndA.inputPorts[1], 0, i);
        SAndA.inputPorts[1].connectInput(A, 0, i);

        var SAndAAndB = createInternalAND();
        SAndA.connectOutput(SAndAAndB, 0);
        SAndAAndB.connectInput(SAndA, 0);
        B.connectOutput(SAndAAndB.inputPorts[1], 0, i);
        SAndAAndB.inputPorts[1].connectInput(B, 0, i);

        var SAndANot = createInternalAND();
        S.connectOutput(SAndANot.inputPorts[0], 0, 0);
        SAndANot.inputPorts[0].connectInput(S, 0, 0);
        ANot.connectOutput(SAndANot, 1);
        SAndANot.connectInput(ANot, 1);

        var SAndANotAndB = createInternalAND();
        SAndANot.connectOutput(SAndANotAndB, 0);
        SAndANotAndB.connectInput(SAndANot, 0);
        B.connectOutput(SAndANotAndB.inputPorts[1], 0, i);
        SAndANotAndB.inputPorts[1].connectInput(B, 0, i);

        var SAndAAndBOrSAndANotAndB = createInternalOR();
        SAndAAndB.connectOutput(SAndAAndBOrSAndANotAndB, 0);
        SAndAAndBOrSAndANotAndB.connectInput(SAndAAndB, 0);
        SAndANotAndB.connectOutput(SAndAAndBOrSAndANotAndB, 1);
        SAndAAndBOrSAndANotAndB.connectInput(SAndANotAndB, 1);


        var SNotAndAAndBOrSNotAndAAndBNotOrSAndAAndBOrSAndANotAndB = createInternalOR();
        SNotAndAAndBOrSNotAndAAndBNot.connectOutput(SNotAndAAndBOrSNotAndAAndBNotOrSAndAAndBOrSAndANotAndB, 0);
        SNotAndAAndBOrSNotAndAAndBNotOrSAndAAndBOrSAndANotAndB.connectInput(SNotAndAAndBOrSNotAndAAndBNot, 0);
        SAndAAndBOrSAndANotAndB.connectOutput(SNotAndAAndBOrSNotAndAAndBNotOrSAndAAndBOrSAndANotAndB, 1);
        SNotAndAAndBOrSNotAndAAndBNotOrSAndAAndBOrSAndANotAndB.connectInput(SAndAAndBOrSAndANotAndB, 1);

        this.outputPorts[0].connectInput(SNotAndAAndBOrSNotAndAAndBNotOrSAndAAndBOrSAndANotAndB.outputPorts[0], i, 0);
        SNotAndAAndBOrSNotAndAAndBNotOrSAndAAndBOrSAndANotAndB.outputPorts[0].connectOutput(this.outputPorts[0], i, 0);

        this.elements.push(SNot);
        this.elements.push(BNot);
        this.elements.push(ANot);
        this.elements.push(SNotAndA);
        this.elements.push(SNotAndAAndB);
        this.elements.push(SNotAndAAndBNot);
        this.elements.push(SNotAndAAndBOrSNotAndAAndBNot);
        this.elements.push(SAndA);
        this.elements.push(SAndAAndB);
        this.elements.push(SAndANot);
        this.elements.push(SAndANotAndB);
        this.elements.push(SAndAAndBOrSAndANotAndB);
        this.elements.push(SNotAndAAndBOrSNotAndAAndBNotOrSAndAAndBOrSAndANotAndB);
    }
};

// Ripple-carry implementation using circuit from the book
Component.prototype.buildComparator = function() {
    this.width = 130;
    this.height = 65;
    this.intializeActualWidthHeight();
    this.maxInput = 2;
    this.initInputs();
    this.name = 'Comparator';
    var offset = this.width / (this.maxInput + 1);
    this.createAndPlaceInputPorts(offset, offset, this.maxInput, this.bitWidth);
    this.inputPorts[0].updateName('A', false);
    this.inputPorts[1].updateName('B', false);
    var numOutputs = 3;
    var offset = this.width / (numOutputs + 1);
    for (var j = 0, newOffset = offset; j < numOutputs; j++, newOffset += offset) {
        this.outputPorts[j] = new Port(this.x + newOffset, this.y + this.height - HALF_WIRE_LENGTH, 1, true);
    }
    this.outputPorts[0].updateName('gt', true);
    this.outputPorts[1].updateName('lt', true);
    this.outputPorts[2].updateName('eq', true);
    /*
        Create inputs into the first one bit comparator.
        These will always be set so that less than = 0, greater than = 0, and equal = 1.
    */
    var lti = createInternalStorage();
    var gti = createInternalStorage();
    var eqi = createInternalStorage();
    lti.value = 0;
    gti.value = 0;
    eqi.value = 1;
    lti.update();
    gti.update();
    eqi.update();
    for (var i = 0; i < this.bitWidth; i++) {
        var A = this.inputPorts[0];
        var B = this.inputPorts[1];
        // gto elements
        var BNot = createInternalNOT();
        var ABNotAnd = createInternalAND();
        var ABNotAndAndeqi = createInternalAND();
        var gtiOrABNotAndAndeqi = createInternalOR();
        var gto;
        B.connectOutput(BNot.inputPorts[0], 0, this.bitWidth - i - 1);
        BNot.inputPorts[0].connectInput(B, 0, this.bitWidth - i - 1);
        A.connectOutput(ABNotAnd.inputPorts[0], 0, this.bitWidth - i - 1);
        ABNotAnd.inputPorts[0].connectInput(A, 0, this.bitWidth - i - 1);
        BNot.connectOutput(ABNotAnd, 1);
        ABNotAnd.connectInput(BNot, 1);
        ABNotAnd.connectOutput(ABNotAndAndeqi, 0);
        ABNotAndAndeqi.connectInput(ABNotAnd, 0);
        eqi.connectOutput(ABNotAndAndeqi, 1);
        ABNotAndAndeqi.connectInput(eqi, 1);
        gti.connectOutput(gtiOrABNotAndAndeqi, 0);
        gtiOrABNotAndAndeqi.connectInput(gti, 0);
        ABNotAndAndeqi.connectOutput(gtiOrABNotAndAndeqi, 1);
        gtiOrABNotAndAndeqi.connectInput(ABNotAndAndeqi, 1);
        gto = gtiOrABNotAndAndeqi;
        // lto elements
        var ANot = createInternalNOT();
        var ANotBAnd = createInternalAND();
        var ANotBAndAndeqi = createInternalAND();
        var ltiOrANotBAndAndeqi = createInternalOR();
        var lto;
        A.connectOutput(ANot.inputPorts[0], 0, this.bitWidth - i - 1);
        ANot.inputPorts[0].connectInput(A, 0, this.bitWidth - i - 1);
        ANot.connectOutput(ANotBAnd, 0);
        ANotBAnd.connectInput(ANot, 0);
        B.connectOutput(ANotBAnd.inputPorts[1], 0, this.bitWidth - i - 1);
        ANotBAnd.inputPorts[1].connectInput(B, 0, this.bitWidth - i - 1);
        ANotBAnd.connectOutput(ANotBAndAndeqi, 0);
        ANotBAndAndeqi.connectInput(ANotBAnd, 0);
        eqi.connectOutput(ANotBAndAndeqi, 1);
        ANotBAndAndeqi.connectInput(eqi, 1);
        lti.connectOutput(ltiOrANotBAndAndeqi, 0);
        ltiOrANotBAndAndeqi.connectInput(lti, 0);
        ANotBAndAndeqi.connectOutput(ltiOrANotBAndAndeqi, 1);
        ltiOrANotBAndAndeqi.connectInput(ANotBAndAndeqi, 1);
        lto = ltiOrANotBAndAndeqi;
        // eqo elements
        var AXorB = createInternalXOR();
        var AXnorB = createInternalNOT();
        var eqiAndAXorB = createInternalAND();
        var eqo;
        A.connectOutput(AXorB.inputPorts[0], 0, this.bitWidth - i - 1);
        AXorB.inputPorts[0].connectInput(A, 0, this.bitWidth - i - 1);
        B.connectOutput(AXorB.inputPorts[1], 0, this.bitWidth - i - 1);
        AXorB.inputPorts[1].connectInput(B, 0, this.bitWidth - i - 1);
        AXorB.connectOutput(AXnorB, 0);
        AXnorB.connectInput(AXorB, 0);
        eqi.connectOutput(eqiAndAXorB, 0);
        eqiAndAXorB.connectInput(eqi, 0);
        AXnorB.connectOutput(eqiAndAXorB, 1);
        eqiAndAXorB.connectInput(AXnorB, 1);
        eqo = eqiAndAXorB;
        this.elements.push(BNot);
        this.elements.push(ABNotAnd);
        this.elements.push(ABNotAndAndeqi);
        this.elements.push(gtiOrABNotAndAndeqi);
        this.elements.push(ANot);
        this.elements.push(ANotBAnd);
        this.elements.push(ANotBAndAndeqi);
        this.elements.push(ltiOrANotBAndAndeqi);
        this.elements.push(AXorB);
        this.elements.push(AXnorB);
        this.elements.push(eqiAndAXorB);
        gti = gto;
        lti = lto;
        eqi = eqo;
    }
    this.outputPorts[0].connectInput(gti.outputPorts[0], 0, 0);
    gti.outputPorts[0].connectOutput(this.outputPorts[0], 0, 0);
    this.outputPorts[1].connectInput(lti.outputPorts[0], 0, 0);
    lti.outputPorts[0].connectOutput(this.outputPorts[1], 0, 0);
    this.outputPorts[2].connectInput(eqi.outputPorts[0], 0, 0);
    eqi.outputPorts[0].connectOutput(this.outputPorts[2], 0, 0);
};

// Made up of one half adder and N-1 full adders
Component.prototype.buildAdder = function() {
    this.width = 115;
    this.height = 65;
    this.intializeActualWidthHeight();
    this.maxInput = 2;
    this.initInputs();
    this.name = 'Adder';
    var offset = this.width / (this.maxInput + 1);
    this.createAndPlaceInputPorts(offset, offset, this.maxInput, this.bitWidth);
    this.inputPorts[0].updateName('A', false);
    this.inputPorts[1].updateName('B', false);
    this.outputPorts[0] = new Port(this.x + this.width / 2, this.y + this.height - HALF_WIRE_LENGTH, this.bitWidth, true);
    this.outputPorts[0].updateName('S', true);
    // Single bit half adder
    var xorAB = createInternalXOR();
    var andAB = createInternalAND();
    // AB to xor
    this.inputPorts[0].connectOutput(xorAB.inputPorts[0], 0, 0);
    xorAB.inputPorts[0].connectInput(this.inputPorts[0], 0, 0);
    this.inputPorts[1].connectOutput(xorAB.inputPorts[1], 0, 0);
    xorAB.inputPorts[1].connectInput(this.inputPorts[1], 0, 0);
    // AB to and
    this.inputPorts[0].connectOutput(andAB.inputPorts[0], 0, 0);
    andAB.inputPorts[0].connectInput(this.inputPorts[0], 0, 0);
    this.inputPorts[1].connectOutput(andAB.inputPorts[1], 0, 0);
    andAB.inputPorts[1].connectInput(this.inputPorts[1], 0, 0);
    // And to Cin
    var Cin = andAB;
    // S to port output
    this.outputPorts[0].connectInput(xorAB.outputPorts[0], 0, 0);
    xorAB.outputPorts[0].connectOutput(this.outputPorts[0], 0, 0);
    this.elements.push(xorAB);
    this.elements.push(andAB);
    // Single bit adder components
    var xorAB;
    var xorABCin;
    var andAB;
    var andxorCin;
    var orCout;
    for (var i = 1; i < this.bitWidth; i++) {
        xorAB = createInternalXOR();
        xorABCin = createInternalXOR();
        andAB = createInternalAND();
        andxorCin = createInternalAND();
        orCout = createInternalOR();
        // AB to xor
        this.inputPorts[0].connectOutput(xorAB.inputPorts[0], 0, i);
        xorAB.inputPorts[0].connectInput(this.inputPorts[0], 0, i);
        this.inputPorts[1].connectOutput(xorAB.inputPorts[1], 0, i);
        xorAB.inputPorts[1].connectInput(this.inputPorts[1], 0, i);
        // xor Cin to xor
        Cin.connectOutput(xorABCin, 0);
        xorABCin.connectInput(Cin, 0);
        xorAB.connectOutput(xorABCin, 1);
        xorABCin.connectInput(xorAB, 1);
        // xor Cin to and
        Cin.connectOutput(andxorCin, 0);
        andxorCin.connectInput(Cin, 0);
        xorAB.connectOutput(andxorCin, 1);
        andxorCin.connectInput(xorAB, 1);
        // AB to and
        this.inputPorts[0].connectOutput(andAB.inputPorts[0], 0, i);
        andAB.inputPorts[0].connectInput(this.inputPorts[0], 0, i);
        this.inputPorts[1].connectOutput(andAB.inputPorts[1], 0, i);
        andAB.inputPorts[1].connectInput(this.inputPorts[1], 0, i);
        // And and to or
        andAB.connectOutput(orCout, 0);
        orCout.connectInput(andAB, 0);
        andxorCin.connectOutput(orCout, 1);
        orCout.connectInput(andxorCin, 1);
        // S to port output
        this.outputPorts[0].connectInput(xorABCin.outputPorts[0], i, 0);
        xorABCin.outputPorts[0].connectOutput(this.outputPorts[0], i, 0);
        // or to Cout to cin
        Cin = orCout;
        this.elements.push(xorAB);
        this.elements.push(xorABCin);
        this.elements.push(andAB);
        this.elements.push(andxorCin);
        this.elements.push(orCout);
    }
};

// Returns the text that will be displayed in the toolbox for this component.
Component.prototype.getDisplayText = function() {
    var textToDisplay = '';
    switch (this.elementType) {
        case Component.IN:
            textToDisplay = 'Data in';
            break;
        case Component.OUT:
            textToDisplay = 'Data out';
            break;
        case Component.ADDER:
            textToDisplay = 'Adder';
            break;
        case Component.COMPARATOR:
            textToDisplay = 'Comparator';
            break;
        case Component.MUX:
            textToDisplay = '2x1 mux';
            break;
        case Component.LOAD_REGISTER:
            textToDisplay = 'Load register';
            break;
        case Component.CONSTANT:
            textToDisplay = 'Constant data';
            break;
    }
    return textToDisplay;
};

// Returns the height and width of a component when it is in text display mode in the toolbox.
Component.prototype.getDisplayTextDimensions = function(context) {
    // Need to scale the width given by measureText so that the box we are drawing will go around the text.
    var SCALE_FACTOR = 1.3;
    // Padding around text so that there is some space bewteen the text and the border.
    var PADDING = 15;
    return {
        width: context.measureText(this.getDisplayText()).width * SCALE_FACTOR + PADDING,
        height: 24
    };
};

/*
    Draws this component
    |context| is a canvas type that supplies the drawing api.
*/
Component.prototype.draw = function(context) {
    if (this.shouldDraw) {
        // Draw inputs/outputs
        if (!this.inToolBox) {
            for (var i = 0; i < this.inputPorts.length; i++) {
                this.inputPorts[i].draw(context);
            }
            for (var i = 0; i < this.outputPorts.length; i++) {
                this.outputPorts[i].draw(context);
            }
        }
        // Draw only simple label representation
        if (this.inToolBox) {
            context.save();
            context.strokeStyle = COMPONENT_CONSTANTS.TOOLBOX_DRAWING.borderColor;
            // Set background color
            if (this.elementType === Component.CONSTANT) {
                context.fillStyle = COMPONENT_CONSTANTS.TOOLBOX_DRAWING.constantBackgroundColor;
            }
            else {
                context.fillStyle = COMPONENT_CONSTANTS.TOOLBOX_DRAWING.normalBackgroundColor;
            }
            var textToDisplay = this.getDisplayText();
            var dimensions = this.getDisplayTextDimensions(context);
            this.width = dimensions.width;
            this.height = dimensions.height;
            context.beginPath();
            context.fillRect(this.x, this.y, this.width, this.height);
            context.rect(this.x, this.y, this.width, this.height);
            context.stroke();
            context.fillStyle = COMPONENT_CONSTANTS.TOOLBOX_DRAWING.nameFontcolor;
            context.font = COMPONENT_CONSTANTS.TOOLBOX_DRAWING.nameFont;
            context.textBaseline = 'middle';
            context.fillText(textToDisplay, this.x + 5, this.y + (this.height / 2));
            context.restore();
        }
        // Draw normal component representation with name and ports
        else {
            context.save();
            context.strokeStyle = COMPONENT_CONSTANTS.NORMAL_DRAWING.borderColor;
            // Set background color
            if (this.elementType === Component.CONSTANT) {
                context.fillStyle = COMPONENT_CONSTANTS.NORMAL_DRAWING.constantBackgroundColor;
            }
            else {
                context.fillStyle = COMPONENT_CONSTANTS.NORMAL_DRAWING.normalBackgroundColor;
            }
            context.globalAlpha = (this.loading ? 0.5 : 1.0);
            this.width = this.actualWidth;
            this.height = this.actualHeight;
            context.beginPath();
            context.fillRect(this.x, this.y, this.width, this.height);
            context.rect(this.x, this.y, this.width, this.height);
            context.stroke();
            for (var i = 0; i < this.inputPorts.length; i++) {
                this.inputPorts[i].drawName(context);
            }
            for (var i = 0; i < this.outputPorts.length; i++) {
                this.outputPorts[i].drawName(context);
            }
            if (this.elementType == Component.IN || this.elementType == Component.OUT || this.elementType == Component.CONSTANT) {
                var valueText = this.value + '';
                if (this.elementType == Component.OUT && (this.inputs[0] == null || this.value == -255)) {
                    valueText = '?';
                }
                context.fillStyle = COMPONENT_CONSTANTS.NORMAL_DRAWING.valueFontColor;
                context.font = COMPONENT_CONSTANTS.NORMAL_DRAWING.valueFont;
                context.textBaseline = 'middle';
                context.fillText(valueText, this.x + (this.width / 2) - (context.measureText(valueText).width / 2), this.y + (this.height / 2));
                if (this.elementType == Component.IN || this.elementType == Component.OUT) {
                    context.fillStyle = COMPONENT_CONSTANTS.NORMAL_DRAWING.nameFontcolor;
                    context.font = COMPONENT_CONSTANTS.NORMAL_DRAWING.nameFont;
                    context.textBaseline = 'middle';
                    context.fillText(this.name, this.x - (this.width / 4) - (context.measureText(this.name).width / 2), this.y + (this.height / 2));
                }
            }
            else {
                context.fillStyle = COMPONENT_CONSTANTS.NORMAL_DRAWING.nameFontcolor;
                context.font = COMPONENT_CONSTANTS.NORMAL_DRAWING.nameFont;
                context.textBaseline = 'middle';
                context.fillText(this.name, this.x + (this.width / 2) - (context.measureText(this.name).width / 2), this.y + (this.height / 2));
            }
            context.restore();
        }
    }
};