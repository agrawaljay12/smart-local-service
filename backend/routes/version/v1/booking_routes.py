from fastapi import APIRouter, Request,Depends
from core import http_status
from core import response 
from core.dependency import get_current_user
from controllers.booking_controller import create_booking,verify_payment,fetch_booking,fetch_provider_booking,update_booking_status


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
async def Verify_Order(request:Request, current_user: dict = Depends(get_current_user)):
    return await verify_payment(request,current_user)

# URL:http://127.0.0.1:8000/api/v1/booking/fetch/current_user
# METHOD:GET
# description: fetch current user booking
@router.get('/fetch/current_user',response_description="fetch current user booking")
async def fetch_booking_endpoint(request:Request,current_user: dict = Depends(get_current_user)):
    return await fetch_booking(request,current_user)


# URL:http://127.0.0.1:8000/api/v1/booking/fetch/provider
# METHOD:GET
# description: fetch current user booking
@router.get('/fetch/provider',response_description="Get Provider Booking")
async def fetch_provider_booking_endpoint(request:Request,current_user: dict = Depends(get_current_user)):
    return await fetch_provider_booking(request,current_user)


# URL:http://127.0.0.1:8000/api/v1/booking/update/status/{booking_id}
# METHOD:PUT
# description: update booking status of particular booking
@router.put('/update/status/{booking_id}',response_description="Update Booking Status")
async def update_booking_status_endpoint(booking_id: str,current_user: dict = Depends(get_current_user)):
    return await update_booking_status(current_user, booking_id)