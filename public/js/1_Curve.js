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

    bezierInverse(pt) {
        const p0 = this.endPt;
        const p1 = this.controlPt;
        const p2 = this.startPt;
        const ts = [];
        let a = p0.x - 2 * p1.x + p2.x;
        let b = 2 * (p1.x - p0.x);
        let c = (p0.x - pt.x);
        if (a === 0) {
            ts.push((pt.x - p0.x) / (p2.x - p0.x), Infinity);
        } else {
            ts.push(...this.quadraticFormula(a, b, c));
        }
        a = p0.y - 2 * p1.y + p2.y;
        b = 2 * (p1.y - p0.y);
        c = (p0.y - pt.y);
        if (a === 0) {
            ts.push((pt.y - p0.y) / (p2.y - p0.y), Infinity);
        } else {
            ts.push(...this.quadraticFormula(a, b, c));
        }
        return ts;
    }

    contains(pt) {
        const ts = this.bezierInverse(pt);
        for (const t of ts) {
            if (isNaN(t) || t > 1 || t < 0) {
                continue;
            }
            const ptAtT = this.bezier(t);
            if (ptAtT.contains(pt, 5)) {
                return true;
            }
        }
        return false;
    }

    draw(canvas, colour = 'black') {
        canvas.drawQuadraticCurve(this.startPt, this.controlPt, this.endPt, colour);
    }

    quadraticFormula(a, b, c) {
        const x1 = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
        const x2 = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
        return [x1, x2];
    }
}
