# from streamlit import user
import re
from config.db import db
from models.users import User
from fastapi import HTTPException, Request
from core.core import hash_password,verify_password,create_access_token
from core import message
from core import http_status
from core import response


user_collection = db["users"]



# create a new user function
async def create_user(request:Request):
    
    try:
        # get the json data from request body
        data = await request.json()
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
        
        # validate name format
        if not name.replace(" ","").isalpha():
            raise HTTPException(
                status_code=http_status.BAD_REQUEST,
                detail=message.INVALID_NAME_FORMAT
            )
            
        # validate email format
        if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
            raise HTTPException(
                status_code=http_status.BAD_REQUEST,
                detail=message.INVALID_EMAIL_FORMAT
            )
            
        # validate password format
        password_pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Z][A-Za-z\d\W_]{7,15}$'
        if not re.match(password_pattern, password):
            raise HTTPException(
                status_code=http_status.BAD_REQUEST,
                detail=message.INVALID_PASSWORD_FORMAT
            )
            

        #  check the user if already exists with the same email then return error message.
        if user_collection.find_one({"email":data["email"]}):
            raise HTTPException(
                status_code = http_status.BAD_REQUEST,
                detail = message.USER_ALREADY_EXISTS
            )

        # convert the plain password to hashed password before storing in database that user entered
        hashed_password = hash_password(password) 

        # insert the user data into the database
        user_data = User(
            name=name,
            email=email,
            password=hashed_password
        )
        result = user_collection.insert_one(user_data.model_dump())

        # if data is inserted successfully then return success message and user id
        return response.created_response(
            message=message.USER_CREATED_SUCCESS,
            data={"user_id": str(result.inserted_id)}
        )
     
    # Re-raise validation errors
    except HTTPException as e:
        raise e


# login user function
async def login_user(request:Request):
     try:
        # get the json data from request body
        data = await request.json()
        email = data.get('email')
        password = data.get('password')
    

        # validation for email and password fields
        if not email or not password:
            raise HTTPException(
                status_code=http_status.BAD_REQUEST,
                detail=message.REQUIRED_FIELDS_MISSING
            )
        
        # validate the email format
        if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
            raise HTTPException(
                status_code=http_status.BAD_REQUEST,
                detail=message.INVALID_EMAIL_FORMAT
            )          
        
        #  check the user if exists with the given email or not if not then return error message. 
        user = user_collection.find_one({"email":email})
        if not user:
            raise HTTPException(
                status_code=http_status.NOT_FOUND,
                detail=message.USER_NOT_FOUND
            )
        
        # verify the plain password with hashed password stored in database      
        if not verify_password(password,user['password']) :
            raise HTTPException(
                status_code= http_status.UNAUTHORIZED,
                detail=message.INVALID_PASSWORD
            )
        
        token_data = {
            "user_id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "role": user.get("role","user")
        }

        access_token = create_access_token(token_data)

        # if user is found and password is correct and hashed then return user data  
        return response.success_response(
            message.LOGIN_SUCCESS,
            data={
                "access_token": access_token,
                "token_type": "bearer",
                "user": token_data
            }
        )  
     
     # Re-raise validation errors
     except HTTPException as e:
        raise e
          
# get all users function
async def get_all_users() -> list[dict]:
    try:
        users = []
        for user in user_collection.find({}):
            users.append({
                "_id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "role": user.get("role", "user")
            })
        return users
    except Exception as e:
        raise HTTPException(
            status_code=http_status.INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    

# forgot pssword 
async def forgot_password(request:Request):
    try:
        data = await request.json()
        email = data.get("email")
        confirm_password = data.get("confirm_password")
        password = data.get("password")

        if not email:
            raise HTTPException(
                status_code=http_status.BAD_REQUEST,
                detail=message.REQUIRED_FIELDS_MISSING
            )
        
        if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
            raise HTTPException(
                status_code=http_status.BAD_REQUEST,
                detail=message.INVALID_EMAIL_FORMAT
            )   

        if not password or not confirm_password:
            raise HTTPException(
                status_code=http_status.BAD_REQUEST,
                detail=message.REQUIRED_FIELDS_MISSING
            )       
        
        user = user_collection.find_one({"email":email})
        if not user:
            raise HTTPException(
                status_code=http_status.NOT_FOUND,
                detail=message.USER_NOT_FOUND
            )
        
        user_collection.update_one(
            {"email": email},
            {"$set": {"password": hash_password(password)}}
        )

        # logic for sending reset password link to user's email will be implemented here in future.
        return response.success_response(
            message="Password reset successful"
        )

    except HTTPException as e:
        raise e
     
   
