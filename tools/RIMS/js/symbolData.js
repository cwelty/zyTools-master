// Class for each entry in the symbol table, stores helpful information like the |address| and |contentLength|
function SymbolData() {
    this.address = 0;
    // How big is this symbol? i.e. a char would be 1, a short would be 2...
    this.contentLength = 0;
    // True if address refers to data; false if it refers to code (text).
    this.inDataSegment = false;
    // True if address refers to symbol registered to external peripheral
    this.isMapped = false;
}
