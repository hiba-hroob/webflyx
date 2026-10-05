const moviesGrid = document.getElementById("moviesGrid");
const classicsGrid = document.getElementById("classicsGrid");
const quotesContainer = document.getElementById("quotesContainer");
const movieCount = document.getElementById("movieCount");

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

const movieModal = document.getElementById("movieModal");
const movieDetails = document.getElementById("movieDetails");
const closeModal = document.getElementById("closeModal");


function movieCard(movie) {
    return `
        <article
            class="movie-card"
            data-movie-id="${movie.id}"
            tabindex="0"
            role="button"
            aria-label="View details for ${escapeHtml(movie.title)}"
        >
            <div class="movie-icon">🎬</div>

            <h3>${escapeHtml(movie.title)}</h3>

            <p class="movie-meta">
                ${
                    movie.director
                        ? `Director: ${escapeHtml(movie.director)}<br>`
                        : ""
                }

                ${
                    movie.year
                        ? `Year: ${movie.year}`
                        : "Year unavailable"
                }
            </p>

            ${
                movie.is_classic
                    ? `<span class="classic-badge">CLASSIC</span>`
                    : ""
            }

            <div class="view-details">
                View details →
            </div>
        </article>
    `;
}


function quoteCard(quote, movie) {
    return `
        <article class="quote-card">
            <p class="quote-text">
                “${escapeHtml(quote.text)}”
            </p>

            <p class="quote-movie">
                ${escapeHtml(movie.title)}
            </p>
        </article>
    `;
}


function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}


async function fetchMovies(url = "/movies") {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to load movies.");
    }

    return response.json();
}


async function fetchMovie(movieId) {
    const response = await fetch(`/movies/${movieId}`);

    if (!response.ok) {
        throw new Error("Failed to load movie.");
    }

    return response.json();
}


async function fetchMovieQuotes(movieId) {
    const response = await fetch(`/movies/${movieId}/quotes`);

    if (!response.ok) {
        throw new Error("Failed to load movie quotes.");
    }

    return response.json();
}


async function loadMovies() {
    moviesGrid.innerHTML = '<p class="loading">Loading movies...</p>';

    try {
        const movies = await fetchMovies();

        movieCount.textContent = `${movies.length} movies`;

        if (movies.length === 0) {
            moviesGrid.innerHTML =
                '<p class="loading">No movies found.</p>';

            return;
        }

        moviesGrid.innerHTML = movies
            .map(movieCard)
            .join("");
    } catch (error) {
        moviesGrid.innerHTML =
            '<p class="error">Unable to load movies.</p>';
    }
}


async function loadClassics() {
    classicsGrid.innerHTML =
        '<p class="loading">Loading classics...</p>';

    try {
        const classics =
            await fetchMovies("/movies/classics");

        if (classics.length === 0) {
            classicsGrid.innerHTML =
                '<p class="loading">No classic movies found.</p>';

            return;
        }

        classicsGrid.innerHTML = classics
            .map(movieCard)
            .join("");
    } catch (error) {
        classicsGrid.innerHTML =
            '<p class="error">Unable to load classics.</p>';
    }
}


async function loadQuotes() {
    quotesContainer.innerHTML =
        '<p class="loading">Loading quotes...</p>';

    try {
        const movies = await fetchMovies();

        const moviesWithQuotes = [];

        for (const movie of movies) {
            const quotes =
                await fetchMovieQuotes(movie.id);

            for (const quote of quotes) {
                moviesWithQuotes.push({
                    quote,
                    movie,
                });
            }
        }

        if (moviesWithQuotes.length === 0) {
            quotesContainer.innerHTML =
                '<p class="loading">No quotes available.</p>';

            return;
        }

        quotesContainer.innerHTML = moviesWithQuotes
            .map(item => quoteCard(item.quote, item.movie))
            .join("");
    } catch (error) {
        quotesContainer.innerHTML =
            '<p class="error">Unable to load quotes.</p>';
    }
}


async function searchMovies() {
    const query = searchInput.value.trim();

    if (!query) {
        loadMovies();
        return;
    }

    moviesGrid.innerHTML =
        '<p class="loading">Searching...</p>';

    try {
        const movies =
            await fetchMovies(
                `/movies/search?q=${encodeURIComponent(query)}`
            );

        movieCount.textContent =
            `${movies.length} results`;

        if (movies.length === 0) {
            moviesGrid.innerHTML =
                '<p class="loading">No movies found.</p>';

            return;
        }

        moviesGrid.innerHTML = movies
            .map(movieCard)
            .join("");
    } catch (error) {
        moviesGrid.innerHTML =
            '<p class="error">Search failed.</p>';
    }
}


