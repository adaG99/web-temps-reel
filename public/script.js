const socket = io();
let pseudo = null;
let chartInstance = null; 

function enterPoll() {
  const input = document.getElementById("pseudo-input");
  if (input.value.trim() === "") {
    alert("Veuillez entrer un pseudo !");
    return;
  }
  pseudo = input.value.trim();
  document.getElementById("pseudo-screen").style.display = "none";
  document.getElementById("poll-screen").style.display = "block";
}

socket.on("init", ({ question, options, votes }) => {
  document.getElementById("quiz-question").textContent = question;
  const voteOptionsDiv = document.getElementById("vote-options");
  const resultsList = document.getElementById("results-list");

  voteOptionsDiv.innerHTML = "";
  resultsList.innerHTML = "";

  Object.keys(options).forEach((optionKey) => {
    const button = document.createElement("button");
    button.textContent = options[optionKey];
    button.onclick = () => castVote(optionKey);
    voteOptionsDiv.appendChild(button);

    
    const resultItem = document.createElement("li");
    resultItem.id = `${optionKey}-result`;
    resultItem.textContent = `${options[optionKey]} : ${votes[optionKey]} vote(s)`;
    resultsList.appendChild(resultItem);
  });

  
  displayFinalResults(votes, options);
});


socket.on("updateVotes", (votes) => {
  Object.keys(votes).forEach((optionKey) => {
    const resultItem = document.getElementById(`${optionKey}-result`);
    if (resultItem) {
      resultItem.textContent = `${votes[optionKey]} vote(s)`;
    }
  });


  displayFinalResults(votes);
});

// Envoyer un vote
function castVote(option) {
  if (pseudo) {
    socket.emit("castVote", { option, pseudo });
  } else {
    alert("Pseudo invalide !");
  }
}
function viewFinalResults() {
  const finalResultsDiv = document.getElementById("final-results");
  if (finalResultsDiv.style.display === "none") {
    finalResultsDiv.style.display = "block"; 
  } else {
    finalResultsDiv.style.display = "none"; 
  }
}



function displayFinalResults(votes, options) {
  const ctx = document.getElementById("final-chart").getContext("2d");

  
  if (chartInstance) {
    chartInstance.destroy();
  }

  const labels = Object.values(options || { option1: "Real madrid", option2: "Liverpool", option3: "Manchester city" });
  const data = Object.values(votes);


  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Votes",
          data: data,
          backgroundColor: ["#4caf50", "#2196f3", "#f44336"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        tooltip: { enabled: true },
      },
    },
  });
}
