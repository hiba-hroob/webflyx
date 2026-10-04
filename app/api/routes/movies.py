from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import Movie, Quote
from app.schemas import MovieResponse, QuoteResponse


router = APIRouter(
    prefix="/movies",
    tags=["Movies"],
)


@router.get(
    "",
    response_model=list[MovieResponse],
)
def get_movies(
    db: Session = Depends(get_db),
) -> list[Movie]:
    """Return all movies."""
    statement = select(Movie).order_by(Movie.title)

    return list(db.scalars(statement).all())


@router.get(
    "/search",
    response_model=list[MovieResponse],
)
def search_movies(
    q: str = Query(
        ...,
        min_length=1,
        description="Movie title to search for",
    ),
    db: Session = Depends(get_db),
) -> list[Movie]:
    """Search movies by title."""
    statement = (
        select(Movie)
        .where(Movie.title.ilike(f"%{q}%"))
        .order_by(Movie.title)
    )

    return list(db.scalars(statement).all())


@router.get(
    "/classics",
    response_model=list[MovieResponse],
)
def get_classics(
    db: Session = Depends(get_db),
) -> list[Movie]:
    """Return all classic movies."""
    statement = (
        select(Movie)
        .where(Movie.is_classic.is_(True))
        .order_by(Movie.year, Movie.title)
    )

    return list(db.scalars(statement).all())


@router.get(
    "/{movie_id}",
    response_model=MovieResponse,
)
def get_movie(
    movie_id: int,
    db: Session = Depends(get_db),
) -> Movie:
    """Return a single movie by ID."""
    movie = db.get(Movie, movie_id)

    if movie is None:
        raise HTTPException(
            status_code=404,
            detail="Movie not found",
        )

    return movie


@router.get(
    "/{movie_id}/quotes",
    response_model=list[QuoteResponse],
)
def get_movie_quotes(
    movie_id: int,
    db: Session = Depends(get_db),
) -> list[Quote]:
    """Return all quotes belonging to a movie."""
    movie = db.get(Movie, movie_id)

    if movie is None:
        raise HTTPException(
            status_code=404,
            detail="Movie not found",
        )

    statement = (
        select(Quote)
        .where(Quote.movie_id == movie_id)
        .order_by(Quote.id)
    )

    return list(db.scalars(statement).all())

