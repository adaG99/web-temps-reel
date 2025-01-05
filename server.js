// Real-Time Quiz Application using Node.js

// Required modules
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Initialize app
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for simplicity
let quizData = {
  easy: [
    { question: "What is the capital of France?", options: ["Paris", "Berlin", "Madrid", "Rome"], answer: 0 },
    { question: "What is 2 + 2?", options: ["3", "4", "5", "6"], answer: 1 }
  ],
  medium: [
    { question: "What is the square root of 16?", options: ["2", "4", "8", "16"], answer: 1 },
    { question: "Who discovered gravity?", options: ["Newton", "Einstein", "Galileo", "Tesla"], answer: 0 }
  ],
  hard: [
    { question: "What is the derivative of x^2?", options: ["x", "2x", "x^2", "2"], answer: 1 },
    { question: "What is the chemical symbol for gold?", options: ["Au", "Ag", "Pb", "Fe"], answer: 0 }
  ]
};
let scores = {}; // Store user scores

// Serve the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle level selection
  socket.on('selectLevel', (level) => {
    if (quizData[level]) {
      socket.emit('quizData', quizData[level]);
    } else {
      socket.emit('error', 'Invalid level selected');
    }
  });

  // Handle score updates
  socket.on('submitAnswer', ({ username, questionIndex, answerIndex, level }) => {
    if (!scores[username]) scores[username] = 0;
    if (quizData[level][questionIndex].answer === answerIndex) {
      scores[username] += 10; // Increment score for correct answer
    }

    io.emit('updateScores', scores); // Broadcast updated scores
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Public folder structure:
// public/
//   index.html
//   styles.css
//   script.js
