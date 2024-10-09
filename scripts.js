document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

    // Fetch champion data from Data Dragon API and then load champions from localStorage
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
                
                // Clear the input field after adding a champion
                const searchInput = document.querySelector('.select-search');
                searchInput.value = '';
                searchInput.dataset.value = '';
                
                // Hide the dropdown
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

    // Show dropdown when search field is focused
    const searchInput = document.querySelector('.select-search');
    if (searchInput) {
        searchInput.addEventListener('focus', function() {
            const selectItems = document.querySelector('.select-items');
            if (selectItems) {
                selectItems.classList.remove('select-hide');
            }
        });
    }

    // Hide dropdown when an item is selected
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
    const apiUrl = 'https://ddragon.leagueoflegends.com/cdn/14.20.1/data/en_US/champion.json'; // Updated API version
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
                    item.style.paddingLeft = '40px'; // Adjust padding to make space for the image
                    selectItems.appendChild(item);
                }
            }
        })
        .catch(error => console.error('Error fetching champions:', error));
}

function addChampion(championName) {
    const leaderboards = document.getElementById('leaderboards');
    if (!leaderboards) {
        console.error('Leaderboards container not found');
        return;
    }

    // Check if the champion already exists
    if (document.getElementById(championName)) {
        console.warn(`Champion ${championName} already exists`);
        return;
    }

    // Create the champion board
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
        <textarea class="champion-notes" placeholder="Notes"></textarea>
        <table class="time-table">
            <thead>
                <tr>
                    <th>Time</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
        <input type="text" class="time-input" placeholder="Add time (e.g., 1m30s)">
        <button class="add-time">Add Time</button>
    `;

    // Add event listener to the "Add Time" button
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

        // Insert the new row in the correct position
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

    leaderboards.appendChild(championBoard);
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
    const data = {};

    for (let champion of champions) {
        const championName = champion.id;
        const timerList = champion.querySelectorAll('tr');
        const notesTextarea = champion.querySelector('.champion-notes');
        data[championName] = {
            timers: [],
            notes: notesTextarea ? notesTextarea.value : ''
        };

        for (let timerItem of timerList) {
            const timerText = timerItem.childNodes[0].textContent.trim().split('×')[0].trim();
            data[championName].timers.push(timerText);
        }
    }

    localStorage.setItem('champions', JSON.stringify(data));
}

function loadChampions() {
    const data = JSON.parse(localStorage.getItem('champions'));

    if (data) {
        for (let champion in data) {
            addChampion(champion);
            const championBoard = document.getElementById(champion);
            const timeTableBody = championBoard.querySelector('.time-table tbody');
            if (!timeTableBody) {
                console.error(`Time table body not found for champion: ${champion}`);
                continue;
            }

            // Sort the times lexicographically before inserting them into the table
            const sortedTimes = data[champion].timers.sort(compareTimes);

            for (let timerText of sortedTimes) {
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
            }

            const notesTextarea = championBoard.querySelector('.champion-notes');
            if (notesTextarea) {
                notesTextarea.value = data[champion].notes;
            }
        }
    }
}

function clearLeaderboards() {
    localStorage.removeItem('champions');
    const leaderboards = document.getElementById('leaderboards');
    if (leaderboards) {
        leaderboards.innerHTML = '';
    }
}