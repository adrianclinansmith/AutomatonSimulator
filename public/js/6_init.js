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

staticCanvas.element.addEventListener('mousedown', function(event) {
    console.log('mouse down on static canvas');
    const clickedPt = staticCanvas.eventPointInCanvas(event);
    for (let i = 0; i < statesArray.length; i++) {
        const state = statesArray[i];
        // state.outEdgeContains(clickedPt);
        let edgeIndex = state.outEdgeVertexContains(clickedPt);
        if (edgeIndex !== null) {
            edgeWithVertexToDrag = state.outEdges[edgeIndex];
            dynamicCanvas.allowsPointerEvents(true);
            break;
        }
        edgeIndex = state.outEdgeLabelContains(clickedPt);
        if (edgeIndex !== null) {
            edgeWithLabelToEdit = state.outEdges[edgeIndex];
            break;
        }
        if (state.contains(clickedPt)) {
            stateToDrag = state;
            dynamicCanvas.allowsPointerEvents(true);
            break;
        }
    }
    if (!edgeWithVertexToDrag && !stateToDrag) {
        console.log('\tstatic mouse down return');
        return;
    }
    staticCanvas.clear();
    // draw all states
    statesArray.forEach(state => {
        const canvas = state === stateToDrag ? dynamicCanvas : staticCanvas;
        state.draw(canvas);
    });
    // draw all edges
    statesArray.forEach(state => {
        if (state === stateToDrag) {
            return;
        }
        state.drawOutEdges(staticCanvas, edge => {
            return edge.tail !== stateToDrag && edge !== edgeWithVertexToDrag;
        });
    });
    stateToDrag?.drawAllEdges(dynamicCanvas);
    edgeWithVertexToDrag?.draw(dynamicCanvas);
});

dynamicCanvas.element.addEventListener('mouseup', function(event) {
    console.log('mouse up on dynamic canvas');
    dynamicCanvas.allowsPointerEvents(false);
    stateToDrag = null;
    edgeWithVertexToDrag = null;
    if (edgeWithLabelToEdit !== null) {
        edgeWithLabelToEdit.label.textInput.focus();
        edgeWithLabelToEdit = null;
    }
});

dynamicCanvas.element.addEventListener('mousemove', function(event) {
    console.log('mouse move on dynamic canvas');

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
