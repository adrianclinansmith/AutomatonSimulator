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
    }

    drawCircle(centerPt, radius, colour = 'black') {
        this.context.beginPath();
        this.context.arc(centerPt.x, centerPt.y, radius, 0, 2 * Math.PI);
        this.context.fillStyle = '#ebe9e9';
        this.context.fill();
        this.context.strokeStyle = colour;
        this.context.stroke();
    }

    drawLine(p0, p1, colour = 'black') {
        this.context.beginPath();
        this.context.moveTo(p0.x, p0.y);
        const p2 = new Pt((p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
        this.context.quadraticCurveTo(p2.x, p2.y, p1.x, p1.y);
        this.context.strokeStyle = colour;
        this.context.stroke();
    }

    eventPointInCanvas(event) {
        const rect = this.element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        return new Pt(x, y);
    }

    drawQuadraticCurve(begin, control, end, colour = 'black') {
        this.context.beginPath();
        this.context.moveTo(begin.x, begin.y);
        this.context.quadraticCurveTo(control.x, control.y, end.x, end.y);
        this.context.strokeStyle = colour;
        this.context.stroke();
    }

    clear() {
        const width = canvas.element.width;
        const height = canvas.element.height;
        this.context.clearRect(0, 0, width, height);
    }
}

// eslint-disable-next-line no-unused-vars
const canvas = new Canvas();
