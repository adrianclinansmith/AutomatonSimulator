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

let clickedSomething = false;

canvasDiv.addEventListener('mousedown', event => {
    const clickedPt = Pt.mouseEventPtInElement(event, canvasDiv);
    for (const state of statesArray) {
        // state.outEdgeContains(clickedPt);
        clickedSomething =
            state.outEdgeVertexContains(clickedPt) ||
            state.outEdgeLabelContains(clickedPt) ||
            state.contains(clickedPt);
        if (clickedSomething) {
            break;
        }
    }
    if (!clickedSomething || clickedSomething instanceof EdgeLabel) {
        return;
    }
    staticCanvas.clear();
    // draw all states
    for (const state of statesArray) {
        const canvas = state === clickedSomething ? dynamicCanvas : staticCanvas;
        state.draw(canvas);
    }
    // draw all edges
    for (const state of statesArray) {
        if (state === clickedSomething) {
            continue;
        }
        state.drawOutEdges(staticCanvas, edge => {
            return ![edge, edge.tail].includes(clickedSomething);
        });
    }
    if (clickedSomething instanceof State) {
        clickedSomething.drawAllEdges(dynamicCanvas);
    } else {
        clickedSomething.draw(dynamicCanvas);
    }
});

canvasDiv.addEventListener('mousemove', event => {
    if (!clickedSomething) {
        return;
    }
    const draggedPt = Pt.mouseEventPtInElement(event, canvasDiv);
    if (clickedSomething instanceof EdgeLabel) {
        clickedSomething.slideLabel(draggedPt);
        return;
    }
    dynamicCanvas.clear();
    if (clickedSomething instanceof Edge) {
        clickedSomething.slideVertex(draggedPt);
        clickedSomething.draw(dynamicCanvas);
    } else if (clickedSomething instanceof State) {
        clickedSomething.setCenter(draggedPt);
        clickedSomething.draw(dynamicCanvas);
        clickedSomething.drawAllEdges(dynamicCanvas);
    }
});

canvasDiv.addEventListener('mouseup', event => {
    if (clickedSomething instanceof EdgeLabel) {
        clickedSomething.textInput.focus();
    }
    clickedSomething = false;
});
