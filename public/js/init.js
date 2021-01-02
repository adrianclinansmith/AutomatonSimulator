/*
    Init.js
    Setup the canvas for drawing digraphs.
*/

console.log('Adrian Clinansmith');

// ********************************
// TEST
// ********************************

/* global State canvas */

const rad = 30;
const statesArray = [new State(150, 200, rad), new State(250, 200, rad), new State(150, 300, rad),
    new State(450, 200, rad), new State(250, 300, rad)];

statesArray[0].makeOutEdgeTo(statesArray[1]);
statesArray[0].makeOutEdgeTo(statesArray[2]);
statesArray[1].makeOutEdgeTo(statesArray[3]);
statesArray[0].makeOutEdgeTo(statesArray[4]);
statesArray[4].makeOutEdgeTo(statesArray[1]);
statesArray[2].makeOutEdgeTo(statesArray[4]);

statesArray[0].makeOutEdgeTo(statesArray[0]);

// const firstState = statesArray[0];
// const start = { x: firstState.x - rad / 2, y: firstState.y };
// const end = { x: firstState.x + rad / 2, y: firstState.y };
// const control = { x: firstState.x, y: firstState.y - rad * 4 };
// canvas.drawQuadraticCurve(start, control, end);

for (let i = 0; i < statesArray.length; i++) {
    statesArray[i].drawOutEdges();
}
for (let i = 0; i < statesArray.length; i++) {
    statesArray[i].draw();
}

// ********************************
// Event Listeners
// ********************************

let indexOfStateToDrag = null;
let indexOfStateAndEdgeToDrag = null;

canvas.element.addEventListener('mousedown', function(event) {
    const { x, y } = canvas.eventPointInCanvas(event);
    let j = null;
    for (let i = 0; i < statesArray.length; i++) {
        if (statesArray[i].contains(x, y)) {
            indexOfStateToDrag = i;
        } else if ((j = statesArray[i].outEdgeVertexContains(x, y)) !== null) {
            indexOfStateAndEdgeToDrag = { stateIndex: i, edgeIndex: j };
        }
        // if (circles[i].outEdge) {
        //     circles[i].edgeContains(x, y);
        // }
    }
});

canvas.element.addEventListener('mouseup', function(event) {
    indexOfStateToDrag = null;
    indexOfStateAndEdgeToDrag = null;
});

canvas.element.addEventListener('mousemove', function(event) {
    if (indexOfStateToDrag === null && indexOfStateAndEdgeToDrag === null) {
        return;
    }
    canvas.clear();
    const { x, y } = canvas.eventPointInCanvas(event);
    if (indexOfStateToDrag !== null) {
        statesArray[indexOfStateToDrag].setCenter(x, y);
    }
    if (indexOfStateAndEdgeToDrag !== null) {
        const stateIndex = indexOfStateAndEdgeToDrag.stateIndex;
        const edgeIndex = indexOfStateAndEdgeToDrag.edgeIndex;
        statesArray[stateIndex].slideOutEdgeVertex(x, y, edgeIndex);
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
