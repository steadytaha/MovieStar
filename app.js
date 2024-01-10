let left_btn = document.getElementsByClassName('bi-chevron-left')[0];
let right_btn = document.getElementsByClassName('bi-chevron-right')[0];
let cards = document.getElementsByClassName('cards')[0];
let search = document.getElementsByClassName('search')[0];
let search_input = document.getElementById('search_input');
let genreList = {};

left_btn.addEventListener('click', () => {
    cards.scrollLeft -= 140;
});

right_btn.addEventListener('click', () => {
    cards.scrollLeft += 140;
});

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2OGY0YjU3ZDUzODVhODgwNGYyNDhmNWMwNmMyZGE3MCIsInN1YiI6IjY1OTljZTFmMWQxYmY0MDIwMjNkMmY4MCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.fTqEiIoIW2e1xZBQgaXi8bX4ApgRD6L9mcJWdYZuKtg'
  }
};

fetch('https://api.themoviedb.org/3/genre/movie/list?language=en', options).then(response => response.json()).then(data => {
    data.genres.forEach((element) => {
        genreList[element.id] = element.name;
    });
});

fetch('https://api.themoviedb.org/3/movie/popular?language=en-US&page=1', options)
  .then(response => response.json())
  .then(data => {
    // Prepare an array to keep all image fetch promises
    const imageFetchPromises = [];

    // Create a map to associate movie IDs with card elements
    const cardMap = {};

    // First, create all the cards without the backdrop images
    data.results.forEach((element) => {
      let {title, release_date, poster_path, vote_average, genre_ids, id} = element;
      let imdb = vote_average.toFixed(1);
      let year = release_date.slice(0, 4);
      let genre = genreList[genre_ids[0]] || 'Unknown Genre';

      let card = document.createElement('a');
      card.classList.add('card');
      card.href = `movie.html?id=${id}`;
      card.innerHTML = `
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
      cards.appendChild(card);

      // Store the card element in the map using its ID
      cardMap[id] = card;

      // Push the fetch promise to the array
      imageFetchPromises.push(
        fetch(`https://api.themoviedb.org/3/movie/${id}/images?include_image_language=en`, options)
          .then(response => response.json())
          .then(data => {
            // Check if there are backdrops available
            if (data.backdrops && data.backdrops.length > 0) {
              const bposter = data.backdrops[0].file_path;
              // Update the card with the backdrop image
              const cardToUpdate = cardMap[id];
              const imgElement = document.createElement('img');
              imgElement.src = `https://image.tmdb.org/t/p/original${bposter}`;
              imgElement.alt = '';
              imgElement.classList.add('backdrop');
              cardToUpdate.querySelector('.rest_card').prepend(imgElement);
            }
          }));
    });
});

    /* document.getElementById('title').innerText = data[0].title;
    document.getElementById('gen').innerText = data[0].genre;
    document.getElementById('date').innerText = data[0].date;
    document.getElementById('rate').innerHTML = `<i class="bi bi-star-fill"></i> ${data[0].imdb}`; */

