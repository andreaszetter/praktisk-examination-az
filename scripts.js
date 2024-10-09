document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

    // Hämta champion namn och bilder från Data Dragon API:n (LoLs API) och ladda sedan champion-boards från minnet (om man skapat några)
    fetchChampions().then(() => {
        loadChampions();
    });

    const championForm = document.getElementById('champion-form');
    if (championForm) {
        championForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const selectedChampion = document.querySelector('.select-search').dataset.value;
            console.log('Selected champion:', selectedChampion);
            if (selectedChampion) {
                addChampion(selectedChampion);
                saveChampions();
                
                // Rensa sökrutanefter att ha lagt till en champion
                const searchInput = document.querySelector('.select-search');
                searchInput.value = '';
                searchInput.dataset.value = '';
                
                // Dölj dropdown-menyn
                const selectItems = document.querySelector('.select-items');
                if (selectItems) {
                    selectItems.classList.add('select-hide');
                }
            } else {
                console.error('No champion selected');
            }
        });
    } else {
        console.error('Champion form not found');
    }

    const clearLeaderboardsButton = document.getElementById('clear-leaderboards');
    if (clearLeaderboardsButton) {
        clearLeaderboardsButton.addEventListener('click', function() {
            clearLeaderboards();
        });
    } else {
        console.error('Clear leaderboards button not found');
    }

    // Visar dropdown-menyn när man klickar in på sökfältet
    const searchInput = document.querySelector('.select-search');
    if (searchInput) {
        searchInput.addEventListener('focus', function() {
            const selectItems = document.querySelector('.select-items');
            if (selectItems) {
                selectItems.classList.remove('select-hide');
            }
        });
    }

    // Ändrar menyns display till none när man valt en champ
    const selectItems = document.querySelector('.select-items');
    if (selectItems) {
        selectItems.addEventListener('click', function(event) {
            const selectedItem = event.target;
            if (selectedItem && selectedItem.dataset.value) {
                const searchInput = document.querySelector('.select-search');
                searchInput.value = selectedItem.textContent;
                searchInput.dataset.value = selectedItem.dataset.value;
                selectItems.classList.add('select-hide');
            }
        });
    }
});

function fetchChampions() {
    const apiUrl = 'https://ddragon.leagueoflegends.com/cdn/14.20.1/data/en_US/champion.json'; // Senaste LoL API 09/10/2024
    return fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const champions = data.data;
            const selectItems = document.querySelector('.select-items');
            if (selectItems) {
                selectItems.innerHTML = '';
                for (let champion in champions) {
                    const item = document.createElement('div');
                    item.classList.add('select-item');
                    item.dataset.value = champion;
                    item.textContent = champions[champion].name;
                    item.style.backgroundImage = `url('https://ddragon.leagueoflegends.com/cdn/14.20.1/img/champion/${champion}.png')`;
                    item.style.backgroundSize = 'contain';
                    item.style.backgroundRepeat = 'no-repeat';
                    item.style.backgroundPosition = 'left center';
                    item.style.paddingLeft = '40px';
                    selectItems.appendChild(item);
                }
            }
        })
        .catch(error => console.error('Error fetching champions:', error));
}

function addChampion(championName, timers = [], notes = '') {
    const leaderboards = document.getElementById('leaderboards');
    if (!leaderboards) {
        console.error('Leaderboards container not found');
        return;
    }

    // Kontrollera om champion board redan finns för champen
    if (document.getElementById(championName)) {
        console.warn(`Champion ${championName} already exists`);
        return;
    }

    // Skapar en champion-board
    const championBoard = document.createElement('div');
    championBoard.id = championName;
    championBoard.classList.add('champion-board');
    championBoard.style.backgroundImage = `url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championName}_0.jpg')`;
    championBoard.style.backgroundSize = 'cover';
    championBoard.style.backgroundPosition = 'center';
    championBoard.innerHTML = `
        <div class="champion-header">
            <img src="https://ddragon.leagueoflegends.com/cdn/14.20.1/img/champion/${championName}.png" alt="${championName}">
            <h3>${championName}</h3>
        </div>
        <textarea class="champion-notes" id="${championName}-notes" name="${championName}-notes" placeholder="Notes">${notes}</textarea>
        <table class="time-table">
            <thead>
                <tr>
                    <th>Time</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
        <input type="text" class="time-input" id="${championName}-time-input" name="${championName}-time-input" placeholder="Add time (e.g., 1m30s)">
        <button class="add-time">Add Time</button>
    `;

    // Lägg till eventlistener till "Add Time"-knappen
    const addTimeButton = championBoard.querySelector('.add-time');
    addTimeButton.addEventListener('click', () => {
        const timeInput = championBoard.querySelector('.time-input');
        const timeText = timeInput.value.trim();

        if (!timeText.match(/^(\d+m)?(\d+s)?$/)) {
            console.error('Invalid time format');
            return;
        }

        const timeTableBody = championBoard.querySelector('.time-table tbody');
        const timeRow = document.createElement('tr');
        timeRow.innerHTML = `
            <td>
                ${timeText}
                <button class="remove-timer">×</button>
            </td>
        `;

        const removeButton = timeRow.querySelector('.remove-timer');
        removeButton.addEventListener('click', () => {
            timeTableBody.removeChild(timeRow);
            saveChampions();
        });

        // Stoppar in den nya raden på rätt plats
        const rows = Array.from(timeTableBody.querySelectorAll('tr'));
        let inserted = false;
        for (let i = 0; i < rows.length; i++) {
            if (compareTimes(timeText, rows[i].querySelector('td').textContent.trim().split('×')[0].trim()) < 0) {
                timeTableBody.insertBefore(timeRow, rows[i]);
                inserted = true;
                break;
            }
        }
        if (!inserted) {
            timeTableBody.appendChild(timeRow);
        }

        timeInput.value = '';
        saveChampions();
    });

    // Lägg till befintliga timers till time-table om de finns
    const timeTableBody = championBoard.querySelector('.time-table tbody');
    timers.sort(compareTimes).forEach(timerText => {
        const timeRow = document.createElement('tr');
        timeRow.innerHTML = `
            <td>
                ${timerText}
                <button class="remove-timer">×</button>
            </td>
        `;

        const removeButton = timeRow.querySelector('.remove-timer');
        removeButton.addEventListener('click', () => {
            timeTableBody.removeChild(timeRow);
            saveChampions();
        });

        timeTableBody.appendChild(timeRow);
    });

    leaderboards.appendChild(championBoard);

    // Lägg till event-listener till notes så den sparas utan att man behöver klicka ur rutan
    const notesTextarea = championBoard.querySelector('.champion-notes');
    notesTextarea.addEventListener('input', () => {
        saveChampions();
    });
}

