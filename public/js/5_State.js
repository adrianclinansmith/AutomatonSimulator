/* global Pt NonLoopEdge LoopEdge */

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

    contains(pt) {
        return this.ptIsWithinRadius(pt, this.radius) ? this : false;
    }

    draw(canvas) {
        canvas.drawCircle(this, this.radius, this.colour);
    }

    drawAllEdges(canvas) {
        for (let i = 0; i < this.outEdges.length; i++) {
            this.outEdges[i].draw(canvas);
        }
        for (let i = 0; i < this.inEdges.length; i++) {
            const inEdge = this.inEdges[i];
            if (inEdge.head !== inEdge.tail) {
                inEdge.draw(canvas);
            }
        }
    }

    drawOutEdges(canvas, predicate) {
        for (let i = 0; i < this.outEdges.length; i++) {
            const edge = this.outEdges[i];
            if (predicate === undefined || predicate(edge)) {
                edge.draw(canvas);
            }
        }
    }

    focusOutEdgeLabel(outEdgeIndex) {
        const outEdge = this.outEdges[outEdgeIndex];
        outEdge.label.textInput.focus();
    }

    hasEdge(edge) {
        return this.outEdges.includes(edge) || this.inEdges.includes(edge);
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

    outEdgeContains(pt) {
        let index = null;
        for (let i = 0; i < this.outEdges.length; i++) {
            const edge = this.outEdges[i];
            edge.isSelected = false;
            if (edge.contains(pt)) {
                edge.isSelected = true;
                index = i;
            }
        }
        return index !== null ? this.outEdges[index] : false;
    }

    outEdgeLabelContains(pt) {
        for (let i = 0; i < this.outEdges.length; i++) {
            if (this.outEdges[i].label.labelContains(pt)) {
                return this.outEdges[i];
            }
        }
        return false;
    }

    outEdgeVertexContains(pt) {
        for (let i = 0; i < this.outEdges.length; i++) {
            const edge = this.outEdges[i];
            if (edge.vertexContains(pt)) {
                edge.isSelected = true;
                return this.outEdges[i];
            }
        }
        return false;
    }

    setCenter(pt) {
        this.x = pt.x;
        this.y = pt.y;
        for (let i = 0; i < this.outEdges.length; i++) {
            this.outEdges[i].readjustForChangedEndpoint();
        }
        for (let i = 0; i < this.inEdges.length; i++) {
            this.inEdges[i].readjustForChangedEndpoint();
        }
    }

    slideOutEdgeVertex(pt, index) {
        this.outEdges[index].slideVertex(pt);
    }
}
