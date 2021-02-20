/*
    Init.js
    Setup the canvas for drawing digraphs.
*/

console.log('Adrian Clinansmith');

// ********************************
// Initialize Graph
// ********************************

/* global State Canvas */

const staticCanvas = new Canvas('StaticCanvas');
const dynamicCanvas = new Canvas('DynamicCanvas');
const canvasDiv = document.getElementById('CanvasDiv');
dynamicCanvas.allowsPointerEvents(false);

const rad = 30;
const statesArray = [new State(150, 200, rad), new State(350, 200, rad), new State(150, 300, rad),
    new State(450, 200, rad), new State(250, 300, rad)];
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

let stateToDrag = null;
let edgeWithVertexToDrag = null;
let edgeWithLabelToEdit = null;

canvasDiv.addEventListener('mousedown', event => {
    const clickedPt = staticCanvas.eventPointInCanvas(event);
    for (const state of statesArray) {
        // state.outEdgeContains(clickedPt);
        const clickedSomething =
        (edgeWithVertexToDrag = state.outEdgeVertexContains(clickedPt)) ||
        (edgeWithLabelToEdit = state.outEdgeLabelContains(clickedPt)) ||
        (stateToDrag = state.contains(clickedPt) ? state : null);
        if (clickedSomething) {
            break;
        }
    }
    if (!edgeWithVertexToDrag && !stateToDrag) {
        return;
    }
    dynamicCanvas.allowsPointerEvents(true);
    staticCanvas.clear();
    // draw all states
    for (const state of statesArray) {
        const canvas = state === stateToDrag ? dynamicCanvas : staticCanvas;
        state.draw(canvas);
    }
    // draw all edges
    for (const state of statesArray) {
        if (state === stateToDrag) {
            continue;
        }
        state.drawOutEdges(staticCanvas, edge => {
            return edge.tail !== stateToDrag && edge !== edgeWithVertexToDrag;
        });
    }
    stateToDrag?.drawAllEdges(dynamicCanvas);
    edgeWithVertexToDrag?.draw(dynamicCanvas);
});

canvasDiv.addEventListener('mousemove', event => {
    if (edgeWithLabelToEdit) {
        const draggedPt = staticCanvas.eventPointInCanvas(event);
        edgeWithLabelToEdit.label.slideLabel(draggedPt);
    }
});

canvasDiv.addEventListener('mouseup', event => {
    if (edgeWithLabelToEdit) {
        edgeWithLabelToEdit.label.textInput.focus();
        edgeWithLabelToEdit = null;
    }
});

dynamicCanvas.element.addEventListener('mousemove', event => {
    const draggedPt = dynamicCanvas.eventPointInCanvas(event);
    dynamicCanvas.clear();
    if (stateToDrag !== null) {
        stateToDrag.setCenter(draggedPt);
        stateToDrag.draw(dynamicCanvas);
        stateToDrag.drawAllEdges(dynamicCanvas);
    } else if (edgeWithVertexToDrag !== null) {
        edgeWithVertexToDrag.slideVertex(draggedPt);
        edgeWithVertexToDrag.draw(dynamicCanvas);
    }
});

dynamicCanvas.element.addEventListener('mouseup', event => {
    dynamicCanvas.allowsPointerEvents(false);
    stateToDrag = null;
    edgeWithVertexToDrag = null;
});
