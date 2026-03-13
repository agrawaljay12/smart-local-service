import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import logging
import os

load_dotenv()


# load email configuration from environment variables

email_password = os.getenv("MAIL_PASSWORD")
email_sender = os.getenv("MAIL_USERNAME")
mail_server = os.getenv("MAIL_SERVER")
mail_port = int(os.getenv("MAIL_PORT"))
mail_tls = os.getenv("MAIL_TLS") == 'True'
mail_ssl = os.getenv("MAIL_SSL") == 'True'

# send email function that takes recipient email, subject and body as parameters and sends the email using the configured SMTP server
def send_email(to_email:str,subject:str,body:str):
    
    # intialize the server variable to None to ensure it is defined in the scope of the try block and can be accessed in the finally block for proper cleanup
    server = None

    try:

        # Create the email message
        msg = MIMEMultipart() # create a multipart email message object to allow for both plain text and HTML content in the email body
        msg['From'] = email_sender # sender email address
        msg['To'] = to_email # recipient email address
        msg['Subject'] = subject # email subject

        # Add the email body to the message
        msg.attach(MIMEText(body, 'html'))

        # Connect to the SMTP server  with secure connection (port 465)and send the email
        if mail_ssl:
                server = smtplib.SMTP_SSL(mail_server, mail_port)
        else:
            # create the normal smtp connection
            server = smtplib.SMTP(mail_server, mail_port)

            # if TLS is enabled, start TLS encryption for the connection
            if mail_tls:
                server.starttls()

        # login with password and email    
        server.login(email_sender, email_password)

        # send the email after the connection is established and login is successful
        server.send_message(msg)

        # log the successful email sending
        logging.info(f"Email sent to {to_email} with subject '{subject}'")

    # catch any exceptions that occur during the email sending process and log the error
    except Exception as e:
        logging.error(f"Failed to send email to {to_email}. Error: {str(e)}")

    # ensure that the SMTP server connection is closed after the email is sent or if an error occurs
    finally:
        if server:
            try:
                server.quit()
            except Exception as e:
                logging.error(f"Failed to close SMTP server connection. Error: {str(e)}")



