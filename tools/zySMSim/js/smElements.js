var ACTION_WIDTH = 15;
var ACTION_HEIGHT = 20;
var ZYANTE_GREEN = '#738033';
var ZYANTE_MEDIUM_RED = '#BB0404';
var ZYANTE_DARK_BLUE = '#5780A6';
var ZYANTE_DARK_ORANGE = '#AB4600';
var ZYANTE_ORANGE = '#c60';
var BACKGROUND_GRAY = '#E0E0E0';
// Class for states
function Node() {
    Node.NODE_RADIUS = 25;
    this.rect = {
        x: 0,
        y: 0,
        width: Node.NODE_RADIUS * 2,
        height: Node.NODE_RADIUS * 2
    };
    this.name = 'NONAME';
    this.actions = '';
    this.initState = false;
    // Total self edges ever
    this.totalSelfEdges = 0;
    this.executing = false;
    this.isDummyState = false;
}
Node.prototype.center = function() {
    return {
        x: (this.rect.x + (this.rect.width / 2)),
        y: (this.rect.y + (this.rect.height / 2))
    };
};
// Draws the state
Node.prototype.draw = function(context) {
    // If the state is a dummy state it is a small grey circle
    if (this.isDummyState) {
        context.beginPath();
        context.fillStyle = 'grey';
        // Dummy state is much smaller than normal states
        context.arc(this.center().x, this.center().y, Node.NODE_RADIUS / 3, 0, 2 * Math.PI, false);
        context.fill();
        context.restore();
    }
    else {
        if (this.executing) {
            context.fillStyle = ZYANTE_GREEN;
        }
        else {
            context.fillStyle = 'white';
        }
        context.beginPath();
        context.arc(this.center().x, this.center().y, Node.NODE_RADIUS, 0, 2 * Math.PI, false);
        context.fill();
        context.lineWidth = 2;
        context.strokeStyle = ZYANTE_DARK_BLUE;
        context.stroke();
        context.fillStyle = 'black';
        var CENTER_ADJUST = 5;
        context.fillText(this.name, this.center().x - context.measureText(this.name).width / 2, this.center().y + CENTER_ADJUST); // adjust to center

        var strings = breakDownText(this.actions, ACTION_WIDTH);
        for (var i = 0; i < strings.length; i++) {
            context.fillText(strings[i], this.rect.x, this.rect.y + this.rect.height + Node.NODE_RADIUS + (i * ACTION_HEIGHT));
        }
    }


};

// Point in rectangle collision
Node.prototype.pointIntersect = function(px, py) {
    // Don't allow collisions with dummy state
    if (this.isDummyState) {
        return false;
    }
    return (this.rect.x <= px) && (px <= this.rect.x + this.rect.width) && (this.rect.y <= py && py <= this.rect.y + this.rect.height);
};
// Make sure node is centered around the mouse
Node.prototype.moveTo = function(px, py) {
    var oldx = this.rect.x;
    var oldy = this.rect.y;
    this.rect.x = px - Node.NODE_RADIUS;
    this.rect.y = py - Node.NODE_RADIUS;
    // true if point changed
    return (oldx != this.rect.x) && (oldy != this.rect.y);
};

function Point() {
    this.x = 0;
    this.y = 0;
}

function LineSegment() {
    this.p = {
        x: 0,
        y: 0
    };
    this.q = {
        x: 0,
        y: 0
    };
}

// Breaks bounding box around node into 4 line segments and finds out which one the edge collides with
function computeLaunchPoint(head, tail) {
    var collisionPoint = new Point();
    // If doesn't intersect return node center
    collisionPoint = head.center();

    var v = new LineSegment();
    var tmp = new Point();

    v.p.x = head.center().x;
    v.p.y = head.center().y;
    v.q.x = tail.center().x;
    v.q.y = tail.center().y;

    var line0 = new LineSegment();
    line0.p.x = head.rect.x;
    line0.p.y = head.rect.y;
    line0.q.x = head.rect.x + head.rect.width;
    line0.q.y = head.rect.y;
    var line1 = new LineSegment();
    line1.p.x = head.rect.x;
    line1.p.y = head.rect.y + head.rect.height;
    line1.q.x = head.rect.x + head.rect.width;
    line1.q.y = head.rect.y + head.rect.height;
    var line2 = new LineSegment();
    line2.p.x = head.rect.x;
    line2.p.y = head.rect.y;
    line2.q.x = head.rect.x;
    line2.q.y = head.rect.y + head.rect.height;
    var line3 = new LineSegment();
    line3.p.x = head.rect.x + head.rect.width;
    line3.p.y = head.rect.y;
    line3.q.x = head.rect.x + head.rect.width;
    line3.q.y = head.rect.y + head.rect.height;
    var sSegs = [ line0, line1, line2, line3 ];
    for (var i = 0; i < 4; ++i) {
        tmp = segmentIntersects(sSegs[i], v);
        if (tmp.x != 0 || tmp.y != 0) {
            collisionPoint = tmp;
            break;
        }
    }
    return collisionPoint;
}

