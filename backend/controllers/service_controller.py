from models.services import Service_Category
from core import http_status
from core import response
from config.db import db    
from bson import ObjectId
from fastapi import HTTPException

# define the service category collection
service_category_collection = db['service_category']

# create a new service category
async def create_service_category(request):
    try:
        # get the request data
        data = await request.json()
        service_name = data.get('service_name')

        # if service name is not provided, return an error response
        if not service_name:
            return response.error_response("Service name is required")
        
        # create a new service category document
        service_category = Service_Category(service_name=service_name)

        result = service_category_collection.insert_one(service_category.dict())

        return response.success_response("Service category created successfully", {"id": str(result.inserted_id)}, status=http_status.CREATED)
    
    except Exception as e:
        return response.error_response(str(e), status=http_status.INTERNAL_SERVER_ERROR)
    

# get all service categories
async def get_service_categories():
    try:

        # find all service categories in the collection
        result = service_category_collection.find()

        # create a empty list to store the service categories
        service_categories = []

        # iterate through the result and append the service categories to the list
        for service in result:

            service['_id'] = str(service['_id'])
            service_categories.append(service)

        # return the service categories in the response
        return response.success_response("Service categories retrieved successfully", service_categories)
    
    except Exception as e:
        return response.error_response(str(e), status=http_status.INTERNAL_SERVER_ERROR)
    
    except Exception as e:
        return response.error_response(str(e), status=http_status.INTERNAL_SERVER_ERROR)

# get service categories by id
async def get_service_by_id(service_id:str):
    try:

        if not service_id:
            raise HTTPException(
                status_code=http_status.NOT_FOUND,
                detail="Service is not found"
            )
        
        service = service_category_collection.find_one({"_id":ObjectId(service_id)})

        service["_id"] = str(service["_id"])

        if not service:
            raise HTTPException(
                status_code=http_status.NOT_FOUND,
                detail="Service is not found"
            )
        else:
            return response.success_response(
                status=http_status.OK,
                message="Service is retrieved successfully",
                data= service
            )
         
    except Exception as e:
        return response.error_response(str(e), status=http_status.INTERNAL_SERVER_ERROR)
    
    except Exception as e:
        return response.error_response(str(e), status=http_status.INTERNAL_SERVER_ERROR)
        
        