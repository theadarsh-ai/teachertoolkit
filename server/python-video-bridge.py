#!/usr/bin/env python3
"""
Python bridge for actual Veo 3.0 video generation
This matches your working Python code exactly
"""
import os
import sys
import json
import time
from google import genai
from google.genai.types import GenerateVideosConfig

# Set up credentials from Node.js environment
credentials_path = os.path.join(os.path.dirname(__file__), 'credentials', 'genzion-ai-9d0b2290221b.json')
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials_path

# Initialize client exactly like your working code
client = genai.Client(vertexai=True, project="genzion-ai", location="us-central1")

def generate_video_real(prompt):
    """Generate actual video using your working Python pattern"""
    output_gcs_uri = "gs://video_bucket_genzion"
    
    try:
        # Use the exact same call as your working Python code
        operation = client.models.generate_videos(
            model="veo-3.0-generate-preview",
            prompt=f"Generate the Animation video for {prompt} for student understanding with labels.",
            config=GenerateVideosConfig(
                aspect_ratio="16:9",
                output_gcs_uri=output_gcs_uri,
            ),
        )

        # Poll for completion exactly like your Python code
        while not operation.done:
            time.sleep(15)
            operation = client.operations.get(operation)
            print("Waiting for video generation...", file=sys.stderr)

        if operation.response:
            video_url = operation.result.generated_videos[0].video.uri
            print("Video generated at:", video_url, file=sys.stderr)
            
            # Return success result
            return {
                "success": True,
                "video_url": video_url,
                "message": "Real video generated successfully"
            }
        else:
            return {
                "success": False,
                "video_url": "",
                "message": "No video URL in response"
            }
            
    except Exception as e:
        return {
            "success": False,
            "video_url": "",
            "message": f"Error: {str(e)}"
        }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"success": False, "message": "Usage: python bridge.py '<prompt>'"}))
        sys.exit(1)
    
    prompt = sys.argv[1]
    result = generate_video_real(prompt)
    print(json.dumps(result))