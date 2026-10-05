# 🎬 WebFlyx

WebFlyx is a movie catalog web application built with **Python, FastAPI, SQLAlchemy, SQLite, Jinja2, HTML, CSS, and JavaScript**.

The project provides a REST API for movies and movie quotes, together with an interactive frontend for browsing, searching, filtering, and viewing movie details.

## ✨ Features

* 🎬 Browse the complete movie catalog
* 🔎 Search movies by title
* 🎞️ Browse classic movies
* 🎯 Filter movies by type and year
* 📖 View individual movie details
* 💬 Browse movie quotes
* 🎥 View quotes associated with individual movies
* ▶️ Find official movie trailers
* ❤️ Interactive movie detail modal
* 📱 Responsive frontend
* 🧪 Automated API tests
* ⚙️ GitHub Actions CI

## 🛠️ Tech Stack

* **Python 3.14+**
* **FastAPI**
* **SQLAlchemy**
* **SQLite**
* **Pydantic**
* **Jinja2**
* **HTML / CSS / JavaScript**
* **uv** for dependency management
* **pytest** for testing
* **GitHub Actions** for continuous integration

## 📁 Project Structure

```text
webflyx/
├── app/
│   ├── api/
│   │   └── routes/
│   │       ├── movies.py
│   │       └── quotes.py
│   ├── db/
│   │   └── database.py
│   ├── models/
│   │   ├── movie.py
│   │   └── quote.py
│   ├── schemas/
│   │   ├── movie.py
│   │   └── quote.py
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css
│   │   └── js/
│   │       └── app.js
│   ├── templates/
│   │   └── index.html
│   └── main.py
├── tests/
│   └── test_movies_api.py
├── scripts/
├── classics.csv
├── quotes/
├── titles.md
├── pyproject.toml
├── uv.lock
└── README.md
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone git@github.com:hiba-hroob/webflyx.git
cd webflyx
```

### 2. Install dependencies

This project uses `uv`.

```bash
uv sync
```

### 3. Run the application


uv run uvicorn app.main:app --reload


The application will be available at:


http://127.0.0.1:8000


## 🌐 Frontend

Open:


http://127.0.0.1:8000/


The frontend provides:

* Movie browsing
* Movie search
* Classic movie filtering
* Year filtering
* Movie details
* Movie quotes
* Official trailer links

## 📚 API

FastAPI automatically provides interactive API documentation.

Open:


http://127.0.0.1:8000/docs


### Health Check


GET /health


Example response:


{
  "status": "ok"
}


### Movies

Get all movies:


GET /movies

Search movies:


GET /movies/search?q=star


Get classic movies:


GET /movies/classics


Get a movie by ID:


GET /movies/{movie_id}


Get quotes for a movie:


GET /movies/{movie_id}/quotes


### Quotes

Get all quotes with their movie titles:


GET /quotes


## 🧪 Testing

Run the complete test suite with:


uv run pytest -q


The project currently includes tests covering:

* Movie listing
* Classic movie listing
* Movie search
* Case-insensitive search
* Empty search results
* Missing search query validation
* Movie details
* Missing movies
* Movie quotes
* Missing movie quotes
* All quotes with movie titles

Current test status:


11 passed


## ⚙️ Continuous Integration

GitHub Actions automatically runs the test suite on pushes to:

* `main`
* `phase1/backend`
* `phase2/frontend`

It also runs for pull requests.

The workflow:

1. Checks out the repository
2. Installs `uv`
3. Installs Python
4. Installs project dependencies
5. Runs the complete pytest suite

## 🌿 Git Branches

The project was developed in phases:


main
├── phase1/backend
└── phase2/frontend


### Phase 1 — Backend

Implemented:

* FastAPI application
* SQLite database
* SQLAlchemy models
* Movie API
* Movie quotes API
* Backend tests

### Phase 2 — Frontend

Implemented:

* Jinja2 frontend
* Responsive movie catalog
* Search interface
* Classic movie section
* Quote browsing
* Movie details
* Interactive filtering
* Trailer links
* Frontend JavaScript

### Phase 3 — Quality & CI

Implemented:

* GitHub Actions
* Automated test execution
* Additional API test coverage
* Project documentation
* Final project cleanup

## 📌 Project Status

WebFlyx is a fully functional local movie catalog application with:

* ✅ REST API
* ✅ Interactive frontend
* ✅ SQLite database
* ✅ Movie and quote data
* ✅ Automated tests
* ✅ GitHub Actions CI
* ✅ Project documentation

## 👩‍💻 Author

**Hiba Hroob**

GitHub:

https://github.com/hiba-hroob

