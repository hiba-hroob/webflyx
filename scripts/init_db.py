from app.db.database import Base, engine
from app.models import Movie, Quote

Base.metadata.create_all(bind=engine)

print("Database initialized successfully.")
