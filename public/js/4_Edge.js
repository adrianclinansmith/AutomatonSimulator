/* global canvas Pt Curve EdgeLabel */

// ********************************************************
// Edge Class
// ********************************************************

/*
An edge that represents a connection between states.
This is an abstract class and thus must be subclassed.
*/

// eslint-disable-next-line no-unused-vars
class Edge extends Curve {
    constructor(head, tail, controlPt = null) {
        super(null, controlPt, null);
        this.head = head;
        this.tail = tail;
        this.isSelected = false;
    }

    draw() {
        const color = this.isSelected ? 'red' : 'black';
        canvas.drawQuadraticCurve(this.startPt, this.controlPt, this.endPt, color);
        canvas.drawLine(this.arrowhead.tip, this.arrowhead.corner1, color);
        canvas.drawLine(this.arrowhead.tip, this.arrowhead.corner2, color);
        if (this.isSelected) {
            canvas.drawCircle(this.vertex(), 5, color);
        }
        //
        // const step = 0.1;
        // let color = 'red';
        // for (let t = 0; t <= 1 - step; t += step) {
        //     const pt1 = this.bezier(t);
        //     const pt2 = this.bezier(t + step);
        //     canvas.drawLine(pt1, pt2, color);
        //     color = color === 'red' ? 'green' : 'red';
        // }
        //
    }

    calculateEndpoints(head = this.head, tail = this.tail) {
        const curve = new Curve(head, this.controlPt, tail);
        const incrementsArray = [0.001, 0.005, 0.01, 0.05];
        let increment = incrementsArray.pop();
        let t = 0;
        while (increment && t < 0.5) {
            const pt = curve.bezier(t);
            if (this.tail.contains(pt)) {
                t += increment;
            } else {
                t -= increment;
                increment = incrementsArray.pop();
                t += increment || 0;
            }
        }
        this.endPt = curve.bezier(t);
        this.startPt = curve.bezier(1 - t);
    }

    setArrowhead() {
        const tip = this.endPt;
        const ptForSlope = this.bezier(0.01);
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

    labelContains(pt) {
        return this.label.labelContains(pt);
    }

    vertex() {
        return this.bezier(0.5);
    }

    // TEMP: will change
    // contains(x, y) {
    //     const [x0, y0] = [this.head.x, this.head.y];
    //     const [x1, y1] = [this.controlPt.x, this.controlPt.y];
    //     const [x2, y2] = [this.tail.x, this.tail.y];
    //     const headTailDistance = Math.hypot(x0 - x2, y0 - y2);
    //     const max = Math.round(((headTailDistance + this.controlDistanceFromMid) / 100) * 100) / 10;
    //     for (let n = 0; n <= max; n++) {
    //         const t = n / max;
    //         // quadratic bezier equation
    //         const xt = x1 + (1 - t) * (1 - t) * (x0 - x1) + t * t * (x2 - x1);
    //         const yt = y1 + (1 - t) * (1 - t) * (y0 - y1) + t * t * (y2 - y1);
    //         const inX = x >= xt - 5 && x <= xt + 5;
    //         const inY = y >= yt - 5 && y <= yt + 5;
    //         if (inX && inY) {
    //             canvas.drawCircle(new Pt(xt, yt), 5, 'green');
    //             return true;
    //         }
    //     }
    //     return false;
    // }

    vertexContains(pt) {
        const distance = this.vertex().distanceTo(pt);
        return distance <= 5;
    }
}

// ********************************************************
// Non-Loop Edge Class
// ********************************************************

// eslint-disable-next-line no-unused-vars
class NonLoopEdge extends Edge {
    constructor(head, tail, controlPt = null) {
        super(head, tail);
        if (controlPt === null) {
            this.controlPt = new Pt((head.x + tail.x) / 2, (head.y + tail.y) / 2);
        } else {
            this.controlPt = controlPt;
        }
        this.calculateEndpoints();
        this.setArrowhead();
        this.controlDistanceFromMid = 0;
        this.controlIsForward = true;
        // this.setupLabel();
        this.label = new EdgeLabel(this);
    }