function segmentIntersects(v1, v2) {
    var collisionPoint = new Point();
    var xlk, ylk, xnm, ynm, xmk, ymk, det;
    var detinv, s, t;

    xlk = v2.q.x - v2.p.x;
    ylk = v2.q.y - v2.p.y;
    xnm = v1.p.x - v1.q.x;
    ynm = v1.p.y - v1.q.y;
    xmk = v1.q.x - v2.p.x;
    ymk = v1.q.y - v2.p.y;

    det = xnm * ylk - ynm * xlk;
    if (Math.abs(det) < 1e-6) {
        collisionPoint.x = 0;
        collisionPoint.y = 0;
    }
    else {
        detinv = 1.0 / det;
        s = (xnm * ymk - ynm * xmk) * detinv;
        t = (xlk * ymk - ylk * xmk) * detinv;
        if (s < 0.0 || s > 1.0 || t < 0.0 || t > 1.0) {
            collisionPoint.x = 0;
            collisionPoint.y = 0;
        }
        else {
            collisionPoint.x = v2.p.x + Math.floor(xlk * s);
            collisionPoint.y = v2.p.y + Math.floor(ylk * s);
        }
    }
    return collisionPoint;
}

// Class for transitions
function Edge() {
    this.head = null;
    this.tail = null;
    this.condition = '';
    this.actions = '';
    this.selected = false;
    this.priority = 1;
    // Bezier points
    this.bp1 = null;
    this.bp2 = null;
    this.bp3 = null;
    this.bp4 = null;
    this.executing = false;
    this.hovered = false;
    this.bp2HandleSelected = false;
    this.bp3HandleSelected = false;
    this.oldHeadInt = null;
    this.oldTailInt = null;
    this.HANDLE_WIDTH = 10;
}

Edge.prototype.drawArrow = function(context, tip, dxdt, dydt) {
    var s, t, q;
    s = new Point();
    t = new Point();
    q = new Point();
    var alpha, cosine, sine;
    var dx, dy;
    alpha = Math.atan2(-(this.tail.center().y - this.bp3.y), this.tail.center().x - this.bp3.x);
    cosine = Math.cos(alpha);
    sine = Math.sin(alpha);
    s.x = Math.floor(cosine + 16 * sine);
    s.y = Math.floor(-1 * sine + 16 * cosine);

    t.x = Math.floor(cosine + sine);
    t.y = Math.floor(-1 * sine + cosine);

    q.x = Math.floor(13 * cosine + 10 * sine);
    q.y = Math.floor(-13 * sine + 10 * cosine);

    dx = tip.x - q.x;
    dy = tip.y - q.y;

    s.x = s.x + dx;
    s.y = s.y + dy;
    t.x = t.x + dx;
    t.y = t.y + dy;

    if (this.executing) {
        context.fillStyle = ZYANTE_GREEN;
    }
    else if (this.hovered) {
        context.fillStyle = 'royalblue';
    }
    else if (this.selected) {
        context.fillStyle = ZYANTE_DARK_ORANGE;
    }
    else {
        context.fillStyle = 'black';
    }
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(s.x, s.y);
    context.lineTo(t.x, t.y);
    context.lineTo(tip.x, tip.y);
    context.fill();
};


Edge.prototype.singleLinePointIntersect = function(x1, y1, x2, y2, px, py) {
    return (x1 <= px) && (px <= x2) && (y1 <= py) && (py <= y2);
};

function findMinMax(pt1, pt2) {
    var min = { x:pt1.x, y:pt1.y };
    var max = { x:pt1.x, y:pt1.y };
    if (pt2.x > max.x) {
        max.x = pt2.x;
    }
    else if (pt2.x < min.x) {
        min.x = pt2.x;
    }
    if (pt2.y > max.y) {
        max.y = pt2.y;
    }
    else if (pt2.y < min.y) {
        min.y = pt2.y;
    }
    return { min:min, max:max };
}

