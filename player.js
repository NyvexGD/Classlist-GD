
const demonPoints = {
    "Easy Demon": 10,
    "Medium Demon": 13,
    "Hard Demon": 18,
    "Insane Demon": 20,
    "Extreme Demon": 25
};

function loadArray(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

const players = loadArray("classlistPlayersV1");
const levels = loadArray("classlistLevelsV1");

// Odczytujemy ID gracza z adresu strony.
const params = new URLSearchParams(window.location.search);
const playerId = Number(params.get("id"));

const player = players.find(item => item.id === playerId);

const nameElement = document.getElementById("playerName");
const hardestElement = document.getElementById("hardestDemon");
const countElement = document.getElementById("demonCount");
const pointsElement = document.getElementById("playerPoints");
const levelsElement = document.getElementById("completedLevels");

if (!player) {
    nameElement.textContent = "Nie znaleziono gracza";
    hardestElement.textContent = "—";
    countElement.textContent = "0";
    pointsElement.textContent = "0";

    const message = document.createElement("li");
    message.textContent = "Ten gracz nie istnieje w zapisanych danych.";
    levelsElement.appendChild(message);
} else {
    nameElement.textContent = player.name;

    const completed = player.demons
        .map(id => levels.find(level => level.id === id))
        .filter(Boolean);

    let hardest = null;

    for (const level of completed) {
        const points = demonPoints[level.difficulty] ?? 0;

        if (!hardest || points > (demonPoints[hardest.difficulty] ?? 0)) {
            hardest = level;
        }
    }

    hardestElement.textContent = hardest
        ? `${hardest.name} (${hardest.difficulty})`
        : "Brak demonów";

    countElement.textContent = completed.length;

    const totalPoints = completed.reduce(
        (sum, level) => sum + (demonPoints[level.difficulty] ?? 0),
        0
    );

    pointsElement.textContent = totalPoints;

    if (completed.length === 0) {
        const message = document.createElement("li");
        message.textContent = "Ten gracz nie ma jeszcze ukończonych demonów.";
        levelsElement.appendChild(message);
    }

    for (const level of completed) {
        const item = document.createElement("li");
        item.textContent =
            `${level.name} — ${level.difficulty} (+${demonPoints[level.difficulty] ?? 0} pkt)`;
        levelsElement.appendChild(item);
    }
}
