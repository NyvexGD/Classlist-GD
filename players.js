
const pointsByDifficulty = {
    "Easy Demon": 10,
    "Medium Demon": 13,
    "Hard Demon": 18,
    "Insane Demon": 20,
    "Extreme Demon": 25
};

function readSavedArray(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

const players = readSavedArray("classlistPlayersV1");
const levels = readSavedArray("classlistLevelsV1");

const searchInput = document.getElementById("playerSearch");
const playersList = document.getElementById("playersList");
const playerCount = document.getElementById("playerCount");

function getPlayerPoints(player) {
    return player.demons.reduce((total, levelId) => {
        const level = levels.find(item => item.id === levelId);
        return total + (level ? (pointsByDifficulty[level.difficulty] ?? 0) : 0);
    }, 0);
}

function renderPlayers() {
    const search = searchInput.value.trim().toLowerCase();

    playersList.replaceChildren();

    const filteredPlayers = [...players]
        .filter(player => player.name.toLowerCase().includes(search))
        .sort((a, b) => getPlayerPoints(b) - getPlayerPoints(a));

    playerCount.textContent =
        `Znaleziono graczy: ${filteredPlayers.length} z ${players.length}`;

    if (filteredPlayers.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.textContent = players.length === 0
            ? "Brak graczy w bazie."
            : "Nie znaleziono gracza o takim nicku.";

        row.appendChild(cell);
        playersList.appendChild(row);
        return;
    }

    for (const player of filteredPlayers) {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = player.name;
        row.appendChild(nameCell);

        const demonCell = document.createElement("td");
        demonCell.textContent = player.demons.length;
        row.appendChild(demonCell);

        const pointsCell = document.createElement("td");
        pointsCell.textContent = getPlayerPoints(player);
        row.appendChild(pointsCell);

        const profileCell = document.createElement("td");
        const link = document.createElement("a");

        link.href = `player.html?id=${player.id}`;
        link.textContent = "Otwórz profil";

        profileCell.appendChild(link);
        row.appendChild(profileCell);

        playersList.appendChild(row);
    }
}

searchInput.addEventListener("input", renderPlayers);

renderPlayers();
