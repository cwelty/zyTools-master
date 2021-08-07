// Class for the address of a symbol used by the assembler to remember whether an entry |isData| - boolean - or not and its |address| - integer
function Address(address, isData) {
    this.address = (address !== 'undefined' ? address : 0);
    this.isCode = (isData !== 'undefined' ? !isData : false);
    this.isData = (isData !== 'undefined' ? isData : false);
}
