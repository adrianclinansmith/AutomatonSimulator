/*
    Init.js
    Setup the canvas for drawing digraphs.
*/

console.log('Adrian Clinansmith');

// ********************************
// Initialize Graph
// ********************************

/* global State Canvas */

const canvas = new Canvas();

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
    statesArray[i].drawOutEdges(canvas);
}
for (let i = 0; i < statesArray.length; i++) {
    statesArray[i].draw(canvas);
}
// ********************************
// Event Listeners
// ********************************

let stateToDrag = null;
let edgeWithVertexToDrag = null;
let edgeWithLabelToEdit = null;

canvas.element.addEventListener('mousedown', function(event) {
    const clickedPt = canvas.eventPointInCanvas(event);
    for (let i = 0; i < statesArray.length; i++) {
        const state = statesArray[i];
        state.outEdgeContains(clickedPt);
        let edgeIndex = state.outEdgeVertexContains(clickedPt);
        if (edgeIndex !== null) {
            edgeWithVertexToDrag = state.outEdges[edgeIndex];
            return;
        }
        edgeIndex = state.outEdgeLabelContains(clickedPt);
        if (edgeIndex !== null) {
            edgeWithLabelToEdit = state.outEdges[edgeIndex];
            return;
        }
        if (state.contains(clickedPt)) {
            stateToDrag = state;
            return;
        }
        //
        // if ((j = statesArray[i].outEdgeContains(clickedPt)) !== null) {
        //     console.log('CLICKED EDGE!');
        // }
    }
    if (statesArray[0].outEdges[0].contains(clickedPt)) {
        console.log('clicked edge');
    } else {
        console.log('didnt click');
    }
    // const t = Math.round(Math.random() * 100) / 100;
    // const pt = statesArray[0].outEdges[0].bezier(t);
    // const [t1, t2] = statesArray[0].outEdges[0].bezierInverse(pt);
    // console.log(`t: ${t}, t1: ${t1}, t2: ${t2}`);
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
    if (stateToDrag === null && edgeWithVertexToDrag === null && edgeWithLabelToEdit === null) {
        return;
    }
    const draggedPt = canvas.eventPointInCanvas(event);
    if (edgeWithLabelToEdit !== null) {
        edgeWithLabelToEdit.label.slideLabel(draggedPt);
        return;
    }
    canvas.clear();
    if (stateToDrag !== null) {
        stateToDrag.setCenter(draggedPt);
    } else if (edgeWithVertexToDrag !== null) {
        edgeWithVertexToDrag.slideVertex(draggedPt);
    }
    // draw all vertices
    for (let i = 0; i < statesArray.length; i++) {
        statesArray[i].draw(canvas);
    }
    // draw all edges
    for (let i = 0; i < statesArray.length; i++) {
        statesArray[i].drawOutEdges(canvas);
    }
});
