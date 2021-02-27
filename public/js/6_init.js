/*
    Init.js
    Setup the canvas for drawing digraphs.
*/

console.log('Adrian Clinansmith');

// ********************************
// Initialize Graph
// ********************************

/* global Pt Canvas EdgeLabel Edge State */

const canvasDiv = document.getElementById('CanvasDiv');
const staticCanvas = new Canvas('StaticCanvas');
const dynamicCanvas = new Canvas('DynamicCanvas');

const rad = 30;
const statesArray = [new State(150, 200, rad), new State(350, 200, rad),
    new State(150, 300, rad), new State(450, 200, rad), new State(250, 300, rad)];
statesArray[0].makeOutEdgeTo(statesArray[1]);
statesArray[0].makeOutEdgeTo(statesArray[2]);
statesArray[3].makeOutEdgeTo(statesArray[0]);
statesArray[0].makeOutEdgeTo(statesArray[0]);

for (let i = 0; i < statesArray.length; i++) {
    statesArray[i].drawOutEdges(staticCanvas);
}
for (let i = 0; i < statesArray.length; i++) {
    statesArray[i].draw(staticCanvas);
}

// ********************************
// Canvas Div Event Listeners
// ********************************

let selected = false;
let mouseIsDown = false;

canvasDiv.addEventListener('mousedown', event => {
    mouseIsDown = true;
    const mousePt = Pt.mouseEventPtInElement(event, canvasDiv);
    let toSelect = false;
    let i;
    for (i = statesArray.length - 1; i >= 0; i--) {
        const state = statesArray[i];
        toSelect = state.contains(mousePt) || state.outEdgeContains(mousePt);
        if (toSelect) {
            break;
        }
    }
    if (toSelect === selected) {
        return;
    }
    if (toSelect instanceof State) {
        statesArray.splice(i, 1);
        statesArray.push(toSelect);
    }
    selected = toSelect;
    redrawAll();
});

canvasDiv.addEventListener('mousemove', event => {
    if (!mouseIsDown || (selected instanceof Edge && !selected.onVertex)) {
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
        selected.drawAllEdges(dynamicCanvas);
    }
});

canvasDiv.addEventListener('mouseup', event => {
    mouseIsDown = false;
    if (selected instanceof EdgeLabel) {
        selected.textInput.focus();
    } else if (selected instanceof Edge) {
        selected.onVertex = false;
    }
});

// ********************************
// Button Event Listeners
// ********************************

const newStateButton = document.getElementById('NewStateButton');

newStateButton.addEventListener('click', () => {
    const x = rad + 20 + Math.random() * 10;
    const y = canvasDiv.offsetHeight - x - Math.random() * 10;
    statesArray.push(new State(x, y, rad));
    redrawAll();
});

// ********************************
// Drawing functions
// ********************************

function redrawAll() {
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
        if (state === selected) {
            continue;
        }
        state.drawOutEdges(staticCanvas, edge => {
            return ![edge, edge.tail].includes(selected);
        });
    }
    if (selected instanceof State) {
        selected.drawAllEdges(dynamicCanvas);
    } else if (selected instanceof Edge) {
        selected.draw(dynamicCanvas, true, 'red');
    }
}
