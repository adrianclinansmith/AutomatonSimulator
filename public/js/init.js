/*
    Init.js
    Setup the canvas for drawing digraphs.
*/

// const { Linter } = require("eslint");

console.log('Adrian Clinansmith');
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// ********************************
// Classes
// ********************************

class Edge {
    constructor(head, tail, control) {
        this.head = head;
        this.tail = tail;
        this.control = control;
    }
}

class Circle {
    constructor(x, y, radius, colour = 'black') {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.outEdge = null;
        this.inEdge = null;
        this.colour = colour;
    }

    draw() {
        drawCircle(this.x, this.y, 30, this.colour);
    }

    drawOutEdge() {
        if (this.outEdge === null) {
            return;
        }
        const tail = this.outEdge.tail;
        drawQuadraticCurve(this.x, this.y, this.outEdge.controlX, this.outEdge.controlY, tail.x, tail.y);
        drawCircle(this.outEdge.controlX, this.outEdge.controlY, 5, 'red');
        this.drawArrowhead();
    }

    drawArrowhead() {
        const tail = this.outEdge.tail;
        const incrementsArray = [0.001, 0.005, 0.01, 0.05];
        let increment = incrementsArray.pop();
        let t = 0;
        while (increment && t < 0.5) {
            const pt = this.bezier(t);
            if (tail.contains(pt.x, pt.y)) {
                t += increment;
            } else {
                t -= increment;
                increment = incrementsArray.pop();
                t += increment || 0;
            }
        }
        if (t >= 0.5) {
            return;
        }
        const intersect = this.bezier(t);
        const ptForSlope = this.bezier(t + 0.01);
        // src: http://www.dbp-consulting.com/tutorials/canvas/CanvasArrow.html
        const angle = Math.atan2(ptForSlope.y - intersect.y, ptForSlope.x - intersect.x);
        const theta = Math.PI / 4;
        const angle1 = Math.PI + angle + theta;
        const angle2 = Math.PI + angle - theta;
        const h = Math.abs(7 / Math.cos(theta));
        const pa = { x: intersect.x - Math.cos(angle1) * h, y: intersect.y - Math.sin(angle1) * h };
        const pb = { x: intersect.x - Math.cos(angle2) * h, y: intersect.y - Math.sin(angle2) * h };
        drawLine(intersect, pa);
        drawLine(intersect, pb);
    }

    bezier(t) {
        const p0 = this.outEdge.tail;
        const p1 = { x: this.outEdge.controlX, y: this.outEdge.controlY };
        const p2 = this.outEdge.head;

        const x = p1.x + (1 - t) * (1 - t) * (p0.x - p1.x) + t * t * (p2.x - p1.x);
        const y = p1.y + (1 - t) * (1 - t) * (p0.y - p1.y) + t * t * (p2.y - p1.y);
        return { x, y };
    }

    setCenter(x, y) {
        this.x = x;
        this.y = y;
        this.adjustEdge();
    }

