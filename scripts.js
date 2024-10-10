document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

    // Hämta champions och ladda från localStorage
    fetchChampions().then(() => {
        loadChampions();
    });

    // Event-lyssnare för champion-formulär
    const championForm = document.getElementById('champion-form');
    if (championForm) {
        championForm.addEventListener('submit', handleChampionFormSubmit);
    } else {
        console.error('Champion form not found');
    }

    // Event-lyssnare för att rensa leaderboards
    const clearLeaderboardsButton = document.getElementById('clear-leaderboards');
    if (clearLeaderboardsButton) {
        clearLeaderboardsButton.addEventListener('click', clearLeaderboards);
    } else {
        console.error('Clear leaderboards button not found');
    }

    // Event-lyssnare för sökfältet
    const searchInput = document.querySelector('.select-search');
    if (searchInput) {
        searchInput.addEventListener('focus', showDropdown);
        searchInput.addEventListener('input', debounce(filterChampions, 300));
        searchInput.addEventListener('keydown', handleSearchInputKeydown);
    }

    // Event-lyssnare för valda objekt
    const selectItems = document.querySelector('.select-items');
    if (selectItems) {
        selectItems.addEventListener('click', handleSelectItemClick);
    }

    // Event-lyssnare för att klicka utanför dropdown
    document.addEventListener('click', handleDocumentClick);

    // Event-lyssnare för att spara anteckningar innan sidan laddas om
    window.addEventListener('beforeunload', saveChampions);

    // Lägg till live region för att meddela uppdateringar till skärmläsare
    const liveRegion = document.createElement('div');
    liveRegion.id = 'live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-9999px';
    document.body.appendChild(liveRegion);
});

// Hanterar formulärinlämning för champion
function handleChampionFormSubmit(event) {
    event.preventDefault();
    const selectedChampion = document.querySelector('.select-search').dataset.value;
    if (selectedChampion) {
        addChampion(selectedChampion);
        saveChampions();
        resetSearchBar();
    } else {
        console.error('No champion selected');
    }
}

// Återställer sökfältet
function resetSearchBar() {
    const searchInput = document.querySelector('.select-search');
    searchInput.value = '';
    searchInput.dataset.value = '';
    hideDropdown();
}

// Visar dropdown-menyn
function showDropdown() {
    const selectItems = document.querySelector('.select-items');
    if (selectItems) {
        selectItems.classList.remove('select-hide');
    }
    // Visa alla champions när dropdown visas
    const selectItemsList = document.querySelectorAll('.select-item');
    selectItemsList.forEach(item => {
        item.style.display = 'block';
    });
}

// Dölj dropdown-menyn
function hideDropdown() {
    const selectItems = document.querySelector('.select-items');
    if (selectItems) {
        selectItems.classList.add('select-hide');
    }
}

// Filtrerar champions baserat på sökfältets värde
function filterChampions() {
    const filter = this.value.toLowerCase();
    const selectItems = document.querySelectorAll('.select-item');
    selectItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(filter) ? '' : 'none';
    });
    highlightFirstVisibleItem();
}

// Markerar första synliga objektet i dropdown-menyn
function highlightFirstVisibleItem() {
    const selectItems = document.querySelectorAll('.select-item');
    const visibleItems = Array.from(selectItems).filter(item => item.style.display !== 'none');
    if (visibleItems.length > 0) {
        visibleItems.forEach(item => item.classList.remove('select-item-active'));
        visibleItems[0].classList.add('select-item-active');
    }
}

// Hanterar tangenttryckningar i sökfältet
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

// Navigerar i dropdown-menyn
function navigateDropdown(visibleItems, currentIndex, direction) {
    if (currentIndex >= 0) visibleItems[currentIndex].classList.remove('select-item-active');
    currentIndex = (currentIndex + direction + visibleItems.length) % visibleItems.length;
    visibleItems[currentIndex].classList.add('select-item-active');
    visibleItems[currentIndex].scrollIntoView({ block: 'nearest' });
}

