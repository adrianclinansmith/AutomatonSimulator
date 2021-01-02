/* global canvas Pt */

// ********************************************************
// Edge Class
// ********************************************************

class Edge {
    constructor(head, tail, control = null) {
        this.head = head;
        this.tail = tail;
    }

    draw() {
        canvas.drawQuadraticCurve(this.startPt, this.control, this.endPt);
        canvas.drawCircle(this.vertex(), 5, 'red');
        canvas.drawLine(this.arrowhead.tip, this.arrowhead.corner1);
        canvas.drawLine(this.arrowhead.tip, this.arrowhead.corner2);
    }

    setArrowhead() {
        const incrementsArray = [0.001, 0.005, 0.01, 0.05];
        let increment = incrementsArray.pop();
        let t = 0;
        while (increment && t < 0.5) {
            const pt = this.bezier(t);
            if (this.tail.contains(pt.x, pt.y)) {
                t += increment;
            } else {
                t -= increment;
                increment = incrementsArray.pop();
                t += increment || 0;
            }
        }
        if (t >= 0.5) {
            return;
        }
        const tip = this.bezier(t);
        const ptForSlope = this.bezier(t + 0.01);
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

    setControl(pt) {
        this.control.x = pt.x;
        this.control.y = pt.y;
    }

    bezier(t) {
        const p0 = this.endPt;
        const p1 = this.control;
        const p2 = this.startPt;
        const x = p1.x + (1 - t) * (1 - t) * (p0.x - p1.x) + t * t * (p2.x - p1.x);
        const y = p1.y + (1 - t) * (1 - t) * (p0.y - p1.y) + t * t * (p2.y - p1.y);
        return new Pt(x, y);
    }

    // TEMP: will change
    contains(x, y) {
        const [x0, y0] = [this.head.x, this.head.y];
        const [x1, y1] = [this.control.x, this.control.y];
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

    vertex() {
        return this.bezier(0.5);
    }

    midBase() {
        const x = (this.head.x + this.tail.x) / 2;
        const y = (this.head.y + this.tail.y) / 2;
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

    vertexContains(x, y) {
        const distance = this.vertex().distanceTo(new Pt(x, y));
        return distance <= 5;
    }

    // readjustForChangedEndpoint() {
    //     const head = this.head;
    //     const tail = this.tail;
    //     let controlDistanceFromMid = this.controlDistanceFromMid;
    //     if (this.controlIsForward && (head.y > tail.y || (head.y === tail.y && head.x < tail.x))) {
    //         controlDistanceFromMid = -1 * controlDistanceFromMid;
    //     } else if (!this.controlIsForward && (head.y < tail.y || (head.y === tail.y && head.x > tail.x))) {
    //         controlDistanceFromMid = -1 * controlDistanceFromMid;
    //     }
    //     const midBase = this.midBase();
    //     const m = this.axisOfSymmetrySlope();
    //     if (Number.isFinite(m)) {
    //         const newControl = midBase.ptAlongSlope(m, controlDistanceFromMid);
    //         this.setControl(newControl);
    //     } else {
    //         const newControl = { x: midBase.x, y: midBase.y + controlDistanceFromMid };
    //         this.setControl(newControl);
    //     }
    //     this.setArrowhead();
    // }
}

// ********************************************************
// Non-Loop Edge Class
// ********************************************************

class NonLoopEdge extends Edge {
    constructor(head, tail, control = null) {
        super(head, tail);
        this.startPt = head;
        this.endPt = tail;
        if (control === null) {
            this.control = new Pt((head.x + tail.x) / 2, (head.y + tail.y) / 2);
        } else {
            this.control = control;
        }
        this.controlDistanceFromMid = 0;
        this.controlIsForward = true;
        this.setArrowhead();
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
            this.setControl(maybeControl1);
        } else {
            this.setControl(maybeControl2);
        }
        this.controlDistanceFromMid = newHeight * 2;
        if (head.y < tail.y) {
            this.controlIsForward = this.control.x >= midBase.x;
        } else if (head.y === tail.y && head.x > tail.x) {
            this.controlIsForward = this.control.y >= midBase.y;
        } else if (head.y === tail.y && head.x < tail.x) {
            this.controlIsForward = this.control.y < midBase.y;
        } else {
            this.controlIsForward = this.control.x <= midBase.x;
        }
        this.setArrowhead();
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
            const newControl = midBase.ptAlongSlope(m, controlDistanceFromMid);
            this.setControl(newControl);
        } else {
            const newControl = { x: midBase.x, y: midBase.y + controlDistanceFromMid };
            this.setControl(newControl);
        }
        this.setArrowhead();
    }
}

// ********************************************************
// Loop Edge Class
// ********************************************************

class LoopEdge extends Edge {
    constructor(state, control = null) {
        super(state, state);
        this.startPt = new Pt(state.x - state.radius / 2, state.y);
        this.endPt = new Pt(state.x + state.radius / 2, state.y);
        if (control === null) {
            this.control = new Pt(state.x, state.y - state.radius * 4);
        } else {
            this.control = control;
        }
        this.setArrowhead();
    }

