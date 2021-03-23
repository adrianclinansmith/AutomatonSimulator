/* global */

// eslint-disable-next-line no-unused-vars
class Graph {
    constructor(staticCanvas, dynamicCanvas) {
        this.staticCanvas = staticCanvas;
        this.dynamicCanvas = dynamicCanvas;
        this.states = [];
        this.dynamicColour = 'red';
    }

    add(state) {
        return this.states.push(state);
    }

    drawToDynamic(element, colour = this.dynamicColour, shouldDrawVertex = true) {
        element.draw?.(this.dynamicCanvas, colour, shouldDrawVertex);
        element.drawAllEdges?.(this.dynamicCanvas, colour, shouldDrawVertex);
    }

    elementContains(pt) {
        let selected;
        for (let i = this.states.length - 1; i >= 0; i--) {
            const state = this.states[i];
            selected = state.contains(pt) || state.outEdgeContains(pt);
            if (selected) {
                return selected;
            }
        }
        return false;
    }

    redrawAllExcept(exceptElement) {
        this.staticCanvas.clear();
        for (const state of this.states) {
            if (state !== exceptElement) {
                state.draw(this.staticCanvas);
            }
        }
        for (const state of this.states) {
            for (const outEdge of state.outEdges) {
                if (exceptElement !== outEdge &&
                    exceptElement !== outEdge.head &&
                    exceptElement !== outEdge.tail) {
                    outEdge.draw(this.staticCanvas);
                }
            }
        }
    }

    redrawToDynamic(element, colour = this.dynamicColour, shouldDrawVertex = true) {
        this.dynamicCanvas.clear();
        this.drawToDynamic(element, colour, shouldDrawVertex);
    }

    sendToBack(state) {
        const i = this.states.indexOf(state);
        if (i > -1) {
            this.states.splice(i, 1);
            this.states.push(state);
        }
        return i > -1;
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
