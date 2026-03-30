from fastapi.encoders import jsonable_encoder
from config.db import db
from core import response, http_status
from core.dependency import get_current_user
from fastapi import Request,Depends,HTTPException
from utility.email_service import send_email
from utility.otphtml import message_template
from bson import ObjectId
from dotenv import load_dotenv
import os
import razorpay
import hmac
import hashlib
from datetime import datetime
from pymongo import DESCENDING, ASCENDING

load_dotenv()

# load the secret_key and api key from .env
SECRET_KEY = os.getenv("RAZORPAY_SECRET_KEY") 
API_KEY = os.getenv("RAZORPAY_API_KEY")

client = razorpay.Client(auth=(API_KEY,SECRET_KEY))

# create the booking collection
booking_collection = db["booking"]
service_collection = db["service_category"]
user_collection = db["users"]
provider_collection = db["providers"]


# create booking 
async def create_booking(request:Request,current_user:dict=Depends(get_current_user)):
    try:

        # load the data from request body
        data = await request.json()
        provider_id = data.get("provider_id")

        user_id = str(current_user.get("user_id")) 

        if not user_id:
            raise HTTPException(
                status_code=http_status.UNAUTHORIZED,
                detail="user is not authenticated"
            )
        
        if not provider_id:
            raise HTTPException(
                status_code=http_status.NOT_FOUND,
                detail="provider id is not found"
            )
        
        
        provider = provider_collection.find_one({"_id":ObjectId(provider_id)})

        if not provider:
             raise HTTPException(
                status_code=http_status.NOT_FOUND,
                detail="provider is not found"
            )
        
        service_id = provider["service_category_id"]
        price = float(provider.get("price",0))

        if not service_id:
            raise HTTPException(
                status_code=http_status.BAD_REQUEST,
                detail="Service ID missing in provider"
            )

        if price <= 0:
            raise HTTPException(
                status_code=http_status.BAD_REQUEST,
                detail="Invalid price"
            )
        
        #  Validate service exists
        service = service_collection.find_one({
            "_id": ObjectId(service_id)
        })

        if not service:
            raise HTTPException(
                status_code=http_status.NOT_FOUND,
                detail="Service not found"
            )

        # create the razorpay order
        order = client.order.create({
            "amount":int(price*100),
            "currency":"INR",
            "receipt":user_id
        })     

        # booking_data = {
        #     "user_id": user_id,
        #     "provider_id":provider_id,
        #     "service_id": str(service_id),
        #     "price": price,
        #     "razorpay_order_id": order["id"],
        #     "booking_date":datetime.utcnow().isoformat(),
        #     "payment_status": "pending",
        #     "booking_status": "pending"
        # }


        

        return response.created_response(
            status=http_status.CREATED,
            message="Order created successfully",
            data={
                "order_id": order["id"],
                "amount": order["amount"],
                "provider_id": provider_id,
                "service_id": str(service_id),
                "price": price
            }
        )
    
    except HTTPException:
        raise

    except Exception as e:
        return response.error_response(
            status=http_status.INTERNAL_SERVER_ERROR,
            message=str(e)
        )
    

# verify the payment booking 
# verify payment and CREATE booking
async def verify_payment(request: Request, current_user: dict = Depends(get_current_user)):
    try:
        data = await request.json()

        user_id = str(current_user.get("user_id"))

        razorpay_order_id = data.get("razorpay_order_id")
        razorpay_payment_id = data.get("razorpay_payment_id")
        razorpay_signature = data.get("razorpay_signature")
        provider_id = data.get("provider_id")  # ✅ IMPORTANT

        if not user_id:
            raise HTTPException(
                status_code=http_status.UNAUTHORIZED,
                detail="User is Unauthorized"
            )

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature, provider_id]):
            raise HTTPException(
                status_code=http_status.BAD_REQUEST,
                detail="Missing payment data"
            )

        # ✅ Verify Signature
        generated_signature = hmac.new(
            bytes(SECRET_KEY, "utf-8"),
            bytes(razorpay_order_id + "|" + razorpay_payment_id, "utf-8"),
            hashlib.sha256
        ).hexdigest()

        if generated_signature != razorpay_signature:
            raise HTTPException(
                status_code=http_status.BAD_REQUEST,
                detail="Invalid Signature"
            )

        # Fetch provider again
        provider = provider_collection.find_one({"_id": ObjectId(provider_id)})
        if not provider:
            raise HTTPException(status_code=404, detail="Provider not found")

        service_id = provider.get("service_category_id")
        price = float(provider.get("price", 0))

        # Fetch service
        service = service_collection.find_one({"_id": ObjectId(service_id)})
        service_name = service.get("service_name")

        # Fetch user
        user = user_collection.find_one({"_id": ObjectId(user_id)})
        user_email = user.get("email")
        user_name = user.get("name")

        # Fetch provider user
        provider_user = user_collection.find_one({"_id": ObjectId(provider["user_id"])})
        provider_email = provider_user.get("email")
        provider_name = provider_user.get("name")

        # CREATE BOOKING ONLY HERE
        booking_data = {
            "user_id": user_id,
            "provider_id": provider_id,
            "service_id": str(service_id),
            "price": price,

            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature,

            "payment_status": "success",
            "booking_status": "confirmed",

            "booking_date": datetime.utcnow().isoformat(),
            "payment_date": datetime.utcnow().isoformat()
        }

        result = booking_collection.insert_one(booking_data)

        # Send Emails
        user_email_body = message_template(
            username=user_name,
            message=f"Your booking for {service_name} is confirmed."
        )

        provider_email_body = message_template(
            username=provider_name,
            message=f"You have a new booking for {service_name}."
        )

        send_email(to_email=user_email, subject="Booking Confirmation", body=user_email_body)
        send_email(to_email=provider_email, subject="New Booking Received", body=provider_email_body)

        return response.success_response(
            status=http_status.OK,
            message="Payment successful & booking confirmed",
            data={
                "booking_id": str(result.inserted_id),
                "order_id": razorpay_order_id,
                "payment_id": razorpay_payment_id,
                "status": "success"
            }
        )

    except HTTPException:
        raise

    except Exception as e:
        return response.error_response(
            status=http_status.INTERNAL_SERVER_ERROR,
            message=str(e)
        )


