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
        this.controlDistanceFromMid = 0;
        this.controlIsForward = false;
        this.setArrowhead();
    }

    draw() {
        const head = this.head;
        const tail = this.tail;
        const control = this.control;
        drawQuadraticCurve(head.x, head.y, control.x, control.y, tail.x, tail.y);
        const vertex = this.vertex();
        drawCircle(vertex.x, vertex.y, 5, 'red');
        drawLine(this.arrowhead.tip, this.arrowhead.corner1);
        drawLine(this.arrowhead.tip, this.arrowhead.corner2);
    }

    setArrowhead() {
        const incrementsArray = [0.001, 0.005, 0.01, 0.05];
        let increment = incrementsArray.pop();
        let t = 0;
        while (increment && t < 0.5) {
            const pt = this.bezier(t);
            if (this.tail.contains(pt.x, pt.y)) {
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
        const tip = this.bezier(t);
        const ptForSlope = this.bezier(t + 0.01);
        // src: http://www.dbp-consulting.com/tutorials/canvas/CanvasArrow.html
        const angle = Math.atan2(ptForSlope.y - tip.y, ptForSlope.x - tip.x);
        const theta = Math.PI / 4;
        const angle1 = Math.PI + angle + theta;
        const angle2 = Math.PI + angle - theta;
        const h = Math.abs(7 / Math.cos(theta));
        const corner1 = { x: tip.x - Math.cos(angle1) * h, y: tip.y - Math.sin(angle1) * h };
        const corner2 = { x: tip.x - Math.cos(angle2) * h, y: tip.y - Math.sin(angle2) * h };
        this.arrowhead = { tip, corner1, corner2 };
    }

    setControl(pt) {
        this.control.x = pt.x;
        this.control.y = pt.y;
    }

    bezier(t) {
        const p0 = this.tail;
        const p1 = this.control;
        const p2 = this.head;
        const x = p1.x + (1 - t) * (1 - t) * (p0.x - p1.x) + t * t * (p2.x - p1.x);
        const y = p1.y + (1 - t) * (1 - t) * (p0.y - p1.y) + t * t * (p2.y - p1.y);
        return { x, y };
    }

    contains(x, y) {
        const [x0, y0] = [this.head.x, this.head.y];
        const [x1, y1] = [this.control.x, this.control.y];
        const [x2, y2] = [this.tail.x, this.tail.y];
        const headTailDistance = Math.hypot(x0 - x2, y0 - y2);
        const max = Math.round(((headTailDistance + this.controlDistanceFromMid) / 100) * 100) / 10;
        for (let n = 0; n <= max; n++) {
            const t = n / max;
            // quadratic bezier equation
            const xt = x1 + (1 - t) * (1 - t) * (x0 - x1) + t * t * (x2 - x1);
            const yt = y1 + (1 - t) * (1 - t) * (y0 - y1) + t * t * (y2 - y1);
            const inX = x >= xt - 5 && x <= xt + 5;
            const inY = y >= yt - 5 && y <= yt + 5;
            if (inX && inY) {
                drawCircle(xt, yt, 5, 'green');
                return true;
            }
        }
        return false;
    }

    vertex() {
        return this.bezier(0.5);
    }

    midBase() {
        const x = (this.head.x + this.tail.x) / 2;
        const y = (this.head.y + this.tail.y) / 2;
        return { x, y };
    }

    // The axis of symmetry is a linear function that is perpendicular to
    // a straight line contecting the head and tail.
    axisOfSymmetry(x, inverse = false) {
        const h = this.head;
        const t = this.tail;
        const slope = (h.x - t.x) / (t.y - h.y);
        const mid = { x: (h.x + t.x) / 2, y: (h.y + t.y) / 2 };
        if (inverse) {
            return (x - mid.y) / slope + mid.x;
        }
        return slope * (x - mid.x) + mid.y;
    }

    axisOfSymmetrySlope() {
        const rise = this.axisOfSymmetry(500) - this.axisOfSymmetry(5);
        const run = 500 - 5;
        return rise / run;
    }

    vertexContains(x, y) {
        const distance = distanceBetween(this.vertex(), { x, y });
        return distance <= 5;
    }

    slideVertex(x, y) {
        const head = this.head;
        const tail = this.tail;
        const slope = this.axisOfSymmetrySlope();
        const newVertex = {};
        newVertex.x = Math.abs(slope) < 1 ? x : this.axisOfSymmetry(y, true);
        newVertex.y = Math.abs(slope) < 1 ? this.axisOfSymmetry(x) : y;
        const midBase = this.midBase();
        const newHeight = distanceBetween(newVertex, midBase);
        const maybeControl1 = ptAlongSlope(midBase, slope, newHeight * 2);
        const maybeControl2 = ptAlongSlope(midBase, slope, newHeight * -2);
        if (distanceBetween(maybeControl1, newVertex) < distanceBetween(maybeControl2, newVertex)) {
            this.setControl(maybeControl1);
        } else {
            this.setControl(maybeControl2);
        }
        this.controlDistanceFromMid = newHeight * 2;
        if (head.y < tail.y || (head.y === tail.y && head.x > tail.x)) {
            this.controlIsForward = this.control.x >= midBase.x;
        } else {
            this.controlIsForward = this.control.x <= midBase.x;
        }
        this.setArrowhead();
    }

    readjustEdgeForChangedEndpoint() {
        const head = this.head;
        const tail = this.tail;
        let controlDistanceFromMid = this.controlDistanceFromMid;
        if (this.controlIsForward && (head.y > tail.y || (head.y === tail.y && head.x < tail.x))) {
            controlDistanceFromMid = -1 * controlDistanceFromMid;
        } else if (!this.controlIsForward && (head.y < tail.y || (head.y === tail.y && head.x > tail.x))) {
            controlDistanceFromMid = -1 * controlDistanceFromMid;
        }
        const midBase = this.midBase();
        const m = this.axisOfSymmetrySlope();
        if (Number.isFinite(m)) {
            const newControl = ptAlongSlope(midBase, m, controlDistanceFromMid);
            this.setControl(newControl);
        } else {
            this.setControl(midBase.x, midBase.y + controlDistanceFromMid);
        }
        this.setArrowhead();
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
        this.outEdge.draw();
    }

    setCenter(x, y) {
        this.x = x;
        this.y = y;
        const edge = this.outEdge || this.inEdge;
        if (edge !== null) {
            edge.readjustEdgeForChangedEndpoint();
        }
    }

    slideOutEdgeVertex(x, y) {
        this.outEdge.slideVertex(x, y);
    }

    contains(x, y) {
        const distance = distanceBetween(this, { x, y });
        return distance <= this.radius;
    }

    outEdgeVertexContains(x, y) {
        if (this.outEdge == null) {
            return;
        }
        return this.outEdge.vertexContains(x, y);
    }

    edgeContains(x, y) {
        return this.outEdge.contains(x, y);
    }

    makeOutEdgeTo(tail) {
        const control = { x: (this.x + tail.x) / 2, y: (this.y + tail.y) / 2 };
        this.outEdge = new Edge(this, tail, control);
        tail.inEdge = this.outEdge;
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
        } else if (circles[i].outEdgeVertexContains(x, y)) {
            indexOfControlToDrag = i;
        }
        // if (circles[i].outEdge) {
        //     circles[i].edgeContains(x, y);
        // }
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
        circles[indexOfControlToDrag].slideOutEdgeVertex(x, y);
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
    const slope = (p0.x - p1.x) / (p1.y - p0.y);
    const mid = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
    if (inverse) {
        return (x - mid.y) / slope + mid.x;
    }
    return slope * (x - mid.x) + mid.y;
}

function distanceBetween(p1, p2) {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

function ptAlongSlope(startPt, slope, distance) {
    if (Number.isFinite(slope) === false) {
        const x = startPt.x;
        const y = startPt.y + distance;
        return { x, y };
    }
    // src: https://www.geeksforgeeks.org/find-points-at-a-given-distance-on-a-line-of-given-slope/
    const m = slope;
    const x = startPt.x + distance * Math.sqrt(1 / (1 + m * m));
    const y = startPt.y + m * distance * Math.sqrt(1 / (1 + m * m));
    return { x, y };
}

function pointBetween(p1, p2) {
    return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}
