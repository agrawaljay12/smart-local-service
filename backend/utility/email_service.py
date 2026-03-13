from fastapi_mail import FastMail, MessageSchema
from config.email_config import conf


def send_email(to_email:str,subject:str,body:str):

    message =MessageSchema(
        subject=subject,
        recipients=[to_email],
        body=body,
        subtype="html"
    )

    fm = FastMail(conf)
    fm.send_message(message)




