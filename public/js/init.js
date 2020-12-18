/*
    Init.js
    Setup the canvas for drawing digraphs.
*/

console.log('Adrian Clinansmith');
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// ********************************
// Classes
// ********************************

class Circle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.edge = null;
    }

    // (𝑚^2 + 1) 𝑥^2 + 2(𝑚𝑐 − 𝑚𝑞 − 𝑝)𝑥 + (𝑞^2 − 𝑟^2 + 𝑝^2 − 2𝑐𝑞 + 𝑐^2)=0
    // 𝑦 = 𝑚𝑥 + 𝑐
    // (𝑥−𝑝)^2+(𝑦−𝑞)^2=𝑟^2.

    draw(x = this.x, y = this.y, colour = 'black') {
        if (this.edge && (x !== this.x || y !== this.y)) {
            // move the control point along with the vertex so the edge retains is curve
            const tail = this.edge.circle;
            const control = { x: this.edge.controlX, y: this.edge.controlY };

            // calculate the slope of the new control line
            // calculate the midpoint between the new head & tail
            const [x0, x1] = x < tail.x ? [x, tail.x] : [tail.x, x];
            const [y0, y1] = x < tail.x ? [y, tail.y] : [tail.y, y];
            const slope = (x0 - x1) / (y1 - y0);
            const [midX, midY] = [(x0 + x1) / 2, (y0 + y1) / 2];

            // calculate the midpoint of the previous head & tail
            // calculate the distance from the old midpoint to the control point
            const oldMidPoint = { x: (this.x + tail.x) / 2, y: (this.y + tail.y) / 2 };
            const distance = Math.hypot(oldMidPoint.x - control.x, oldMidPoint.y - control.y);
            // drawCircle(midX, midY, distance, colour = 'red');

            // derive the quadratic formula from the circle eqatuion with the new midpoint & radius = distance,
            // and the linear equation centered at the new midpoint
            // this gives the x-intercepts of the circle & new control line
            const a = slope * slope + 1;
            const b = (-2 - 2 * slope * slope) * midX;
            const c = a * midX * midX - distance * distance;
            let root = Math.sqrt(b * b - 4 * a * c);
            root = isNaN(root) ? 0 : root;
            // move the control point such that it follows the new control line & remains the same distance
            // from the mid point
            const controlX = (-b + root) / (2 * a);
            const controlY = slope * (controlX - midX) + midY;
            console.log(`old = (${this.edge.controlX} ${this.edge.controlY}), new = (${controlX} ${controlY})`);
            // console.log(`a=${a}, b=${b}, c=${c}, contX=${controlX}, sqrt=${b * b - 4 * a * c}`);
            this.edge.controlX = controlX;
            this.edge.controlY = controlY;
        }
        this.x = x;
        this.y = y;
        drawCircle(x, y, 30, colour);
    }

    drawEdge(x = this.edge?.controlX, y = this.edge?.controlY) {
        if (this.edge == null) {
            return;
        }
        // f is a linear function that is perpendicular to the line between the head and tail.
        // The control point must travel along f.
        const head = { x: this.x, y: this.y };
        const tail = this.edge.circle;
        const f = function(x, inverse = false) {
            return perpendicularFunction(x, head, tail, inverse);
        };
        // For the control point, use (x, f(x)) if f is more horizontal,
        // else if f is more vertical use (g(y), y), where g is the inverse of f.
        const fIsVertical = Math.abs(head.y - tail.y) < Math.abs(head.x - tail.x);
        const xval = fIsVertical ? f(y, true) : x;
        const yval = fIsVertical ? y : f(x);
        // Draw the control and the edge, then update the control's coordinates.
        drawCircle(xval, yval, 5, 'red');
        drawQuadraticCurve(this.x, this.y, xval, yval, tail.x, tail.y);
        this.edge.controlX = xval;
        this.edge.controlY = yval;
        // Draw the control line (f) and a horzidonal version of the line between the head and tail
        drawLine(5, f(5), 500, f(500), 'red');
        const distance = Math.hypot(this.x - tail.x, this.y - tail.y);
        drawLine(this.x, this.y, this.x - distance, this.y, 'green');
    }

    contains(x, y) {
        const inX = x >= this.x - this.radius && x <= this.x + this.radius;
        const inY = y >= this.y - this.radius && y <= this.y + this.radius;
        return inX && inY;
    }

    controlContains(x, y) {
        if (this.edge == null) {
            return;
        }
        const control = { x: this.edge.controlX, y: this.edge.controlY };
        const inX = x >= control.x - 5 && x <= control.x + 5;
        const inY = y >= control.y - 5 && y <= control.y + 5;
        return inX && inY;
    }

    makeEdgeTo(circle, controlX = null, controlY = null) {
        controlX = controlX || (this.x + circle.x) / 2;
        controlY = controlY || (this.y + circle.y) / 2;
        this.edge = { circle, controlX, controlY };
    }

    controlFunction(x, p0 = { x: this.x, y: this.y }) {
        if (this.edge == null) {
            return;
        }
        const tail = this.edge.circle;
        const [x0, x1] = p0.x < tail.x ? [p0.x, tail.x] : [tail.x, p0.x];
        const [y0, y1] = p0.x < tail.x ? [p0.y, tail.y] : [tail.y, p0.y];
        const slope = (x0 - x1) / (y1 - y0);
        const [xmid, ymid] = [(x0 + x1) / 2, (y0 + y1) / 2];
        return slope * (x - xmid) + ymid;
    }
}

