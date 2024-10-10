document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

    // Fetch champions and load from localStorage
    fetchChampions().then(() => {
        loadChampions();
    });

    // Event listener for champion form submission
    const championForm = document.getElementById('champion-form');
    if (championForm) {
        championForm.addEventListener('submit', handleChampionFormSubmit);
    } else {
        console.error('Champion form not found');
    }

    // Event listener for clearing leaderboards
    const clearLeaderboardsButton = document.getElementById('clear-leaderboards');
    if (clearLeaderboardsButton) {
        clearLeaderboardsButton.addEventListener('click', clearLeaderboards);
    } else {
        console.error('Clear leaderboards button not found');
    }

    // Event listeners for search input
    const searchInput = document.querySelector('.select-search');
    if (searchInput) {
        searchInput.addEventListener('focus', showDropdown);
        searchInput.addEventListener('input', filterChampions);
        searchInput.addEventListener('keydown', handleSearchInputKeydown);
    }

    // Event listener for select items
    const selectItems = document.querySelector('.select-items');
    if (selectItems) {
        selectItems.addEventListener('click', handleSelectItemClick);
    }

    // Event listener for clicking outside the dropdown
    document.addEventListener('click', handleDocumentClick);
});

function handleChampionFormSubmit(event) {
    event.preventDefault();
    const selectedChampion = document.querySelector('.select-search').dataset.value;
    if (selectedChampion) {
        addChampion(selectedChampion);
        saveChampions();
        clearSearchInput();
    } else {
        console.error('No champion selected');
    }
}

function clearSearchInput() {
    const searchInput = document.querySelector('.select-search');
    searchInput.value = '';
    searchInput.dataset.value = '';
    const selectItems = document.querySelector('.select-items');
    if (selectItems) {
        selectItems.classList.add('select-hide');
    }
}

function showDropdown() {
    const selectItems = document.querySelector('.select-items');
    if (selectItems) {
        selectItems.classList.remove('select-hide');
    }
}

function filterChampions() {
    const filter = this.value.toLowerCase();
    const selectItems = document.querySelectorAll('.select-item');
    selectItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(filter) ? '' : 'none';
    });
    highlightFirstVisibleItem();
}

function highlightFirstVisibleItem() {
    const selectItems = document.querySelectorAll('.select-item');
    const visibleItems = Array.from(selectItems).filter(item => item.style.display !== 'none');
    if (visibleItems.length > 0) {
        visibleItems.forEach(item => item.classList.remove('select-item-active'));
        visibleItems[0].classList.add('select-item-active');
    }
}

function handleSearchInputKeydown(event) {
    const selectItems = document.querySelectorAll('.select-item');
    const visibleItems = Array.from(selectItems).filter(item => item.style.display !== 'none');
    let currentIndex = visibleItems.findIndex(item => item.classList.contains('select-item-active'));

    if (event.key === 'ArrowDown') {
        event.preventDefault();
        navigateDropdown(visibleItems, currentIndex, 1);
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        navigateDropdown(visibleItems, currentIndex, -1);
    } else if (event.key === 'Enter') {
        event.preventDefault();
        selectHighlightedItem(visibleItems, currentIndex);
    }
}

function navigateDropdown(visibleItems, currentIndex, direction) {
    if (currentIndex >= 0) visibleItems[currentIndex].classList.remove('select-item-active');
    currentIndex = (currentIndex + direction + visibleItems.length) % visibleItems.length;
    visibleItems[currentIndex].classList.add('select-item-active');
    visibleItems[currentIndex].scrollIntoView({ block: 'nearest' });
}

function selectHighlightedItem(visibleItems, currentIndex) {
    if (currentIndex >= 0) {
        const selectedItem = visibleItems[currentIndex];
        const searchInput = document.querySelector('.select-search');
        searchInput.value = selectedItem.textContent;
        searchInput.dataset.value = selectedItem.dataset.value;
        document.querySelector('.select-items').classList.add('select-hide');
        addChampion(selectedItem.dataset.value);
        saveChampions();
        clearSearchInput();
    }
}

function handleSelectItemClick(event) {
    const selectedItem = event.target;
    if (selectedItem && selectedItem.dataset.value) {
        const searchInput = document.querySelector('.select-search');
        searchInput.value = selectedItem.textContent;
        searchInput.dataset.value = selectedItem.dataset.value;
        document.querySelector('.select-items').classList.add('select-hide');
    }
}

function handleDocumentClick(event) {
    const searchInput = document.querySelector('.select-search');
    const selectItems = document.querySelector('.select-items');
    if (searchInput && selectItems && !searchInput.contains(event.target) && !selectItems.contains(event.target)) {
        selectItems.classList.add('select-hide');
        const highlightedItem = selectItems.querySelector('.select-item-active');
        if (highlightedItem) {
            highlightedItem.classList.remove('select-item-active');
        }
    }
}