// Väljer markerat objekt i dropdown-menyn
function selectHighlightedItem(visibleItems, currentIndex) {
    if (currentIndex >= 0) {
        const selectedItem = visibleItems[currentIndex];
        const searchInput = document.querySelector('.select-search');
        searchInput.value = selectedItem.textContent;
        searchInput.dataset.value = selectedItem.dataset.value;
        addChampion(selectedItem.dataset.value);
        saveChampions();
        resetSearchBar();
    }
}

// Hanterar klick på objekt i dropdown-menyn
function handleSelectItemClick(event) {
    const selectedItem = event.target;
    if (selectedItem && selectedItem.dataset.value) {
        const searchInput = document.querySelector('.select-search');
        searchInput.value = selectedItem.textContent;
        searchInput.dataset.value = selectedItem.dataset.value;
        addChampion(selectedItem.dataset.value);
        saveChampions();
        resetSearchBar();
    }
}

// Hanterar klick utanför dropdown-menyn
function handleDocumentClick(event) {
    const searchInput = document.querySelector('.select-search');
    const selectItems = document.querySelector('.select-items');
    if (searchInput && selectItems && !searchInput.contains(event.target) && !selectItems.contains(event.target)) {
        hideDropdown();
        const highlightedItem = selectItems.querySelector('.select-item-active');
        if (highlightedItem) {
            highlightedItem.classList.remove('select-item-active');
        }
    }
}

// Hämtar champions från API
function fetchChampions() {
    const apiUrl = 'https://ddragon.leagueoflegends.com/cdn/14.20.1/data/en_US/champion.json';
    return fetch(apiUrl)
        .then(response => response.json())
        .then(data => populateChampionSelect(data.data))
        .catch(error => console.error('Error fetching champions:', error));
}

// Fyller dropdown-menyn med champions
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

