// Caching frequently accessed DOM elements
const series = document.getElementById('series');
const kids = document.getElementById('kids');
const left_btn = document.getElementsByClassName('bi-chevron-left')[0];
const right_btn = document.getElementsByClassName('bi-chevron-right')[0];
const cards = document.getElementsByClassName('cards')[0];
const search = document.getElementsByClassName('search')[0];
const search_input = document.getElementById('search_input');
const video = document.getElementById('trailer');
const header = document.getElementById('title');
const overview = document.getElementById('overview');
const director = document.getElementById('director');
const gen = document.getElementById('gen');
const rate = document.getElementById('rate');
const date = document.getElementById('date');
const play = document.getElementById('play');
const download = document.getElementById('download_main');
let genreList = {};

// API call options
const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2OGY0YjU3ZDUzODVhODgwNGYyNDhmNWMwNmMyZGE3MCIsInN1YiI6IjY1OTljZTFmMWQxYmY0MDIwMjNkMmY4MCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.fTqEiIoIW2e1xZBQgaXi8bX4ApgRD6L9mcJWdYZuKtg'
    }
  };

// Entry function to load genres and movies
async function loadMovies() {
    try {
        await fetchGenres();
        await fetchTrendingMovies();
    } catch (error) {
        console.error('Error loading movies:', error);
    }
}

// Fetch and store movie genres
async function fetchGenres() {
    const genreResponse = await fetch('https://api.themoviedb.org/3/genre/movie/list?language=en', options);
    const genreData = await genreResponse.json();
    genreData.genres.forEach(genre => {
        genreList[genre.id] = genre.name;
    });
}

// Fetch and display trending movies
async function fetchTrendingMovies() {
    const movieResponse = await fetch('https://api.themoviedb.org/3/trending/movie/week?language=en-US', options);
    const movieData = await movieResponse.json();

    const cardMap = {};
    movieData.results.forEach(movie => createMovieCard(movie, cardMap));

    // Fetch backdrop images in parallel after all cards are created
    const imageFetchPromises = Object.keys(cardMap).map(id => 
        fetchBackdropImage(id, cardMap[id])
    );
    await Promise.all(imageFetchPromises);
}

// Create movie card
function createMovieCard(movie, cardMap) {
    const {title, release_date, poster_path, vote_average, genre_ids, id } = movie;
    let card = document.createElement('a');
    card.classList.add('card');
    card.innerHTML = generateCardHTML(title, release_date, poster_path, vote_average, genre_ids);
    cards.appendChild(card);
    cardMap[id] = card;
}

// Generate HTML for movie card
function generateCardHTML(title, release_date, poster_path, vote_average, genre_ids) {
    let imdb = vote_average.toFixed(1);
    let year = release_date.slice(0, 4);
    let genre = genreList[genre_ids[0]] || 'Unknown Genre';
    return `
        <img src="https://image.tmdb.org/t/p/original${poster_path}" alt="${title}" class="poster">
        <div class="rest_card">
            <div class="cont">
                <h4>${title}</h4>
                <div class="sub">
                    <p>${genre}, ${year}</p>
                    <h3><span>IMBD</span><i class="bi bi-star-fill"></i> ${imdb}</h3>
                </div>
            </div>
        </div>
    `;
}

// Fetch and update backdrop image
async function fetchBackdropImage(id, card) {
    const imageResponse = await fetch(`https://api.themoviedb.org/3/movie/${id}/images?include_image_language=en`, options);
    const imageData = await imageResponse.json();
    if (imageData.backdrops && imageData.backdrops.length > 0) {
        const bposter = imageData.backdrops[0].file_path;
        const imgElement = document.createElement('img');
        imgElement.src = `https://image.tmdb.org/t/p/original${bposter}`;
        imgElement.alt = '';
        imgElement.classList.add('backdrop');
        card.querySelector('.rest_card').prepend(imgElement);
    }
}

// Start the process
loadMovies();

search_input.addEventListener('keyup', () => {
    handleSearchInput(search_input.value);
});

