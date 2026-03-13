from pydantic import BaseModel 

class User(BaseModel):
    name:str
    email:str
    password:str
    phone_no:str
    address:str
    status:str = "active" # default status is active (True)
    role:str = "user"  # default role is 'user'
    created_at:str

