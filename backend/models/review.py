from pydantic import BaseModel

class Review(BaseModel):
    user_id:str
    provider_id:str
    booking_id:str
    rating:int
    comment:str
    created_at:str