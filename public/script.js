const socket = io();
let currentLevel = '';
let currentQuestionIndex = 0;
let questions = [];

const levelSelection = document.getElementById('level-selection');
const quizContainer = document.getElementById('quiz-container');
const scoreboard = document.getElementById('scoreboard');
const questionElem = document.getElementById('question');
const optionsElem = document.getElementById('options');
const nextQuestionButton = document.getElementById('next-question');

function selectLevel(level) {
  currentLevel = level;
  socket.emit('selectLevel', level);
  levelSelection.classList.add('hidden');
  quizContainer.classList.remove('hidden');
}

socket.on('quizData', (quizData) => {
  questions = quizData;
  currentQuestionIndex = 0;
  loadQuestion();
});

function loadQuestion() {
  if (currentQuestionIndex < questions.length) {
    const questionData = questions[currentQuestionIndex];
    questionElem.textContent = questionData.question;
    optionsElem.innerHTML = '';
    questionData.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.textContent = option;
      button.onclick = () => submitAnswer(index);
      optionsElem.appendChild(button);
    });
  } else {
    quizContainer.classList.add('hidden');
    scoreboard.classList.remove('hidden');
  }
}

function submitAnswer(answerIndex) {
  const username = prompt('Enter your username:');
  socket.emit('submitAnswer', {
    username,
    questionIndex: currentQuestionIndex,
    answerIndex,
    level: currentLevel
  });
  currentQuestionIndex++;
  nextQuestionButton.classList.remove('hidden');
}

function loadNextQuestion() {
  nextQuestionButton.classList.add('hidden');
  loadQuestion();
}

socket.on('updateScores', (scores) => {
  const scoresList = document.getElementById('scores-list');
  scoresList.innerHTML = '';
  for (const [user, score] of Object.entries(scores)) {
    const li = document.createElement('li');
    li.textContent = `${user}: ${score}`;
    scoresList.appendChild(li);
  }
});
