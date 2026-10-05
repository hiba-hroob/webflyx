from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.api.routes.movies import router as movies_router
from app.db.database import Base, engine
from app.models import Movie, Quote


BASE_DIR = Path(__file__).resolve().parent

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="WebFlyx API",
    description="Movie catalog API built with FastAPI and SQLite.",
    version="1.0.0",
)

app.mount(
    "/static",
    StaticFiles(directory=BASE_DIR / "static"),
    name="static",
)

templates = Jinja2Templates(
    directory=BASE_DIR / "templates"
)

app.include_router(movies_router)


@app.get("/", tags=["Frontend"])
def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
    )


@app.get("/health", tags=["Health"])
def health() -> dict[str, str]:
    return {"status": "ok"}
