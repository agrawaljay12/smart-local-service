from pydantic import BaseModel
from typing import Optional

class Booking(BaseModel):
    user_id:str
    service_id:str
    price:float
    razorpay_order_id:str
    razorpay_payment_id:Optional[str] = None 
    razorpay_signature:Optional[str] = None
    booking_date:str
    payment_date:Optional[str] = None
    payment_status:str="pending"
    booking_status:str ="Pending"
    
