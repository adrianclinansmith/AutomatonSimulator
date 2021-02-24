/*
    Init.js
    Setup the canvas for drawing digraphs.
*/

console.log('Adrian Clinansmith');

// ********************************
// Initialize Graph
// ********************************

/* global Pt Canvas EdgeLabel Edge State */

const staticCanvas = new Canvas('StaticCanvas');
const dynamicCanvas = new Canvas('DynamicCanvas');
const canvasDiv = document.getElementById('CanvasDiv');

const rad = 30;
const statesArray = [new State(150, 200, rad), new State(350, 200, rad),
    new State(150, 300, rad), new State(450, 200, rad), new State(250, 300, rad)];
statesArray[0].makeOutEdgeTo(statesArray[1]);
// statesArray[0].makeOutEdgeTo(statesArray[2]);
// statesArray[1].makeOutEdgeTo(statesArray[3]);
// statesArray[0].makeOutEdgeTo(statesArray[4]);
// statesArray[4].makeOutEdgeTo(statesArray[1]);
// statesArray[2].makeOutEdgeTo(statesArray[4]);
statesArray[0].makeOutEdgeTo(statesArray[0]);

for (let i = 0; i < statesArray.length; i++) {
    statesArray[i].drawOutEdges(staticCanvas);
}
for (let i = 0; i < statesArray.length; i++) {
    statesArray[i].draw(staticCanvas);
}
// ********************************
// Event Listeners
// ********************************

let selected = false;
let lastSelected = false;

canvasDiv.addEventListener('mousedown', event => {
    const mousePt = Pt.mouseEventPtInElement(event, canvasDiv);
    for (const state of statesArray) {
        // state.outEdgeContains(clickedPt);
        selected = state.contains(mousePt) || state.outEdgeContains(mousePt);
        if (selected) {
            break;
        }
    }
    if (selected === lastSelected) {
        return;
    }
    staticCanvas.clear();
    dynamicCanvas.clear();
    // draw all states
    for (const state of statesArray) {
        if (state === selected) {
            state.draw(dynamicCanvas, 'red');
        } else {
            state.draw(staticCanvas);
        }
    }
    // draw all edges
    for (const state of statesArray) {
        if (state !== selected) {
            state.drawOutEdges(staticCanvas, edge => {
                return ![edge, edge.tail].includes(selected);
            });
        }
    }
    if (selected instanceof State) {
        selected.drawAllEdges(dynamicCanvas, false, 'red');
    } else if (selected instanceof Edge) {
        selected.draw(dynamicCanvas, true, 'red');
    }
});

canvasDiv.addEventListener('mousemove', event => {
    if (!selected || (selected instanceof Edge && !selected.onVertex)) {
        return;
    }
    const mousePt = Pt.mouseEventPtInElement(event, canvasDiv);
    if (selected instanceof EdgeLabel) {
        selected.slideLabel(mousePt);
        return;
    }
    dynamicCanvas.clear();
    if (selected instanceof Edge) {
        selected.slideVertex(mousePt);
        selected.draw(dynamicCanvas, true, 'red');
    } else if (selected instanceof State) {
        selected.setCenter(mousePt);
        selected.draw(dynamicCanvas, 'red');
        selected.drawAllEdges(dynamicCanvas, false, 'red');
    }
});

canvasDiv.addEventListener('mouseup', event => {
    if (selected instanceof EdgeLabel) {
        selected.textInput.focus();
    } else if (selected instanceof Edge) {
        selected.onVertex = false;
    }
    lastSelected = selected;
    selected = false;
});