function compareTimes(a, b) {
    const parseTime = (time) => {
        const match = time.match(/(\d+m)?(\d+s)?/);
        const minutes = match[1] ? parseInt(match[1]) : 0;
        const seconds = match[2] ? parseInt(match[2]) : 0;
        return minutes * 60 + seconds;
    };

    return parseTime(a) - parseTime(b);
}

function saveChampions() {
    const leaderboards = document.getElementById('leaderboards');
    if (!leaderboards) {
        console.error('Leaderboards container not found');
        return;
    }
    const champions = leaderboards.children;
    const data = [];

    for (let champion of champions) {
        const notes = champion.querySelector('.champion-notes').value;
        data.push({
            html: champion.outerHTML,
            notes: notes
        });
    }

    localStorage.setItem('champions', JSON.stringify(data));
}

function loadChampions() {
    const data = JSON.parse(localStorage.getItem('champions'));

    if (data) {
        const leaderboards = document.getElementById('leaderboards');
        if (!leaderboards) {
            console.error('Leaderboards container not found');
            return;
        }
        data.forEach(championData => {
            leaderboards.innerHTML += championData.html;
        });

        // Återanslut eventlisteners för "Add Time"- och "Remove Timer"-knapparna
        document.querySelectorAll('.champion-board').forEach(championBoard => {
            const addTimeButton = championBoard.querySelector('.add-time');
            addTimeButton.addEventListener('click', () => {
                const timeInput = championBoard.querySelector('.time-input');
                const timeText = timeInput.value.trim();

                if (!timeText.match(/^(\d+m)?(\d+s)?$/)) {
                    console.error('Invalid time format');
                    return;
                }

                const timeTableBody = championBoard.querySelector('.time-table tbody');
                const timeRow = document.createElement('tr');
                timeRow.innerHTML = `
                    <td>
                        ${timeText}
                        <button class="remove-timer">×</button>
                    </td>
                `;

                const removeButton = timeRow.querySelector('.remove-timer');
                removeButton.addEventListener('click', () => {
                    timeTableBody.removeChild(timeRow);
                    saveChampions();
                });

                // Sätt in den tiden på rätt plats
                const rows = Array.from(timeTableBody.querySelectorAll('tr'));
                let inserted = false;
                for (let i = 0; i < rows.length; i++) {
                    if (compareTimes(timeText, rows[i].querySelector('td').textContent.trim().split('×')[0].trim()) < 0) {
                        timeTableBody.insertBefore(timeRow, rows[i]);
                        inserted = true;
                        break;
                    }
                }
                if (!inserted) {
                    timeTableBody.appendChild(timeRow);
                }

                timeInput.value = '';
                saveChampions();
            });

            championBoard.querySelectorAll('.remove-timer').forEach(removeButton => {
                removeButton.addEventListener('click', () => {
                    const timeRow = removeButton.closest('tr');
                    const timeTableBody = timeRow.closest('tbody');
                    timeTableBody.removeChild(timeRow);
                    saveChampions();
                });
            });

            // Återställ notes
            const notesTextarea = championBoard.querySelector('.champion-notes');
            const championData = data.find(champ => champ.html.includes(championBoard.id));
            if (championData) {
                notesTextarea.value = championData.notes;
            }

            // Lägg till event-listeners till notes så den sparas utan att man behöver klicka ur rutan
            notesTextarea.addEventListener('input', () => {
                saveChampions();
            });
        });
    }
}

function clearLeaderboards() {
    localStorage.removeItem('champions');
    const leaderboards = document.getElementById('leaderboards');
    if (leaderboards) {
        leaderboards.innerHTML = '';
    }
}