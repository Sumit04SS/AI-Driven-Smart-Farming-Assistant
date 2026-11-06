from backend.database import Base, engine
from backend.models.user import User
from backend.models.token import BlacklistedToken
from backend.models.chat_history import ChatHistory
from backend.models.equipment import Equipment
from backend.models.rental_request import RentalRequest
from backend.models.price_alert import PriceAlert
from backend.models.notification import Notification


Base.metadata.create_all(bind=engine)

print("Database tables created successfully")