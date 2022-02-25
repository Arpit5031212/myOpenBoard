let canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let pencilColor = document.querySelectorAll(".pencil-color");
let pencilWidthElem = document.querySelector(".pencil-width");
let eraserWidthElem = document.querySelector(".eraser-width");
let download = document.querySelector(".download");
let undo = document.querySelector(".undo");
let redo = document.querySelector(".redo");

let penColor = "red";
let pencilWidth = pencilWidthElem.value;
let eraserWidth = eraserWidthElem.value;

let undoRedoTracker = []; //data
let track = 0; //

let mouseDown = false;

//API
let tool = canvas.getContext("2d");

tool.strokeStyle = penColor;
tool.lineWidth = pencilWidth;

// mousedown => start path, mouseup => path fill
canvas.addEventListener("mousedown", (e) => {
    mouseDown = true;
    // beginPath({
    //     x: e.clientX,
    //     y: e.clientY
    // })
    let data = {
        x: e.clientX,
        y: e.clientY
    }
    socket.emit("beginPath", data);
})

canvas.addEventListener("mousemove", (e) => {
    if(mouseDown){
        let data = {
            x: e.clientX,
            y: e.clientY,
            color: eraserFlag ? "white" : penColor,
            width: eraserFlag ? eraserWidth : pencilWidth

        }
        socket.emit("drawStroke", data);
    }
    
})

canvas.addEventListener("mouseup", (e) => {
    mouseDown = false;
    let url = canvas.toDataURL();
    undoRedoTracker.push(url);
    track = undoRedoTracker.length - 1;
})

function beginPath(strokeObj) {
    tool.beginPath();
    tool.moveTo(strokeObj.x, strokeObj.y); 
}

function drawStroke(strokeObj) {
    tool.strokeStyle = strokeObj.color;
    tool.lineWidth = strokeObj.width;
    tool.lineTo(strokeObj.x, strokeObj.y);
    tool.stroke();
}

pencilColor.forEach((colorElem) => {
    colorElem.addEventListener("click", (e) => {
        let color = colorElem.classList[0];
        penColor = color;
        tool.strokeStyle = penColor;
    })
})

pencilWidthElem.addEventListener("change", (e) => {
    pencilWidth = pencilWidthElem.value;
    tool.lineWidth = pencilWidth;
})

eraserWidthElem.addEventListener("change", (e) => {
    eraserWidth = eraserWidthElem.value;
    tool.lineWidth = eraserWidth;
})

eraser.addEventListener("click", (e) => {
    if(eraserFlag) {
        tool.strokeStyle = "white";
        tool.lineWidth = eraserWidth;
    }else {
        tool.strokeStyle = penColor;
        tool.lineWidth = pencilWidth;
    }
})

download.addEventListener("click", (e) => {
    let url = canvas.toDataURL();

    let a = document.createElement("a");
    a.href = url;
    a.download = "board.jpg";
    a.click();
})

undo.addEventListener("click", (e) => {
    if(track > 0) track--;
    // action
    let /*trackObj*/ data = {
        trackValue: track,
        undoRedoTracker
    }
    //undoRedoCanvas(trackObj);
    socket.emit("redoUndo", data);
})

redo.addEventListener("click", (e) => {
    if(track < undoRedoTracker.length - 1) track++;
// action
    let /*trackObj*/ data = {
        trackValue: track,
        undoRedoTracker
    }
   // undoRedoCanvas(trackObj);
   socket.emit("redoUndo", data);

})

function undoRedoCanvas(trackObj) {
    track = trackObj.trackValue;
    undoRedoTracker = trackObj.undoRedoTracker;

    let url = undoRedoTracker[track];
    let img = new Image(); // new image reference element.
    img.src = url;
    img.onload = (e) => {
        tool.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
}
// reciving data from server
socket.on("beginPath", (data) => {
    // data -> data from server
    beginPath(data);
})

socket.on("drawStroke", (data) => {
    drawStroke(data);
})

socket.on("redoUndo", (data) => {
    undoRedoCanvas(data);
})