// Lägger till en champion till leaderboards
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

    // Skapa champion-board
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
        <textarea class="champion-notes" id="${championName}-notes" name="${championName}-notes" placeholder="Write some notes about the champion...">${notes}</textarea>
        <table class="time-table">
            <thead>
                <tr>
                    <th>Time</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
        <input type="text" class="time-input" id="${championName}-time-input" name="${championName}-time-input" placeholder="Add time (e.g., 1m30s)" aria-label="Add time for ${championName}">
        <button class="add-time" aria-label="Submit time for ${championName}">Submit</button>
    `;

    // Lägg till event-lyssnare till "Add Time"-knappen
    const addTimeButton = championBoard.querySelector('.add-time');
    const timeInput = championBoard.querySelector('.time-input');

    addTimeButton.addEventListener('click', () => addTime(championBoard));
    timeInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            addTime(championBoard);
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
    notesTextarea.addEventListener('blur', saveChampions); // Save on blur as well

    // Rensa sökfältet efter att en champion har lagts till
    resetSearchBar();
}

// Lägger till en tid till en champion
function addTime(championBoard) {
    const timeInput = championBoard.querySelector('.time-input');
    const timeText = timeInput.value.trim();

    // Validera inmatningen
    if (!timeText) {
        timeInput.setCustomValidity('Time cannot be empty.');
        timeInput.reportValidity();
        return;
    }

    const timeMatch = timeText.match(/^(\d+m)?(\d+s)?$/);
    if (!timeMatch) {
        timeInput.setCustomValidity('Invalid time format. Use format like 1m30s.');
        timeInput.reportValidity();
        return;
    }

    const minutes = timeMatch[1] ? parseInt(timeMatch[1]) : 0;
    const seconds = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    if (seconds > 59) {
        timeInput.setCustomValidity('Seconds cannot be more than 59.');
        timeInput.reportValidity();
        return;
    }

    timeInput.setCustomValidity('');
    const timeTableBody = championBoard.querySelector('.time-table tbody');
    const timeRow = createTimeRow(timeText);
    insertTimeRow(timeTableBody, timeRow, timeText);
    timeInput.value = '';
    saveChampions();
    highlightTopTimes(timeTableBody);

    // Announce the update to screen readers
    announceUpdate('New time added: ' + timeText);
}

// Skapar en rad för en tid
function createTimeRow(timeText) {
    const timeRow = document.createElement('tr');
    timeRow.innerHTML = `
        <td>
            ${timeText}
            <button class="remove-timer" aria-label="Remove time ${timeText}">×</button>
        </td>
    `;
    const removeButton = timeRow.querySelector('.remove-timer');
    removeButton.addEventListener('click', () => {
        timeRow.remove();
        saveChampions();
        highlightTopTimes(timeRow.closest('tbody'));

        // Announce the removal to screen readers
        announceUpdate('Time removed: ' + timeText);
    });
    return timeRow;
}

// Infogar en rad för en tid i rätt ordning
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

// Jämför två tider
function compareTimes(a, b) {
    const parseTime = (time) => {
        const match = time.match(/(\d+m)?(\d+s)?/);
        const minutes = match[1] ? parseInt(match[1]) : 0;
        const seconds = match[2] ? parseInt(match[2]) : 0;
        return minutes * 60 + seconds;
    };
    return parseTime(a) - parseTime(b);
}

// Markerar de bästa tiderna i tabellen
function highlightTopTimes(timeTableBody) {
    const rows = Array.from(timeTableBody.querySelectorAll('tr'));
    rows.forEach(row => {
        row.querySelector('td').style.backgroundColor = '';
    });
    if (rows.length > 0) {
        rows[0].querySelector('td').style.backgroundColor = 'rgba(255, 215, 0, 0.3)'; // Guld med 30% opacitet
    }
}

// Announce updates to screen readers
function announceUpdate(message) {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
        liveRegion.textContent = message;
    }
}

// Sparar champions till localStorage
function saveChampions() {
    const leaderboards = document.getElementById('leaderboards');
    if (!leaderboards) {
        console.error('Leaderboards container not found');
        return;
    }
    const champions = Array.from(leaderboards.children).map(champion => ({
        id: champion.id,
        notes: champion.querySelector('.champion-notes').value,
        timers: Array.from(champion.querySelectorAll('.time-table tbody tr')).map(row => 
            row.querySelector('td').textContent.trim().split('×')[0].trim()
        )
    }));
    localStorage.setItem('champions', JSON.stringify(champions));
}

// Laddar champions från localStorage
function loadChampions() {
    const data = JSON.parse(localStorage.getItem('champions'));
    if (data) {
        const leaderboards = document.getElementById('leaderboards');
        if (!leaderboards) {
            console.error('Leaderboards container not found');
            return;
        }
        leaderboards.innerHTML = ''; // Rensar befintligt innehåll för att undvika duplicering
        data.forEach(championData => {
            addChampion(championData.id, championData.timers, championData.notes);
        });
    }
}

// Återfäster event-lyssnare efter att champions har laddats
function reattachEventListeners() {
    document.querySelectorAll('.champion-board').forEach(championBoard => {
        const addTimeButton = championBoard.querySelector('.add-time');
        const timeInput = championBoard.querySelector('.time-input');
        addTimeButton.addEventListener('click', () => addTime(championBoard));
        timeInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                addTime(championBoard);
            }
        });

        championBoard.querySelectorAll('.remove-timer').forEach(removeButton => {
            removeButton.addEventListener('click', () => {
                removeButton.closest('tr').remove();
                saveChampions();
                highlightTopTimes(removeButton.closest('tbody'));
            });
        });

        const notesTextarea = championBoard.querySelector('.champion-notes');
        notesTextarea.addEventListener('input', saveChampions);
        notesTextarea.addEventListener('blur', saveChampions); // Save on blur as well
    });
}

// Rensar leaderboards
function clearLeaderboards() {
    localStorage.removeItem('champions');
    const leaderboards = document.getElementById('leaderboards');
    if (leaderboards) {
        leaderboards.innerHTML = '';
    }
}

// Debounce-funktion för att begränsa hur ofta en funktion kan köras
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}