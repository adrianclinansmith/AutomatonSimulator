/*
    Init.js
    Setup the canvas for drawing digraphs.
*/

// ********************************
// Initialize Graph
// ********************************

/* global Pt Canvas EdgeLabel Edge LoopEdge NonLoopEdge Graph State */

const canvasDiv = document.getElementById('CanvasDiv');
const staticCanvas = new Canvas('StaticCanvas');
const dynamicCanvas = new Canvas('DynamicCanvas');

const graph = new Graph(staticCanvas, dynamicCanvas);

const rad = 30;

graph.add(new State(canvasDiv.offsetWidth / 2 - rad * 4, 400, rad));
graph.add(new State(canvasDiv.offsetWidth / 2 + rad * 4, 400, rad));
graph.states[0].makeOutEdgeTo(graph.states[1]);
graph.states[0].outEdges[0].label = new EdgeLabel(graph.states[0].outEdges[0]);

graph.redrawAllExcept();

// ****************************************************************
// Canvas Div Event Listeners
// ****************************************************************

let mouseIsDown = false;
let selected = false;
let selectedTail = false;
let newEdge;

canvasDiv.addEventListener('mousedown', event => {
    const mousePt = Pt.mouseEventPtInElement(event, canvasDiv);
    mouseIsDown = true;
    const toSelect = graph.elementContains(mousePt);
    if (event.shiftKey) {
        console.log('pressed shift');
    }
    if (toSelect === selected) {
        return;
    }
    selected = toSelect;
    if (!(selected instanceof EdgeLabel)) {
        graph.redrawAllExcept(selected);
        console.log(selected);
        graph.redrawToDynamic(selected);
    }
});

canvasDiv.addEventListener('mousemove', event => {
    if (!mouseIsDown || !selected) {
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    const mousePt = Pt.mouseEventPtInElement(event, canvasDiv);

    if (selected instanceof EdgeLabel) {
        selected.slideLabel(mousePt);
    } else if (selected instanceof Edge) {
        handleMouseMoveOnEdge(mousePt);
    } else if (selected instanceof State) {
        handleMouseMoveOnState(mousePt);
    }
});

canvasDiv.addEventListener('mouseup', event => {
    mouseIsDown = false;
    event.preventDefault();
    event.stopPropagation();
    if (selected instanceof EdgeLabel) {
        selected.focusIfNotEmpty();
    } else if (selected instanceof Edge) {
        selected.label.textInput.focus();
        selected.onVertex = false;
    } else if (selected instanceof State) {
        handleMouseUpOnState();
    }
    selectedTail = false;
});

canvasDiv.addEventListener('dblclick', event => {
    console.log('dbclick');
});

// ****************************************************************
// Graph Element MouseEvent Handlers
// ****************************************************************

function handleMouseMoveOnEdge(mousePt) {
    if (!selected.onVertex) {
        return;
    }
    selected.slideVertex(mousePt);
    graph.redrawToDynamic(selected);
}

function handleMouseMoveOnState(mousePt) {
    if (!newEdgeButton.isPressed) {
        selected.setCenter(mousePt);
        graph.redrawToDynamic(selected);
        return;
    }
    dynamicCanvas.clear();
    selectedTail = graph.stateContains(mousePt);
    if (!selectedTail) {
        newEdge = new NonLoopEdge(selected, mousePt);
    } else if (selected !== selectedTail) {
        newEdge = new NonLoopEdge(selected, selectedTail);
        graph.drawToDynamic(selectedTail);
    } else {
        const m = selected.slopeTo(mousePt);
        const c1 = selected.ptAlongSlope(m, selected.radius * 3);
        const c2 = selected.ptAlongSlope(m, selected.radius * -3);
        newEdge = new LoopEdge(selected, mousePt.closestTo(c1, c2));
    }
    graph.drawToDynamic(newEdge);
    graph.drawToDynamic(selected);
}

function handleMouseUpOnState() {
    if (!newEdgeButton.isPressed) {
        return;
    }
    if (selectedTail) {
        selected.makeOutEdgeTo(selectedTail, newEdge);
        newEdge.label = new EdgeLabel(newEdge);
    }
    graph.redrawToDynamic(selected);
}

// ****************************************************************
// Button Event Listeners
// ****************************************************************

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
    graph.redrawAllExcept(selected);
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
