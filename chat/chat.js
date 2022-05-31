const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require("path");
const bodyParser = require("body-parser");
let onlineUsers = 0;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.get('/onlineusers',(req,res)=>{
  res.send({online:onlineUsers})
})


io.on("connection",(socket)=>{
   
    socket.on("disconnect",(e)=>{
        
        if(onlineUsers>0){
          onlineUsers--;
        }
        socket.broadcast.emit("somebody left the chat",onlineUsers);

    })

    socket.on("send message",(msg,img,user)=>{
        
        io.emit("refresh messages",{text:msg,img:img,user:user});
    })

    socket.on("new user",(user,img)=>{
        onlineUsers++;
        socket.broadcast.emit("new join",{text:user+" has joined the chat!",img:img,online:onlineUsers})
    })

    
})

server.listen(3000, () => {
  console.log("listening on *:3000");
});
