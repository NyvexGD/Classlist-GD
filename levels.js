
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

const searchInput = document.getElementById("levelSearch");
const difficultyFilter = document.getElementById("difficultyFilter");
const levelsList = document.getElementById("levelsList");
const levelCount = document.getElementById("levelCount");

function getCompletionCount(level) {
    return players.filter(player =>
        player.demons.includes(level.id)
    ).length;
}

function renderLevels() {
    const search = searchInput.value.trim().toLowerCase();
    const difficulty = difficultyFilter.value;

    levelsList.replaceChildren();

    const filteredLevels = levels
        .filter(level => level.name.toLowerCase().includes(search))
        .filter(level => !difficulty || level.difficulty === difficulty)
        .sort((a, b) => a.name.localeCompare(b.name));

    levelCount.textContent =
        `Znaleziono poziomów: ${filteredLevels.length} z ${levels.length}`;

    if (filteredLevels.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.textContent = levels.length === 0
            ? "Brak poziomów w katalogu."
            : "Nie znaleziono poziomów spełniających kryteria.";

        row.appendChild(cell);
        levelsList.appendChild(row);
        return;
    }

    for (const level of filteredLevels) {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = level.name;
        row.appendChild(nameCell);

        const difficultyCell = document.createElement("td");
        difficultyCell.textContent = level.difficulty;
        row.appendChild(difficultyCell);

        const pointsCell = document.createElement("td");
        pointsCell.textContent = pointsByDifficulty[level.difficulty] ?? 0;
        row.appendChild(pointsCell);

        const completionsCell = document.createElement("td");
        completionsCell.textContent = getCompletionCount(level);
        row.appendChild(completionsCell);

        const linkCell = document.createElement("td");
        const link = document.createElement("a");

        link.href = `level.html?id=${level.id}`;
        link.textContent = "Otwórz poziom";

        linkCell.appendChild(link);
        row.appendChild(linkCell);

        levelsList.appendChild(row);
    }
}

searchInput.addEventListener("input", renderLevels);
difficultyFilter.addEventListener("change", renderLevels);

renderLevels();
