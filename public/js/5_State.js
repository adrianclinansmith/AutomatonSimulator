/* global canvas Pt NonLoopEdge LoopEdge */

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

    contains(pt) {
        const distance = this.distanceTo(pt);
        return distance <= this.radius;
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
        for (let i = 0; i < this.outEdges.length; i++) {
            if (this.outEdges[i].contains(pt)) {
                return i;
            }
        }
        return null;
    }

    outEdgeVertexContains(pt) {
        for (let i = 0; i < this.outEdges.length; i++) {
            if (this.outEdges[i].vertexContains(pt)) {
                return i;
            }
        }
        return null;
    }

    outEdgeLabelContains(pt) {
        for (let i = 0; i < this.outEdges.length; i++) {
            if (this.outEdges[i].label.labelContains(pt)) {
                return i;
            }
        }
        return null;
    }

    focusOutEdgeLabel(outEdgeIndex) {
        const outEdge = this.outEdges[outEdgeIndex];
        outEdge.label.textInput.focus();
    }
}
