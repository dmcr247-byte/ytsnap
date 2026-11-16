import os
import glob
import subprocess
import tempfile
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.background import BackgroundTask

app = FastAPI(title="YTSnap 1080p Muxer Worker")

# Enable CORS for frontend website
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def cleanup_temp_file(filepath: str):
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
    except Exception:
        pass

@app.get("/")
def home():
    return {
        "status": "online",
        "service": "YTSnap Render 1080p Worker",
        "message": "Ready to merge and serve 1080p full HD videos with sound!"
    }

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/api/download")
def download_merged_video(
    id: str = Query(..., regex="^[a-zA-Z0-9_-]{11}$"),
    res: str = Query("1080", regex="^(2160|1440|1080|720|480|360)$")
):
    temp_dir = tempfile.gettempdir()
    prefix = f"render_{id}_{res}"
    output_template = os.path.join(temp_dir, f"{prefix}_%(title)s.%(ext)s")

    # Format: best video of requested resolution + best audio, combined with ffmpeg into MP4
    format_str = (
        f"bestvideo[height<={res}][ext=mp4]+bestaudio[ext=m4a]/"
        f"bestvideo[height<={res}]+bestaudio/"
        f"best[height<={res}]/best"
    )

    cmd = [
        "yt-dlp",
        "--no-warnings",
        "--no-playlist",
        "--extractor-args", "youtube:player_client=mweb,android,web_embedded",
        "-f", format_str,
        "--merge-output-format", "mp4",
        "-o", output_template,
        f"https://www.youtube.com/watch?v={id}"
    ]

    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    # Find the merged mp4 file
    pattern = os.path.join(temp_dir, f"{prefix}_*.mp4")
    matching_files = glob.glob(pattern)

    if not matching_files or result.returncode != 0:
        err = result.stderr[-300:] if result.stderr else "Video extraction failed"
        raise HTTPException(status_code=500, detail=f"Download failed: {err}")

    file_path = matching_files[0]
    clean_filename = os.path.basename(file_path).replace(f"{prefix}_", "")

    return FileResponse(
        path=file_path,
        filename=clean_filename,
        media_type="video/mp4",
        background=BackgroundTask(cleanup_temp_file, file_path)
    )
