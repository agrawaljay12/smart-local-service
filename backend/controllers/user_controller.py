# from streamlit import user
import re
from config.db import db
from models.users import User
from fastapi import HTTPException, Request, File,UploadFile,Form
from core.core import create_refresh_token, hash_password,verify_password,create_access_token
from utility.file_upload import save_file
from core import message
from core import http_status
from core import response
from core import validation
from datetime import datetime
from bson import ObjectId
from pymongo import ASCENDING, DESCENDING
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

# define user collections
user_collection = db["users"]

# create a new user function
async def create_user(
        name:str = Form(...),
        email:str = Form(...),
        password:str = Form(...),
        phone_no:str = Form(...),
        address:str = Form(...),
        file:UploadFile = File(None)

):
    
    try:
        # --------------------------validations logic for fields ----------------------------
        # validation for all required fields
        # validation.validate_data_all_required_field(data)
        
        print(name)
        print(email)
        
        # validate name format
        validation.validate_name(name)
            
        # validate email format
        validation.validate_email(email)

        # validate password format
        validation.validate_password(password)

        # validate phone number format
        validation.validate_phone(phone_no)

        # # validate address format
        # validation.validate_address(address)
            

        #  check the user if already exists with the same email then return error message.
        if user_collection.find_one({"email":email}):
            raise HTTPException(
                status_code = http_status.BAD_REQUEST,
                detail = message.USER_ALREADY_EXISTS
            )

        # convert the plain password to hashed password before storing in database that user entered
        hashed_password = hash_password(password) 

        # if file is found then insert then otherwise default 
        if file:
            profile_picture = await save_file(file,"users")
        else:
            profile_picture = "http://localhost:8000/static/uploads/users/profile.png"
        


        # insert the user data into the database
        user_data = User(
            name=name,
            email=email,
            password=hashed_password,
            phone_no=phone_no,
            address=address,
            created_at=datetime.now().isoformat(),
            profile = profile_picture
        )

        print(user_data)

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

        # generate the jwt token for authentication and authorization
        access_token = create_access_token(token_data)

        # refresh token

        refresh_token = create_refresh_token(token_data)        

        # if user is found and password is correct and hashed then return user data  
        return response.success_response(
            message.LOGIN_SUCCESS,
            data={
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "user": token_data
            }
        )  
     
     # Re-raise validation errors
     except HTTPException as e:
        raise e
          
