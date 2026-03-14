from controllers.service_controller import create_service_category,get_service_categories
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from fastapi import Request, status

router = APIRouter()


# url: http://127.0.0.1:8000/api/v1/services/
# method: GET
# description : WELCOME TO API HOME 
@router.get('/',response_description="Welcome to the Service Category API")
async def home():
    return JSONResponse(
        status_code= status.HTTP_200_OK,
        content={"message": "Welcome to the Service Category API"}

    )

# url: http://127.0.0.1:8000/api/v1/services/create
# method: POST
# description : create a new service category

@router.post('/create',response_description="Create a new service category")
async def create_service_category_endpoint(request:Request):
    return await create_service_category(request)


# url: http://127.0.0.1:8000/api/v1/services/fetch_all
# method: GET
# description : fetch all service categories

@router.get('/fetch_all',response_description="Fetch all service categories")
async def get_service_categories_endpoint():
    return await get_service_categories()