from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import Movie, Quote
from app.schemas import QuoteWithMovieResponse


router = APIRouter(
    prefix="/quotes",
    tags=["Quotes"],
)


@router.get(
    "",
    response_model=list[QuoteWithMovieResponse],
)
def get_quotes(
    db: Session = Depends(get_db),
) -> list[dict]:
    """
    Return all quotes with their movie titles.

    A single database query is used so the frontend
    does not need to request quotes movie by movie.
    """
    statement = (
        select(Quote, Movie.title)
        .join(Movie, Quote.movie_id == Movie.id)
        .order_by(Quote.id)
    )

    rows = db.execute(statement).all()

    return [
        {
            "id": quote.id,
            "text": quote.text,
            "movie_id": quote.movie_id,
            "movie_title": movie_title,
        }
        for quote, movie_title in rows
    ]
