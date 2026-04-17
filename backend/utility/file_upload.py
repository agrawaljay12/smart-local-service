from typing import List
from fastapi import UploadFile
import os
import uuid

upload_dir: str = "static/uploads"

async def save_file(file: UploadFile, folder:str):
    # Create the full upload directory path
    path = os.path.join(upload_dir, folder)
    
    # if path does not exist, create it
    if not os.path.exists(path):
        os.makedirs(path, exist_ok=True)

    # Extract the file extension
    file_extension = file.filename.split(".")[-1]

    # Generate a unique filename using uuid4 and preserve the original file extension
    unique_filename = f"{uuid.uuid4()}.{file_extension}"

    file_path = os.path.join(path, unique_filename)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()  # Read the file content asynchronously
        buffer.write(content)         # Write the content to the file

    # save the path of the saved file to the specified folder   
    file_location = f"https://servicehub-i8ef.onrender.com/static/uploads/{folder}/{unique_filename}"
    return file_location


async def save_files(files: List[UploadFile], folder:str) -> List[str]:
   
    # create the empty list to store the paths of the saved files      
    file_paths = []

    # save each file and append its path to the list one by one
    for file in files:
        
        # save the file  and get its path, then append the path to the list
        file_path = await save_file(file, folder)

        # append the path of the saved file to the list
        file_paths.append(file_path)

    # after saving all the files, return the list of their paths 
    return file_paths