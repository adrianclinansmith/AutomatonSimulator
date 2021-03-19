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

    addPt(addendPt, multiplier = 1) {
        const x = (this.x + addendPt.x) * multiplier;
        const y = (this.y + addendPt.y) * multiplier;
        return new Pt(x, y);
    }

    distanceTo(otherPt) {
        return Math.hypot(this.x - otherPt.x, this.y - otherPt.y);
    }

    minusPt(subtrahendPt, multiplier = 1) {
        const x = (this.x - subtrahendPt.x) * multiplier;
        const y = (this.y - subtrahendPt.y) * multiplier;
        return new Pt(x, y);
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

    closestTo(p1, p2) {
        return this.distanceTo(p1) < this.distanceTo(p2) ? p1 : p2;
    }

    contains(otherPt, radius) {
        const distance = this.distanceTo(otherPt);
        return distance <= radius ? this : false;
    }

    farthestFrom(p1, p2) {
        return this.distanceTo(p1) > this.distanceTo(p2) ? p1 : p2;
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
