/*
    Ports handle the connections between elements and components
    |x|, |y|, and |bitWidth| are required and are numbers.
    |vertical| is required and is boolean.
*/
function Port(x, y, bitWidth, vertical) {
    this.x = x;
    this.y = y;
    this.bitWidth = bitWidth;
    this.connectors = [];
    this.name = '';
    this.vertical = vertical !== undefined ? vertical : false;
    this.isOutput = false;
    this.value = 0;
    for (var i = 0; i < bitWidth; i++) {
        this.connectors[i] = new InternalCell();
    }
    if (this.vertical) {
        this.height = WIRE_LENGTH;
        this.width = 1;
    }
    else {
        this.height = 1;
        this.width = WIRE_LENGTH;
    }
}

/*
    Update the name and where it is an output port.
    |name| is a string and is required.
    |isOutput| is a boolean and is required.
*/
Port.prototype.updateName = function(name, isOutput) {
    this.name = name;
    this.isOutput = isOutput;
};

/*
    Draws this port
    |context| is a canvas type that supplies the drawing api.
*/
Port.prototype.draw = function(context) {
    context.save();
    context.fillStyle = WIRE_COLOR;
    context.font = '12px Helvetica';
    context.strokeStyle = WIRE_COLOR;
    context.lineWidth = 1;
    if (this.vertical) {
        if (this.bitWidth > 1) {
            context.beginPath();
            if (this.isOutput) {
                context.moveTo(this.x + QUARTER_WIRE_LENGTH, this.y + (this.height / 2));
                context.lineTo(this.x - QUARTER_WIRE_LENGTH, this.y + this.height);
            }
            else {
                context.moveTo(this.x + QUARTER_WIRE_LENGTH, this.y);
                context.lineTo(this.x - QUARTER_WIRE_LENGTH, this.y + (this.height / 2));
            }
            context.stroke();
        }
        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.x, this.y + this.height);
        context.stroke();
        context.restore();
    }
    else {
        if (this.bitWidth > 1) {
            context.beginPath();
            if (this.isOutput) {
                context.moveTo(this.x + (this.width / 2), this.y + QUARTER_WIRE_LENGTH);
                context.lineTo(this.x + this.width, this.y - QUARTER_WIRE_LENGTH);
            }
            else {
                context.moveTo(this.x, this.y + QUARTER_WIRE_LENGTH);
                context.lineTo(this.x + (this.width / 2), this.y - QUARTER_WIRE_LENGTH);
            }
            context.stroke();
        }
        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.x + this.width, this.y);
        context.stroke();
        context.restore();
    }
};

/*
    Draws this port's name in the correct location
    |context| is a canvas type that supplies the drawing api.
*/
Port.prototype.drawName = function(context) {
    context.save();
    context.fillStyle = WIRE_COLOR;
    var fontSize = 12;
    context.font = fontSize + 'px Helvetica';
    context.strokeStyle = WIRE_COLOR;
    var inspectorValueOffset = 5;
    if (this.vertical) {
        if (this.isOutput) {
            context.fillText(this.name, this.x - (context.measureText(this.name).width / 2), this.y);
            if (this.name) {
                context.font = 'italic ' + (fontSize - 2) + 'px Helvetica';
                context.fillStyle = 'gray';
                context.fillText(this.value, this.x + (context.measureText(this.name).width / 2) + inspectorValueOffset, this.y);
            }

        }
        else {
            context.fillText(this.name, this.x - (context.measureText(this.name).width / 2), this.y + this.height + 5);
            if (this.name) {
                context.font = 'italic ' + (fontSize - 2) + 'px Helvetica';
                context.fillStyle = 'gray';
                context.fillText(this.value, this.x + (context.measureText(this.name).width / 2) + inspectorValueOffset, this.y + this.height + 5);
            }
        }
    }
    else {
        if (this.isOutput) {
            context.fillText(this.name, this.x - (context.measureText(this.name).width / 2), this.y);
        }
        else {
            if (this.name == 'clk') {
                context.strokeStyle = ZYANTE_DARK_BLUE;
                var triangleHeight = fontSize;
                var trangleWidth = fontSize;
                context.beginPath();
                context.moveTo(this.x + (this.width / 2), this.y + (triangleHeight / 2));
                context.lineTo(this.x + (this.width / 2), this.y - (triangleHeight / 2));
                context.lineTo(this.x + (this.width / 2) + trangleWidth, this.y);
                context.lineTo(this.x + (this.width / 2), this.y + (triangleHeight / 2));
                context.stroke();
            }
            else {
                context.fillText(this.name, this.x + this.width - context.measureText(this.name).width / 2, this.y);
            }
        }
    }
    context.restore();
};

/*
    Connects this port to another, either with select bits or the entire port
    |port| is a port and is required.
    |inputIndex| and |outputIndex| are numbers and are not required.
*/
Port.prototype.connectInput = function(port, inputIndex, outputIndex) {
    if (inputIndex != undefined && outputIndex != undefined) {
        this.connectors[inputIndex].connectInput(port.connectors[outputIndex]);
    }
    else {
        for (var i = 0; i < this.bitWidth; i++) {
            this.connectors[i].connectInput(port.connectors[i]);
        }
    }
};

/*
    Connects this port to another, either with select bits or the entire port
    |port| is a port and is required.
    |inputIndex| and |outputIndex| are numbers and are not required.
*/
Port.prototype.connectOutput = function(port, inputIndex, outputIndex) {
    if (inputIndex != undefined && outputIndex != undefined) {
        this.connectors[outputIndex].connectOutput(port.connectors[inputIndex]);
    }
    else {
        for (var i = 0; i < this.bitWidth; i++) {
            this.connectors[i].connectOutput(port.connectors[i]);
        }
    }
};

// Updates this port, pulls in values from its inputs
Port.prototype.update = function() {
    var newValue = 0;
    for (var i = 0; i < this.bitWidth; i++) {
        this.connectors[i].update();
        newValue |= this.connectors[i].value << i;
    }
    this.value = newValue;
};

/*
    Returns an object with properties |x|, |y| letting the user know where the endpoint
    of this port is.
*/
Port.prototype.endPoint = function() {
    if (this.vertical) {
        if (this.isOutput) {
            return { x: this.x, y: this.y + this.height };
        }
        else {
            return { x:this.x, y: this.y };
        }
    }
    else {
        if (this.isOutput) {
            return { x: this.x + this.width, y: this.y };
        }
        else {
            return { x:this.x, y: this.y };
        }
    }
};