function pointLerp(p0, p1, t) {
    return { x:((1 - t) * p0.x) + (t * p1.x), y:((1 - t) * p0.y) + (t * p1.y) };
}

function createRectangleAndTestCollision(px, py, p0, p1) {
    var BUFFER = 5;
    var minMax = findMinMax(p0, p1);
    var lowerLeft = minMax.min;
    var upperRight = minMax.max;
    lowerLeft.x -= BUFFER;
    lowerLeft.y -= BUFFER;
    upperRight.x += BUFFER;
    upperRight.y += BUFFER;
    return px >= lowerLeft.x && px <= upperRight.x && py >= lowerLeft.y && py <= upperRight.y;
}
// We can test for a collsion by breaking the line down into many regions
Edge.prototype.pointIntersect = function(px, py) {
    var points = [ this.bp1, this.bp2, this.bp3, this.bp4 ];
    var doesIntersect = false;
    for (var i = 0; i < points.length - 1; i++) {
        var midPoint = pointLerp(points[i], points[i + 1], 0.5);
        doesIntersect = createRectangleAndTestCollision(px, py, points[i], midPoint);
        if (doesIntersect) {
            break;
        }
        doesIntersect = createRectangleAndTestCollision(px, py, points[i], midPoint);
        if (doesIntersect) {
            break;
        }
    }
    if (doesIntersect) {
        return true;
    }
    else if (this.head == this.tail) {
        // Try a test that checks region made by 4 points for self transitions
        var minX = this.bp1.x,
            minY = this.bp1.y,
            maxX = this.bp1.x,
            maxY = this.bp1.y;
        if (this.bp2.x > maxX) {
            maxX = this.bp2.x;
        }
        if (this.bp2.x < minX) {
            minX = this.bp2.x;
        }

        if (this.bp2.y > maxY) {
            maxY = this.bp2.y;
        }
        if (this.bp2.y < minY) {
            minY = this.bp2.y;
        }

        if (this.bp3.x > maxX) {
            maxX = this.bp3.x;
        }
        if (this.bp3.x < minX) {
            minX = this.bp3.x;
        }

        if (this.bp3.y > maxY) {
            maxY = this.bp3.y;
        }
        if (this.bp3.y < minY) {
            minY = this.bp3.y;
        }

        if (this.bp4.x > maxX) {
            maxX = this.bp4.x;
        }
        if (this.bp4.x < minX) {
            minX = this.bp4.x;
        }

        if (this.bp4.y > maxY) {
            maxY = this.bp4.y;
        }
        if (this.bp4.y < minY) {
            minY = this.bp4.y;
        }

        // Check if point is within the region made up of our 4 control points.
        return ((px >= minX && px <= maxX) && (py >= minY && py <= maxY));
    }
    else {
        return false;
    }
};

Edge.prototype.deselect = function() {
    this.selected = false;
    this.bp2HandleSelected = false;
    this.bp3HandleSelected = false;
};

Edge.prototype.moveBy = function(px, py) {
    this.bp2.x += px;
    this.bp2.y += py;
    this.bp3.x += px;
    this.bp3.y += py;
};

Edge.prototype.handleIntersect = function(px, py) {
    // Dont allow user to move intial transition
    if (this.head.isDummyState) {
        return false;
    }
    var squareDist = (this.bp2.x - px) * (this.bp2.x - px) + (this.bp2.y - py) * (this.bp2.y - py);
    var isBp2 = squareDist <= (this.HANDLE_WIDTH * 2) * (this.HANDLE_WIDTH * 2);
    if (isBp2) {
        this.bp2HandleSelected = true;
        this.bp3HandleSelected = false;
        return true;
    }
    squareDist = (this.bp3.x - px) * (this.bp3.x - px) + (this.bp3.y - py) * (this.bp3.y - py);
    var isBp3 = squareDist <= (this.HANDLE_WIDTH * 2) * (this.HANDLE_WIDTH * 2);
    if (isBp3) {
        this.bp3HandleSelected = true;
        this.bp2HandleSelected = false;
        return true;
    }
    return false;
};