# get all provider user 
async def get_all_users(request: Request):
    try:
        params = request.query_params

        # pass the query params for pagination
        page = max(int(params.get("page", 1)), 1)
        limit = max(int(params.get("limit", 10)), 1)
        skip = (page - 1) * limit

        # for sorting 
        sort_order = params.get("sort_order", "asc").lower()
        sort_by = params.get("sort_by", "name")

        
        if sort_by:
            sort_by = "name"

        sort_direction = ASCENDING if sort_order == "asc" else DESCENDING

        query_filter = {"role": "user"}

        total_records = user_collection.count_documents(query_filter)

        result = (
            user_collection
            .find(query_filter)
            .sort(sort_by, sort_direction)
            .skip(skip)
            .limit(limit)
        )

        providers = []

        for user in result:

            user["id"] = str(user["_id"])

            del user["_id"]

            providers.append(user)
            
        total_pages = (total_records + limit - 1) // limit

        return response.success_response(
            message="Providers retrieved successfully",
            data={
                "providers": providers,
                "pagination": {
                    "current_page": page,
                    "limit": limit,
                    "total_records": total_records,
                    "total_pages": total_pages
                }
            },
            status=http_status.OK
        )

    except Exception as e:
        return response.error_response(
            message=str(e),
            status=http_status.INTERNAL_SERVER_ERROR
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

        if password != confirm_password:
            raise HTTPException(
                status_code=http_status.BAD_REQUEST,
                detail=message.INVALID_PASSWORD
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
    
async def get_all_provider(request: Request):
    try:
        params = request.query_params

        # pass the query params for pagination
        page = max(int(params.get("page", 1)), 1)
        limit = max(int(params.get("limit", 10)), 1)
        skip = (page - 1) * limit

        # for sorting 
        sort_order = params.get("sort_order", "asc").lower()
        sort_by = params.get("sort_by", "name")

        
        if sort_by:
            sort_by = "name"

        sort_direction = ASCENDING if sort_order == "asc" else DESCENDING

        query_filter = {"role": "provider"}

        total_records = user_collection.count_documents(query_filter)

        result = (
            user_collection
            .find(query_filter)
            .sort(sort_by, sort_direction)
            .skip(skip)
            .limit(limit)
        )

        providers = []

        for user in result:

            user["id"] = str(user["_id"])

            del user["_id"]

            providers.append(user)

        total_pages = (total_records + limit - 1) // limit

        return response.success_response(
            message="Providers retrieved successfully",
            data={
                "providers": providers,
                "pagination": {
                    "current_page": page,
                    "limit": limit,
                    "total_records": total_records,
                    "total_pages": total_pages
                }
            },
            status=http_status.OK
        )

    except Exception as e:
        return response.error_response(
            message=str(e),
            status=http_status.INTERNAL_SERVER_ERROR
        )


#  get user by id 
async def fetch_user_by_id(user_id:str):
    try:

        if not user_id:
            raise HTTPException(
                status_code= http_status.BAD_REQUEST,
                detail="User Id is required"
            )
        
        user = user_collection.find_one({"_id":ObjectId(user_id)})

        if not user:
            raise HTTPException(
                status_code=http_status.BAD_REQUEST,
                detail="User is not found"
            )
        user["_id"] = str(user["_id"])

        return response.success_response(
            message = "User retrieved successfully",
            data = user,
            status = http_status.OK 
        )
    
    except Exception as e:
       return response.error_response(
            message=str(e),
            status=http_status.INTERNAL_SERVER_ERROR
        )
    
async def edit_user_by_id(
    user_id: str,
    name: str = Form(None),
    email: str = Form(None),
    phone_no: str = Form(None),
    address: str = Form(None),
    file: UploadFile = File(None)   # profile image
):
    try:
        update_data = {}

        if not user_id:
            raise HTTPException(
                status_code=http_status.BAD_REQUEST,
                detail="User Id is Required"
            )

        existing_user = user_collection.find_one({"_id": ObjectId(user_id)})

        if not existing_user:
            raise HTTPException(
                status_code=http_status.NOT_FOUND,
                detail=message.USER_NOT_FOUND
            )

        if name:
            update_data["name"] = name

        if email:
            update_data["email"] = email

        if phone_no:
            update_data["phone_no"] = phone_no

        if address:
            update_data["address"] = address

        # Profile image upload
        if file:
            profile_url = await save_file(file, "users")  # your existing function
            update_data["profile"] = profile_url

        # If nothing to update
        if not update_data:
            raise HTTPException(
                status_code=400,
                detail="No data provided to update"
            )
        print(update_data)

        result = user_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )

        if result.modified_count == 1:
            return response.success_response(
                message="Profile updated successfully",
                data={"_id": user_id},
                status=http_status.OK
            )
        else:
            return response.error_response(
                message="No changes made",
                data={"_id": user_id},
                status=http_status.BAD_REQUEST
            )

    except HTTPException as e:
        raise e

    except Exception as e:
        return response.error_response(
            message=str(e),
            status=http_status.INTERNAL_SERVER_ERROR
        )
    
# forgot pssword 
async def change_password(user_id:str,request:Request):
    try:
        data = await request.json()
        old_password = data.get("old_password")
        confirm_password = data.get("confirm_password")
        new_password = data.get("new_password")

        # if user id is provided then return error message
        if not user_id :
            raise HTTPException(
                status_code=http_status.BAD_REQUEST,
                detail="User Id is Required"
            )

        # ------------------validation for all required field----------------

        if not old_password or not new_password or not confirm_password:
            raise HTTPException(
                status_code=400,
                detail="All password fields are required"
            )
        
        # password and confirm password doesn't match then return the error message
        if new_password != confirm_password:
            raise HTTPException(
                status_code=http_status.BAD_REQUEST,
                detail="new password and confirm password do not match"
            )       
        
        user = user_collection.find_one({"_id":ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=http_status.NOT_FOUND,
                detail=message.USER_NOT_FOUND
            )
        
        # verify the old password with hash password in database stored
        if not verify_password(old_password,user["password"]):
             raise HTTPException(
                 status_code=http_status.BAD_REQUEST,
                 detail="old password is incorrect"
             )
        
        result = user_collection.update_one(
            {"_id":ObjectId(user_id)},
            {"$set": {"password": hash_password(new_password)}}
        )

        if result.modified_count==1:
                # if data is inserted successfully then return success message and user id
                return response.success_response(
                    message = f" Password is Change Successfully",
                    data ={
                    "_id": user_id
                    },
                    status = http_status.OK 
            )
        else:
            # if data is inserted successfully then return success message and user id
            raise HTTPException(
                status_code= http_status.BAD_REQUEST,
                detail="password is not change"
            )


    except HTTPException as e:
        raise e
    
    except HTTPException as e:
        return response.error_response(
                message=str(e),
                status=http_status.INTERNAL_SERVER_ERROR
            )
    
# delete the user by id 
async def delete_user_by_id(user_id:str):
    try:

        # if user id is provided then return error message
        if not user_id :
            raise HTTPException(
                status_code=http_status.BAD_REQUEST,
                detail="User Id is Required"
            )

        user = user_collection.find_one({"_id":ObjectId(user_id)})

        if not user:
            raise HTTPException(
                status_code=http_status.NOT_FOUND,
                detail=message.USER_NOT_FOUND
            )
        
        result = user_collection.delete_one({"_id":ObjectId(user_id)})

        if result.deleted_count==1:
                # if data is inserted successfully then return success message and user id
                return response.success_response(
                    message = f"{user_id} is deleted successfully",
                    data ={
                    "_id": user_id
                    },
                    status = http_status.OK 
            )
        else:
            # if data is inserted successfully then return success message and user id
            raise HTTPException(
                status_code= http_status.BAD_REQUEST,
                detail="password is not change"
            )
   
    except HTTPException as e:
        raise e
    
    except HTTPException as e:
        return response.error_response(
                message=str(e),
                status=http_status.INTERNAL_SERVER_ERROR
            )