drawQuadraticCurve(10, 50, 110, 50, 210, 50);
drawQuadraticCurve(10, 50, 110, 100, 210, 50);
drawQuadraticCurve(10, 50, 110, 150, 210, 50);
drawQuadraticCurve(10, 50, 110, 200, 210, 50);

const circles = [new Circle(370, 86, 30), new Circle(228, 280, 30)];
circles[0].makeEdgeTo(circles[1]);
// circles[1].makeEdgeTo(circles[2]);
circles[0].drawEdge();
circles[1].drawEdge();
circles[0].draw();
circles[1].draw();
// circles[2].draw();

// const p0 = { x: circles[0].x, y: circles[0].y };
// const p1 = { x: (circles[0].x + circles[1].x) / 2, y: (circles[0].y + circles[1].y) / 2 };
// const p2 = { x: circles[1].x, y: circles[1].y };

// for (let t = 0; t <= 1; t += 0.02) {
//     const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
//     const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
//     const circle = new Circle(x, y, 3);
//     circle.draw(circle.x, circle.y, 'red');
// }

// ********************************
// Event Listeners
// ********************************

let dragInfo = null;
let controlIndex = null;

canvas.addEventListener('mousedown', function(event) {
    const { x, y } = eventPointInCanvas(event);
    for (let i = 0; i < circles.length; i++) {
        if (circles[i].contains(x, y)) {
            dragInfo = { index: i, offset: { x: circles[i] - x, y: circles[i] - y } };
        } else if (circles[i].controlContains(x, y)) {
            console.log('CLICKED CONTROL with i = ' + i);
            controlIndex = i;
        }
    }
});

canvas.addEventListener('mouseup', function(event) {
    // lastDragPoint = null;
    dragInfo = null;
    controlIndex = null;
});

canvas.addEventListener('mousemove', function(event) {
    if (dragInfo !== null || controlIndex !== null) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        const { x, y } = eventPointInCanvas(event);
        for (let i = 0; i < circles.length; i++) {
            if (i === dragInfo?.index) {
                circles[i].draw(x, y);
            } else {
                circles[i].draw();
            }
        }
        for (let i = 0; i < circles.length; i++) {
            if (i === controlIndex) {
                circles[i].drawEdge(x, y);
            } else {
                circles[i].drawEdge();
            }
        }
    }
});

// ********************************
// Canvas drawing functions
// ********************************

function drawCircle(x, y, radius, colour = 'black') {
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.strokeStyle = colour;
    context.stroke();
}

function drawLine(x0, y0, x1, y1, colour = 'black') {
    context.beginPath();
    context.moveTo(x0, y0);
    context.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2, x1, y1);
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
    const [x0, x1] = p0.x < p1.x ? [p0.x, p1.x] : [p1.x, p0.x];
    const [y0, y1] = p0.x < p1.x ? [p0.y, p1.y] : [p1.y, p0.y];
    const slope = (x0 - x1) / (y1 - y0);
    const [xmid, ymid] = [(x0 + x1) / 2, (y0 + y1) / 2];
    if (inverse) {
        return (x - ymid) / slope + xmid;
    }
    return slope * (x - xmid) + ymid;
}
