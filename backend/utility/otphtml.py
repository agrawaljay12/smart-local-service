def otp_template(otp):
    return f"""
    <html>
        <body>
            <h1>Your OTP Code:</h1>
            <p>Your OTP code is: <strong>{otp}</strong></p>
            <p>Please use this code to complete your authentication process. This code will expire in 10 minutes.</p>
        </body>
    </html>
    """