    slideVertex(x, y) {
        const state = this.head;
        const newVertex = new Pt(x, y);
        const distance = newVertex.distanceTo(state);
        const m = newVertex.slopeTo(state);
        const maybeControl1 = newVertex.ptAlongSlope(m, -1 * distance);
        const maybeControl2 = newVertex.ptAlongSlope(m, distance);
        if (state.distanceTo(maybeControl1) > state.distanceTo(maybeControl2)) {
            this.control = maybeControl1;
        } else {
            this.control = maybeControl2;
        }
        const p0 = new Pt(5, newVertex.perpendicularFunction(5, state));
        const p1 = new Pt(50, newVertex.perpendicularFunction(50, state));
        const slope = p0.slopeTo(p1);
        if (newVertex.y < state.y) {
            this.startPt = state.ptAlongSlope(slope, -1 * state.radius / 2);
            this.endPt = state.ptAlongSlope(slope, state.radius / 2);
        } else {
            this.startPt = state.ptAlongSlope(slope, state.radius / 2);
            this.endPt = state.ptAlongSlope(slope, -1 * state.radius / 2);
        }
        this.setArrowhead();
    }

    readjustForChangedEndpoint() {
        console.log('must implement');
    }
}

// ********************************************************
// State Class
// ********************************************************

// eslint-disable-next-line no-unused-vars
class State extends Pt {
    constructor(x, y, radius, colour = 'black') {
        super(x, y);
        this.radius = radius;
        this.outEdges = [];
        this.inEdges = [];
        this.colour = colour;
    }

    draw() {
        canvas.drawCircle(this, this.radius, this.colour);
    }

    drawOutEdges() {
        for (let i = 0; i < this.outEdges.length; i++) {
            this.outEdges[i].draw();
        }
    }

    setCenter(x, y) {
        this.x = x;
        this.y = y;
        for (let i = 0; i < this.outEdges.length; i++) {
            this.outEdges[i].readjustForChangedEndpoint();
        }
        for (let i = 0; i < this.inEdges.length; i++) {
            this.inEdges[i].readjustForChangedEndpoint();
        }
    }

    slideOutEdgeVertex(x, y, index) {
        this.outEdges[index].slideVertex(x, y);
    }

    contains(x, y) {
        const distance = this.distanceTo({ x, y });
        return distance <= this.radius;
    }

    outEdgeVertexContains(x, y) {
        for (let i = 0; i < this.outEdges.length; i++) {
            if (this.outEdges[i].vertexContains(x, y)) {
                return i;
            }
        }
        return null;
    }

    edgeContains(x, y) {
        return this.outEdge.contains(x, y);
    }

    makeOutEdgeTo(tail) {
        let newEdge;
        if (tail !== this) {
            newEdge = new NonLoopEdge(this, tail);
        } else {
            newEdge = new LoopEdge(this);
        }
        this.outEdges.push(newEdge);
        tail.inEdges.push(newEdge);
    }
}