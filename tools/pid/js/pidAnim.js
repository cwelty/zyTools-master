/*
    File: pidAnim.js
    Author: Timothy Cherney
    Javascript animation of a pid controlled system

    dependencies: jquery
*/
var TAN = '#c5b47f';
var ZYANTE_MEDIUM_RED = '#BB0404';
function PIDAnim(canvas, interval) {
    this.timerHandle = 0;
    this.interval = interval;
    this.width = 0;
    this.height = 0;
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');
    this.tube = new Tube(25, 25, 30, 200, 15, Math.PI, 0);
    this.fan = new Fan(25, 245, 30, 30, 0, 10);
    this.ball = new Ball(40, 210, 15);
    this.desired = 0;
}

// Ball is effectively just a circle
function Ball(x, y, radius) {
    this.x = x;
    this.y = y;
    this.yStart = y;
    this.radius = radius;
}

Ball.prototype.draw = function(context) {
    context.save();
    context.fillStyle = ZYANTE_MEDIUM_RED;
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.closePath();
    context.fill();
    context.restore();
};

// Keeps ball lined up with graph
PIDAnim.prototype.adjustBall = function(distance) {
    this.ball.y = this.ball.yStart - ((distance / (this.desired * 2)) * (this.tube.height));
};

// The fan's speed (how fast it spins) max is always the same. This function takes the current
// actuator value and sets the fan speed based on what % of the actuator
// value's max the current actuator value is.
PIDAnim.prototype.adjustFan = function(current, max) {
    if (max > 0) {
        this.fan.currentSpeed = parseFloat(((current / max) * this.fan.maxSpeed));
    }
    else {
        this.fan.currentSpeed = 0;
    }
};


function Tube(x, y, width, height, radius, start, end) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.start = start;
    this.end = end;
    this.width = width;
    this.height = height;
    this.offset = -10;
}

Tube.prototype.draw = function(context) {
    context.save();
    context.beginPath();
    context.arc(this.x + this.radius, this.y - 10, this.radius, this.start, this.end);
    context.closePath();
    context.fill();
    context.beginPath();
    context.moveTo(this.x, this.y + this.offset);
    context.lineTo(this.x, this.y + this.height);
    context.lineTo(this.x + this.width, this.y + this.height);
    context.lineTo(this.x + this.width, this.y + this.offset);
    context.closePath();
    context.fill();
    context.restore();

};

function Fan(x, y, width, height, angle, maxSpeed) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    // Degrees
    this.angle = angle;
    this.maxSpeed = maxSpeed;
    this.currentSpeed = 0;
}
// Draws fan at the proper angle, fan is effectively two lines
Fan.prototype.draw = function(context) {
    context.save();
    context.lineWidth = 2;
    context.translate(this.x + (this.width / 2), this.y + (this.height / 2));
    context.rotate((this.angle) * Math.PI / 180);
    context.translate(-(this.x + (this.width / 2)), -(this.y + (this.height / 2)));

    context.beginPath();
    context.moveTo(this.x, this.y + (this.height / 2));
    context.lineTo(this.x + this.width, this.y + (this.height / 2));
    context.stroke();

    context.beginPath();
    context.moveTo(this.x + (this.width / 2), this.y);
    context.lineTo(this.x + (this.width / 2), this.y + this.height);
    context.stroke();
    context.restore();
};

Fan.prototype.update = function() {
    this.angle += this.currentSpeed;
};

// timerHandles drawing of all of the animation
PIDAnim.prototype.draw = function() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.tube.draw(this.context);
    this.fan.draw(this.context);
    this.ball.draw(this.context);
    // Draw desired line
    this.context.save();
    this.context.strokeStyle = TAN;
    this.context.beginPath();
    this.context.moveTo(this.tube.x, (this.ball.yStart - ((this.desired / (this.desired * 2)) * this.tube.height)));
    this.context.lineTo(this.tube.x + this.tube.width, (this.ball.yStart - ((this.desired / (this.desired * 2)) * this.tube.height)));
    this.context.closePath();
    this.context.stroke();
    this.context.restore();
};

PIDAnim.prototype.update = function() {
    this.fan.update();
};

PIDAnim.prototype.init = function(canvas, desired) {
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    var self = this;
    this.timerHandle = setInterval(function() {
        self.update();
        self.draw();
    }, this.interval);
    this.desired = desired;
};

PIDAnim.prototype.reset = function() {
    this.tube = new Tube(25, 25, 30, 200, 15, Math.PI, 0);
    this.fan = new Fan(25, 245, 30, 30, 0, 10);
    this.ball = new Ball(40, 210, 15);
    this.draw();
}
