
const pointsByDifficulty = {
    "Easy Demon": 10,
    "Medium Demon": 13,
    "Hard Demon": 18,
    "Insane Demon": 20,
    "Extreme Demon": 25
};

function readArray(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

const levels = readArray("classlistLevelsV1");
const players = readArray("classlistPlayersV1");

const params = new URLSearchParams(window.location.search);
const levelId = Number(params.get("id"));

const level = levels.find(item => item.id === levelId);

const nameElement = document.getElementById("levelName");
const difficultyElement = document.getElementById("levelDifficulty");
const pointsElement = document.getElementById("levelPoints");
const videoElement = document.getElementById("verificationVideo");
const playersElement = document.getElementById("levelPlayers");

if (!level) {
    nameElement.textContent = "Nie znaleziono poziomu";
    difficultyElement.textContent = "—";
    pointsElement.textContent = "0";

    const message = document.createElement("li");
    message.textContent = "Ten poziom nie istnieje w zapisanym katalogu.";
    playersElement.appendChild(message);
} else {
    nameElement.textContent = level.name;
    document.title = `${level.name} — Classlist GD`;

    difficultyElement.textContent = level.difficulty;
    pointsElement.textContent = pointsByDifficulty[level.difficulty] ?? 0;

    // Link do filmu dodamy w kolejnym etapie.
    videoElement.textContent = "Brak filmu";

    const levelPlayers = players.filter(player =>
        player.demons.includes(level.id)
    );

    if (levelPlayers.length === 0) {
        const message = document.createElement("li");
        message.textContent = "Nikt jeszcze nie zaliczył tego poziomu.";
        playersElement.appendChild(message);
    }

    for (const player of levelPlayers) {
        const item = document.createElement("li");
        const link = document.createElement("a");

        link.textContent = player.name;
        link.href = `player.html?id=${player.id}`;

        item.appendChild(link);
        playersElement.appendChild(item);
    }
}
