/* global LoopEdge NonLoopEdge State */

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
            // state.drawOutEdges(canvas);
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

    drawConnection(canvas, fromState, toPtOrState, colour) {
        canvas.clear();
        let curveToDraw;
        if (!fromState.contains(toPtOrState)) {
            curveToDraw = new NonLoopEdge(fromState, toPtOrState, null, false);
            curveToDraw.draw(canvas, colour);
        }
        if (toPtOrState instanceof State) {
            toPtOrState.draw(canvas, colour);
        } else if (fromState.contains(toPtOrState)) {
            const m = fromState.slopeTo(toPtOrState);
            const distance = fromState.radius / 2;
            let d = 1;
            if (toPtOrState.x < fromState.x ||
                (toPtOrState.x === fromState.x && toPtOrState.y < fromState.y)) {
                d = -1;
            }
            const controlPt = fromState.ptAlongSlope(m, distance * 10 * d);
            curveToDraw = new LoopEdge(fromState, controlPt, false);
            curveToDraw.draw(canvas, colour);
        }
        fromState.draw(canvas, colour);
        fromState.drawAllEdges(canvas, colour, true);
        return curveToDraw;
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

    move(element, toPt) {
        element.setCenter?.(toPt);
        element.slideLabel?.(toPt);
        element.slideVertex?.(toPt);
    }
}