    adjustEdge() {
        const edge = this.outEdge || this.inEdge;
        if (edge == null) {
            return;
        }
        const head = { x: edge.head.x, y: edge.head.y };
        const tail = { x: edge.tail.x, y: edge.tail.y };
        const f = function(x, inverse = false) {
            return perpendicularFunction(x, head, tail, inverse);
        };
        const midHeadTail = { x: (head.x + tail.x) / 2, y: (head.y + tail.y) / 2 };
        const m = (f(500) - f(5)) / (500 - 5);
        let distanceFromControlToMid = edge.controlDistanceFromMid;
        if (edge.controlIsForward && (head.y > tail.y || (head.y === tail.y && head.x < tail.x))) {
            distanceFromControlToMid = -1 * distanceFromControlToMid;
        } else if (!edge.controlIsForward && (head.y < tail.y || (head.y === tail.y && head.x > tail.x))) {
            distanceFromControlToMid = -1 * distanceFromControlToMid;
        }
        if (Number.isFinite(m)) {
            // equation: https://www.geeksforgeeks.org/find-points-at-a-given-distance-on-a-line-of-given-slope/
            edge.controlX = midHeadTail.x + distanceFromControlToMid * Math.sqrt(1 / (1 + m * m));
            edge.controlY = midHeadTail.y + m * distanceFromControlToMid * Math.sqrt(1 / (1 + m * m));
        } else {
            edge.controlX = midHeadTail.x;
            edge.controlY = midHeadTail.y + distanceFromControlToMid;
        }
        // ** TEMP
        // const control = { x: edge.controlX, y: edge.controlY };
        // const vertex = { x: (control.x + midHeadTail.x) / 2, y: (control.y + midHeadTail.y) / 2 };
        // drawCircle(vertex.x, vertex.y, 3);
        // drawLine(control, tail, 'red');
        // drawLine(vertex, tail, 'red');
        // const slope = (control.y - tail.y) / (control.x - tail.x);
        // const x0 = tail.x + this.radius * Math.sqrt(1 / (1 + slope * slope));
        // const y0 = tail.y + slope * this.radius * Math.sqrt(1 / (1 + slope * slope));
        // const p0 = { x: x0, y: y0 };
        // const x1 = tail.x - this.radius * Math.sqrt(1 / (1 + slope * slope));
        // const y1 = tail.y - slope * this.radius * Math.sqrt(1 / (1 + slope * slope));
        // const p1 = { x: x1, y: y1 };
        // const intersect = distanceBetween(control, p0) < distanceBetween(control, p1) ? p0 : p1;
        // drawCircle(intersect.x, intersect.y, 5, 'red');
        // **
    }

    slideControl(x, y) {
        const head = { x: this.x, y: this.y };
        const tail = this.outEdge.tail;
        // f is a linear function that is perpendicular to the line between the head and tail.
        // The control point must travel along f.
        const f = function(x, inverse = false) {
            return perpendicularFunction(x, head, tail, inverse);
        };
        const midHeadTail = { x: (head.x + tail.x) / 2, y: (head.y + tail.y) / 2 };
        const fIsVertical = Math.abs(head.y - tail.y) < Math.abs(head.x - tail.x);
        this.outEdge.controlX = fIsVertical ? f(y, true) : x;
        this.outEdge.controlY = fIsVertical ? y : f(x);
        this.outEdge.controlDistanceFromMid = Math.hypot(this.outEdge.controlX - midHeadTail.x, this.outEdge.controlY - midHeadTail.y);
        if (head.y < tail.y || (head.y === tail.y && head.x > tail.x)) {
            this.outEdge.controlIsForward = this.outEdge.controlX >= midHeadTail.x;
        } else {
            this.outEdge.controlIsForward = this.outEdge.controlX <= midHeadTail.x;
        }
    }

    contains(x, y) {
        const distance = distanceBetween(this, { x, y });
        return distance <= this.radius;
    }

    controlContains(x, y) {
        if (this.outEdge == null) {
            return;
        }
        const control = { x: this.outEdge.controlX, y: this.outEdge.controlY };
        const inX = x >= control.x - 5 && x <= control.x + 5;
        const inY = y >= control.y - 5 && y <= control.y + 5;
        return inX && inY;
    }

    edgeContains(x, y) {
        const [x0, y0] = [this.x, this.y];
        const [x1, y1] = [this.outEdge.controlX, this.outEdge.controlY];
        const [x2, y2] = [this.outEdge.tail.x, this.outEdge.tail.y];
        const headTailDistance = Math.hypot(x0 - x2, y0 - y2);
        const max = Math.round(((headTailDistance + this.outEdge.controlDistanceFromMid) / 100) * 100) / 10;
        for (let n = 0; n <= max; n++) {
            const t = n / max;
            // quadratic bezier equation
            const xt = x1 + (1 - t) * (1 - t) * (x0 - x1) + t * t * (x2 - x1);
            const yt = y1 + (1 - t) * (1 - t) * (y0 - y1) + t * t * (y2 - y1);
            const inX = x >= xt - 5 && x <= xt + 5;
            const inY = y >= yt - 5 && y <= yt + 5;
            if (inX && inY) {
                drawCircle(xt, yt, 5, 'green');
                break;
            }
        }
        // this.inverseBezierFunction(x, y);
        // Inverse Quadratic Bezier (using the quadratic equation)
    }

