import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base, get_db
from app.main import app
from app.models import Movie, Quote


@pytest.fixture
def client():
    """
    Create an isolated in-memory database for API tests.
    The real webflyx.db is never modified.
    """
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    TestingSessionLocal = sessionmaker(
        bind=test_engine,
        autocommit=False,
        autoflush=False,
    )

    Base.metadata.create_all(bind=test_engine)

    db = TestingSessionLocal()

    movies = [
        Movie(
            title="Inception",
            director="Christopher Nolan",
            year=2010,
        ),
        Movie(
            title="Psycho",
            director="Alfred Hitchcock",
            year=1960,
            is_classic=True,
        ),
        Movie(
            title="Star Wars",
            director="George Lucas",
            year=1977,
        ),
    ]

    db.add_all(movies)
    db.flush()

    db.add_all(
        [
            Quote(
                text="May the Force be with you",
                movie_id=movies[2].id,
            ),
            Quote(
                text="Do or do not. There is no try",
                movie_id=movies[2].id,
            ),
        ]
    )

    db.commit()

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    db.close()
    Base.metadata.drop_all(bind=test_engine)


def test_get_movies(client):
    response = client.get("/movies")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 3
    assert data[0]["title"] == "Inception"
    assert data[1]["title"] == "Psycho"
    assert data[2]["title"] == "Star Wars"


def test_get_classics(client):
    response = client.get("/movies/classics")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["title"] == "Psycho"
    assert data[0]["is_classic"] is True


def test_search_movies(client):
    response = client.get("/movies/search?q=star")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["title"] == "Star Wars"


def test_search_movies_case_insensitive(client):
    response = client.get("/movies/search?q=INCEPTION")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["title"] == "Inception"


def test_search_movies_requires_query(client):
    response = client.get("/movies/search")

    assert response.status_code == 422


def test_get_movie(client):
    response = client.get("/movies/1")

    assert response.status_code == 200

    data = response.json()

    assert data["title"] == "Inception"
    assert data["director"] == "Christopher Nolan"
    assert data["year"] == 2010


def test_get_movie_not_found(client):
    response = client.get("/movies/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Movie not found"


def test_get_movie_quotes(client):
    response = client.get("/movies/3/quotes")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert data[0]["text"] == "May the Force be with you"
    assert data[1]["text"] == "Do or do not. There is no try"


def test_get_movie_quotes_not_found(client):
    response = client.get("/movies/999/quotes")

    assert response.status_code == 404
    assert response.json()["detail"] == "Movie not found"
def test_get_all_quotes(client):
    response = client.get("/quotes")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2

    assert data[0]["text"] == "May the Force be with you"
    assert data[0]["movie_title"] == "Star Wars"

    assert data[1]["text"] == "Do or do not. There is no try"
    assert data[1]["movie_title"] == "Star Wars"