function fetchChampions() {
    const apiUrl = 'https://ddragon.leagueoflegends.com/cdn/14.20.1/data/en_US/champion.json';
    return fetch(apiUrl)
        .then(response => response.json())
        .then(data => populateChampionSelect(data.data))
        .catch(error => console.error('Error fetching champions:', error));
}

function populateChampionSelect(champions) {
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
}

function addChampion(championName, timers = [], notes = '') {
    const leaderboards = document.getElementById('leaderboards');
    if (!leaderboards) {
        console.error('Leaderboards container not found');
        return;
    }

    if (document.getElementById(championName)) {
        console.warn(`Champion ${championName} already exists`);
        return;
    }

    const championBoard = document.createElement('div');
    championBoard.id = championName;
    championBoard.classList.add('champion-board');
    championBoard.style.backgroundImage = `url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championName}_0.jpg')`;
    championBoard.style.backgroundSize = 'cover';
    championBoard.style.backgroundPosition = 'center';
    championBoard.innerHTML = `
        <div class="champion-header">
            <img src="https://ddragon.leagueoflegends.com/cdn/14.20.1/img/champion/${championName}.png" alt="${championName}">
            <h3 class="champion-name">${championName}</h3>
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

    const addTimeButton = championBoard.querySelector('.add-time');
    const timeInput = championBoard.querySelector('.time-input');
    addTimeButton.addEventListener('click', () => addTime(championBoard, timeInput));
    timeInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            addTime(championBoard, timeInput);
        }
    });

    const timeTableBody = championBoard.querySelector('.time-table tbody');
    timers.sort(compareTimes).forEach(timerText => {
        const timeRow = createTimeRow(timerText);
        timeTableBody.appendChild(timeRow);
    });

    leaderboards.appendChild(championBoard);

    const notesTextarea = championBoard.querySelector('.champion-notes');
    notesTextarea.addEventListener('input', saveChampions);
}

function addTime(championBoard, timeInput) {
    const timeText = timeInput.value.trim();
    if (!validateTimeInput(timeText, timeInput)) return;

    const timeTableBody = championBoard.querySelector('.time-table tbody');
    const timeRow = createTimeRow(timeText);
    insertTimeRow(timeTableBody, timeRow, timeText);
    timeInput.value = '';
    saveChampions();
}

function validateTimeInput(timeText, timeInput) {
    if (!timeText) {
        timeInput.setCustomValidity('Time cannot be empty.');
        timeInput.reportValidity();
        return false;
    }

    const timeMatch = timeText.match(/^(\d+m)?(\d+s)?$/);
    if (!timeMatch) {
        timeInput.setCustomValidity('Invalid time format. Use format like 1m30s.');
        timeInput.reportValidity();
        return false;
    }

    const minutes = timeMatch[1] ? parseInt(timeMatch[1]) : 0;
    const seconds = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    if (seconds > 59) {
        timeInput.setCustomValidity('Seconds cannot be more than 59.');
        timeInput.reportValidity();
        return false;
    }

    timeInput.setCustomValidity('');
    return true;
}

function createTimeRow(timeText) {
    const timeRow = document.createElement('tr');
    timeRow.innerHTML = `
        <td>
            ${timeText}
            <button class="remove-timer">×</button>
        </td>
    `;
    const removeButton = timeRow.querySelector('.remove-timer');
    removeButton.addEventListener('click', () => {
        timeRow.remove();
        saveChampions();
    });
    return timeRow;
}

function insertTimeRow(timeTableBody, timeRow, timeText) {
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
    const data = Array.from(champions).map(champion => ({
        html: champion.outerHTML,
        notes: champion.querySelector('.champion-notes').value
    }));
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
        reattachEventListeners();
    }
}

function reattachEventListeners() {
    document.querySelectorAll('.champion-board').forEach(championBoard => {
        const addTimeButton = championBoard.querySelector('.add-time');
        const timeInput = championBoard.querySelector('.time-input');
        addTimeButton.addEventListener('click', () => addTime(championBoard, timeInput));
        timeInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                addTime(championBoard, timeInput);
            }
        });

        championBoard.querySelectorAll('.remove-timer').forEach(removeButton => {
            removeButton.addEventListener('click', () => {
                removeButton.closest('tr').remove();
                saveChampions();
            });
        });

        const notesTextarea = championBoard.querySelector('.champion-notes');
        notesTextarea.addEventListener('input', saveChampions);
    });
}

function clearLeaderboards() {
    localStorage.removeItem('champions');
    const leaderboards = document.getElementById('leaderboards');
    if (leaderboards) {
        leaderboards.innerHTML = '';
    }
}