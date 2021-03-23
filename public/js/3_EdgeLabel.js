/* global Pt */

// ********************************************************
// Edge Label Class
// ********************************************************

// eslint-disable-next-line no-unused-vars
class EdgeLabel {
    constructor(edge) {
        const textInput = document.createElement('input');
        textInput.setAttribute('type', 'text');
        textInput.setAttribute('class', 'EdgeLabel');
        const thisLabel = this;
        textInput.oninput = function() {
            console.log('oninput');
            const textWidth = textInput.value.length || 1;
            textInput.style.width = textWidth + 'ch';
            thisLabel.readjustLabel();
        };
        this.textInput = textInput;
        this.bezierT = 0.5;
        this.verticalAnchor = 'bottom';
        this.horizontalAnchor = 'left';
        this.edge = edge;
        document.getElementById('CanvasDiv').appendChild(textInput);
        this.readjustLabel();
    }

    focusIfNotEmpty() {
        if (this.textInput.value.length !== 0) {
            this.textInput.focus();
        }
    }

    labelContains(pt) {
        const textInput = this.textInput;
        const width = textInput.scrollWidth;
        const height = textInput.scrollHeight;
        const left = Number(textInput.style.left.replace(/[^.\d]/g, ''));
        const top = Number(textInput.style.top.replace(/[^.\d]/g, ''));
        const topLeftPt = new Pt(left, top);
        const bottomRightPt = new Pt(left + width, top + height);
        return pt.x > topLeftPt.x && pt.x < bottomRightPt.x && pt.y > topLeftPt.y && pt.y < bottomRightPt.y;
    }

    readjustLabel() {
        const verticalAnchor = this.verticalAnchor;
        const horizontalAnchor = this.horizontalAnchor;
        const t = this.bezierT;
        const location = this.edge.bezier(t);
        const labelHeight = this.textInput.scrollHeight;
        const labelWidth = this.textInput.scrollWidth;
        const deriv = this.edge.bezierDerivative(t);
        // console.log(`t: ${t}, d: (${deriv.x}, ${deriv.y})`);
        // the curve is more horizontal at t
        if (Math.abs(deriv.x) > Math.abs(deriv.y)) {
            // top anchor
            if (verticalAnchor === 'top') {
                const topString = `${location.y}px`;
                this.textInput.style.top = topString;
            // bottom anchor
            } else {
                const topString = `${location.y - labelHeight}px`;
                this.textInput.style.top = topString;
            }
            // mid-horizontal anchor
            if (Math.abs(deriv.y) < 60) {
                let dy = deriv.y;
                if (this.edge.head.x > this.edge.tail.x) dy *= -1;
                if (verticalAnchor === 'top') dy *= -1;
                const leftString = `${location.x - (labelWidth / 2) * (dy / 60 + 1)}px`;
                this.textInput.style.left = leftString;
            // right anchor
            } else if ((deriv.x * deriv.y > 0 && verticalAnchor === 'top') ||
                        (deriv.x * deriv.y <= 0 && verticalAnchor === 'bottom')) {
                this.textInput.style.left = `${location.x - labelWidth}px`;
            // left anchor
            } else {
                this.textInput.style.left = `${location.x}px`;
            }
        // the curve is more vertical at t
        } else {
            // left anchor
            if (horizontalAnchor === 'left') {
                this.textInput.style.left = `${location.x}px`;
            // right anchor
            } else {
                this.textInput.style.left = `${location.x - labelWidth}px`;
            }
            // mid-vertical anchor
            if (Math.abs(deriv.x) < 60) {
                let dx = deriv.x;
                if (this.edge.head.y > this.edge.tail.y) dx *= -1;
                if (horizontalAnchor === 'left') dx *= -1;
                const topString = `${location.y - (labelHeight / 2) * (dx / 60 + 1)}px`;
                this.textInput.style.top = topString;
            // top anchor
            } else if ((deriv.x * deriv.y > 0 && horizontalAnchor === 'right') ||
                (deriv.x * deriv.y <= 0 && horizontalAnchor === 'left')) {
                this.textInput.style.top = `${location.y}px`;
            // bottom anchor
            } else {
                this.textInput.style.top = `${location.y - labelHeight}px`;
            }
        }
    }

    slideLabel(pt) {
        if (this.textInput.value.length === 0) {
            return;
        }
        let t = this.bezierT;
        const forwardDistance = pt.distanceTo(this.edge.bezier(t + 0.001));
        const backwardDistance = pt.distanceTo(this.edge.bezier(t - 0.001));
        const increment = forwardDistance < backwardDistance ? 0.0001 : -0.0001;
        let lastDistance = Infinity;
        let ptOnCurve;
        // let iterations = 0;
        while (t > 0 && t <= 1) {
            // iterations += 1;
            ptOnCurve = this.edge.bezier(t);
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
        // console.log(`iterations: ${iterations}`);
        // Q1
        const directionPt = ptOnCurve.minusPt(pt);
        if (directionPt.x > 0 && directionPt.y < 0) {
            this.verticalAnchor = 'top';
            this.horizontalAnchor = 'right';
        // Q2
        } else if (directionPt.x < 0 && directionPt.y < 0) {
            this.verticalAnchor = 'top';
            this.horizontalAnchor = 'left';
        // Q3
        } else if (directionPt.x < 0 && directionPt.y > 0) {
            this.verticalAnchor = 'bottom';
            this.horizontalAnchor = 'left';
        // Q4
        } else if (directionPt.x > 0 && directionPt.y > 0) {
            this.verticalAnchor = 'bottom';
            this.horizontalAnchor = 'right';
        }
        this.bezierT = t;
        this.readjustLabel();
    }
}