async function handleSearchInput(searchValue) {
    if (searchValue.trim() !== '') {
        try {
            const data = await fetchSearchResults(searchValue);
            displaySearchResults(data.results);
        } catch (error) {
            console.error('Error fetching search results:', error);
            // Optional: Display error message to the user
        }
    } else {
        clearSearchResults();
    }
}

async function fetchSearchResults(query) {
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1`, options);
    return response.json();
}

function displaySearchResults(results) {
    clearSearchResults();
    results.forEach(element => {
        const card = createSearchResultCard(element);
        search.append(card);
    });
    // Show the search results container
    search.style.display = "block";
    search.style.opacity = "1";
}

function createSearchResultCard({ title, release_date, poster_path, vote_average, genre_ids }) {
    let imdb = vote_average.toFixed(1);
    let year = release_date ? release_date.slice(0, 4) : 'N/A';
    let genre = genre_ids.length > 0 && genreList[genre_ids[0]] ? genreList[genre_ids[0]] : 'Unknown Genre';
    let poster = poster_path ? `https://image.tmdb.org/t/p/original${poster_path}` : './images/1.png';

    let card = document.createElement('a');
    card.classList.add('card');
    card.innerHTML = `
        <img src="${poster}" alt="${title}" class="poster">
        <div class="cont">
            <h3>${title}</h3>
            <p>${genre}, ${year} <span>IMDB</span><i class="bi bi-star-fill"></i> ${imdb}</p>
        </div>
    `;
    return card;
}

function clearSearchResults() {
    search.innerHTML = '';
    search.style.opacity = "0";
}

