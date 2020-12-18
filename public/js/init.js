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

            const [x0, x1] = x < tail.x ? [x, tail.x] : [tail.x, x];
            const [y0, y1] = x < tail.x ? [y, tail.y] : [tail.y, y];
            const slope = (x0 - x1) / (y1 - y0);
            const [midX, midY] = [(x0 + x1) / 2, (y0 + y1) / 2];

            const oldMidPoint = { x: (this.x + tail.x) / 2, y: (this.y + tail.y) / 2 };
            const distance = Math.hypot(oldMidPoint.x - control.x, oldMidPoint.y - control.y);
            console.log('slope = ' + slope);
            console.log(`oldMid = (${oldMidPoint.x}, ${oldMidPoint.y}) cntrl = (${control.x}, ${control.y})`);
            // drawCircle(midX, midY, distance, colour = 'red');

            const a = slope * slope + 1;
            const b = (-2 - 2 * slope * slope) * midX;
            const c = a * midX * midX - distance * distance;
            let root = Math.sqrt(b * b - 4 * a * c);
            root = isNaN(root) ? 0 : root;
            const controlX = (-b + root) / (2 * a);
            const controlY = slope * (controlX - midX) + midY;
            console.log(`a=${a}, b=${b}, c=${c}, contX=${controlX}, sqrt=${b * b - 4 * a * c}`);
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
        const f = function(x) {
            return perpendicularFunction(x, head, tail);
        };
        // draw the control
        drawCircle(x, f(x), 5, 'red');
        drawLine(5, f(5), 500, f(500), 'red');
        // draw the edge
        drawQuadraticCurve(this.x, this.y, x, f(x), tail.x, tail.y);
        this.edge.controlX = x;
        this.edge.controlY = f(x);
        console.log(`cntrol = (${this.edge.controlX}, ${this.edge.controlY})`);
        // draw flat version of line (temp)
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

const circles = [new Circle(276, 86, 30), new Circle(128, 280, 30)];
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

let lastDragPoint = null;
let controlIndex = null;

canvas.addEventListener('mousedown', function(event) {
    const { x, y } = eventPointInCanvas(event);
    lastDragPoint = { x, y };
    console.log(`(${x.toFixed(2)}, ${y.toFixed(2)})`);
    for (let i = 0; i < circles.length; i++) {
        if (circles[i].controlContains(x, y)) {
            controlIndex = i;
        }
    }
});

canvas.addEventListener('mouseup', function(event) {
    lastDragPoint = null;
    controlIndex = null;
});

canvas.addEventListener('mousemove', function(event) {
    if (lastDragPoint) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        const { x, y } = eventPointInCanvas(event);
        const dx = x - lastDragPoint.x;
        const dy = y - lastDragPoint.y;
        for (let i = 0; i < circles.length; i++) {
            if (circles[i].contains(x, y)) {
                circles[i].draw(circles[i].x + dx, circles[i].y + dy);
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
        lastDragPoint = { x, y };
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

function perpendicularFunction(x, p0, p1) {
    const [x0, x1] = p0.x < p1.x ? [p0.x, p1.x] : [p1.x, p0.x];
    const [y0, y1] = p0.x < p1.x ? [p0.y, p1.y] : [p1.y, p0.y];
    const slope = (x0 - x1) / (y1 - y0);
    const [xmid, ymid] = [(x0 + x1) / 2, (y0 + y1) / 2];
    return slope * (x - xmid) + ymid;
}
