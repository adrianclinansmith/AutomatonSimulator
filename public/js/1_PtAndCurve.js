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

    // A linear function f(x) that passes through this point and which has a
    // slope that is perpendicular to the line formed by this and toPt.
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
// Curve Class
// ********************************************************

/*
Represents a bezier curve on the Cartesian plane.
*/

// eslint-disable-next-line no-unused-vars
class Curve {
    constructor(startPt, controlPt, endPt) {
        this.startPt = startPt;
        this.controlPt = controlPt;
        this.endPt = endPt;
    }

    bezier(t) {
        const p0 = this.endPt;
        const p1 = this.controlPt;
        const p2 = this.startPt;
        const x = p1.x + (1 - t) * (1 - t) * (p0.x - p1.x) + t * t * (p2.x - p1.x);
        const y = p1.y + (1 - t) * (1 - t) * (p0.y - p1.y) + t * t * (p2.y - p1.y);
        return new Pt(x, y);
    }

    // TEMP: may not use
    bezierDerivative(t) {
        const p0 = this.endPt;
        const p1 = this.controlPt;
        const p2 = this.startPt;
        const x = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
        const y = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
        return new Pt(x, y);
    }

    // TEMP: may not use
    bezierInverse(pt, useX = true) {
        const p0 = this.endPt;
        const p1 = this.controlPt;
        const p2 = this.startPt;
        const a = p0.x - 2 * p1.x + p2.x;
        const b = 2 * (p1.x - p0.x);
        const c = (p0.x - pt.x);
        let t1;
        if (a === 0) {
            t1 = (pt.x - p0.x) / (p2.x - p0.x);
        } else {
            t1 = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
        }
        const t2 = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
        return [t1, t2];
    }

    contains(pt) {
        const step = 0.1;
        const precision = 7;
        for (let t = 0; t <= 1 - step; t += step) {
            const srtPt = this.bezier(t);
            const endPt = this.bezier(t + step);
            const x1 = (srtPt.x < endPt.x ? srtPt.x : endPt.x) - precision;
            const x2 = (x1 === srtPt.x ? endPt.x : srtPt.x) + precision;
            const y1 = (srtPt.y < endPt.y ? srtPt.y : endPt.y) - precision;
            const y2 = (y1 === srtPt.y ? endPt.y : srtPt.y) + precision;
            // console.log(`pt1: ${new Pt(x1, y1)}, pt2: ${new Pt(x2, y2)}, pt: ${pt}`);
            if (pt.x >= x1 && pt.x <= x2 && pt.y >= y1 && pt.y <= y2) {
                return true;
            }
        }
        return false;
    }

    // TEMP: may not use
    isValidBezierT(t) {
        return t !== null && isFinite(t) && t >= 0 && t <= 1;
    }
}
