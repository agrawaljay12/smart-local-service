from config.db import db 
from models.provider import Provider
from core import response
from core import http_status
from bson import ObjectId
from datetime import datetime
from fastapi import UploadFile, File, Form, Depends,HTTPException,Request
from utility.file_upload import save_file
from core.dependency import get_current_user
from utility.email_service import send_email
from utility.otphtml import message_template
from pymongo import ASCENDING, DESCENDING

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
        if not user_id:
            return response.error_response("User id not found in token", status=http_status.UNAUTHORIZED)

        # ensure user exists
        if not user_collection.find_one({"_id": ObjectId(user_id)}):
            return response.error_response("User not found", status=http_status.NOT_FOUND)

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
    
# ---------------------fetch the all approved provider with searching, pagination, sorting.---------------------------------
async def get_all_approved_Provider(request: Request):
    try:
        # -------- Parse Request -------- #
        try:
            data = await request.json()
            if not isinstance(data, dict):
                data = {}
        except:
            data = {}

        params = request.query_params

        location = data.get("location") or params.get("location")
        description = data.get("description") or params.get("description")

        sort_order = (data.get("sort_order") or params.get("sort_order") or "asc").lower()
        sort_by = data.get("sort_by") or params.get("sort_by") or "price"

        page = max(int(data.get("page") or params.get("page") or 1), 1)
        limit = max(int(data.get("limit") or params.get("limit") or 12), 1)
        skip = (page - 1) * limit

        service_id = (data.get("service_id") or params.get("service_id") or "").strip()

        # -------- Validate service_id -------- #
        service_object_id = None
        if service_id:
            try:
                service_object_id = ObjectId(service_id)
            except:
                return response.success_response(
                    message="Invalid service_id",
                    data={
                        "providers": [],
                        "total": 0,
                        "page": page,
                        "limit": limit
                    },
                    status=http_status.OK
                )

        # -------- Sorting -------- #
        allowed_sort_fields = ["price", "rating", "experience"]
        if sort_by not in allowed_sort_fields:
            sort_by = "price"

        sort_direction = ASCENDING if sort_order == "asc" else DESCENDING

        # -------- Base Match -------- #
        match_stage = {
            "provider_status": "approved"
        }

        # 🔍 Search Filter
        if location or description:
            search_value = location or description
            match_stage["$or"] = [
                {"location": {"$regex": search_value, "$options": "i"}},
                {"description": {"$regex": search_value, "$options": "i"}}
            ]

        # -------- Aggregation Pipeline -------- #
        pipeline = [
            {"$match": match_stage},

            # ✅ Convert string → ObjectId (CORRECT FIELD)
            {
                "$addFields": {
                    "service_id_obj": {
                        "$convert": {
                            "input": "$service_category_id",  # ✅ FIXED
                            "to": "objectId",
                            "onError": None,
                            "onNull": None
                        }
                    }
                }
            }
        ]

        # ✅ Apply filter
        if service_object_id:
            pipeline.append({
                "$match": {
                    "service_id_obj": service_object_id
                }
            })

        pipeline.extend([

            # user conversion
            {
                "$addFields": {
                    "user_id_obj": {
                        "$convert": {
                            "input": "$user_id",
                            "to": "objectId",
                            "onError": None,
                            "onNull": None
                        }
                    }
                }
            },

            # user lookup
            {
                "$lookup": {
                    "from": "users",
                    "localField": "user_id_obj",
                    "foreignField": "_id",
                    "as": "user_details"
                }
            },
            {"$unwind": {"path": "$user_details", "preserveNullAndEmptyArrays": True}},

            # service lookup
            {
                "$lookup": {
                    "from": "service_category",
                    "localField": "service_id_obj",
                    "foreignField": "_id",
                    "as": "service_details"
                }
            },
            {"$unwind": {"path": "$service_details", "preserveNullAndEmptyArrays": True}},

            {
                "$facet": {
                    "data": [
                        {"$sort": {sort_by: sort_direction}},
                        {"$skip": skip},
                        {"$limit": limit},
                        {
                            "$project": {
                                "_id": {"$toString": "$_id"},  # ✅ FIX
                                "description": 1,
                                "price": 1,
                                "rating": 1,
                                "location": 1,
                                "experience": 1,
                                "name": "$user_details.name",
                                "email": "$user_details.email",
                                "phone_no": "$user_details.phone_no",
                                "service_name": "$service_details.service_name",

                                # ✅ IMPORTANT FIXES
                                "service_id": "$service_category_id",  # keep original string
                                "service_id_obj": {
                                    "$toString": "$service_id_obj"
                                }
                            }
                        }
                    ],
                    "total": [{"$count": "count"}]
                }
            }
        ])
        # -------- Execute -------- #
        result = list(provider_collection.aggregate(pipeline))

        providers = result[0]["data"] if result else []
        total_count = result[0]["total"][0]["count"] if result and result[0]["total"] else 0

        # Convert ObjectId → string
        for provider in providers:
            provider["_id"] = str(provider["_id"])

        return response.success_response(
            message="Providers retrieved successfully",
            data={
                "providers": providers,
                "total": total_count,
                "page": page,
                "limit": limit
            },
            status=http_status.OK
        )

    except Exception as e:
        return response.error_response(
            message=str(e),
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

        # if approved → update role
        if status == "approved":

            user_collection.update_one(
                {"_id": ObjectId(provider["user_id"])},
                {"$set": {"role": "provider"}}
            )

        # send email
        email_body = message_template(username= user["name"], message=f"Your Request is {status} by service local platform team")
        send_email(
            to_email=email,
            subject="Provider Request Status",
            body=email_body
        )

        return response.success_response(
            message=f"Provider request {status} successfully",
            status=http_status.OK,
            data = str(provider["_id"])
        )

    except Exception as e:
        return response.error_response(
            message=str(e),
            status=http_status.INTERNAL_SERVER_ERROR
        )
