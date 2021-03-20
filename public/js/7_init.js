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
    if (!(selected instanceof EdgeLabel)) {
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

    if (newEdgeButton.isPressed && selected instanceof State) {
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
        selected.focusIfNotEmpty();
    } else if (selected instanceof Edge) {
        selected.label.textInput.focus();
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
    } else if (selected instanceof State && newEdgeButton.isPressed) {
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
newStateButton.angle = Math.PI / -2;

const newEdgeButton = document.getElementById('NewEdgeButton');
newEdgeButton.isPressed = false;

newStateButton.addEventListener('click', () => {
    const angle = newStateButton.angle;
    const pi = Math.PI;
    const x = canvasDiv.offsetWidth / 2 + rad * Math.cos(angle);
    const y = canvasDiv.offsetHeight - rad * (2 + Math.sin(angle)) - 5;
    graph.add(new State(x, y, rad));
    graph.draw(staticCanvas, selected);
    newStateButton.angle += pi / 2;
    if (Math.abs(newStateButton.angle - 3 * pi / 2) < 0.01) {
        newStateButton.angle = pi / -4;
    } else if (Math.abs(newStateButton.angle - 7 * pi / 4) < 0.01) {
        newStateButton.angle = pi / -2;
    }
});

newEdgeButton.addEventListener('click', () => {
    newEdgeButton.isPressed = !newEdgeButton.isPressed;
    if (newEdgeButton.isPressed) {
        canvasDiv.style.cursor = 'w-resize';
        newEdgeButton.style.borderStyle = 'inset';
    } else {
        selectedTail = false;
        canvasDiv.style.cursor = '';
        newEdgeButton.style.borderStyle = '';
    }
});
