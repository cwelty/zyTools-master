
function ErrorManager() {

    // Input is the error (subject to error API)
    this.postError = function(message) {
        console.log(message);
    }
}

var manager = new ErrorManager();

module.exports = manager;