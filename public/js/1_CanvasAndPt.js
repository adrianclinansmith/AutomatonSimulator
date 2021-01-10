// ********************************************************
// Pt Class
// ********************************************************

/*
Represents a point on the Cartesian plane.
*/

class Pt {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    distanceTo(otherPt) {
        return Math.hypot(this.x - otherPt.x, this.y - otherPt.y);
    }

    slopeTo(otherPt) {
        return (otherPt.y - this.y) / (otherPt.x - this.x);
    }

    addPt(addendPt) {
        return new Pt(this.x + addendPt.x, this.y + addendPt.y);
    }

    minusPt(subtrahendPt) {
        return new Pt(this.x - subtrahendPt.x, this.y - subtrahendPt.y);
    }

    ptAlongSlope(slope, distance) {
        if (Number.isFinite(slope) === false) {
            return new Pt(this.x, this.y + distance);
        }
        // source:
        // https://www.geeksforgeeks.org/find-points-at-a-given-distance-on-a-line-of-given-slope/
        const m = slope;
        const x = this.x + distance * Math.sqrt(1 / (1 + m * m));
        const y = this.y + m * distance * Math.sqrt(1 / (1 + m * m));
        return new Pt(x, y);
    }

    perpendicularFunction(x, toPt, inverse = false) {
        const slope = (this.x - toPt.x) / (toPt.y - this.y);
        if (inverse) {
            return (x - toPt.y) / slope + toPt.x;
        }
        return slope * (x - toPt.x) + toPt.y;
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }
}

// ********************************************************
// Canvas Class
// ********************************************************

/*
Contains methods to make drawing on the canvas more convenient.
*/

class Canvas {
    constructor(canvasID = 'canvas', contextType = '2d') {
        /** @type {HTMLCanvasElement} */
        this.element = document.getElementById(canvasID);
        this.context = this.element.getContext(contextType);
        this.context.lineWidth = 1.3;
    }

    drawCircle(centerPt, radius, colour = 'black') {
        this.context.beginPath();
        this.context.arc(centerPt.x, centerPt.y, radius, 0, 2 * Math.PI);
        this.context.fillStyle = '#ebe9e9';
        this.context.fill();
        this.context.strokeStyle = colour;
        this.context.stroke();
    }

    drawLine(pt0, pt1, colour = 'black') {
        this.context.beginPath();
        this.context.moveTo(pt0.x, pt0.y);
        const p2 = new Pt((pt0.x + pt1.x) / 2, (pt0.y + pt1.y) / 2);
        this.context.quadraticCurveTo(p2.x, p2.y, pt1.x, pt1.y);
        this.context.strokeStyle = colour;
        this.context.stroke();
    }

    linearBezier(t, p0, p1) {
        const x = (1 - t) * p0.x + t * p1.x;
        const y = (1 - t) * p0.y + t * p1.y;
        return new Pt(x, y);
    }

    drawQuadraticCurve(beginPt, controlPt, endPt, colour = 'black') {
        this.context.beginPath();
        this.context.moveTo(beginPt.x, beginPt.y);
        this.context.quadraticCurveTo(controlPt.x, controlPt.y, endPt.x, endPt.y);
        this.context.strokeStyle = colour;
        this.context.stroke();
    }

    drawText(text, atPt) {
        this.context.fillStyle = 'black';
        this.context.font = '10px serif';
        this.context.textAlign = 'center';
        this.context.fillText(text, atPt.x, atPt.y);

        // const width = this.context.measureText(text).width;
        // const p0 = new Pt(atPt.x - width / 2, atPt.y);
        // const p1 = new Pt(atPt.x + width / 2, atPt.y);
        // this.drawLine(p0, p1, 'green'); // bottom line
        // console.log('width: ' + width);
        // p1.x = p0.x;
        // p1.y = p0.y - width;
        // this.drawLine(p0, p1, 'green'); // left line
        // p0.x = p0.x + width;
        // p1.x = p1.x + width;
        // this.drawLine(p0, p1, 'green'); // right line
        // p0.x = p0.x - width;
        // p0.y = p1.y;
        // this.drawLine(p0, p1, 'green'); // top line
    }

    eventPointInCanvas(event) {
        const rect = this.element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        return new Pt(x, y);
    }

    clear() {
        const width = canvas.element.width;
        const height = canvas.element.height;
        this.context.clearRect(0, 0, width, height);
    }
}

// eslint-disable-next-line no-unused-vars
const canvas = new Canvas();
