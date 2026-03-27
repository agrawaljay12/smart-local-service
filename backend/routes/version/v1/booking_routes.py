from fastapi import APIRouter
from core import http_status
from core import response 
import razorpay
import hmac
import hashlib
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# load the environment variable

SECRET_KEY = os.getenv("RAZORPAY_SECRET_KEY") 
API_KEY = os.getenv("RAZORPAY_API_KEY")

client = razorpay.Client(auth=(API_KEY,SECRET_KEY))

print(API_KEY)
print(SECRET_KEY)




# test route
# URL:http://127.0.0.1:8000/api/v1/booking/
# URL:http://127.0.0.1:8000/api/v1/booking
# METHOD:GET
# description: Welcome to Booking API Management

@router.get('/',response_description="Welcome to Booking API Management")
async def booking_home():
    return response.success_response(
        status=http_status.OK,
        message="Welcome to Booking API Management"
    )




# URL:http://127.0.0.1:8000/api/v1/booking/create
# METHOD:POST
# description: create booking 
@router.post('/create',response_description="Create Booking")
async def Create_Order():
   order = client.order.create({
       "amount":500*100,
       "currency":"INR",
       "payment_capture":1
   })
   return order


# URL:http://127.0.0.1:8000/api/v1/booking/verify
# METHOD:POST
# description: create booking 
@router.post('/verify',response_description="Verify Booking")
async def Verify_Order(data:dict):

    order_id = data["razorpay_order_id"]
    payment_id = data["razorpay_payment_id"]
    signature = data["razorpay_signature"]

    generated_signature = hmac.new(
        bytes(SECRET_KEY, "utf-8"),
        bytes(order_id + "|" + payment_id, "utf-8"),
        hashlib.sha256
    ).hexdigest()

    if generated_signature == signature:
        return {"status": "success"}
    else:
        return {"status": "failed"}