/* global canvas Pt */

// ********************************************************
// Edge Class
// ********************************************************

const anchor = {
    BOTTOMLEFT: 0,
    BOTTOMRIGHT: 1,
    BOTTOMMIDDLE: 2
};

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

    setupLabel() {
        const textInput = document.createElement('input');
        textInput.setAttribute('type', 'text');
        textInput.setAttribute('class', 'EdgeLabel');
        textInput.oninput = function() {
            const textWidth = textInput.value.length;
            textInput.style.width = (textWidth + 1) + 'ch';
        };
        document.getElementById('CanvasDiv').appendChild(textInput);
        this.label = { textInput, bezierT: 0.5, verticalAnchor: 'bottom', horizontalAnchor: 'left' };
        this.readjustLabel();
    }

    readjustLabel() {
        const verticalAnchor = this.label.verticalAnchor;
        const horizontalAnchor = this.label.horizontalAnchor;
        const t = this.label.bezierT;
        const location = this.bezier(t);
        const labelHeight = this.label.textInput.scrollHeight;
        const labelWidth = this.label.textInput.scrollWidth;
        const deriv = this.bezierDerivative(t);
        // the curve is more horizontal at t
        if (Math.abs(deriv.x) > Math.abs(deriv.y)) {
            // top anchor
            if (verticalAnchor === 'top') {
                this.label.textInput.style.top = location.y;
            // bottom anchor
            } else {
                this.label.textInput.style.top = location.y - labelHeight;
            }
            // mid-horizontal anchor
            if (Math.abs(deriv.y) < 20) {
                this.label.textInput.style.left = location.x - labelWidth / 2;
            // right anchor
            } else if ((deriv.x * deriv.y > 0 && verticalAnchor === 'top') ||
                        (deriv.x * deriv.y <= 0 && verticalAnchor === 'bottom')) {
                this.label.textInput.style.left = location.x - labelWidth;
            // left anchor
            } else {
                this.label.textInput.style.left = location.x;
            }
        // the curve is more vertical at t
        } else {
            // left anchor
            if (horizontalAnchor === 'left') {
                this.label.textInput.style.left = location.x;
            // right anchor
            } else {
                this.label.textInput.style.left = location.x - labelWidth;
            }
            // mid-vertical anchor
            if (Math.abs(deriv.x) < 20) {
                this.label.textInput.style.top = location.y - labelHeight / 2;
            // top anchor
            } else if ((deriv.x * deriv.y > 0 && horizontalAnchor === 'right') ||
                (deriv.x * deriv.y <= 0 && horizontalAnchor === 'left')) {
                this.label.textInput.style.top = location.y;
            // bottom anchor
            } else {
                this.label.textInput.style.top = location.y - labelHeight;
            }
        }
    }

    labelContains(x, y) {
        const textInput = this.label.textInput;
        const width = textInput.scrollWidth;
        const height = textInput.scrollHeight;
        const left = Number(textInput.style.left.replace(/[^.\d]/g, ''));
        const top = Number(textInput.style.top.replace(/[^.\d]/g, ''));
        const topLeftPt = new Pt(left, top);
        const bottomRightPt = new Pt(left + width, top + height);
        return x > topLeftPt.x && x < bottomRightPt.x && y > topLeftPt.y && y < bottomRightPt.y;
    }

    slideLabel(x, y) {
        const pt = new Pt(x, y);
        let t = this.label.bezierT;
        const forwardDistance = pt.distanceTo(this.bezier(t + 0.001));
        const backwardDistance = pt.distanceTo(this.bezier(t - 0.001));
        const increment = forwardDistance < backwardDistance ? 0.001 : -0.001;
        let lastDistance = Infinity;
        let ptOnCurve;
        let iterations = 0;
        while (t > 0 && t <= 1) {
            iterations += 1;
            ptOnCurve = this.bezier(t);
            const currentDistance = pt.distanceTo(ptOnCurve);
            if (currentDistance > lastDistance) {
                break;
            }
            t += increment;
            lastDistance = currentDistance;
        }
        if (t <= 0 || t >= 1) {
            return;
        }
        // canvas.drawCircle(this.bezier(t), 3, 'purple');
        console.log(`iterations: ${iterations}`);
        // Q1
        const directionPt = ptOnCurve.minusPt(pt);
        if (directionPt.x > 0 && directionPt.y < 0) {
            this.label.verticalAnchor = 'top';
            this.label.horizontalAnchor = 'right';
        // Q2
        } else if (directionPt.x < 0 && directionPt.y < 0) {
            this.label.verticalAnchor = 'top';
            this.label.horizontalAnchor = 'left';
        // Q3
        } else if (directionPt.x < 0 && directionPt.y > 0) {
            this.label.verticalAnchor = 'bottom';
            this.label.horizontalAnchor = 'left';
        // Q4
        } else if (directionPt.x > 0 && directionPt.y > 0) {
            this.label.verticalAnchor = 'bottom';
            this.label.horizontalAnchor = 'right';
        }
        this.label.bezierT = t;
        this.readjustLabel();
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
        this.startPt = head;
        this.endPt = tail;
        if (controlPt === null) {
            this.controlPt = new Pt((head.x + tail.x) / 2, (head.y + tail.y) / 2);
        } else {
            this.controlPt = controlPt;
        }
        this.controlDistanceFromMid = 0;
        this.controlIsForward = true;
        this.setArrowhead();
        this.setupLabel();
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
        this.setArrowhead();
        this.readjustLabel();
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
        this.setArrowhead();
        this.readjustLabel();
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
}

// ********************************************************
// Loop Edge Class
// ********************************************************

// eslint-disable-next-line no-unused-vars
class LoopEdge extends Edge {
    constructor(state, controlPt = null) {
        super(state, state);
        this.startPt = new Pt(state.x - state.radius / 2, state.y);
        this.endPt = new Pt(state.x + state.radius / 2, state.y);
        if (controlPt === null) {
            this.controlPt = new Pt(state.x, state.y - state.radius * 4);
        } else {
            this.controlPt = controlPt;
        }
        this.setArrowhead();
        this.setOffset();
        this.setupLabel();
    }

    slideVertex(x, y) {
        const state = this.head;
        const newVertex = new Pt(x, y);
        const distance = newVertex.distanceTo(state);
        const m = newVertex.slopeTo(state);
        const maybeControl1 = newVertex.ptAlongSlope(m, -1 * distance);
        const maybeControl2 = newVertex.ptAlongSlope(m, distance);
        if (state.distanceTo(maybeControl1) > state.distanceTo(maybeControl2)) {
            this.controlPt = maybeControl1;
        } else {
            this.controlPt = maybeControl2;
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
        this.setOffset();
        this.readjustLabel();
    }

    readjustForChangedEndpoint() {
        this.startPt = this.head.addPt(this.stateOffset.startPt);
        this.endPt = this.head.addPt(this.stateOffset.endPt);
        this.controlPt = this.head.addPt(this.stateOffset.controlPt);
        this.setArrowhead();
        this.readjustLabel();
    }

    setOffset() {
        const startPt = this.startPt.minusPt(this.head);
        const endPt = this.endPt.minusPt(this.head);
        const controlPt = this.controlPt.minusPt(this.head);
        this.stateOffset = { startPt, endPt, controlPt };
    }
}
