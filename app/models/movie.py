from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Movie(Base):
    __tablename__ = "movies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    director: Mapped[str | None] = mapped_column(String(255), nullable=True)
    year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    is_classic: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    quotes = relationship(
        "Quote",
        back_populates="movie",
        cascade="all, delete-orphan",
    )