async function openMovieDetails(movieId) {
    movieModal.classList.remove("hidden");

    movieDetails.innerHTML = `
        <div class="movie-details-loading">
            <p class="loading">Loading movie details...</p>
        </div>
    `;

    try {
        const [movie, quotes] = await Promise.all([
            fetchMovie(movieId),
            fetchMovieQuotes(movieId),
        ]);

        const year = movie.year
            ? movie.year
            : "Year unavailable";

        const director = movie.director
            ? movie.director
            : "Director unavailable";

        const quotesHtml = quotes.length > 0
            ? quotes
                .map(
                    quote => `
                        <blockquote class="detail-quote">
                            “${escapeHtml(quote.text)}”
                        </blockquote>
                    `
                )
                .join("")
            : `
                <p class="loading">
                    No quotes available for this movie.
                </p>
            `;

        const trailerSearchUrl =
            `https://www.youtube.com/results?search_query=${
                encodeURIComponent(`${movie.title} official trailer`)
            }`;

        movieDetails.innerHTML = `
            <div class="movie-details-header">
                <div class="movie-details-icon">🎬</div>

                <div>
                    <p class="eyebrow">MOVIE DETAILS</p>

                    <h2>
                        ${escapeHtml(movie.title)}
                    </h2>

                    ${
                        movie.is_classic
                            ? `
                                <span class="classic-badge">
                                    CLASSIC
                                </span>
                            `
                            : ""
                    }
                </div>
            </div>

            <div class="movie-details-meta">
                <p>
                    <strong>Director</strong>
                    <span>
                        ${escapeHtml(director)}
                    </span>
                </p>

                <p>
                    <strong>Year</strong>
                    <span>
                        ${escapeHtml(String(year))}
                    </span>
                </p>
            </div>

            ${
                movie.description
                    ? `
                        <div class="movie-description">
                            <h3>About</h3>

                            <p>
                                ${escapeHtml(movie.description)}
                            </p>
                        </div>
                    `
                    : ""
            }

            <div class="movie-quotes">
                <h3>Memorable Quotes</h3>

                ${quotesHtml}
            </div>

            <div class="movie-actions">
                <a
                    class="trailer-button"
                    href="${trailerSearchUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    ▶ Find Official Trailer
                </a>
            </div>
        `;
    } catch (error) {
        movieDetails.innerHTML = `
            <div class="error">
                Unable to load movie details.
            </div>
        `;
    }
}


function closeMovieModal() {
    movieModal.classList.add("hidden");
}


moviesGrid.addEventListener(
    "click",
    event => {
        const card =
            event.target.closest(".movie-card");

        if (!card) {
            return;
        }

        openMovieDetails(card.dataset.movieId);
    }
);


classicsGrid.addEventListener(
    "click",
    event => {
        const card =
            event.target.closest(".movie-card");

        if (!card) {
            return;
        }

        openMovieDetails(card.dataset.movieId);
    }
);


moviesGrid.addEventListener(
    "keydown",
    event => {
        if (event.key !== "Enter" && event.key !== " ") {
            return;
        }

        const card =
            event.target.closest(".movie-card");

        if (!card) {
            return;
        }

        event.preventDefault();

        openMovieDetails(card.dataset.movieId);
    }
);


classicsGrid.addEventListener(
    "keydown",
    event => {
        if (event.key !== "Enter" && event.key !== " ") {
            return;
        }

        const card =
            event.target.closest(".movie-card");

        if (!card) {
            return;
        }

        event.preventDefault();

        openMovieDetails(card.dataset.movieId);
    }
);


searchButton.addEventListener(
    "click",
    searchMovies
);


searchInput.addEventListener(
    "keydown",
    event => {
        if (event.key === "Enter") {
            searchMovies();
        }
    }
);


closeModal.addEventListener(
    "click",
    closeMovieModal
);


movieModal.addEventListener(
    "click",
    event => {
        if (event.target === movieModal) {
            closeMovieModal();
        }
    }
);


document.addEventListener(
    "keydown",
    event => {
        if (
            event.key === "Escape" &&
            !movieModal.classList.contains("hidden")
        ) {
            closeMovieModal();
        }
    }
);


loadMovies();
loadClassics();
loadQuotes();
