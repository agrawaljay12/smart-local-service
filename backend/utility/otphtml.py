def otp_template(otp):
    return f"""
    <html>
        <body>
            <p>Your OTP code is: <strong>{otp}</strong></p>
            <p>Please use this code to complete your authentication process. This code will expire in 10 minutes.</p>
        </body>
    </html>
    """

# send the dynamic message to user 
def message_template(message,username:str,):
    return f"""
    <html>
        <body>
           <p>Hello ,{username if username else "User"} {message}</p></br>
           <p>Regards Smart Local Service Platflorm</p>
        </body>
    </html>
    """