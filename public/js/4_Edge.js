/* global Pt Curve EdgeLabel */

// ********************************************************
// Edge Class
// ********************************************************

/*
Abstract class: must be subclassed to be used.

A directed edge between states, depicted as a quadratic bezier curve.
Head & tail are the state(s) that are connected by this edge.
startPt & endPt are the last points that are drawn; t=1 & t=0 respectively.
*/

// eslint-disable-next-line no-unused-vars
class Edge extends Curve {
    constructor(head, tail, controlPt = null) {
        super(null, controlPt, null);
        this.head = head;
        this.tail = tail;
        this.isSelected = false;
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

    draw(canvas) {
        const color = this.isSelected ? 'red' : 'black';
        canvas.drawQuadraticCurve(this.startPt, this.controlPt, this.endPt, color);
        canvas.drawLine(this.arrowhead.tip, this.arrowhead.corner1, color);
        canvas.drawLine(this.arrowhead.tip, this.arrowhead.corner2, color);
        if (this.isSelected) {
            canvas.drawCircle(this.vertex(), 5, color);
        }
    }

    labelContains(pt) {
        return this.label.labelContains(pt);
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

    vertex() {
        return this.bezier(0.5);
    }

    vertexContains(pt) {
        const distance = this.vertex().distanceTo(pt);
        return distance <= 5;
    }
}

// ********************************************************
// Non-Loop Edge Class
// ********************************************************

/*
A concrete subclass of Edge which connects two different states.
*/

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

    midBase() {
        const x = (this.startPt.x + this.endPt.x) / 2;
        const y = (this.startPt.y + this.endPt.y) / 2;
        return new Pt(x, y);
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
}

// ********************************************************
// Loop Edge Class
// ********************************************************

/*
A concrete subclass of Edge which connects one state to itself.
*/

// eslint-disable-next-line no-unused-vars
class LoopEdge extends Edge {
    constructor(state, controlPt = null) {
        super(state, state);
        if (controlPt === null) {
            this.controlPt = new Pt(state.x, state.y - state.radius * 4);
        } else {
            this.controlPt = controlPt;
        }
        this.calculateEndpoints(0);
        this.setArrowhead();
        this.setOffset();
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
}
