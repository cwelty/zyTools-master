// Class for managing all of symbols used by code in the virtual machine
function SymbolTable() {
    this.symbolLut = {};
    this.changed = false;
}

/*
    Looks up the symbol with name given by |name| and returns the address if it exists, defaults to -1.
    |name| - string, name of the symbol to be looked up.
*/
SymbolTable.prototype.lookUp = function(name) {
    if (name in this.symbolLut) {
        return this.symbolLut[name];
    }
    var defaultReturn = new SymbolData();
    defaultReturn.address = -1;
    return defaultReturn;
};

/*
    Look up a symbol by its |address|; if not found it returns the next lowest address found (and assumes it points to a function).
    |address| - integer, address of the symbol to be looked up.
*/
SymbolTable.prototype.reverseLookup = function(address) {
    var lowest = { greatestValue: 0, greatestAddress: address };
    for (var name in this.symbolLut) {
        if (this.symbolLut[name].address === address) {
            return name;
        }
        if (this.symbolLut[name].address < address && lowest.greatestAddress == address) {
            lowest.greatestAddress = this.symbolLut[name].address;
            lowest.greatestValue = name;
        }
        else if (this.symbolLut[name].address < address && this.symbolLut[name].address > lowest.greatestAddress) {
            lowest.greatestAddress = this.symbolLut[name].address;
            lowest.greatestValue = name;
        }
    }
    return lowest.greatestValue;
};

// Remove the symbol |name| - string - from the symbol table
SymbolTable.prototype.remove = function(name) {
    delete this.symbolLut[name];
};

/*
    Inserts symbol into the table if it doesn't already exist, otherwise just updates the entry for this symbol.
    |name| - string, name of the symbol.
    |address| - integer, address of the symbol.
    |size| - integer, size of the symbol, 1 for char, 2 for short...
    |isData| - boolean, is this data or is this code.
*/
SymbolTable.prototype.modify = function(name, address, size, isData) {
    var temp = new SymbolData();
    temp.address = address;
    temp.contentLength = size;
    temp.inDataSegment = isData;
    // if name doesn't exist the pair is automatically created
    this.symbolLut[name] = temp;
};

// Returns true if the symbol |name| - string - exists in the symbol table
SymbolTable.prototype.contains = function(name) {
    return name in this.symbolLut;
};

// Returns true if the address |addr| - integer - has a symbol defined
SymbolTable.prototype.reverseContains = function(addr) {
    for (var name in this.symbolLut) {
        if (this.symbolLut[name].address == addr) {
            return true;
        }
    }
    return false;
};

// Copies all elements to the supplied map (to literally export the symbol map)
SymbolTable.prototype.export = function() {
    var symbolMap = {};
    for (var name in this.symbolLut) {
        symbolMap[name] = this.symbolLut[name];
    }
    return symbolMap;
};

// Makes the symbol look-up table a copy of the supplied map
SymbolTable.prototype.import = function(symbolMap) {
    this.symbolLut = symbolMap;
};


// Erase all elements
SymbolTable.prototype.reset = function() {
    this.symbolLut = {};
    this.changed = false;
};
