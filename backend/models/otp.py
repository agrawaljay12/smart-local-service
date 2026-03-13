from pydantic import BaseModel

class Otp(BaseModel):
    email:str
    otp:str
    created_at:str
    expires_at:str

    