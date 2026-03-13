from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from controllers.otp_controller import generate_otp,verify_otp
from core import http_status
from models.otp import Otp


router = APIRouter()

# url: http://127.0.0.1:8000/api/v1/otp/
# method: GET
# description : WELCOME TO API HOME 
@router.get('/',response_description="Welcome to the OTP Management API")
async def home():
    return JSONResponse(
        status_code= http_status.OK,
        content={"message": "Welcome to the OTP Management API"}

    )

# url: http://127.0.0.1:8000/api/v1/otp/generate    
# method: POST
# description : WELCOME TO API HOME 

@router.post('/generate',response_description="OTP generated successfully")
async def generate_otp_route(request:Request):
    return await generate_otp(request)


# url: http://127.0.0.1:8000/api/v1/otp/verify
# method: POST
# description : WELCOME TO API HOME 
@router.post('/verify',response_description="OTP Verifyed successfully")
async def verify_otp_route(request:Request):
    return await verify_otp(request)
