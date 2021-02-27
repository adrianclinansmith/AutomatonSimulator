/* global Pt  */

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
        const [t1, t2] = this.bezierInverse(pt);
        return this.isPtAtT(pt, t1) || this.isPtAtT(pt, t2);
    }

    isPtAtT(pt, t, radius = 5) {
        if (!this.isValidBezierT(t)) {
            return false;
        }
        const ptAtT = this.bezier(t);
        return ptAtT.ptIsWithinRadius(pt, radius);
    }

    isValidBezierT(t) {
        return !isNaN(t) && t !== null && t >= 0 && t <= 1;
    }
}
