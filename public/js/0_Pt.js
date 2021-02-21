// ********************************************************
// Pt Class
// ********************************************************

/*
Represents a point on the Cartesian plane.
*/

// eslint-disable-next-line no-unused-vars
class Pt {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /* Instance methods */

    addPt(addendPt) {
        return new Pt(this.x + addendPt.x, this.y + addendPt.y);
    }

    distanceTo(otherPt) {
        return Math.hypot(this.x - otherPt.x, this.y - otherPt.y);
    }

    minusPt(subtrahendPt) {
        return new Pt(this.x - subtrahendPt.x, this.y - subtrahendPt.y);
    }

    // A linear function f(x) that passes through this point and which has a
    // slope that is perpendicular to the line formed by this and toPt.
    perpendicularFunction(x, toPt, inverse = false) {
        const slope = (this.x - toPt.x) / (toPt.y - this.y);
        if (inverse) {
            return (x - toPt.y) / slope + toPt.x;
        }
        return slope * (x - toPt.x) + toPt.y;
    }

    ptAlongSlope(slope, distance) {
        if (Number.isFinite(slope) === false) {
            return new Pt(this.x, this.y + distance);
        }
        // source:
        // https://www.geeksforgeeks.org/find-points-at-a-given-distance-on-a-line-of-given-slope/
        const m = slope;
        const x = this.x + distance * Math.sqrt(1 / (1 + m * m));
        const y = this.y + m * distance * Math.sqrt(1 / (1 + m * m));
        return new Pt(x, y);
    }

    ptIsWithinRadius(otherPt, radius) {
        const distance = this.distanceTo(otherPt);
        return distance <= radius;
    }

    slopeTo(otherPt) {
        return (otherPt.y - this.y) / (otherPt.x - this.x);
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }

    /* Static methods */

    static mouseEventPtInElement(event, element) {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        return new Pt(x, y);
    }
}
