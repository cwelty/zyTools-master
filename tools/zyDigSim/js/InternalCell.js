/*
    InternalCells are where the values of a port are stored.
    _______        _________          _______
    |      |      |         |        |       |
    |Port  |      | Element |        | Port  |
    |      |      |         |        |       |
    | ____ |______|         |________|       |
    ||cell||      |         |        |       |
    |      |      |         |        |       |
    |______|      |_________|        |_______|
*/
function InternalCell() {
    this.input = null;
    this.outputs = [];
    this.value = 0;
}

/*
    Connect a cell to the input of this cell
    |cell| is an InputCell and is required.
*/
InternalCell.prototype.connectInput = function(cell) {
    this.input = cell;
};


/*
    Connect a cell to the output of this cell
    |cell| is an InputCell and is required.
*/
InternalCell.prototype.connectOutput = function(cell) {
    this.outputs.push({
        outputEle: cell,
        inputIndex: 0,
        portIndex: 0
    });
};

// Updates this cell, pulls value from it's input.
InternalCell.prototype.update = function() {
	    if (this.input) {
		    this.value = this.input.value;
	}
};