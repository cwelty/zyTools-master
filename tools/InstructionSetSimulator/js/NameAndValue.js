/**
    Structure to store a name and value of a storage unit. Ex: A register named '$s1' with value 100.
    @class StorageUnitNameAndValue
    @constructor
    @param {String} name The name of the storage unit.
    @param {Number} value The value stored in the storage unit.
*/
function StorageUnitNameAndValue(name, value) {
    this.name  = name;
    this.value = value;
}