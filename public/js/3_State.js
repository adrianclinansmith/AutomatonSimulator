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

    outEdgeContains(x, y) {
        for (let i = 0; i < this.outEdges.length; i++) {
            if (this.outEdges[i].contains(x, y)) {
                return i;
            }
        }
        return null;
    }

    outEdgeVertexContains(x, y) {
        for (let i = 0; i < this.outEdges.length; i++) {
            if (this.outEdges[i].vertexContains(x, y)) {
                return i;
            }
        }
        return null;
    }

    outEdgeLabelContains(x, y) {
        for (let i = 0; i < this.outEdges.length; i++) {
            if (this.outEdges[i].labelContains(x, y)) {
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
