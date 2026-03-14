from fastapi import APIRouter, Depends,Request,status
from controllers.user_controller import create_user, forgot_password, get_all_users,login_user
from core.dependency import get_required_role
from fastapi.responses import JSONResponse
# from config.db import get_database



router = APIRouter()

# url: http://127.0.0.1:8000/api/v1/users/
# method: GET
# description : WELCOME TO API HOME 
@router.get('/',response_description="Welcome to the User Management API")
async def home():
    return JSONResponse(
        status_code= status.HTTP_200_OK,
        content={"message": "Welcome to the User Management API"}

    )

# URL:http://127.0.0.1:8000/api/v1/users/create
# method : POST
# description : create a new user

@router.post("/create",response_description="Create a new user")
async def add_user(request:Request):
    return await create_user(request)


# URL: http://127.0.0.1:8000/api/v1/users/login
# method : POST
# description : login a user

@router.post("/login",response_description="Login a user")
async def handle_login_user(request:Request):
   return await login_user(request)


# URL: http://127.0.0.1:8000/api/v1/users/fetch/all
# method : GET
# description : get all users
@router.get("/fetch/all",response_description="Get all users",dependencies=[Depends(get_required_role(["admin"]))])
async def get_all_users_route():
    return await get_all_users()


# URL: http://127.0.0.1:8000/api/v1/users/forgot-password
# method :put
# description : forgot password for user
@router.put("/forgot-password",response_description="Forgot password for user")
async def forgot_password_endpoint(request:Request):
    return await forgot_password(request)