// Processes the text that makes up a users actions/conditions into lines that have a max width
function breakDownText(str, width) {
    var re = str.match(/\n/g);
    var count = 0;
    var i = 0;
    if (re != null) {
        if (str[str.length - 1] != '\n') {
            str += '\n';
        }
        var tmpStr = str;
        var index = tmpStr.indexOf('\n');
        while (index != -1) {
            count += Math.ceil((index - i) / width);
            i = index;
            tmpStr = tmpStr.replace('\n', '');
            index = tmpStr.indexOf('\n');
        }
    }
    else {
        count = Math.ceil(str.length / width);
    }
    var size = count;
    var ret = new Array();
    i = 0;
    for (var j = 0; j < size; j++) {
        var strLength = str.indexOf('\n', i);
        if (strLength > -1) {
            strLength = (strLength - i + 1) > width ? width : (strLength - i + 1);
        }
        else {
            strLength = width;
        }
        ret[j] = str.substr(i, strLength);
        i += strLength;
    }
    return ret;

}
Edge.prototype.setBPs = function(bp1, bp2, bp3, bp4) {
    this.bp1 = bp1;
    this.bp2 = bp2;
    this.bp3 = bp3;
    this.bp4 = bp4;
    // Makes sure bps aren't recalculated
    this.oldHeadInt = computeLaunchPoint(this.head, this.tail);
    this.oldTailInt = computeLaunchPoint(this.tail, this.head);
};
Edge.prototype.draw = function(context) {
    var headInt = computeLaunchPoint(this.head, this.tail);
    var tailInt = computeLaunchPoint(this.tail, this.head);
    if (this.executing) {
        context.strokeStyle = ZYANTE_GREEN;
    }
    else if (this.hovered) {
        context.strokeStyle = 'royalblue';
    }
    else if (this.selected) {
        context.strokeStyle = ZYANTE_DARK_ORANGE;
    }
    else {
        context.strokeStyle = 'black';
    }
    if (this.head === this.tail) {
        context.save();
        context.translate(this.head.center().x, this.head.center().y);
        context.rotate((45 * (this.priority - 1)) * (Math.PI / 180));
        context.translate(-this.head.center().x, -this.head.center().y);
        headInt.x = this.head.center().x;
        headInt.y = this.head.center().y;
        // Adjustments to allow arrow to touch node
        tailInt.x = this.head.rect.x + this.head.rect.width - 5;
        tailInt.y = this.head.rect.y + 10;
        context.lineWidth = 2;
        context.beginPath();
        if (this.oldHeadInt == null) {
            this.bp2 = {
                x: this.head.rect.x,
                y: this.head.rect.y - this.head.rect.height
            };
            this.bp3 = {
                // Adjustments to allow arrow to touch node
                x: this.head.rect.x + this.head.rect.width + 10,
                y: this.head.rect.y - this.head.rect.height + 5
            };
        }
        this.bp1 = {
            x: this.head.center().x,
            y: this.head.center().y
        };
        this.bp4 = {
            // Adjustments to allow arrow to touch node
            x: this.head.rect.x + this.head.rect.width - 5,
            y: this.head.rect.y + 10
        };
        this.oldHeadInt = headInt;
        this.oldTailInt = tailInt;
        this.drawArrow(context, this.bp4, tailInt.x - computeMidPoint(headInt, tailInt).x, tailInt.y - computeMidPoint(headInt, tailInt).y);
        context.moveTo(this.bp1.x, this.bp1.y);
        context.bezierCurveTo(this.bp2.x, this.bp2.y, this.bp3.x, this.bp3.y, this.bp4.x, this.bp4.y);
        context.fillStyle = 'black';
        var OFFSET_TO_ABOVE = -15;
        // Rotated
        if (this.actions) {
            var strings = breakDownText(this.condition + ' / ' + this.actions, ACTION_WIDTH);
            var i;
            for (i = 0; i < strings.length; i++) {
                context.fillText(strings[i], (this.bp2.x + this.bp4.x) / 2, (((this.bp2.y + this.bp4.y) / 2) + OFFSET_TO_ABOVE) + (i * ACTION_HEIGHT));
            }
        }
        else {
            var strings = breakDownText(this.condition, ACTION_WIDTH);
            var i;
            for (i = 0; i < strings.length; i++) {
                context.fillText(strings[i], (this.bp2.x + this.bp4.x) / 2, (((this.bp2.y + this.bp4.y) / 2) + OFFSET_TO_ABOVE) + (i * ACTION_HEIGHT));
            }
        }


        context.restore();

    }
    else {

        context.lineWidth = 2;
        context.beginPath();
        var adjustX = (headInt.x < tailInt.x) ? tailInt.x - 4 : tailInt.x + 4; // keep line end in arrow
        var adjustY = (headInt.y < tailInt.y) ? tailInt.y - 2 : tailInt.y + 2;
        // Don't want two edges between two nodes to overlap with each other
        var TOP_OFFSET = 60;
        var BOTTOM_OFFSET = -20;
        var tailCenter = this.tail.center();
        var xOffSetFromCenter = adjustX - tailCenter.x;
        var yOffSetFromCenter = adjustY - tailCenter.y;
        var angle = Math.atan2(yOffSetFromCenter, xOffSetFromCenter);
        // Use to spread edges evenly
        var multiplier = (this.priority % 2 == 1) ? Math.ceil(this.priority / 2.0) : Math.floor(this.priority / 2.0) * -1;
        adjustX = tailCenter.x + (Node.NODE_RADIUS * Math.cos(angle + (((multiplier * 30) * Math.PI) / 180)));
        adjustY = tailCenter.y + (Node.NODE_RADIUS * Math.sin(angle + (((multiplier * 30) * Math.PI) / 180)));
        if (headInt.y >= tailInt.y) {
            if (this.oldHeadInt == null) {

                this.bp2 = {
                    x: (adjustX + headInt.x) / 2,
                    y: (adjustY + headInt.y) / 2 + TOP_OFFSET
                };
                this.bp3 = {
                    x: (adjustX + headInt.x) / 2,
                    y: (adjustY + headInt.y) / 2 + TOP_OFFSET
                };

            }

        }
        else {
            if (this.oldHeadInt == null) {
                this.bp2 = {
                    x: (adjustX + headInt.x) / 2,
                    y: (adjustY + headInt.y) / 2 + BOTTOM_OFFSET
                };
                this.bp3 = {
                    x: (adjustX + headInt.x) / 2,
                    y: (adjustY + headInt.y) / 2 + BOTTOM_OFFSET
                };

            }
        }

        this.bp1 = {
            x: headInt.x,
            y: headInt.y
        };
        this.bp4 = {
            x: adjustX,
            y: adjustY
        };
        this.oldHeadInt = headInt;
        this.oldTailInt = tailInt;
        this.drawArrow(context, this.bp4, tailInt.x - adjustX, tailInt.y - adjustY);
        context.moveTo(this.bp1.x, this.bp1.y);
        context.bezierCurveTo(this.bp2.x, this.bp2.y, this.bp3.x, this.bp3.y, this.bp4.x, this.bp4.y);
        context.fillStyle = 'black';
        var textArea = computeMidPoint(this.bp3, this.bp2);
        if (this.actions) {
            var strings = breakDownText(this.condition + ' / ' + this.actions, ACTION_WIDTH);
            var i;
            for (i = 0; i < strings.length; i++) {
                context.fillText(strings[i], textArea.x, textArea.y + (i * ACTION_HEIGHT));
            }
        }
        else {
            var strings = breakDownText(this.condition, ACTION_WIDTH);
            var i;
            for (i = 0; i < strings.length; i++) {
                context.fillText(strings[i], textArea.x, textArea.y + (i * ACTION_HEIGHT));
            }
        }
    }
    // Draw handles
    context.stroke();
    if (this.selected) {
        context.fillStyle = 'white';
        context.beginPath();
        context.moveTo(this.bp1.x, this.bp1.y);
        context.lineTo(this.bp2.x, this.bp2.y);
        context.stroke();
        context.beginPath();
        context.arc(this.bp2.x, this.bp2.y, this.HANDLE_WIDTH, 0, 2 * Math.PI, false);
        context.fill();
        context.stroke();
        context.beginPath();
        context.moveTo(this.bp4.x, this.bp4.y);
        context.lineTo(this.bp3.x, this.bp3.y);
        context.closePath();
        context.stroke();
        context.beginPath();
        context.arc(this.bp3.x, this.bp3.y, this.HANDLE_WIDTH, 0, 2 * Math.PI, false);
        context.fill();
        context.stroke();
    }

};

function computeMidPoint(p1, p2) {
    var t = new Point();
    t.x = (p1.x + p2.x) / 2;
    t.y = (p1.y + p2.y) / 2;
    return t;
}
