/* global canvas Pt Curve EdgeLabel */

// ********************************************************
// Edge Class
// ********************************************************

// eslint-disable-next-line no-unused-vars
class Edge {
    constructor(head, tail, controlPt = null) {
        this.head = head;
        this.tail = tail;
    }

    draw() {
        canvas.drawQuadraticCurve(this.startPt, this.controlPt, this.endPt);
        canvas.drawCircle(this.vertex(), 5, 'red');
        canvas.drawLine(this.arrowhead.tip, this.arrowhead.corner1);
        canvas.drawLine(this.arrowhead.tip, this.arrowhead.corner2);
        canvas.drawCircle(this.controlPt, 5, 'green');
        // canvas.drawLine(this.head, this.bezier(0.75), 'red');
        // canvas.drawLine(this.bezier(0.75), this.bezier(0.5), 'red');
        // canvas.drawLine(this.bezier(0.5), this.bezier(0.25), 'red');
        // canvas.drawLine(this.bezier(0.25), this.tail, 'red');
        // TEMP
        // const vertex = this.vertex();
        // canvas.drawLine(this.startPt, vertex, 'green');
        // canvas.drawLine(vertex, this.endPt, 'blue');
        // for (let t = 0; t <= 1; t += 0.1) {
        //     //
        //     let pt = canvas.linearBezier(t, vertex, this.startPt);
        //     canvas.drawCircle(pt, 3, 'pink');
        //     canvas.drawText(Math.round(t * 10) / 10, pt);
        //     //
        //     pt = canvas.linearBezier(t, this.endPt, vertex);
        //     canvas.drawCircle(pt, 3, 'pink');
        //     canvas.drawText(Math.round(t * 10) / 10, pt);
        //     //
        //     pt = this.bezier(t);
        //     canvas.drawCircle(pt, 3, 'pink');
        //     canvas.drawText(Math.round(t * 10) / 10, pt);
        // }
    }

    calculateEndpoints(pt1, pt2) {
        const curve = new Curve(pt1, this.controlPt, pt2);
        const incrementsArray = [0.001, 0.005, 0.01, 0.05];
        let increment = incrementsArray.pop();
        let t = 0;
        while (increment && t < 0.5) {
            const pt = curve.bezier(t);
            if (this.tail.contains(pt.x, pt.y)) {
                t += increment;
            } else {
                t -= increment;
                increment = incrementsArray.pop();
                t += increment || 0;
            }
        }
        this.endPt = curve.bezier(t);
        this.startPt = curve.bezier(1 - t);
        this.endT = t;
    }

    setArrowhead() {
        const tip = this.endPt;
        const ptForSlope = this.bezier(this.endT + 0.01);
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

    labelContains(x, y) {
        return this.label.labelContains(x, y);
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
    isValidBezierT(t) {
        return t !== null && isFinite(t) && t >= 0 && t <= 1;
    }

    vertex() {
        return this.bezier(0.5);
    }

    // TEMP: will change
    contains(x, y) {
        const [x0, y0] = [this.head.x, this.head.y];
        const [x1, y1] = [this.controlPt.x, this.controlPt.y];
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
                canvas.drawCircle(new Pt(xt, yt), 5, 'green');
                return true;
            }
        }
        return false;
    }

    vertexContains(x, y) {
        const distance = this.vertex().distanceTo(new Pt(x, y));
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

    calculateEndpoints() {
        super.calculateEndpoints(this.head, this.tail);
    }

    slideVertex(x, y) {
        const head = this.head;
        const tail = this.tail;
        const slope = this.axisOfSymmetrySlope();
        const newVertex = new Pt();
        newVertex.x = Math.abs(slope) < 1 ? x : this.axisOfSymmetry(y, true);
        newVertex.y = Math.abs(slope) < 1 ? this.axisOfSymmetry(x) : y;
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
        let controlDistanceFromMid = this.controlDistanceFromMid;
        if (this.controlIsForward && (head.y > tail.y || (head.y === tail.y && head.x < tail.x))) {
            controlDistanceFromMid = -1 * controlDistanceFromMid;
        } else if (!this.controlIsForward && (head.y < tail.y || (head.y === tail.y && head.x > tail.x))) {
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

    slideVertex(x, y) {
        const state = this.head;
        const newVertex = new Pt(x, y);
        const distance = newVertex.distanceTo(state) - state.radius;
        const m = newVertex.slopeTo(state);
        const maybeControl1 = newVertex.ptAlongSlope(m, -1 * distance);
        const maybeControl2 = newVertex.ptAlongSlope(m, distance);
        if (state.distanceTo(maybeControl1) > state.distanceTo(maybeControl2)) {
            this.controlPt = maybeControl1;
        } else {
            this.controlPt = maybeControl2;
        }
        const perpM = -1 / m;
        this.calculateEndpoints(perpM);
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
