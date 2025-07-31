from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
import time
import os
from google import genai
from google.genai.types import GenerateVideosConfig
from fastapi.middleware.cors import CORSMiddleware

# Set up credentials
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = "D:\\genzion-ai-3199b0dad231.json"

# Initialize client
client = genai.Client(vertexai=True, project="genzion-ai", location="us-central1")

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://127.0.0.1:5500'],            # Allow specific origins
    allow_credentials=True,
    allow_methods=["*"],              # Allow all HTTP methods
    allow_headers=["*"],              # Allow all headers
)


class VideoRequest(BaseModel):
    prompt: str

output_gcs_uri: str = "gs://video_bucket_genzion"

def generate_video_task(prompt: str):
    operation = client.models.generate_videos(
        model="veo-3.0-generate-preview",
        prompt=f"Generate the Animation video for {prompt} for student understanding with labels.",
        config=GenerateVideosConfig(
            aspect_ratio="16:9",
            output_gcs_uri=output_gcs_uri,
        ),
    )

    while not operation.done:
        time.sleep(15)
        operation = client.operations.get(operation)
        print("Waiting for video generation...")

    if operation.response:
        print("Video generated at:", operation.result.generated_videos[0].video.uri)
    
    return operation.result.generated_videos[0].video.uri

@app.post("/generate-video/")
def generate_video(request: VideoRequest, background_tasks: BackgroundTasks):
    return {"url": generate_video_task(request.prompt)}
