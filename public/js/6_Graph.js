/* global */

// eslint-disable-next-line no-unused-vars
class Graph {
    constructor() {
        this.states = [];
    }

    add(state) {
        this.states.push(state);
    }

    draw(canvas, exceptElement) {
        canvas.clear();
        for (const state of this.states) {
            if (state !== exceptElement) {
                state.draw(canvas);
            }
        }
        for (const state of this.states) {
            for (const outEdge of state.outEdges) {
                if (exceptElement !== outEdge &&
                    exceptElement !== outEdge.head &&
                    exceptElement !== outEdge.tail) {
                    outEdge.draw(canvas);
                }
            }
        }
    }

    drawElement(element, canvas, colour, shouldDrawVertex) {
        canvas.clear();
        element.draw?.(canvas, colour, shouldDrawVertex);
        element.drawAllEdges?.(canvas, colour, shouldDrawVertex);
    }

    elementContains(pt) {
        let selected;
        let i;
        for (i = this.states.length - 1; i >= 0; i--) {
            const state = this.states[i];
            selected = state.contains(pt) || state.outEdgeContains(pt);
            if (selected) {
                return selected;
            }
        }
        return false;
    }

    stateContains(pt) {
        for (let i = this.states.length - 1; i >= 0; i--) {
            const state = this.states[i];
            if (state.contains(pt)) {
                return state;
            }
        }
        return false;
    }
}
