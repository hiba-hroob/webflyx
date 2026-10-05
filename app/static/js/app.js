const moviesGrid = document.getElementById("moviesGrid");
const classicsGrid = document.getElementById("classicsGrid");
const quotesContainer = document.getElementById("quotesContainer");
const movieCount = document.getElementById("movieCount");

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

const classicFilter = document.getElementById("classicFilter");
const yearFilter = document.getElementById("yearFilter");
const clearFiltersButton = document.getElementById("clearFilters");

const movieModal = document.getElementById("movieModal");
const movieDetails = document.getElementById("movieDetails");
const closeModal = document.getElementById("closeModal");

let allMovies = [];
let currentMovieResults = [];


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


function quoteCard(quote) {
    return `
        <article class="quote-card">
            <p class="quote-text">
                “${escapeHtml(quote.text)}”
            </p>

            <p class="quote-movie">
                ${escapeHtml(quote.movie_title)}
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


async function fetchQuotes() {
    const response = await fetch("/quotes");

    if (!response.ok) {
        throw new Error("Failed to load quotes.");
    }

    return response.json();
}


function populateYearFilter(movies) {
    const years = [
        ...new Set(
            movies
                .map(movie => movie.year)
                .filter(year => year !== null)
        ),
    ].sort((a, b) => b - a);

    yearFilter.innerHTML = `
        <option value="">All years</option>
        ${
            years
                .map(
                    year =>
                        `<option value="${year}">${year}</option>`
                )
                .join("")
        }
    `;
}


function applyFilters(movies) {
    const classicValue = classicFilter.value;
    const selectedYear = yearFilter.value;

    return movies.filter(movie => {
        if (
            classicValue === "classic" &&
            !movie.is_classic
        ) {
            return false;
        }

        if (
            classicValue === "non-classic" &&
            movie.is_classic
        ) {
            return false;
        }

        if (
            selectedYear &&
            String(movie.year) !== selectedYear
        ) {
            return false;
        }

        return true;
    });
}


function renderMovieResults() {
    const filteredMovies =
        applyFilters(currentMovieResults);

    movieCount.textContent =
        `${filteredMovies.length} movies`;

    if (currentMovieResults.length === 0) {
        moviesGrid.innerHTML = `
            <p class="loading">
                No movies found.
            </p>
        `;
        return;
    }

    if (filteredMovies.length === 0) {
        moviesGrid.innerHTML = `
            <p class="loading">
                No movies match the selected filters.
            </p>
        `;
        return;
    }

    moviesGrid.innerHTML = filteredMovies
        .map(movieCard)
        .join("");
}


async function loadMovies() {
    moviesGrid.innerHTML =
        '<p class="loading">Loading movies...</p>';

    try {
        allMovies = await fetchMovies();

        currentMovieResults = allMovies;

        populateYearFilter(allMovies);
        renderMovieResults();

    } catch (error) {
        console.error(error);

        movieCount.textContent = "Unavailable";

        moviesGrid.innerHTML = `
            <p class="error">
                Unable to load movies.
                Please refresh the page and try again.
            </p>
        `;
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
        console.error(error);

        classicsGrid.innerHTML = `
            <p class="error">
                Unable to load classics.
            </p>
        `;
    }
}


async function loadQuotes() {
    quotesContainer.innerHTML =
        '<p class="loading">Loading quotes...</p>';

    try {
        const quotes = await fetchQuotes();

        if (quotes.length === 0) {
            quotesContainer.innerHTML =
                '<p class="loading">No quotes available.</p>';

            return;
        }

        quotesContainer.innerHTML = quotes
            .map(quoteCard)
            .join("");

    } catch (error) {
        console.error(error);

        quotesContainer.innerHTML = `
            <p class="error">
                Unable to load quotes.
            </p>
        `;
    }
}


async function searchMovies() {
    const query = searchInput.value.trim();

    if (!query) {
        currentMovieResults = allMovies;
        renderMovieResults();
        return;
    }

    moviesGrid.innerHTML =
        '<p class="loading">Searching...</p>';

    try {
        currentMovieResults =
            await fetchMovies(
                `/movies/search?q=${encodeURIComponent(query)}`
            );

        renderMovieResults();

    } catch (error) {
        console.error(error);

        moviesGrid.innerHTML = `
            <p class="error">
                Search failed.
                Please try again.
            </p>
        `;
    }
}


async function openMovieDetails(movieId) {
    movieModal.classList.remove("hidden");

    movieDetails.innerHTML = `
        <div class="movie-details-loading">
            <p class="loading">
                Loading movie details...
            </p>
        </div>
    `;

    try {
        const [movie, quotes] = await Promise.all([
            fetchMovie(movieId),
            fetchMovieQuotes(movieId),
        ]);

        const year = movie.year
            ? String(movie.year)
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
                encodeURIComponent(
                    `${movie.title} official trailer`
                )
            }`;

        movieDetails.innerHTML = `
            <div class="movie-details-header">
                <div class="movie-details-icon">
                    🎬
                </div>

                <div>
                    <p class="eyebrow">
                        MOVIE DETAILS
                    </p>

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
                        ${escapeHtml(year)}
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
        console.error(error);

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


function clearFilters() {
    searchInput.value = "";
    classicFilter.value = "";
    yearFilter.value = "";

    currentMovieResults = allMovies;

    renderMovieResults();
}


moviesGrid.addEventListener("click", event => {
    const card =
        event.target.closest(".movie-card");

    if (!card) {
        return;
    }

    openMovieDetails(card.dataset.movieId);
});


classicsGrid.addEventListener("click", event => {
    const card =
        event.target.closest(".movie-card");

    if (!card) {
        return;
    }

    openMovieDetails(card.dataset.movieId);
});


moviesGrid.addEventListener("keydown", event => {
    if (
        event.key !== "Enter" &&
        event.key !== " "
    ) {
        return;
    }

    const card =
        event.target.closest(".movie-card");

    if (!card) {
        return;
    }

    event.preventDefault();

    openMovieDetails(card.dataset.movieId);
});


classicsGrid.addEventListener("keydown", event => {
    if (
        event.key !== "Enter" &&
        event.key !== " "
    ) {
        return;
    }

    const card =
        event.target.closest(".movie-card");

    if (!card) {
        return;
    }

    event.preventDefault();

    openMovieDetails(card.dataset.movieId);
});


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


classicFilter.addEventListener(
    "change",
    renderMovieResults
);


yearFilter.addEventListener(
    "change",
    renderMovieResults
);


clearFiltersButton.addEventListener(
    "click",
    clearFilters
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