async def fetch_booking(request: Request, current_user: dict = Depends(get_current_user)):
    try:
        params = request.query_params
        search = params.get("search", "")
        sort_by = params.get("sort_by", "booking_date")
        sort_order = int(params.get("sort_order", 1))
        page = int(params.get("page", 1))
        limit = int(params.get("limit", 12))

        user_id = str(current_user.get("user_id"))

        if not user_id:
            raise HTTPException(status_code=401, detail="User not authenticated")

        skip = (page - 1) * limit
        sort_direction = 1 if sort_order == 1 else -1

        # ---------------- BASE PIPELINE ---------------- #
        base_pipeline = [

            # ✅ MATCH USER BOOKINGS
            {
                "$match": {
                    "user_id": user_id
                }
            },

            # ✅ SAFE OBJECT ID CONVERSION
            {
                "$addFields": {
                    "provider_id_obj": {
                        "$cond": [
                            {"$and": [
                                {"$ne": ["$provider_id", None]},
                                {"$ne": ["$provider_id", ""]}
                            ]},
                            {"$toObjectId": "$provider_id"},
                            None
                        ]
                    },
                    "service_id_obj": {
                        "$cond": [
                            {"$and": [
                                {"$ne": ["$service_id", None]},
                                {"$ne": ["$service_id", ""]}
                            ]},
                            {"$toObjectId": "$service_id"},
                            None
                        ]
                    }
                }
            },

            # ---------------- PROVIDER LOOKUP ---------------- #
            {
                "$lookup": {
                    "from": "providers",
                    "localField": "provider_id_obj",
                    "foreignField": "_id",
                    "as": "provider"
                }
            },
            {
                "$unwind": {
                    "path": "$provider",
                    "preserveNullAndEmptyArrays": True
                }
            },

            # ✅ CONVERT provider.user_id → ObjectId
            {
                "$addFields": {
                    "provider_user_id_obj": {
                        "$cond": [
                            {"$and": [
                                {"$ne": ["$provider.user_id", None]},
                                {"$ne": ["$provider.user_id", ""]}
                            ]},
                            {"$toObjectId": "$provider.user_id"},
                            None
                        ]
                    }
                }
            },

            # ---------------- PROVIDER USER LOOKUP ---------------- #
            {
                "$lookup": {
                    "from": "users",
                    "localField": "provider_user_id_obj",
                    "foreignField": "_id",
                    "as": "provider_user"
                }
            },
            {
                "$unwind": {
                    "path": "$provider_user",
                    "preserveNullAndEmptyArrays": True
                }
            },

            # ---------------- SERVICE LOOKUP ---------------- #
            {
                "$lookup": {
                    "from": "service_category",
                    "localField": "service_id_obj",
                    "foreignField": "_id",
                    "as": "service"
                }
            },
            {
                "$unwind": {
                    "path": "$service",
                    "preserveNullAndEmptyArrays": True
                }
            }
        ]

        # ---------------- SEARCH ---------------- #
        if search:
            base_pipeline.append({
                "$match": {
                    "$or": [
                        {"provider_user.name": {"$regex": search, "$options": "i"}},
                        {"service.service_name": {"$regex": search, "$options": "i"}},
                        {"booking_status": {"$regex": search, "$options": "i"}},
                        {"payment_status": {"$regex": search, "$options": "i"}}
                    ]
                }
            })

        # ---------------- DATA PIPELINE ---------------- #
        data_pipeline = base_pipeline + [
            {"$sort": {sort_by: sort_direction}},
            {"$skip": skip},
            {"$limit": limit}
        ]

        bookings = list(booking_collection.aggregate(data_pipeline))

        # ---------------- COUNT PIPELINE ---------------- #
        count_pipeline = base_pipeline + [
            {"$count": "total"}
        ]

        total_result = list(booking_collection.aggregate(count_pipeline))
        total_bookings = total_result[0]["total"] if total_result else 0

        # ---------------- FORMAT RESPONSE ---------------- #
        booking_data = []

        for b in bookings:
            booking_data.append({
                "booking_id": str(b["_id"]),
                "provider_name": b.get("provider_user", {}).get("name") or "N/A",
                "service_name": b.get("service", {}).get("service_name") or "N/A",
                "price": b.get("price"),
                "booking_status": b.get("booking_status"),
                "payment_status": b.get("payment_status"),
                "payment_date": b.get("payment_date"),
                "booking_date": b.get("booking_date"),
            })

        total_pages = (total_bookings + limit - 1) // limit

        return response.success_response(
            status=200,
            message="Booking data retrieved",
            data=jsonable_encoder({
                "bookings": booking_data,
                "pagination": {
                    "total_bookings": total_bookings,
                    "total_pages": total_pages,
                    "current_page": page,
                    "limit": limit
                }
            })
        )

    except Exception as e:
        return response.error_response(
            status=500,
            message=str(e)
        )