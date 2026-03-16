from config.db import db 
from models.provider import Provider
from core import response
from core import http_status
from bson import ObjectId
from datetime import datetime
from fastapi import UploadFile, File, Form, Depends,HTTPException
from utility.file_upload import save_file
from core.dependency import get_current_user
from utility.email_service import send_email
from utility.otphtml import otp_template

# define the provider collection
provider_collection = db['providers']
service_category_collection = db['service_category']
user_collection = db["users"]


# create a new provider
async def create_provider(
    service_category_id: str = Form(...),
    location: str = Form(...),
    experience: str = Form(...),
    price: str = Form(...),
    description: str = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user) 
):
    try:
        # check if the service category exists
        service_category = service_category_collection.find_one({"_id": ObjectId(service_category_id)})

        # if service category does not exist, return an error response
        if not service_category:
            return response.error_response("Service category not found", status=http_status.NOT_FOUND)
    

        user_id = current_user.get("user_id") or str(current_user.get("_id"))

        # save the uploaded file and get its path
        proof_document_path = await save_file(file, "provider")

        # create a new provider document
        provider = Provider(
            user_id=user_id,
            service_category_id=service_category_id,
            location=location,
            experience=experience,
            price=price,
            description=description,
            created_at=datetime.utcnow().isoformat(),
            proof_document=proof_document_path
        )

        result = provider_collection.insert_one(provider.dict())

        return response.success_response("Provider created successfully", {"id": str(result.inserted_id)}, status=http_status.CREATED)
    except Exception as e:
        return response.error_response(str(e), status=http_status.INTERNAL_SERVER_ERROR)

# list all provider based on status =="approved"
async def get_all_approved_Provider():
    try:
        providers =[]

        result = provider_collection.find({"provider_status":"approved"})

        for provider in result:

            provider["_id"] = str(provider["_id"])
            providers.append(provider)
            
        return response.success_response(
            message = "Providers retrieved successfully",
            data = providers,
            status = http_status.OK 
        )
    except Exception as e:
        return response.error_response(
            message= str(e), 
            status=http_status.INTERNAL_SERVER_ERROR
        )

# fetch all pending status of provider
async def get_all_pending_Provider():
    try:
        providers =[]

        result = provider_collection.find({"provider_status":"pending"})

        for provider in result:

            provider["_id"] = str(provider["_id"])
            providers.append(provider)
            
        return response.success_response(
            message = "Providers retrieved successfully",
            data = providers,
            status = http_status.OK 
        )
    except Exception as e:
        return response.error_response(
            message= str(e), 
            status=http_status.INTERNAL_SERVER_ERROR
        )
    
# accept the request of provider aproved/reject and update the role
async def approved_reject_request_provider(provider_id:str,status:str):
    
    try:

        # if status is not found then raise http bad request error
        if status not in ["approved", "rejected"]:
            raise HTTPException(
                status_code=http_status.BAD_REQUEST,
                detail="Invalid status"
            )
        
        # if provider id is not provided then raise error of bad request 
        if not provider_id:
            raise HTTPException(
                status_code= http_status.BAD_REQUEST,
                detail="provider id is required"
            )
        
        provider = provider_collection.find_one({"_id":ObjectId(provider_id)})

        # if provider id is not found then raise error
        if not provider:
              raise HTTPException(
                status_code= http_status.NOT_FOUND,
                detail="provider is not found"
            )
        
        # find the user email  
        user = user_collection.find_one({"_id":ObjectId(provider["user_id"])})

        if not user: 
            raise HTTPException(
                status_code=http_status.NOT_FOUND,
                detail="User not found"
            )
        
        email = user["email"]

        # update provider status
        provider_collection.update_one(
            {"_id": ObjectId(provider_id)},
            {"$set": {"provider_status": status}}
        )

        # update provider status
        provider_collection.update_one(
            {"_id": ObjectId(provider_id)},
            {"$set": {"provider_status": status}}
        )

        # if approved → update role
        if status == "approved":

            user_collection.update_one(
                {"_id": ObjectId(provider["user_id"])},
                {"$set": {"role": "provider"}}
            )

        # send email
        email_body = otp_template(status)

        send_email(
            to_email=email,
            subject="Provider Request Status",
            body=email_body
        )

        return response.success_response(
            message=f"Provider request {status} successfully",
            status=http_status.OK
        )

    except Exception as e:
        return response.error_response(
            message=str(e),
            status=http_status.INTERNAL_SERVER_ERROR
        )
