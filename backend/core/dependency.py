from typing import List
from typing import List
from fastapi import Depends,HTTPException
from core import http_status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import os
from typing import List
from dotenv import load_dotenv

# Load environment variables for JWT configuration
load_dotenv()

oauth2_scheme =  OAuth2PasswordBearer(tokenUrl="/users/login")

# Load environment variables for JWT configuration
jwt_secret_key = os.getenv("JWT_SECRET_KEY")
jwt_algorithm = os.getenv("JWT_ALGORITHM")

# create get current user function for extracting and verifying jwt token from request
def get_current_user(token:str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, jwt_secret_key, algorithms=[jwt_algorithm])
        return payload
    except JWTError:
       raise HTTPException(
        status_code=http_status.UNAUTHORIZED,
        detail="Invalid credentials"
    )

    
def get_active_user(current_user:dict=Depends(get_current_user)):
    if not current_user.get("is_active", False):
        raise HTTPException(
            status_code=http_status.BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user

# create role-based authorization dependency
# “Only users with specific roles are allowed to access this API.”

"""this function is used for check the user role 
   it takes a list of required roles as input and returns a dependency function
   example: get_required_roles(['admin','user'])
   In short It set the required roles for accessing a particular endpoint.
"""
def get_required_role(required_roles: List[str]):

    """It check the role of the current user against the required roles
    current_user: dict = Depends(get_current_user: This function is calls dependency to get the current user information from the JWT token.
    This get_current_user function is extracted  token from the request and decodes it to get user information and return the user data from token."""
    def check_role(current_user: dict = Depends(get_current_user)):

        # Extract the user's role from the current user information
        user_role = current_user.get("role")

        # if user role is missing in token then raise HTTPException
        if not user_role:
            raise HTTPException(
                status_code=http_status.FORBIDDEN,
                detail="Role information missing in token"
            )

        # Check if the user's role is in the list of required roles and raise an HTTPException if not
        if user_role not in required_roles:
            raise HTTPException(
                status_code=http_status.FORBIDDEN,
                detail=f"Access denied. Required role(s):{required_roles}"
            )
        
        # If the user's role is valid, return the current user information
        return current_user
    return check_role

# Example usage:
# require_user = required role[user]
# require_admin = required role[admin]

