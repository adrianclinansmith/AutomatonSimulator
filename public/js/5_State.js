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
        return super.contains(pt, this.radius);
    }

    draw(canvas, colour = this.colour) {
        canvas.drawCircle(this, this.radius, colour);
    }

    drawAllEdges(canvas, color = this.colour, shouldDrawVertex = false) {
        for (let i = 0; i < this.outEdges.length; i++) {
            this.outEdges[i].draw(canvas, shouldDrawVertex, 'red');
        }
        for (let i = 0; i < this.inEdges.length; i++) {
            const inEdge = this.inEdges[i];
            if (inEdge.head !== inEdge.tail) {
                inEdge.draw(canvas, shouldDrawVertex, 'red');
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

    drawWithEdges(canvas, color = this.colour, shouldDrawVertex = false) {
        this.draw(canvas, color, shouldDrawVertex);
        this.drawAllEdges(canvas, color, shouldDrawVertex);
    }

    makeOutEdgeTo(tail, edge = null) {
        let newEdge;
        if (!edge && tail !== this) {
            newEdge = new NonLoopEdge(this, tail);
        } else if (!edge) {
            newEdge = new LoopEdge(this);
        } else {
            newEdge = edge;
        }
        this.outEdges.push(newEdge);
        tail.inEdges.push(newEdge);
        return newEdge;
    }

    outEdgeContains(pt) {
        for (const edge of this.outEdges) {
            if (edge.vertexContains(pt)) {
                edge.onVertex = true;
                return edge;
            } else if (edge.contains(pt)) {
                return edge;
            } else if (edge.labelContains(pt)) {
                return edge.label;
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
}
