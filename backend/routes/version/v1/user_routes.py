from fastapi import APIRouter, Depends,Request,status,UploadFile,File,Form
from controllers.user_controller import change_password, create_user, forgot_password, get_all_users,login_user,get_all_provider,fetch_user_by_id,edit_user_by_id,delete_user_by_id
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
async def add_user(
        name:str = Form(...),
        email:str = Form(...),
        password:str = Form(...),
        phone_no:str = Form(...),
        address:str = Form(...),
        file:UploadFile = File(None)
        ):
    return await create_user(
        name = name,
        email = email,
        password = password,
        phone_no=phone_no,
        address=address,
        file=file
        )


# URL: http://127.0.0.1:8000/api/v1/users/login
# method : POST
# description : login a user

@router.post("/login",response_description="Login a user")
async def handle_login_user(request:Request):
   return await login_user(request)


# URL: http://127.0.0.1:8000/api/v1/users/fetch/all
# method : GET
# description : Fetch all Users 

@router.get("/fetch/all",response_description="Get all users",dependencies=[Depends(get_required_role(["admin"]))])
async def get_all_users_route(request:Request):
    return await get_all_users(request)


# URL: http://127.0.0.1:8000/api/v1/users/fetch/all/provider
# method : GET
# description : Fetch all Provider

@router.get("/fetch/all/provider",response_description="Get all providers",dependencies=[Depends(get_required_role(["admin"]))])
async def get_all_provider_route(request:Request):
    return await get_all_provider(request)


# URL: http://127.0.0.1:8000/api/v1/users/fetch/{user_id}
# method : GET
# description : Get User By Id
@router.get("/fetch/{user_id}",response_description="Get User By Id")
async def get_user_by_id_endpoint(user_id:str):
    return await fetch_user_by_id(user_id)


# URL: http://127.0.0.1:8000/api/v1/users/forgot-password
# method :put
# description : forgot password for user
@router.put("/forgot-password",response_description="Forgot password for user")
async def forgot_password_endpoint(request:Request):
    return await forgot_password(request)


# URL: http://127.0.0.1:8000/api/v1/users/edit/{user_id}
# method :put
# description : Update User By Id

@router.put("/edit/{user_id}",response_description="Update the User data By Id")
async def edit_user_by_id_endpoint( 
    user_id: str,
    name: str = Form(None),
    email: str = Form(None),
    phone_no: str = Form(None),
    address: str = Form(None),
    file: UploadFile = File(None) 
):
    return await edit_user_by_id(
        user_id=user_id,
        name=name,
        email= email,
        phone_no=phone_no,
        address=address,
        file=file
    )


# URL: http://127.0.0.1:8000/api/v1/users/change_password/{user_id}
# method :put
# description : Change Password By Id

@router.put("/change_password/{user_id}",response_description="Change Password By Id")
async def change_password_endpoint(user_id:str,request:Request):
    return await change_password(user_id,request)


# URL: http://127.0.0.1:8000/api/v1/users/delete/{user_id}
# method :DELETE
# description : Delete User By Id

@router.delete("/delete/{user_id}",response_description="Delete User By Id")
async def delete_user_by_id_endpoint(user_id:str):
    return await delete_user_by_id(user_id)