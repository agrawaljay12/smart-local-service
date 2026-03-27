from models.booking import Booking
from config.db import db
from core import response, http_status
from core.dependency import get_current_user
from fastapi import Request,Depends,HTTPException
from bson import ObjectId
from dotenv import load_dotenv
import os
import razorpay
import hmac
import hashlib
from datetime import datetime

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
        service_id = data.get("service_id")

        user_id = str(current_user.get("user_id")) 

        if not user_id:
            raise HTTPException(
                status_code=http_status.NOT_FOUND,
                detail="User Id is not found"
            )
        
        service = service_collection.find_one({"_id":ObjectId(service_id)})

        # service_id = str(service["_id"])

        if not service_id:
             raise HTTPException(
                status_code=http_status.NOT_FOUND,
                detail="Service Id is not found"
            )
        
        provider = provider_collection.find_one({"price":price})

        # convert the price into float
        price = float(provider["price"])

        # create the razorpay order
        order = client.order.create({
            "amount":int(price*100),
            "currency":"INR",
            "receipt":user_id
        })
        
        booking_date = datetime.utcnow()

        booking_data = {
            "user_id": user_id,
            "service_id": service_id,
            "price": price,
            "razorpay_order_id": order["id"],
            "booking_date": booking_date,
            "payment_status": "pending",
            "booking_status": "pending"
        }


        result = booking_collection.insert_one(booking_data)

        return response.created_response(
            status=http_status.CREATED,
            message="Order created successfully",
            data={
                "order_id": order["id"],
                "amount": order["amount"],
                "booking_id": str(result.inserted_id)
            }
        )

    except Exception as e:
        return response.error_response(
            status=http_status.INTERNAL_SERVER_ERROR,
            message=str(e)
        )
    

    # verify the payment booking 
async def verify_payment(request:Request):
    try:

        # load the data from request body
        data = await request.json()
        
        order_id = data.get("razorpay_order_id")
        payment_id = data.get("razorpay_payment_id")
        razorpay_signature = data.get("razorpay_signature")

        if not order_id or not payment_id or not razorpay_signature:
            raise HTTPException(status_code=400, detail="Missing payment data")

        generated_signature = hmac.new(
            bytes(SECRET_KEY, "utf-8"),
            bytes(order_id + "|" + payment_id, "utf-8"),
            hashlib.sha256
        ).hexdigest()


        if generated_signature !=razorpay_signature:
            raise HTTPException(
                status_code=http_status.BAD_REQUEST,
                detail="Invalid Signature"
            )
        
        
        booking_data ={
            "razorpay_payment_id":payment_id,
            "razorpay_signature":razorpay_signature,
            "payment_status":"success",
            "booking_status":"confirmed",
            "payment_date":datetime.utcnow()
        }

        result = booking_collection.update_one({"razorpay_order_id":order_id},{"$set":booking_data})


        if result.modified_count==1:
            return response.success_response(
                status=http_status.OK,
                message=f"Your payment is successful",
                data=result
            )


    except Exception as e:
        return response.error_response(
            status=http_status.INTERNAL_SERVER_ERROR,
            message=str(e)
        )
