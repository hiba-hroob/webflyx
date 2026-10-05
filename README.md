# 🎬 WebFlyx

**WebFlyx** is a movie catalog web application built with **Python, FastAPI, SQLAlchemy, SQLite, Jinja2, HTML, CSS, and JavaScript**.

The project provides a REST API for movies and movie quotes, together with an interactive frontend for browsing, searching, filtering, and viewing movie details.

## 🌐 Live Demo

**WebFlyx is deployed and available online:**

https://webflyx.onrender.com/

> The application is deployed using Render's free hosting plan. The free instance may spin down after inactivity, so the first request after a period of inactivity may take longer to respond.

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
* 🌍 Live web deployment

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
* **Render** for deployment

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
│   └── seed_db.py
├── classics.csv
├── quotes/
├── titles.md
├── pyproject.toml
├── uv.lock
└── README.md
```

## 🌐 Using the Application

The easiest way to use WebFlyx is through the live website.

The application provides:

* Movie browsing
* Movie search
* Classic movie filtering
* Year filtering
* Movie details
* Movie quotes
* Official trailer links

## 📚 API

WebFlyx provides a REST API powered by FastAPI.

Interactive API documentation is available at:

https://webflyx.onrender.com/docs

### Health Check

```http
GET /health
```

Example response:

```json
{
  "status": "ok"
}
```

### Movies

Get all movies:

```http
GET /movies
```

Search movies:

```http
GET /movies/search?q=star
```

Get classic movies:

```http
GET /movies/classics
```

Get a movie by ID:

```http
GET /movies/{movie_id}
```

Get quotes for a movie:

```http
GET /movies/{movie_id}/quotes
```

### Quotes

Get all quotes with their movie titles:

```http
GET /quotes
```

## 🧪 Testing

The project includes an automated test suite using **pytest**.

Run the complete test suite with:

```bash
uv run pytest -q
```

The tests cover:

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

```text
11 passed
```

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

## 🚀 Deployment

WebFlyx is deployed on **Render**.

The deployment uses the following commands:

### Build Command

```bash
uv sync --frozen && PYTHONPATH=. uv run python scripts/seed_db.py
```

### Start Command

```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

During deployment, the database is initialized using:

```text
scripts/seed_db.py
```

The seeding process loads:

* Movie titles from `titles.md`
* Classic movie information from `classics.csv`
* Movie quotes from the `quotes/` directory

## 💻 Local Development

Although WebFlyx is available online, the project can also be run locally for development.

### Clone the repository

```bash
git clone git@github.com:hiba-hroob/webflyx.git
cd webflyx
```

### Install dependencies

```bash
uv sync
```

### Seed the database

```bash
uv run python scripts/seed_db.py
```

### Run the application

```bash
uv run uvicorn app.main:app --reload
```

The local application will be available at:

```text
http://127.0.0.1:8000
```

## 🌿 Git Branches

The project was developed in phases:

```text
main
├── phase1/backend
└── phase2/frontend
```

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

### Phase 3 — Quality, CI & Deployment

Implemented:

* GitHub Actions
* Automated test execution
* Additional API test coverage
* Project documentation
* Final project cleanup
* Deployment configuration
* Live web deployment

## 📌 Project Status

WebFlyx is a fully functional and deployed movie catalog application with:

* ✅ REST API
* ✅ Interactive frontend
* ✅ SQLite database
* ✅ Movie and quote data
* ✅ Movie search
* ✅ Classic movie filtering
* ✅ Year filtering
* ✅ Movie details
* ✅ Movie quotes
* ✅ Trailer links
* ✅ Automated tests
* ✅ GitHub Actions CI
* ✅ Project documentation
* ✅ Live deployment

## 👩‍💻 Author

**Hiba Hroob**
