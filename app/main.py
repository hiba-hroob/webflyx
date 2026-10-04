from fastapi import FastAPI

from app.api.routes.movies import router as movies_router
from app.db.database import Base, engine
from app.models import Movie, Quote


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="WebFlyx API",
    description="Movie catalog API built with FastAPI and SQLite.",
    version="1.0.0",
)


app.include_router(movies_router)


@app.get("/", tags=["Health"])
def root() -> dict[str, str]:
    return {
        "message": "Welcome to WebFlyx API",
        "docs": "/docs",
    }
