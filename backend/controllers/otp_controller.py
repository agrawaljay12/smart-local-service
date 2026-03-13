from models.otp import Otp
from utility.otphtml import otp_template
from fastapi import  HTTPException, Request,status
from fastapi.responses import JSONResponse
from utility.email_service import send_email
from datetime import datetime, timedelta
from config.db import db 
import random

otp_collection = db["otp"]
user_collection = db["users"]

# ----------------------------generate otp and send to email--------------------------------------
async def generate_otp(request:Request):
    try:
        # get the email from the request body
        data = await request.json()
        email = data.get("email")

        # check if the user exists in the database
        if not user_collection.find_one({"email":email}):
            raise HTTPException(status_code=404, detail="User not found")

        # generate a random 6-digit OTP
        otp = str(random.randint(100000, 999999))

        # set the OTP expiration time (e.g., 10 minutes from now)
        expires_at = datetime.utcnow() + timedelta(minutes=10)
        created_at=datetime.utcnow().isoformat()

        # create an Otp object and save it to the database
        otp_data = Otp(email=email, otp=otp, created_at=created_at, expires_at=expires_at.isoformat())
        otp_collection.insert_one(otp_data.dict())

        # send the OTP to the user's email
        email_body = otp_template(otp)
        send_email(to_email=email, subject="Your OTP Code", body=email_body)

        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "status": status.HTTP_201_CREATED,
                "message": "OTP generated and sent to email successfully"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# ---------------------verify the otp and check if it is valid and not expired------------------------
async def verify_otp(request: Request):
    try:
        data = await request.json()

        email = data.get("email")
        otp = data.get("otp")

        if not email or not otp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email and OTP are required"
            )

        # normalize values
        email = email.strip().lower()
        otp = str(otp).strip()

        print(email)
        print(otp)

        # check if email exists
        email_record = otp_collection.find_one({"email": email})
        print("Email Record:", email_record)

        # find OTP record
        otp_record = otp_collection.find_one({
            "email": email,
            "otp": otp
        })
        print(otp_collection.find())

        if not otp_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP"
            )

        # check expiration
        expires_at = otp_record.get("expires_at")

        if datetime.utcnow() > expires_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP has expired"
            )

        # delete OTP after verification
        otp_collection.delete_one({"_id": otp_record["_id"]})

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": status.HTTP_200_OK,
                "message": "OTP verified successfully"
            }
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )