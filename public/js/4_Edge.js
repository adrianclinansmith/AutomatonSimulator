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
        this.onVertex = false;
    }

    // The endpoints are where the curve meets the rims of the head & tail.
    calculateEndpoints(head = this.head, tail = this.tail) {
        const curve = new Curve(head, this.controlPt, tail);
        const incrementsArray = [0.001, 0.005, 0.01, 0.05];
        let increment = incrementsArray.pop();
        let t = 0;
        // let iterations = 0;
        while (increment && t < 0.5) {
            // iterations++;
            const pt = curve.bezier(t);
            if (this.tail.contains(pt)) {
                t += increment;
            } else {
                t -= increment;
                increment = incrementsArray.pop();
                t += increment || 0;
            }
        }
        // console.log('itertions: ' + iterations);
        this.endPt = curve.bezier(t);
        this.startPt = curve.bezier(1 - t);
    }

    draw(canvas, colour = 'black', shouldDrawVertex = false) {
        super.draw(canvas, colour);
        if (shouldDrawVertex) {
            canvas.drawCircle(this.vertex(), 5, colour);
        }
    }

    labelContains(pt) {
        return this.label?.labelContains(pt);
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
    constructor(head, tail, controlPt = null, hasLabel = false) {
        super(head, tail);
        if (controlPt === null) {
            this.controlPt = head.ptBetween(tail);
        } else {
            this.controlPt = controlPt;
        }
        this.calculateEndspointsArrowAndLabel();
        this.controlDistanceFromMid = 0;
        this.controlIsForward = true;
        if (hasLabel) {
            this.label = new EdgeLabel(this);
        }
    }

    // The axis of symmetry is a linear function that is perpendicular to
    // the line between the head and tail. Here it's in point-slope form.
    axisOfSymmetry(x, inverse = false) {
        const slope = this.axisOfSymmetrySlope();
        const midPt = this.startPt.ptBetween(this.endPt);
        if (inverse) {
            return (x - midPt.y) / slope + midPt.x;
        }
        return slope * (x - midPt.x) + midPt.y;
    }

    axisOfSymmetrySlope() {
        return -1 / this.head.slopeTo(this.tail);
    }

    // If the head or tail has moved then an endpoint has moved also,
    // so the curve must be recalculated.
    readjustForChangedEndpoint() {
        const head = this.head;
        const tail = this.tail;
        const controlIsForward = this.controlIsForward;
        let controlDistanceFromMid = this.controlDistanceFromMid;
        const tailIsAboveHead = head.y > tail.y || (head.y === tail.y && head.x < tail.x);
        if ((controlIsForward && tailIsAboveHead) ||
            !(controlIsForward || tailIsAboveHead)) {
            controlDistanceFromMid *= -1;
        }
        const midPt = this.startPt.ptBetween(this.endPt);
        const m = this.axisOfSymmetrySlope();
        this.controlPt = midPt.ptAlongSlope(m, controlDistanceFromMid);
        this.calculateEndspointsArrowAndLabel();
    }

    // The vertex must slide along the curve's axis of symmetry.
    slideVertex(pt) {
        const slope = this.axisOfSymmetrySlope();
        const vertex = new Pt();
        vertex.x = Math.abs(slope) < 1 ? pt.x : this.axisOfSymmetry(pt.y, true);
        vertex.y = Math.abs(slope) < 1 ? this.axisOfSymmetry(pt.x) : pt.y;
        const midPt = this.startPt.ptBetween(this.endPt);
        let vertexHeight = vertex.distanceTo(midPt);
        if (vertex.distanceTo(this.head.ptBetween(this.tail)) < 10) {
            this.controlPt = this.head.ptBetween(this.tail);
            vertexHeight = 0;
        } else {
            const c1 = midPt.ptAlongSlope(slope, vertexHeight * 2);
            const c2 = midPt.ptAlongSlope(slope, vertexHeight * -2);
            this.controlPt = vertex.closestTo(c1, c2);
        }
        this.controlDistanceFromMid = vertexHeight * 2;
        const head = this.head;
        const tail = this.tail;
        if (head.y < tail.y) {
            this.controlIsForward = this.controlPt.x >= midPt.x;
        } else if (head.y === tail.y && head.x > tail.x) {
            this.controlIsForward = this.controlPt.y >= midPt.y;
        } else if (head.y === tail.y && head.x < tail.x) {
            this.controlIsForward = this.controlPt.y < midPt.y;
        } else {
            this.controlIsForward = this.controlPt.x <= midPt.x;
        }
        this.calculateEndspointsArrowAndLabel();
    }

    calculateEndspointsArrowAndLabel() {
        this.calculateEndpoints();
        this.setArrowhead();
        this.label?.readjustLabel();
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
    constructor(state, controlPt = null, hasLabel = false) {
        super(state, state);
        if (controlPt === null) {
            this.controlPt = new Pt(state.x, state.y - state.radius * 4);
            this.calculateEndpoints(0);
        } else {
            this.controlPt = controlPt;
            this.calculateEndpoints(-1 / controlPt.slopeTo(state));
        }
        this.setArrowhead();
        this.setOffsets();
        if (hasLabel) {
            this.label = new EdgeLabel(this);
        }
    }

    // There is only one state in a self-loop, so the endpoints are cacluated
    // from the ends of a line segment with the given slope that's centered at
    // the state's center.
    calculateEndpoints(slope) {
        const state = this.head;
        const p0 = state.ptAlongSlope(slope, -1 * state.radius / 2);
        const p1 = state.ptAlongSlope(slope, state.radius / 2);
        if (this.controlPt.y < state.y) {
            super.calculateEndpoints(p0, p1);
        } else {
            super.calculateEndpoints(p1, p0);
        }
    }

    // If the state has moved then the endpoints have to move with it.
    readjustForChangedEndpoint() {
        this.startPt = this.head.addPt(this.stateOffset.startPt);
        this.endPt = this.head.addPt(this.stateOffset.endPt);
        this.controlPt = this.head.addPt(this.stateOffset.controlPt);
        this.setArrowhead();
        this.label?.readjustLabel();
    }

    // The start, end, & control's offsets from the state's center.
    setOffsets() {
        const startPt = this.startPt.minusPt(this.head);
        const endPt = this.endPt.minusPt(this.head);
        const controlPt = this.controlPt.minusPt(this.head);
        this.stateOffset = { startPt, endPt, controlPt };
    }

    slideVertex(newVertexPt) {
        const state = this.head;
        const distance = newVertexPt.distanceTo(state) - state.radius;
        const m = newVertexPt.slopeTo(state);
        const c1 = newVertexPt.ptAlongSlope(m, -1 * distance);
        const c2 = newVertexPt.ptAlongSlope(m, distance);
        this.controlPt = state.farthestFrom(c1, c2);
        this.calculateEndpoints(-1 / m);
        this.setArrowhead();
        this.setOffsets();
        this.label?.readjustLabel();
    }
}
