from models.review import Review
from fastapi import Depends, HTTPException,Request
from config.db import db
from core.dependency import get_current_user
from bson import ObjectId
from core import http_status
from core import response
from datetime import datetime

# created the review collection
review_collection = db["reviews"]
booking_collection = db["bookings"]
provider_collection = db["providers"]

async def create_review(request:Request, current_user: dict =Depends(get_current_user)):
    try:
        data = await request.json()

        booking_id = data.get("booking_id")
        provider_id = data.get("provider_id")
        rating = data.get("rating")
        comment = data.get("comment")
        user_id = str(current_user.get("user_id"))
        
        if not user_id:
            raise HTTPException(status_code=http_status.UNAUTHORIZED, detail="Unauthorized")
        
        if not booking_id or not provider_id or rating is None or comment is None:
            raise HTTPException(status_code=http_status.BAD_REQUEST, detail="Missing required fields")
        
        if rating < 1 or rating > 5:
            raise HTTPException(status_code=http_status.BAD_REQUEST, detail="Invalid rating")
        
        booking = booking_collection.find_one({"_id": ObjectId(booking_id), "user_id": user_id, "provider_id": provider_id, "booking_status": "completed"})

        print(booking)

        if not booking:
            raise HTTPException(status_code=http_status.BAD_REQUEST, detail="Invalid booking or booking not completed")
        
        review = review_collection.find_one({"booking_id": booking_id})

        if review:
            raise HTTPException(status_code=http_status.BAD_REQUEST, detail="Review already exists for this booking")
        
        review_data = Review(
            user_id=user_id,
            provider_id=provider_id,
            booking_id=booking_id,
            rating=rating,
            comment=comment,
            created_at= datetime.utcnow().isoformat()
        )
        
        result = review_collection.insert_one(review_data.dict())

        # Recalculate average rating
        reviews = list(review_collection.find({"provider_id": provider_id}))

        avg_rating = sum(r["rating"] for r in reviews) / len(reviews)

        # Update provider
        provider_collection.update_one(
            {"_id": ObjectId(provider_id)},
            {
                "$set": {
                    "avg_rating": round(avg_rating, 1),
                    "total_reviews": len(reviews)
                }
            }
        )

        return response.success_response(
            status_code=http_status.CREATED,
            detail="Review created successfully",
            data={"review_id": str(result.inserted_id)}
        )    

    except HTTPException:
        raise

    except Exception as e:
        return response.error_response(
            status_code=http_status.INTERNAL_SERVER_ERROR,
            detail=str(e)
        )