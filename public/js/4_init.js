/*
    Init.js
    Setup the canvas for drawing digraphs.
*/

console.log('Adrian Clinansmith');

// ********************************
// Initialize Graph
// ********************************

/* global State canvas */

const rad = 30;
const statesArray = [new State(150, 200, rad), new State(350, 200, rad), new State(150, 300, rad),
    new State(450, 200, rad), new State(250, 300, rad)];
statesArray[0].makeOutEdgeTo(statesArray[1]);
statesArray[0].makeOutEdgeTo(statesArray[2]);
statesArray[1].makeOutEdgeTo(statesArray[3]);
statesArray[0].makeOutEdgeTo(statesArray[4]);
statesArray[4].makeOutEdgeTo(statesArray[1]);
statesArray[2].makeOutEdgeTo(statesArray[4]);
statesArray[0].makeOutEdgeTo(statesArray[0]);

for (let i = 0; i < statesArray.length; i++) {
    statesArray[i].drawOutEdges();
}
for (let i = 0; i < statesArray.length; i++) {
    statesArray[i].draw();
}
// ********************************
// Event Listeners
// ********************************

let stateToDrag = null;
let edgeWithVertexToDrag = null;
let edgeWithLabelToEdit = null;

canvas.element.addEventListener('mousedown', function(event) {
    const { x, y } = canvas.eventPointInCanvas(event);
    let j = null;
    for (let i = 0; i < statesArray.length; i++) {
        if (statesArray[i].contains(x, y)) {
            stateToDrag = statesArray[i];
            return;
        } else if ((j = statesArray[i].outEdgeVertexContains(x, y)) !== null) {
            edgeWithVertexToDrag = statesArray[i].outEdges[j];
            return;
        } else if ((j = statesArray[i].outEdgeLabelContains(x, y)) !== null) {
            edgeWithLabelToEdit = statesArray[i].outEdges[j];
            return;
        }
    }
});

canvas.element.addEventListener('mouseup', function(event) {
    stateToDrag = null;
    edgeWithVertexToDrag = null;
    if (edgeWithLabelToEdit !== null) {
        edgeWithLabelToEdit.label.textInput.focus();
        edgeWithLabelToEdit = null;
    }
});

canvas.element.addEventListener('mousemove', function(event) {
    if (stateToDrag === null && edgeWithVertexToDrag === null) {
        return;
    }
    canvas.clear();
    const { x, y } = canvas.eventPointInCanvas(event);
    if (stateToDrag !== null) {
        stateToDrag.setCenter(x, y);
    }
    if (edgeWithVertexToDrag !== null) {
        edgeWithVertexToDrag.slideVertex(x, y);
    }
    // draw all vertices
    for (let i = 0; i < statesArray.length; i++) {
        statesArray[i].drawOutEdges();
    }
    // draw all edges
    for (let i = 0; i < statesArray.length; i++) {
        statesArray[i].draw();
    }
});
