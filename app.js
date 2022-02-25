 const express = require("express"); //access
 const socket = require("socket.io");
 
 const app = express();     // initialised and server ready

 app.use(express.static("public"));

 let port = 8080;
 let server = app.listen(port, () => {
     console.log("Listening to port" + port);
 })

 let io = socket(server);      // server's instance is passed to the socket 

 io.on("connection", (socket) => {                                                 // .on is similar to event listener used to emit hte event
    console.log("Made socket connection");                                         // every time a connection is made callback function is executed
    socket.on("beginPath", (data) => {
        // transfer data to all connected computers
        io.sockets.emit("beginPath", data);
    })

    socket.on("drawStroke", (data) => {
        io.sockets.emit("drawStroke", data);
    })

    socket.on("redoUndo", (data) => {
        io.sockets.emit("redoUndo", data);
    })
})