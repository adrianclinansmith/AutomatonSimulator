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
        this.controlIsForward = true;
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
        if (head.y < tail.y) {
            this.controlIsForward = this.control.x >= midBase.x;
        } else if (head.y === tail.y && head.x > tail.x) {
            this.controlIsForward = this.control.y >= midBase.y;
        } else if (head.y === tail.y && head.x < tail.x) {
            this.controlIsForward = this.control.y < midBase.y;
        } else {
            this.controlIsForward = this.control.x <= midBase.x;
        }
        this.setArrowhead();
    }

    readjustForChangedEndpoint() {
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
            const newControl = { x: midBase.x, y: midBase.y + controlDistanceFromMid };
            this.setControl(newControl);
        }
        this.setArrowhead();
    }
}

class State {
    constructor(x, y, radius, colour = 'black') {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.outEdges = [];
        this.inEdges = [];
        this.colour = colour;
    }

    draw() {
        drawCircle(this.x, this.y, 30, this.colour);
    }

    drawOutEdges() {
        for (let i = 0; i < this.outEdges.length; i++) {
            this.outEdges[i].draw();
        }
    }

    setCenter(x, y) {
        this.x = x;
        this.y = y;
        for (let i = 0; i < this.outEdges.length; i++) {
            this.outEdges[i].readjustForChangedEndpoint();
        }
        for (let i = 0; i < this.inEdges.length; i++) {
            this.inEdges[i].readjustForChangedEndpoint();
        }
    }

    slideOutEdgeVertex(x, y, index) {
        this.outEdges[index].slideVertex(x, y);
    }

    contains(x, y) {
        const distance = distanceBetween(this, { x, y });
        return distance <= this.radius;
    }

    outEdgeVertexContains(x, y) {
        for (let i = 0; i < this.outEdges.length; i++) {
            if (this.outEdges[i].vertexContains(x, y)) {
                return i;
            }
        }
        return null;
    }

    edgeContains(x, y) {
        return this.outEdge.contains(x, y);
    }

    makeOutEdgeTo(tail) {
        const control = { x: (this.x + tail.x) / 2, y: (this.y + tail.y) / 2 };
        const newEdge = new Edge(this, tail, control);
        this.outEdges.push(newEdge);
        tail.inEdges.push(newEdge);
    }
}

// ********************************
// TEST
// ********************************

const rad = 30;
const circles = [new State(150, 200, rad), new State(250, 200, rad), new State(150, 300, rad),
    new State(450, 200, rad), new State(250, 300, rad)];

circles[0].makeOutEdgeTo(circles[1]);
circles[0].makeOutEdgeTo(circles[2]);
circles[1].makeOutEdgeTo(circles[3]);
circles[0].makeOutEdgeTo(circles[4]);
circles[1].makeOutEdgeTo(circles[4]);
circles[2].makeOutEdgeTo(circles[4]);

for (let i = 0; i < circles.length; i++) {
    circles[i].drawOutEdges();
}
for (let i = 0; i < circles.length; i++) {
    circles[i].draw();
}

// ********************************
// Event Listeners
// ********************************

let indexOfStateToDrag = null;
let indexOfStateAndEdgeToDrag = null;

canvas.addEventListener('mousedown', function(event) {
    const { x, y } = eventPointInCanvas(event);
    let j = null;
    for (let i = 0; i < circles.length; i++) {
        if (circles[i].contains(x, y)) {
            indexOfStateToDrag = i;
        } else if ((j = circles[i].outEdgeVertexContains(x, y)) !== null) {
            indexOfStateAndEdgeToDrag = { stateIndex: i, edgeIndex: j };
        }
        // if (circles[i].outEdge) {
        //     circles[i].edgeContains(x, y);
        // }
    }
});

canvas.addEventListener('mouseup', function(event) {
    indexOfStateToDrag = null;
    indexOfStateAndEdgeToDrag = null;
});

canvas.addEventListener('mousemove', function(event) {
    if (indexOfStateToDrag === null && indexOfStateAndEdgeToDrag === null) {
        return;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    const { x, y } = eventPointInCanvas(event);
    if (indexOfStateToDrag !== null) {
        circles[indexOfStateToDrag].setCenter(x, y);
    }
    if (indexOfStateAndEdgeToDrag !== null) {
        const stateIndex = indexOfStateAndEdgeToDrag.stateIndex;
        const edgeIndex = indexOfStateAndEdgeToDrag.edgeIndex;
        circles[stateIndex].slideOutEdgeVertex(x, y, edgeIndex);
    }
    // draw all vertices
    for (let i = 0; i < circles.length; i++) {
        circles[i].drawOutEdges();
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