    makeOutEdgeTo(circle, controlX = null, controlY = null) {
        controlX = controlX || (this.x + circle.x) / 2;
        controlY = controlY || (this.y + circle.y) / 2;
        const controlDistanceFromMid = 0;
        const controlIsForward = false;
        this.outEdge = { head: this, tail: circle, controlX, controlY, controlDistanceFromMid, controlIsForward };
        circle.inEdge = this.outEdge;
    }
}

// TEST

const circles = [new Circle(370, 86, 30), new Circle(228, 280, 30, 'blue')];
circles[0].makeOutEdgeTo(circles[1]);
circles[0].drawOutEdge();
circles[0].draw();
circles[1].draw();

// ********************************
// Event Listeners
// ********************************

let indexOfVertexToDrag = null;
let indexOfControlToDrag = null;

canvas.addEventListener('mousedown', function(event) {
    const { x, y } = eventPointInCanvas(event);
    for (let i = 0; i < circles.length; i++) {
        if (circles[i].contains(x, y)) {
            indexOfVertexToDrag = i;
        } else if (circles[i].controlContains(x, y)) {
            indexOfControlToDrag = i;
        }
        if (circles[i].outEdge) {
            circles[i].edgeContains(x, y);
        }
    }
});

canvas.addEventListener('mouseup', function(event) {
    indexOfVertexToDrag = null;
    indexOfControlToDrag = null;
});

canvas.addEventListener('mousemove', function(event) {
    if (indexOfVertexToDrag === null && indexOfControlToDrag === null) {
        return;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    const { x, y } = eventPointInCanvas(event);
    if (indexOfVertexToDrag !== null) {
        circles[indexOfVertexToDrag].setCenter(x, y);
    }
    if (indexOfControlToDrag !== null) {
        circles[indexOfControlToDrag].slideControl(x, y);
    }
    // draw all vertices
    for (let i = 0; i < circles.length; i++) {
        circles[i].drawOutEdge();
    }
    // draw all edges
    for (let i = 0; i < circles.length; i++) {
        circles[i].draw();
    }
});

// ********************************
// Canvas drawing functions
// ********************************

function drawCircle(x, y, radius, colour = 'black') {
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fillStyle = '#ebe9e9';
    context.fill();
    context.strokeStyle = colour;
    context.stroke();
}

function drawLine(p0, p1, colour = 'black') {
    context.beginPath();
    context.moveTo(p0.x, p0.y);
    context.quadraticCurveTo((p0.x + p1.x) / 2, (p0.y + p1.y) / 2, p1.x, p1.y);
    context.strokeStyle = colour;
    context.stroke();
}

function eventPointInCanvas(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x, y };
}

function drawQuadraticCurve(beginX, beginY, contX, contY, endX, endY, colour = 'black') {
    context.beginPath();
    context.moveTo(beginX, beginY);
    context.quadraticCurveTo(contX, contY, endX, endY);
    context.strokeStyle = colour;
    context.stroke();
}

function perpendicularFunction(x, p0, p1, inverse = false) {
    const [x0, x1] = p0.x < p1.x ? [p0.x, p1.x] : [p1.x, p0.x]; // maybe remove
    const [y0, y1] = p0.x < p1.x ? [p0.y, p1.y] : [p1.y, p0.y]; // maybe remove
    const slope = (x0 - x1) / (y1 - y0);
    const [xmid, ymid] = [(x0 + x1) / 2, (y0 + y1) / 2];
    if (inverse) {
        return (x - ymid) / slope + xmid;
    }
    return slope * (x - xmid) + ymid;
}

function distanceBetween(p1, p2) {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

function pointBetween(p1, p2) {
    return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}