series.addEventListener('click', async () => {
    cards.innerHTML = '';

    try {
        const response = await fetch('https://api.themoviedb.org/3/trending/tv/week?language=en-US', options);
        const data = await response.json();

        updateHeader(data.results[0]);
        updateDetailsSeries(data.results[0]);
        video.src = './videos/MastersOftheAir.mp4';
        
        const cardsHTML = data.results.map(element => createSeriesCard(element)).join('');
        cards.innerHTML = cardsHTML;

        const imageFetchPromises = data.results.map(element =>
            fetch(`https://api.themoviedb.org/3/tv/${element.id}/images?include_image_language=en`, options)
                .then(response => response.json())
                .then(data => {
                    if (data.backdrops && data.backdrops.length > 0) {
                        const bposter = data.backdrops[0].file_path;
                        const cardToUpdate = document.getElementById(`card-${element.id}`);
                        const imgElement = document.createElement('img');
                        imgElement.src = `https://image.tmdb.org/t/p/original${bposter}`;
                        imgElement.alt = '';
                        imgElement.classList.add('backdrop');
                        cardToUpdate.querySelector('.rest_card').prepend(imgElement);
                    }
                })
        );

        await Promise.all(imageFetchPromises);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});

function updateHeader(result) {
    const title = document.createElement('h1');
    title.innerText = result.title || result.name;
    header.innerHTML = '';
    header.append(title);
}

function updateDetailsSeries(result) {
    overview.innerHTML = `<p id="overview">${result.overview}</p>`;
    director.innerHTML = `<h6 id="director">John Shiban</h6>`;
    gen.innerHTML = `<h5 id="gen">${genreList[result.genre_ids[0]]}</h5>`;
    date.innerHTML = `<h4 id="date">${result.first_air_date.slice(0, 4)}</h4>`;
    rate.innerHTML = `<h3 id="rate"><span>IMDB</span><i class="bi bi-star-fill"></i> ${result.vote_average.toFixed(1)}</h3>`;
}

function createSeriesCard(element) {
    let {name, first_air_date, poster_path, vote_average, genre_ids, id } = element;
    let imdb = vote_average.toFixed(1);
    let year = first_air_date.slice(0, 4);
    let genre = genreList[genre_ids[0]] || 'Unknown Genre';

    return `
        <a id="card-${id}" class="card">
            <img src="https://image.tmdb.org/t/p/original${poster_path}" alt="${name}" class="poster">
            <div class="rest_card">
                <div class="cont">
                    <h4>${name}</h4>
                    <div class="sub">
                        <p>${genre}, ${year}</p>
                        <h3><span>IMBD</span><i class="bi bi-star-fill"></i> ${imdb}</h3>
                    </div>
                </div>
            </div>
        </a>
    `;
}
    
kids.addEventListener('click', async () => {
    cards.innerHTML = '';

    try {
        const response = await fetch('https://api.themoviedb.org/3/discover/movie?include_adult=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=16', options);
        const data = await response.json();

        updateHeader(data.results[0]);
        updateDetailsKids(data.results[0]);
        video.src = './videos/Migration.mp4';
        
        const cardsHTML = data.results.map(element => createKidsCard(element)).join('');
        cards.innerHTML = cardsHTML;

        const imageFetchPromises = data.results.map(element =>
            fetch(`https://api.themoviedb.org/3/movie/${element.id}/images?include_image_language=en`, options)
                .then(response => response.json())
                .then(data => {
                    if (data.backdrops && data.backdrops.length > 0) {
                        const bposter = data.backdrops[0].file_path;
                        const cardToUpdate = document.getElementById(`card-${element.id}`);
                        const imgElement = document.createElement('img');
                        imgElement.src = `https://image.tmdb.org/t/p/original${bposter}`;
                        imgElement.alt = '';
                        imgElement.classList.add('backdrop');
                        cardToUpdate.querySelector('.rest_card').prepend(imgElement);
                    }
                })
        );

        await Promise.all(imageFetchPromises);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});

function createKidsCard(element) {
    let {title, release_date, poster_path, vote_average, genre_ids, id } = element;
    let imdb = vote_average.toFixed(1);
    let year = release_date.slice(0, 4);
    let genre = genreList[genre_ids[0]] || 'Unknown Genre';

    return `
        <a id="card-${id}" class="card">
            <img src="https://image.tmdb.org/t/p/original${poster_path}" alt="${title}" class="poster">
            <div class="rest_card">
                <div class="cont">
                    <h4>${title}</h4>
                    <div class="sub">
                        <p>${genre}, ${year}</p>
                        <h3><span>IMBD</span><i class="bi bi-star-fill"></i> ${imdb}</h3>
                    </div>
                </div>
            </div>
        </a>
    `;
}

function updateDetailsKids(result) {
    overview.innerHTML = `<p id="overview">${result.overview}</p>`;
    director.innerHTML = `<h6 id="director">Benjamin Renner</h6>`;
    gen.innerHTML = `<h5 id="gen">${genreList[result.genre_ids[0]]}</h5>`;
    date.innerHTML = `<h4 id="date">${result.release_date.slice(0, 4)}</h4>`;
    rate.innerHTML = `<h3 id="rate"><span>IMDB</span><i class="bi bi-star-fill"></i> ${result.vote_average.toFixed(1)}</h3>`;
}

play.addEventListener('click', toggleVideoPlayback);

function toggleVideoPlayback() {
    if (video.paused) {
        playVideo();
    } else {
        pauseVideo();
    }
}

function playVideo() {
    video.play();
    updatePlayButtonIcon('pause');
}

function pauseVideo() {
    video.pause();
    updatePlayButtonIcon('play');
}

download.addEventListener('click', () => {
    window.open(`${video.src}`, '_blank');
});

function updatePlayButtonIcon(state) {
    const iconClass = state === 'play' ? 'bi-play-fill' : 'bi-pause-fill';
    play.innerHTML = `<i class="bi ${iconClass}"></i>`;
}

// Combined event handler for left and right buttons
function handleScroll(direction) {
    const scrollAmount = direction === 'left' ? -140 : 140;
    cards.scrollLeft += scrollAmount;
}

left_btn.addEventListener('click', () => handleScroll('left'));
right_btn.addEventListener('click', () => handleScroll('right'));