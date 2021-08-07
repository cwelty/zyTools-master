'use strict';

/* exported convertImportCSVStringToArray, convertStorageToCSV */
/* global StorageUnitNameAndValue */

/**
    Convert a CSV string to an array of storage unit names and values.
    @method convertImportCSVStringToArray
    @param {String} string CSV string containing storage unit names and values.
    @return {Array} of {StorageUnitNameAndValue} Extracted storage unit names and values.
*/
function convertImportCSVStringToArray(string) {
    const registers = string ? string.split(', ') : [];

    return registers.map(register => {
        const split = register.split(' ');
        const name = split[0];
        const value = split[1];

        return new StorageUnitNameAndValue(name, value);
    });
}

/**
    Convert a register or memory controller into a CSV string with format: <byte name> <byte value>
    Ex: $s1 4, $s2 6, $s3 7
    @method convertStorageToCSV
    @param {StorageController} storageController The register or memory controller to convert.
    @return {String} A CSV format of the given storage type's data.
*/
function convertStorageToCSV(storageController) {
    return storageController.getUsedBytesNameAndValue()
                            .map(bytesNameAndValue => `${bytesNameAndValue.address} ${bytesNameAndValue.value}`)
                            .join(', ');
}
