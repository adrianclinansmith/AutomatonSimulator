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
        return this.tForPt(pt) !== false;
    }

    draw(canvas, colour = 'black') {
        canvas.drawQuadraticCurve(this.startPt, this.controlPt, this.endPt, colour);
        if (this.arrowhead) {
            canvas.drawLine(this.arrowhead.tip, this.arrowhead.corner1, colour);
            canvas.drawLine(this.arrowhead.tip, this.arrowhead.corner2, colour);
        }
    }

    quadraticFormula(a, b, c) {
        const x1 = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
        const x2 = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
        return [x1, x2];
    }

    setArrowhead(atT = 0) {
        const tip = this.bezier(atT);
        const ptForSlope = this.bezier(atT + 0.01);
        // src: http://www.dbp-consulting.com/tutorials/canvas/CanvasArrow.html
        const angle = Math.atan2(ptForSlope.y - tip.y, ptForSlope.x - tip.x);
        const theta = Math.PI / 4;
        const angle1 = Math.PI + angle + theta;
        const angle2 = Math.PI + angle - theta;
        const h = Math.abs(7 / Math.cos(theta));
        const corner1 = new Pt(tip.x - Math.cos(angle1) * h, tip.y - Math.sin(angle1) * h);
        const corner2 = new Pt(tip.x - Math.cos(angle2) * h, tip.y - Math.sin(angle2) * h);
        this.arrowhead = { tip, corner1, corner2 };
    }

    tForPt(pt) {
        const ts = this.bezierInverse(pt);
        for (const t of ts) {
            if (isNaN(t) || t > 1 || t < 0) {
                continue;
            }
            const ptAtT = this.bezier(t);
            if (ptAtT.contains(pt, 5)) {
                return t;
            }
        }
        return false;
    }
}