    slideVertex(pt) {
        const head = this.head;
        const tail = this.tail;
        const slope = this.axisOfSymmetrySlope();
        const newVertex = new Pt();
        newVertex.x = Math.abs(slope) < 1 ? pt.x : this.axisOfSymmetry(pt.y, true);
        newVertex.y = Math.abs(slope) < 1 ? this.axisOfSymmetry(pt.x) : pt.y;
        const midBase = this.midBase();
        const newHeight = newVertex.distanceTo(midBase);
        const maybeControl1 = midBase.ptAlongSlope(slope, newHeight * 2);
        const maybeControl2 = midBase.ptAlongSlope(slope, newHeight * -2);
        if (newVertex.distanceTo(maybeControl1) < newVertex.distanceTo(maybeControl2)) {
            this.controlPt = maybeControl1;
        } else {
            this.controlPt = maybeControl2;
        }
        this.controlDistanceFromMid = newHeight * 2;
        if (head.y < tail.y) {
            this.controlIsForward = this.controlPt.x >= midBase.x;
        } else if (head.y === tail.y && head.x > tail.x) {
            this.controlIsForward = this.controlPt.y >= midBase.y;
        } else if (head.y === tail.y && head.x < tail.x) {
            this.controlIsForward = this.controlPt.y < midBase.y;
        } else {
            this.controlIsForward = this.controlPt.x <= midBase.x;
        }
        this.calculateEndpoints();
        this.setArrowhead();
        this.label.readjustLabel();
    }

    readjustForChangedEndpoint() {
        const head = this.head;
        const tail = this.tail;
        const controlIsForward = this.controlIsForward;
        let controlDistanceFromMid = this.controlDistanceFromMid;
        const tailIsAboveHead = head.y > tail.y || (head.y === tail.y && head.x < tail.x);
        if ((controlIsForward && tailIsAboveHead) || !(controlIsForward || tailIsAboveHead)) {
            controlDistanceFromMid = -1 * controlDistanceFromMid;
        }
        const midBase = this.midBase();
        const m = this.axisOfSymmetrySlope();
        if (Number.isFinite(m)) {
            this.controlPt = midBase.ptAlongSlope(m, controlDistanceFromMid);
        } else {
            this.controlPt = new Pt(midBase.x, midBase.y + controlDistanceFromMid);
        }
        this.calculateEndpoints();
        this.setArrowhead();
        this.label.readjustLabel();
    }

    midBase() {
        const x = (this.startPt.x + this.endPt.x) / 2;
        const y = (this.startPt.y + this.endPt.y) / 2;
        return new Pt(x, y);
    }

    // The axis of symmetry is a linear function that is perpendicular to
    // a straight line contecting the head and tail.
    axisOfSymmetry(x, inverse = false) {
        const h = this.head;
        const t = this.tail;
        const slope = (h.x - t.x) / (t.y - h.y);
        const mid = new Pt((h.x + t.x) / 2, (h.y + t.y) / 2);
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
}

// ********************************************************
// Loop Edge Class
// ********************************************************

// eslint-disable-next-line no-unused-vars
class LoopEdge extends Edge {
    constructor(state, controlPt = null) {
        super(state, state);
        // this.startPt = new Pt(state.x - state.radius / 2, state.y);
        // this.endPt = new Pt(state.x + state.radius / 2, state.y);
        if (controlPt === null) {
            this.controlPt = new Pt(state.x, state.y - state.radius * 4);
        } else {
            this.controlPt = controlPt;
        }
        this.calculateEndpoints(0);
        this.setArrowhead();
        this.setOffset();
        // this.setupLabel();
        this.label = new EdgeLabel(this);
    }

    calculateEndpoints(slope) {
        const state = this.head;
        let p0, p1;
        if (this.controlPt.y < state.y) {
            p0 = state.ptAlongSlope(slope, -1 * state.radius / 2);
            p1 = state.ptAlongSlope(slope, state.radius / 2);
        } else {
            p0 = state.ptAlongSlope(slope, state.radius / 2);
            p1 = state.ptAlongSlope(slope, -1 * state.radius / 2);
        }
        super.calculateEndpoints(p0, p1);
    }

    slideVertex(newVertexPt) {
        const state = this.head;
        const distance = newVertexPt.distanceTo(state) - state.radius;
        const m = newVertexPt.slopeTo(state);
        const maybeControl1 = newVertexPt.ptAlongSlope(m, -1 * distance);
        const maybeControl2 = newVertexPt.ptAlongSlope(m, distance);
        if (state.distanceTo(maybeControl1) > state.distanceTo(maybeControl2)) {
            this.controlPt = maybeControl1;
        } else {
            this.controlPt = maybeControl2;
        }
        this.calculateEndpoints(-1 / m);
        this.setArrowhead();
        this.setOffset();
        this.label.readjustLabel();
    }

    readjustForChangedEndpoint() {
        this.startPt = this.head.addPt(this.stateOffset.startPt);
        this.endPt = this.head.addPt(this.stateOffset.endPt);
        this.controlPt = this.head.addPt(this.stateOffset.controlPt);
        this.setArrowhead();
        this.label.readjustLabel();
    }

    setOffset() {
        const startPt = this.startPt.minusPt(this.head);
        const endPt = this.endPt.minusPt(this.head);
        const controlPt = this.controlPt.minusPt(this.head);
        this.stateOffset = { startPt, endPt, controlPt };
    }
}
