/*
    Simple class to be used for console output to the user.
    Sending output to the console can be done via the out function, errors should be sent
    with the error function.
    |$console|, the jquery object for the textarea.
*/
function Console($console) {
    this.$console = $console;
}

// Clears the console of all text
Console.prototype.clear = function() {
    this.$console.val('');
};

/*
    Appends|str| to the console window with Error: prepended.
    |str| - string, string to be outputed.
*/
Console.prototype.error = function(str) {
    this.$console.val(this.$console.val() + 'Error: ' + str);
};
/*
    Appends |str| to the console window.
    |str| - string, string to be outputed.
*/
Console.prototype.out = function(str) {
    this.$console.val(this.$console.val() + str);
};

// Returns true if no text has been added to the console
Console.prototype.isEmpty = function() {
    return (this.$console.val().trim().length) === 0;
};