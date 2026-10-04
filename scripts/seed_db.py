from pathlib import Path
import csv
import re

from sqlalchemy import func, select

from app.db.database import Base, SessionLocal, engine
from app.models import Movie, Quote


BASE_DIR = Path(__file__).resolve().parent.parent

TITLES_FILE = BASE_DIR / "titles.md"
CLASSICS_FILE = BASE_DIR / "classics.csv"
QUOTES_DIR = BASE_DIR / "quotes"


def normalize_title(title: str) -> str:
    """
    Normalize movie titles to make matching more reliable.

    Examples:
        "Star Wars" -> "starwars"
        "star-wars" -> "starwars"
        "  Star Wars  " -> "starwars"
    """
    return re.sub(r"[^a-z0-9]", "", title.lower())


def title_from_quote_filename(movie_key: str) -> str:
    """
    Convert a normalized quote filename key into a readable movie title.

    Examples:
        "dune" -> "Dune"
        "starwars" -> "Star Wars"
    """
    known_titles = {
        "starwars": "Star Wars",
        "dune": "Dune",
    }

    if movie_key in known_titles:
        return known_titles[movie_key]

    return movie_key.replace("-", " ").title()


def load_titles() -> list[str]:
    """Load movie titles from titles.md."""
    if not TITLES_FILE.exists():
        raise FileNotFoundError(f"Missing file: {TITLES_FILE}")

    titles: list[str] = []

    for line in TITLES_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()

        if line.startswith("- "):
            title = line[2:].strip()

            if title:
                titles.append(title)

    return titles


def load_classics() -> list[dict[str, str]]:
    """
    Load classic movies from classics.csv.

    Header names are normalized so minor formatting differences
    such as extra spaces or capitalization do not break the import.
    """
    if not CLASSICS_FILE.exists():
        raise FileNotFoundError(f"Missing file: {CLASSICS_FILE}")

    with CLASSICS_FILE.open(
        "r",
        encoding="utf-8-sig",
        newline="",
    ) as file:
        reader = csv.DictReader(file)

        if reader.fieldnames is None:
            raise ValueError("classics.csv does not contain a header row.")

        normalized_headers = [
            header.strip().lower()
            for header in reader.fieldnames
            if header is not None
        ]

        required_columns = {"title", "director", "year"}
        missing_columns = required_columns - set(normalized_headers)

        if missing_columns:
            raise ValueError(
                "classics.csv is missing columns: "
                f"{sorted(missing_columns)}. "
                f"Found columns: {normalized_headers}"
            )

        classics: list[dict[str, str]] = []

        for row in reader:
            normalized_row: dict[str, str] = {}

            for key, value in row.items():
                if key is None:
                    continue

                normalized_key = key.strip().lower()
                normalized_row[normalized_key] = (value or "").strip()

            classics.append(normalized_row)

        return classics


def load_quotes() -> dict[str, list[str]]:
    """
    Load quotes from markdown files inside quotes/.

    Example:
        quotes/dune.md -> "dune"
        quotes/starwars.md -> "starwars"
    """
    if not QUOTES_DIR.exists():
        raise FileNotFoundError(f"Missing directory: {QUOTES_DIR}")

    quotes_by_movie: dict[str, list[str]] = {}

    for quote_file in sorted(QUOTES_DIR.glob("*.md")):
        movie_key = normalize_title(quote_file.stem)

        quotes: list[str] = []

        for line in quote_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()

            if not line.startswith("- "):
                continue

            quote = line[2:].strip()

            if quote.startswith('"') and quote.endswith('"'):
                quote = quote[1:-1]

            if quote:
                quotes.append(quote)

        quotes_by_movie[movie_key] = quotes

    return quotes_by_movie


def find_movie(session, title: str) -> Movie | None:
    """Find a movie using normalized title matching."""
    normalized_title = normalize_title(title)

    movies = session.scalars(select(Movie)).all()

    for movie in movies:
        if normalize_title(movie.title) == normalized_title:
            return movie

    return None


def seed_movies(session) -> int:
    """
    Import titles.md and classics.csv into the movies table.

    Returns the number of newly created movies.
    """
    added = 0

    # ---------------------------------------------------------
    # 1. Import titles.md
    # ---------------------------------------------------------
    for title in load_titles():
        movie = find_movie(session, title)

        if movie is None:
            session.add(Movie(title=title))
            added += 1

    session.flush()

    # ---------------------------------------------------------
    # 2. Import classics.csv
    # ---------------------------------------------------------
    for classic in load_classics():
        title = classic["title"].strip()
        director = classic["director"].strip()
        year_text = classic["year"].strip()

        if not title:
            continue

        try:
            year = int(year_text)
        except ValueError as exc:
            raise ValueError(
                f"Invalid year for movie '{title}': {year_text}"
            ) from exc

        movie = find_movie(session, title)

        if movie is None:
            movie = Movie(title=title)
            session.add(movie)
            added += 1

        movie.director = director or None
        movie.year = year
        movie.is_classic = True

    session.flush()

    return added


def seed_quotes(session) -> int:
    """
    Import quotes and associate them with movies.

    If a quote file does not have a corresponding movie,
    create the movie automatically from the filename.

    Existing quotes are not duplicated.

    Returns the number of newly created quotes.
    """
    added = 0

    quotes_by_movie = load_quotes()

    # Load movies once instead of querying the database repeatedly.
    movies = session.scalars(select(Movie)).all()

    # Create a normalized lookup table for fast matching.
    movies_by_normalized_title = {
        normalize_title(movie.title): movie
        for movie in movies
    }

    for movie_key, quotes in quotes_by_movie.items():
        movie = movies_by_normalized_title.get(movie_key)

        # -----------------------------------------------------
        # Create missing movie from quote filename
        # -----------------------------------------------------
        if movie is None:
            movie_title = title_from_quote_filename(movie_key)

            movie = Movie(title=movie_title)
            session.add(movie)
            session.flush()

            movies_by_normalized_title[movie_key] = movie

            print(
                f"Created movie '{movie.title}' from quote file."
            )

        # -----------------------------------------------------
        # Load existing quotes for this movie
        # -----------------------------------------------------
        existing_quotes = {
            quote.text
            for quote in session.scalars(
                select(Quote).where(Quote.movie_id == movie.id)
            ).all()
        }

        # -----------------------------------------------------
        # Insert new quotes
        # -----------------------------------------------------
        for quote_text in quotes:
            if quote_text in existing_quotes:
                continue

            session.add(
                Quote(
                    text=quote_text,
                    movie_id=movie.id,
                )
            )

            existing_quotes.add(quote_text)
            added += 1

    session.flush()

    return added


def main() -> None:
    """Initialize the database and seed all available WebFlyx data."""
    Base.metadata.create_all(bind=engine)

    session = SessionLocal()

    try:
        movies_added = seed_movies(session)
        quotes_added = seed_quotes(session)

        session.commit()

        total_movies = session.scalar(
            select(func.count()).select_from(Movie)
        )

        total_quotes = session.scalar(
            select(func.count()).select_from(Quote)
        )

        classic_movies = session.scalar(
            select(func.count())
            .select_from(Movie)
            .where(Movie.is_classic.is_(True))
        )

        print("Database seeding completed successfully.")
        print(f"Movies added: {movies_added}")
        print(f"Quotes added: {quotes_added}")
        print(f"Total movies: {total_movies}")
        print(f"Classic movies: {classic_movies}")
        print(f"Total quotes: {total_quotes}")

    except Exception:
        session.rollback()
        raise

    finally:
        session.close()


if __name__ == "__main__":
    main()

