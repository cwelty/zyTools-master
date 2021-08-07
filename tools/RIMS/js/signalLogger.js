/*
    Class used by the virtual machine to generate a vcd file
*/
function SignalLogger() {
    this.reset();
}

// Reset the signal logger, adds all of the starter code needed by a vcd file
SignalLogger.prototype.reset = function() {
    var currentDate = new Date();
    var day = currentDate.getDate();
    var month = currentDate.getMonth() + 1;
    var year = currentDate.getFullYear();
    var currentDateString = month + '/' + day + '/' + year;
    var currentTime = currentDate.getHours() + ':' + currentDate.getMinutes() + ':' + currentDate.getSeconds();

    this.vcdString = '$date\n\t' + currentDateString + ' ' + currentTime + '\n$end\n';
    this.vcdString += '$version\n\t' + APP_NAME + ' ' + VERSION + '\n$end\n';
    this.vcdString += '$timescale\n\t1 ms\n$end\n';
    this.vcdString += '$scope module RIMS $end\n';
    this.vcdString += '$var wire 1 *TMR TIMER_ISR $end\n';
    for (var i = 0; i < 8; i++) {
        this.vcdString += '$var wire 1 *A' + i + ' A' + i + ' $end\n';
    }
    for (var i = 0; i < 8; i++) {
        this.vcdString += '$var wire 1 *B' + i + ' B' + i + ' $end\n';
    }
    this.vcdString += '$upscope $end\n';
    this.vcdString += '$enddefinitions $end\n\n';
    this.vcdString += '#0\n$dumpvars\nb0 *TMR\nb0 *A0\nb0 *A1\nb0 *A2\nb0 *A3\nb0 *A4\nb0 *A5\nb0 *A6\nb0 *A7';
    this.vcdString += '\nb0 *B0\nb0 *B1\nb0 *B2\nb0 *B3\nb0 *B4\nb0 *B5\nb0 *B6\nb0 *B7\n$end\n';
    this.neededSignals = {};
};

SignalLogger.prototype.addNeededSignal = function(signalName) {
    this.neededSignals[signalName] = true;
};

/*
    Register an event on on the given signal
    |currentTicks| - integer - current vm time
    |value| - integer - value of the signal at the time |currentTicks|
    |name| - string - name of the signal
*/
SignalLogger.prototype.emitSignal = function(currentTicks, value, name) {
    this.vcdString += '#' + ((currentTicks * (1000.0 / VM_CONSTANTS.INSTR_PER_SEC)) | 0) + '\nb' + value + ' *' + name + '\n';
};

// Returns the vcd string for the signals that have been logged
SignalLogger.prototype.getVCDString = function() {
    return this.vcdString;
};
