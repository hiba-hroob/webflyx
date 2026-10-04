from pydantic import BaseModel, ConfigDict


class QuoteResponse(BaseModel):
    id: int
    text: str
    movie_id: int

    model_config = ConfigDict(from_attributes=True)
