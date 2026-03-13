from fastapi import FastAPI
from routes.version.v1.user_routes import router as user_router
from routes.version.v1.otp_routes import router as otp_router

# function to register all routes
def register_routes(app: FastAPI):
    
    # http://127.0.0.1:8000/api/v1/users
    app.include_router(
        user_router,
        prefix="/api/v1/users",
        tags=["users"]
    )

    # http://127.0.0.1:8000/api/v1/otp  
    app.include_router(
        otp_router,
        prefix="/api/v1/otp",
        tags=["otp"]
    )


