/* global Pt  */

// ********************************************************
// Canvas Class
// ********************************************************

/*
Contains methods to make drawing on the canvas more convenient.
*/

// eslint-disable-next-line no-unused-vars
class Canvas {
    constructor(canvasID, containerID = 'CanvasDiv', contextType = '2d') {
        /** @type {HTMLCanvasElement} */
        this.element = document.getElementById(canvasID);
        this.container = document.getElementById(containerID);
        this.context = this.element.getContext(contextType);
        // src: https://www.kirupa.com/canvas/canvas_high_dpi_retina.htm
        this.element.width = this.container.offsetWidth * devicePixelRatio;
        this.element.height = this.container.offsetHeight * devicePixelRatio;
        this.context.scale(devicePixelRatio, devicePixelRatio);
        this.element.style.width = this.container.offsetWidth + 'px';
        this.element.style.height = this.container.offsetHeight + 'px';
        this.context.lineWidth = 1.5;

        this.strokeStyle = 'black';
    }

    clear() {
        const width = this.element.width;
        const height = this.element.height;
        this.context.clearRect(0, 0, width, height);
    }

    drawCircle(centerPt, radius, colour = this.strokeStyle) {
        this.context.beginPath();
        this.context.arc(centerPt.x, centerPt.y, radius, 0, 2 * Math.PI);
        this.context.fillStyle = '#ebe9e9';
        this.context.fill();
        this.context.strokeStyle = colour;
        this.context.stroke();
    }

    drawLine(pt0, pt1, colour = this.strokeStyle) {
        this.context.beginPath();
        this.context.moveTo(pt0.x, pt0.y);
        const p2 = new Pt((pt0.x + pt1.x) / 2, (pt0.y + pt1.y) / 2);
        this.context.quadraticCurveTo(p2.x, p2.y, pt1.x, pt1.y);
        this.context.strokeStyle = colour;
        this.context.stroke();
    }

    drawQuadraticCurve(beginPt, ctrlPt, endPt, colour = this.strokeStyle) {
        this.context.beginPath();
        this.context.moveTo(beginPt.x, beginPt.y);
        this.context.quadraticCurveTo(ctrlPt.x, ctrlPt.y, endPt.x, endPt.y);
        this.context.strokeStyle = colour;
        this.context.stroke();
    }

    drawText(text, atPt) {
        this.context.fillStyle = 'black';
        this.context.font = '10px serif';
        this.context.textAlign = 'center';
        this.context.fillText(text, atPt.x, atPt.y);
    }

    linearBezier(t, p0, p1) {
        const x = (1 - t) * p0.x + t * p1.x;
        const y = (1 - t) * p0.y + t * p1.y;
        return new Pt(x, y);
    }

    setStrokeStyle(strokeStyle) {
        this.strokeStyle = strokeStyle;
    }
}
// const canvas = new Canvas();
