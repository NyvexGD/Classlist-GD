
const demonPoints = {
    "Easy Demon": 10,
    "Medium Demon": 13,
    "Hard Demon": 18,
    "Insane Demon": 20,
    "Extreme Demon": 25
};

const initialLevels = [
    { id: 1, name: "Test Easy", difficulty: "Easy Demon" },
    { id: 2, name: "Test Medium", difficulty: "Medium Demon" },
    { id: 3, name: "Test Hard", difficulty: "Hard Demon" }
];

const initialPlayers = [
    { id: 1, name: "Gracz 1", demons: [1, 2, 3] },
    { id: 2, name: "Gracz 2", demons: [1] },
    { id: 3, name: "Gracz 3", demons: [] }
];

function loadData(key, fallback) {
    try {
        const saved = localStorage.getItem(key);

        if (saved !== null) {
            const parsed = JSON.parse(saved);

            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (error) {
        console.error("Nie udało się wczytać danych:", error);
    }

    return fallback.map(item => ({
        ...item,
        demons: item.demons ? [...item.demons] : undefined
    }));
}

let levels = loadData("classlistLevelsV1", initialLevels);
let players = loadData("classlistPlayersV1", initialPlayers);

let nextLevelId = Math.max(0, ...levels.map(level => level.id)) + 1;
let nextPlayerId = Math.max(0, ...players.map(player => player.id)) + 1;

function saveData() {
    try {
        localStorage.setItem("classlistLevelsV1", JSON.stringify(levels));
        localStorage.setItem("classlistPlayersV1", JSON.stringify(players));
    } catch (error) {
        console.error("Nie udało się zapisać danych:", error);
        alert("Nie udało się zapisać danych w przeglądarce.");
    }
}

function calculatePoints(player) {
    return player.demons.reduce((total, levelId) => {
        const level = levels.find(item => item.id === levelId);
        return total + (level ? (demonPoints[level.difficulty] ?? 0) : 0);
    }, 0);
}

function getHardestDemon(player) {
    let hardest = "Brak demonów";
    let highest = -1;

    for (const levelId of player.demons) {
        const level = levels.find(item => item.id === levelId);

        if (level && (demonPoints[level.difficulty] ?? 0) > highest) {
            highest = demonPoints[level.difficulty] ?? 0;
            hardest = level.difficulty;
        }
    }

    return hardest;
}

function addCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.appendChild(cell);
    return cell;
}

function makeButton(label, callback, isDelete = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;

    if (isDelete) {
        button.className = "delete";
    }

    button.addEventListener("click", callback);
    return button;
}

function renderRanking() {
    const ranking = document.getElementById("ranking");
    ranking.replaceChildren();

    // Sortowanie: najpierw punkty, potem liczba ukończonych demonów.
    const sortedPlayers = [...players].sort((a, b) => {
        const pointsDifference = calculatePoints(b) - calculatePoints(a);

        if (pointsDifference !== 0) {
            return pointsDifference;
        }

        return b.demons.length - a.demons.length;
    });

    sortedPlayers.forEach((player, index) => {
        const row = document.createElement("tr");

        let place = index + 1;

if (place === 1) {
    place = "🥇 1.";
} else if (place === 2) {
    place = "🥈 2.";
} else if (place === 3) {
    place = "🥉 3.";
}

addCell(row, place);
        const nameCell = addCell(row, "");

const profileLink = document.createElement("a");
profileLink.textContent = player.name;
profileLink.href = `player.html?id=${player.id}`;

nameCell.appendChild(profileLink);
        addCell(row, getHardestDemon(player));
        addCell(row, player.demons.length);
        addCell(row, calculatePoints(player));

        const actions = addCell(row, "");

        actions.appendChild(makeButton("Usuń gracza", () => {
            if (!confirm(`Usunąć gracza ${player.name}?`)) {
                return;
            }

            players = players.filter(item => item.id !== player.id);
            saveData();
            renderAll();
        }, true));

        ranking.appendChild(row);
    });

    if (players.length === 0) {
        const row = document.createElement("tr");
        const cell = addCell(row, "Brak graczy");
        cell.colSpan = 6;
        ranking.appendChild(row);
    }
}

function renderLevels() {
    const list = document.getElementById("levelList");
    list.replaceChildren();

    for (const level of levels) {
        const row = document.createElement("tr");

        const nameCell = addCell(row, "");

const levelLink = document.createElement("a");
levelLink.textContent = level.name;
levelLink.href = `level.html?id=${level.id}`;

nameCell.appendChild(levelLink);
        addCell(row, level.difficulty);
        addCell(row, demonPoints[level.difficulty] ?? 0);

        const actions = addCell(row, "");

        actions.appendChild(makeButton("Usuń poziom", () => {
            if (!confirm(
                `Usunąć poziom ${level.name}? Zostanie też usunięty z rekordów graczy.`
            )) {
                return;
            }

            levels = levels.filter(item => item.id !== level.id);

            for (const player of players) {
                player.demons = player.demons.filter(id => id !== level.id);
            }

            saveData();
            renderAll();
        }, true));

        list.appendChild(row);
    }

    if (levels.length === 0) {
        const row = document.createElement("tr");
        const cell = addCell(row, "Katalog jest pusty");
        cell.colSpan = 4;
        list.appendChild(row);
    }
}

function renderSelects() {
    const playerSelect = document.getElementById("completionPlayer");
    const levelSelect = document.getElementById("completionLevel");

    playerSelect.replaceChildren();
    levelSelect.replaceChildren();

    playerSelect.add(new Option("Wybierz gracza", ""));
    levelSelect.add(new Option("Wybierz poziom", ""));

    for (const player of players) {
        playerSelect.add(new Option(player.name, String(player.id)));
    }

    for (const level of levels) {
        levelSelect.add(new Option(
            `${level.name} — ${level.difficulty} (${demonPoints[level.difficulty] ?? 0} pkt)`,
            String(level.id)
        ));
    }

    playerSelect.disabled = players.length === 0;
    levelSelect.disabled = levels.length === 0;
}

function renderRecords() {
    const container = document.getElementById("playerRecords");
    container.replaceChildren();

    if (players.length === 0) {
        const message = document.createElement("p");
        message.className = "empty";
        message.textContent = "Dodaj gracza, aby zarządzać jego rekordami.";
        container.appendChild(message);
        return;
    }

    for (const player of players) {
        const card = document.createElement("div");
        card.className = "record-card";

        const heading = document.createElement("h3");
        heading.textContent =
            `${player.name} — ${player.demons.length} demonów, ${calculatePoints(player)} pkt`;

        card.appendChild(heading);

        const playerLevels = player.demons
            .map(id => levels.find(level => level.id === id))
            .filter(Boolean);

        if (playerLevels.length === 0) {
            const message = document.createElement("p");
            message.className = "empty";
            message.textContent = "Ten gracz nie ma jeszcze rekordów.";
            card.appendChild(message);
        }

        for (const level of playerLevels) {
            const item = document.createElement("div");
            item.className = "record-item";

            const label = document.createElement("span");
            label.textContent =
                `${level.name} — ${level.difficulty} (+${demonPoints[level.difficulty] ?? 0} pkt)`;

            item.appendChild(label);

            item.appendChild(makeButton("Usuń rekord", () => {
                if (!confirm(
                    `Usunąć rekord ${level.name} gracza ${player.name}?`
                )) {
                    return;
                }

                player.demons = player.demons.filter(id => id !== level.id);
                saveData();
                renderAll();
            }, true));

            card.appendChild(item);
        }

        container.appendChild(card);
    }
}

function renderAll() {
    renderRanking();
    renderLevels();
    renderSelects();
    renderRecords();
}

document.getElementById("playerForm").addEventListener("submit", event => {
    event.preventDefault();

    const input = document.getElementById("playerName");
    const name = input.value.trim();

    if (!name) {
        return;
    }

    if (players.some(player => player.name.toLowerCase() === name.toLowerCase())) {
        alert("Gracz o takim nicku już istnieje.");
        return;
    }

    players.push({
        id: nextPlayerId++,
        name,
        demons: []
    });

    input.value = "";
    saveData();
    renderAll();
});

document.getElementById("levelForm").addEventListener("submit", event => {
    event.preventDefault();

    const nameInput = document.getElementById("levelName");
    const difficultyInput = document.getElementById("levelDifficulty");
    const name = nameInput.value.trim();

    if (!name) {
        return;
    }

    if (levels.some(level => level.name.toLowerCase() === name.toLowerCase())) {
        alert("Taki poziom już znajduje się w katalogu.");
        return;
    }

    levels.push({
        id: nextLevelId++,
        name,
        difficulty: difficultyInput.value
    });

    nameInput.value = "";
    saveData();
    renderAll();
});

document.getElementById("completionForm").addEventListener("submit", event => {
    event.preventDefault();

    const playerId = Number(document.getElementById("completionPlayer").value);
    const levelId = Number(document.getElementById("completionLevel").value);

    const player = players.find(item => item.id === playerId);
    const level = levels.find(item => item.id === levelId);

    if (!player || !level) {
        alert("Wybierz gracza i poziom.");
        return;
    }

    if (player.demons.includes(levelId)) {
        alert("Ten gracz ma już zaliczony ten poziom.");
        return;
    }

    player.demons.push(levelId);

    saveData();
    renderAll();
});

renderAll();
