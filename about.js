document.addEventListener('DOMContentLoaded', (event) => {
    displaySplashArts();
});

function displaySplashArts() {
    const splashArtsContainer = document.querySelector('.splash-arts-container');
    if (!splashArtsContainer) {
        console.error('Splash arts container not found');
        return;
    }

    const championsData = JSON.parse(localStorage.getItem('champions'));
    if (!championsData) {
        console.error('No champions data found in localStorage');
        return;
    }

    championsData.forEach(championData => {
        const championBoard = document.createElement('div');
        championBoard.classList.add('champion-splash');

        // Extract champion name from the stored data
        const championName = championData.id;

        // Set background image and aria-label
        championBoard.style.backgroundImage = `url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championName}_0.jpg')`;
        championBoard.setAttribute('aria-label', `${championName} splash art`);
        splashArtsContainer.appendChild(championBoard);
    });
}