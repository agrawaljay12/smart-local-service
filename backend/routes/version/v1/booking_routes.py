from fastapi import APIRouter, Request,Depends
from core import http_status
from core import response 
from core.dependency import get_current_user
from controllers.booking_controller import create_booking,verify_payment


router = APIRouter()

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
async def Create_Order(request:Request,current_user: dict = Depends(get_current_user)):
    return await create_booking(request,current_user)



# URL:http://127.0.0.1:8000/api/v1/booking/verify
# METHOD:POST
# description: create booking 
@router.post('/verify',response_description="Verify Booking")
async def Verify_Order(request:Request):
    return await verify_payment(request)