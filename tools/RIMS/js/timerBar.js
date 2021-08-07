// Class for the visual representation of the timer execution, also shows the elapsed time
function TimerBar($canvas) {
    this.$canvas = $canvas;
    this.canvas = $canvas[0];
    this.context = this.canvas.getContext('2d');
    this.min = 0;
    this.max = 1000;
    this.currentTime = 0;
    this.textSize = 16;
    this.previousTime = 0;
}

// TimerBar constants
TimerBar.TIMER_WIDTH = 200;
TimerBar.TIMER_HEIGHT = 20;
TimerBar.BAR_COLOR = 'green';

/*
    Update the timer bar with new |timerInfo| from the vm
    |timerInfo| - object containing:
        * |max| - integer - time it takes for one tick
        * |currentElapsed| - integer - current elapsed time from vm's execution start
        * |currentValue| - integer - current timer elapsed value, between 0-max
*/
TimerBar.prototype.update = function(timerInfo) {
    this.max = timerInfo.max;
    this.previousTime = this.currentTime;
    this.currentTime = timerInfo.currentElapsed;
    this.currentValue = timerInfo.currentValue;
};

// Draw the current state of the timer bar
TimerBar.prototype.draw = function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = TimerBar.BAR_COLOR;
    this.context.strokeStyle = 'black';
    var percentage = 0;
    if (this.max !== 0) {
        this.context.beginPath();
        percentage = ((this.currentValue - this.min) / this.max);
        if ((this.currentTime - this.previousTime) > this.max) {
            if (this.drawFilled) {
                percentage = 0;
                this.drawFilled = false;
            }
            else {
                percentage = 1;
                this.drawFilled = true;
            }
        }
        this.context.rect(0, 0, TimerBar.TIMER_WIDTH * percentage, TimerBar.TIMER_HEIGHT);
        this.context.fill();
    }
    this.context.beginPath();
    this.context.rect(0, 0, TimerBar.TIMER_WIDTH, TimerBar.TIMER_HEIGHT);
    this.context.stroke();
    this.context.fillStyle = 'black';
    this.context.font = this.textSize + 'px Courier';
    this.context.textBaseline = 'middle';
    var percentText = ((percentage * 100) | 0) + '%';
    this.context.fillText(percentText, (TimerBar.TIMER_WIDTH / 2) - (this.context.measureText(percentText).width / 2), TimerBar.TIMER_HEIGHT / 2);
};
