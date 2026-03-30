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

async def create_review(request: Request, current_user: dict = Depends(get_current_user)):
    try:
        data = await request.json()

        booking_id = data.get("booking_id")
        provider_id = data.get("provider_id")
        rating = data.get("rating")
        comment = data.get("comment")

        user_id = str(current_user.get("user_id"))

        # Auth check
        if not user_id:
            raise HTTPException(status_code=http_status.UNAUTHORIZED, detail="Unauthorized")

        # Required fields
        if not all([booking_id, provider_id]) or rating is None:
            raise HTTPException(status_code=http_status.BAD_REQUEST, detail="Missing required fields")

        # Type safety
        try:
            rating = int(rating)
        except:
            raise HTTPException(status_code=400, detail="Rating must be a number")

        if rating < 1 or rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

        # Convert IDs properly
        booking_obj_id = ObjectId(booking_id)
        provider_obj_id = ObjectId(provider_id)

        # Validate booking
        booking = booking_collection.find_one({
            "_id": booking_obj_id,
            "user_id": user_id,
            "provider_id": provider_id,  # keep consistent with DB type
            "booking_status": "completed"
        })

        if not booking:
            raise HTTPException(
                status_code=400,
                detail="Invalid booking or not completed"
            )

        # Prevent duplicate review (atomic safer approach later)
        existing_review = review_collection.find_one({
            "booking_id": booking_id
        })

        if existing_review:
            raise HTTPException(
                status_code=400,
                detail="Review already exists"
            )

        # Save review
        review_data = {
            "user_id": user_id,
            "provider_id": provider_id,
            "booking_id": booking_id,
            "rating": rating,
            "comment": comment,
            "created_at": datetime.utcnow().isoformat()
        }

        result = review_collection.insert_one(review_data)

        # EFFICIENT aggregation (NO full fetch)
        pipeline = [
            {"$match": {"provider_id": provider_id}},
            {
                "$group": {
                    "_id": "$provider_id",
                    "avg_rating": {"$avg": "$rating"},
                    "total_reviews": {"$sum": 1}
                }
            }
        ]

        agg_result = list(review_collection.aggregate(pipeline))

        if agg_result:
            avg_rating = round(agg_result[0]["avg_rating"], 1)
            total_reviews = agg_result[0]["total_reviews"]
        else:
            avg_rating = rating
            total_reviews = 1

        # Update provider safely
        provider = provider_collection.find_one({"_id": provider_obj_id})
        if not provider:
            raise HTTPException(status_code=404, detail="Provider not found")

        provider_collection.update_one(
            {"_id": provider_obj_id},
            {
                "$set": {
                    "avg_rating": avg_rating,
                    "total_reviews": total_reviews
                }
            }
        )

        return response.success_response(
            status_code=http_status.CREATED,
            detail="Review created successfully",
            data={
                "review_id": str(result.inserted_id),
                "avg_rating": avg_rating
            }
        )

    except HTTPException:
        raise

    except Exception as e:
        return response.error_response(
            status_code=http_status.INTERNAL_SERVER_ERROR,
            detail=str(e)
        )