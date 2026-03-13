from core import http_status
from core import message
import re 
from fastapi import HTTPException

def validate_data(data:dict):

    # extract fields 
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    # --------------------------validations logic for fields ----------------------------
    # validation for all required fields
    if not name or not email or not password:
        raise HTTPException(
            status_code=http_status.BAD_REQUEST,
            detail = message.REQUIRED_FIELDS_MISSING
        )
        

def validate_name(name:str):
    # validate name format
    if not name.replace(" ","").isalpha():
        raise HTTPException(
            status_code=http_status.BAD_REQUEST,
            detail=message.INVALID_NAME_FORMAT
        )
        
def validate_email(email:str):
    # validate email format
    if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
        raise HTTPException(
            status_code=http_status.BAD_REQUEST,
            detail=message.INVALID_EMAIL_FORMAT
        )
    
def validate_password(password:str):
    # validate password format
    password_pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Z][A-Za-z\d\W_]{7,15}$'
    if not re.match(password_pattern, password):
        raise HTTPException(
            status_code=http_status.BAD_REQUEST,
            detail=message.INVALID_PASSWORD_FORMAT
        )
        
