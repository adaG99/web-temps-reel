const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);


let question = "Qui va gagner la Ligue des Champions ?";
let options = { option1: "Real Madrid", option2: "Liverpool", option3: "Manchester City" };
let votes = { option1: 0, option2: 0, option3: 0 };
let voters = new Set();


app.use(express.static("public"));


io.on("connection", (socket) => {
  console.log("Nouvel utilisateur connecté :", socket.id);


  socket.emit("init", { question, options, votes });


  socket.on("castVote", ({ option, pseudo }) => {
    if (!voters.has(socket.id) && votes[option] !== undefined) {
      votes[option] += 1;
      voters.add(socket.id);
      io.emit("updateVotes", votes); 
      console.log(`${pseudo} a voté pour ${option}:`, votes);
    } else {
      socket.emit("error", "Vote invalide ou déjà enregistré.");
    }
  });

  
  socket.on("disconnect", () => {
    console.log("Utilisateur déconnecté :", socket.id);
  });
});


app.get("/reset", (req, res) => {
  votes = { option1: 0, option2: 0, option3: 0 };
  voters.clear();
  io.emit("updateVotes", votes);
  res.send("Votes réinitialisés !");
});


const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
