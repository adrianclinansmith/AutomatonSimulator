/*
    Init.js
    Setup the canvas for drawing digraphs.
*/

console.log('Adrian Clinansmith');

// ********************************
// Initialize Graph
// ********************************

/* global Pt Canvas EdgeLabel Edge Graph State */

const canvasDiv = document.getElementById('CanvasDiv');
const staticCanvas = new Canvas('StaticCanvas');
const dynamicCanvas = new Canvas('DynamicCanvas');

const graph = new Graph();

const rad = 30;

graph.add(new State(150, 200, rad));
graph.add(new State(350, 200, rad));
graph.add(new State(150, 300, rad));
graph.add(new State(450, 200, rad));
graph.add(new State(250, 300, rad));

graph.states[0].makeOutEdgeTo(graph.states[1]);
graph.states[0].makeOutEdgeTo(graph.states[0]);
graph.states[1].makeOutEdgeTo(graph.states[2]);

graph.draw(staticCanvas);

// ********************************
// Canvas Div Event Listeners
// ********************************

let inEdgeMode = false;
let mouseIsDown = false;
let selected = false;
let selectedTail = false;
let newEdge;

canvasDiv.addEventListener('mousedown', event => {
    const mousePt = Pt.mouseEventPtInElement(event, canvasDiv);
    mouseIsDown = true;
    const toSelect = graph.elementContains(mousePt);
    if (toSelect === selected) {
        return;
    }
    selected = toSelect;
    if (!(toSelect instanceof EdgeLabel)) {
        graph.draw(staticCanvas, selected);
        graph.drawElement(selected, dynamicCanvas, 'red', true);
    }
});

canvasDiv.addEventListener('mousemove', event => {
    if (!mouseIsDown || !selected ||
         (selected instanceof Edge && !selected.onVertex)) {
        return;
    }
    const mousePt = Pt.mouseEventPtInElement(event, canvasDiv);

    if (inEdgeMode && selected instanceof State) {
        selectedTail = graph.stateContains(mousePt);
        let endPt = selectedTail || mousePt;
        endPt = (endPt === selected) ? mousePt : endPt;
        newEdge = graph.drawConnection(dynamicCanvas, selected, endPt, 'red');
        newEdge.hasLabel = false;
        return;
    }
    graph.move(selected, mousePt);
    if (!(selected instanceof EdgeLabel)) {
        graph.drawElement(selected, dynamicCanvas, 'red', true);
    }
});

canvasDiv.addEventListener('mouseup', event => {
    mouseIsDown = false;
    if (selected instanceof EdgeLabel) {
        selected.textInput.focus();
    } else if (selected instanceof Edge) {
        selected.onVertex = false;
    } else if (selected instanceof State && selectedTail) {
        selected.makeOutEdgeTo(selectedTail, newEdge);
        newEdge.label = new EdgeLabel(newEdge);
        dynamicCanvas.clear();
        if (selectedTail !== selected) {
            selectedTail.draw(staticCanvas);
        }
        selected.draw(dynamicCanvas, 'red');
        selected.drawAllEdges(dynamicCanvas, true, 'red');
    } else if (selected instanceof State && inEdgeMode) {
        dynamicCanvas.clear();
        selected.draw(dynamicCanvas, 'red');
        selected.drawAllEdges(dynamicCanvas, true, 'red');
    }
    selectedTail = false;
});

// ********************************
// Button Event Listeners
// ********************************

const newStateButton = document.getElementById('NewStateButton');
const newEdgeButton = document.getElementById('NewEdgeButton');

newStateButton.addEventListener('click', () => {
    const x = rad + 20 + Math.random() * 10;
    const y = canvasDiv.offsetHeight - x - Math.random() * 10;
    graph.add(new State(x, y, rad));
    graph.draw(staticCanvas, selected);
});

newEdgeButton.addEventListener('click', () => {
    if (!inEdgeMode) {
        inEdgeMode = true;
        canvasDiv.style.cursor = 'w-resize';
        newEdgeButton.style.borderStyle = 'inset';
    } else {
        inEdgeMode = false;
        selectedTail = false;
        canvasDiv.style.cursor = '';
        newEdgeButton.style.borderStyle = '';
    }
});
