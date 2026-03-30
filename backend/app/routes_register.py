from fastapi import FastAPI
from routes.version.v1.user_routes import router as user_router
from routes.version.v1.otp_routes import router as otp_router
from routes.version.v1.service_routes import router as service_router
from routes.version.v1.provider_routes import router as provider_router
from routes.version.v1.booking_routes import router as booking_router
from routes.version.v1.review_routes import router as review_router

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

    # http://127.0.0.1:8000/api/v1/services
    app.include_router(
        service_router,
        prefix="/api/v1/services",
        tags=["services"]
    )

    # http://127.0.0.1:8000/api/v1/provider
    app.include_router(
        provider_router,
        prefix="/api/v1/provider",
        tags=["provider"]
    )

    # http://127.0.0.1:8000/api/v1/booking
    app.include_router(
        booking_router,
        prefix="/api/v1/booking",
        tags=["booking"]
    )

    # http://127.0.0.1:8000/api/v1/reviews
    app.include_router(
        review_router,
        prefix="/api/v1/reviews",
        tags=["reviews"]
    )


