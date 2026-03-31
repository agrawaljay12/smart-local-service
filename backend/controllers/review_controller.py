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
booking_collection = db["booking"]
provider_collection = db["providers"]

async def create_review(request:Request, current_user: dict =Depends(get_current_user)):
     try: 

        # get the review data from the request body
        data = await request.json() 
        booking_id = data.get("booking_id")
        provider_id = data.get("provider_id")
        rating = int(data.get("rating"))
        comment = data.get("comment") 
        user_id = str(current_user.get("user_id")) 

        # if user is not authenticated, raise an error
        if not user_id:
            raise HTTPException(status_code=http_status.UNAUTHORIZED, detail="Unauthorized") 

        # validate the review data 
        if not booking_id or not provider_id or rating is None or comment is None:
            raise HTTPException(status_code=http_status.BAD_REQUEST, detail="Missing required fields") 
        
        # check if provider exists
        provider = provider_collection.find_one({"_id": ObjectId(provider_id)})
        if not provider:
            raise HTTPException(status_code=http_status.NOT_FOUND, detail="Provider not found")
        
        # validate rating
        if rating < 1 or rating > 5:
             raise HTTPException(status_code=http_status.BAD_REQUEST, detail="Invalid rating")
             
        # check if booking exists and is completed  
        booking = booking_collection.find_one({"_id": ObjectId(booking_id), "user_id": user_id, "provider_id": provider_id, "booking_status": "completed"}) 

        # check if booking is not found or not completed 
        if not booking:    
            raise HTTPException(status_code=http_status.BAD_REQUEST, detail="Invalid booking or booking not completed") 
        
        # check if review already exists for this booking
        review = review_collection.find_one({"booking_id": str(booking_id)}) 
        
        if review:
             raise HTTPException(status_code=http_status.BAD_REQUEST, detail="Review already exists for this booking")
        
        # create the review data
        review_data = Review(
             user_id=user_id, 
             provider_id=provider_id,
             booking_id=booking_id, 
             rating=rating, 
             comment=comment, 
             created_at= datetime.utcnow().isoformat() 
            ) 
        
        # insert the review into the database
        result = review_collection.insert_one(review_data.dict()) 
        
        # Recalculate average rating 
        pipeline = [
            {"$match": {"provider_id": provider_id}},
            {
                "$group": {
                    "_id": None,
                    "avg_rating": {"$avg": "$rating"},
                    "total_reviews": {"$sum": 1}
                }
            }
        ]

        # execute the aggregation pipeline to calculate average rating and total reviews for the provider
        result = list(review_collection.aggregate(pipeline))

        avg_rating = result[0]["avg_rating"] if result else 0
        total_reviews = result[0]["total_reviews"] if result else 0
        
        # Update provider document with the new average rating and total reviews
        provider_collection.update_one( {"_id": ObjectId(provider_id)}, { "$set": { "avg_rating": round(avg_rating, 1), "total_reviews": total_reviews } } ) 
        
        return response.success_response( 
            status=http_status.CREATED,
            detail="Review created successfully", 
            data={"review_id": str(result.inserted_id)} 
        ) 
     
     except HTTPException: 
         raise 
     
     except Exception as e: 
        return response.error_response( 
            status=http_status.INTERNAL_SERVER_ERROR, 
            detail=str(e) 
        )