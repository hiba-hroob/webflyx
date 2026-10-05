from pydantic import BaseModel, ConfigDict


class MovieBase(BaseModel):
    title: str
    director: str | None = None
    year: int | None = None
    description: str | None = None
    is_classic: bool = False


class MovieResponse(MovieBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