search_input.addEventListener('keyup', () => {
    // Clear previous search results
    console.log(search_input.value);

    const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2OGY0YjU3ZDUzODVhODgwNGYyNDhmNWMwNmMyZGE3MCIsInN1YiI6IjY1OTljZTFmMWQxYmY0MDIwMjNkMmY4MCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.fTqEiIoIW2e1xZBQgaXi8bX4ApgRD6L9mcJWdYZuKtg'
        }
      };
      
      fetch(`https://api.themoviedb.org/3/search/movie?query=${search_input.value}&language=en-US&page=1`, options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));

    });
        
    // Check if the search input is not empty
   /*  if (search_input.value.trim() !== '') {
        fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(search_input.value)}&language=en-US&page=1`, options)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Make sure to access the 'results' array from the API response
            data.results.forEach((element) => {
                let {title, release_date, poster_path, vote_average, genre_ids, id} = element;
                console.log(poster_path);
                let imdb = vote_average.toFixed(1);
                let year = release_date ? release_date.slice(0, 4) : 'N/A'; // Check if release_date is available
                let genre = genre_ids.length > 0 && genreList[genre_ids[0]] ? genreList[genre_ids[0]] : 'Unknown Genre';
                let card = document.createElement('a');
                card.classList.add('card');
                card.href = `movie.html?id=${id}`; // Construct the URL with the movie ID
                card.innerHTML = `
                <img src="https://image.tmdb.org/t/p/original${poster_path}" alt="${title}" class="poster">
                <div class="cont">
                    <h3>${title}</h3>
                    <p>${genre}, ${year} - <span>IMDB</span><i class="bi bi-star-fill"></i> ${imdb}</p>
                </div>
                `;
                search.appendChild(card);
            });
            // Show the search results container
            search.style.visibility = "visible";
            search.style.opacity = "1";
        })
        .catch(error => {
        console.error('Error fetching search results:', error);
        });
    } else {
        // If the search input is empty, clear the search results and hide the container
        search.innerHTML = '';
        search.style.visibility = "hidden";
        search.style.opacity = "0";
    }
}); */

    /* let video = document.getElementsByTagName('video')[0];
    let play = document.getElementById('play');

    play.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            play.innerHTML = `<i class="bi bi-pause-fill"></i>`;
        } else {
            video.pause();
            play.innerHTML = `<i class="bi bi-play-fill"></i>`;
        }
    }); */

    let series = document.getElementById('series');
    let movies = document.getElementById('movies');
    let kids = document.getElementById('kids');
    
    series.addEventListener('click', () => {
        cards.innerHTML = '';

        let series_array = data.filter((element) => {
            return element.type == "series";
        });

        series_array.forEach((element) => {
            let {name, imdb, date, sposter, bposter, genre, url} = element;
            let card = document.createElement('a');
            card.classList.add('card');
            card.href = url;
            card.innerHTML = `
            <img src="${sposter}" alt="${name}" class="poster">
                        <div class="rest_card">
                            <img src="${bposter}" alt="" class="">
                            <div class="cont">
                                <h4>${name}</h4>
                                <div class="sub">
                                    <p>${genre}, ${date}</p>
                                    <h3><span>IMBD</span><i class="bi bi-star-fill"></i> ${imdb}</h3>
                                </div>
                            </div>
                        </div>
            `
            cards.appendChild(card);
        });
    });

    /*movies.addEventListener('click', () => {
        cards.innerHTML = '';

        let movies_array = data.filter((element) => {
            return element.type == "movies";
        });

        movies_array.forEach((element) => {
            let {name, imdb, date, sposter, bposter, genre, url} = element;
            let card = document.createElement('a');
            card.classList.add('card');
            card.href = url;
            card.innerHTML = `
            <img src="${sposter}" alt="${name}" class="poster">
                        <div class="rest_card">
                            <img src="${bposter}" alt="" class="">
                            <div class="cont">
                                <h4>${name}</h4>
                                <div class="sub">
                                    <p>${genre}, ${date}</p>
                                    <h3><span>IMBD</span><i class="bi bi-star-fill"></i> ${imdb}</h3>
                                </div>
                            </div>
                        </div>
            `
            cards.appendChild(card);
        });
    });

    kids.addEventListener('click', () => {
        cards.innerHTML = '';

        let kids_array = data.filter((element) => {
            return element.type == "kids";
        });

        kids_array.forEach((element) => {
            let {name, imdb, date, sposter, bposter, genre, url} = element;
            let card = document.createElement('a');
            card.classList.add('card');
            card.href = url;
            card.innerHTML = `
            <img src="${sposter}" alt="${name}" class="poster">
                        <div class="rest_card">
                            <img src="${bposter}" alt="" class="">
                            <div class="cont">
                                <h4>${name}</h4>
                                <div class="sub">
                                    <p>${genre}, ${date}</p>
                                    <h3><span>IMBD</span><i class="bi bi-star-fill"></i> ${imdb}</h3>
                                </div>
                            </div>
                        </div>
            `
            cards.appendChild(card);
        });
    }); */