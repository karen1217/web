FROM python:3.11-slim

# System deps for OpenCV + build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    build-essential \
    cmake \
    libglib2.0-0 \
    libgl1 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Clone 3DDFA_V2 and build Cython extensions
RUN git clone https://github.com/cleardusk/3DDFA_V2.git --depth=1 3DDFA_V2 \
    && cd 3DDFA_V2 \
    && pip install --no-cache-dir cython numpy \
    && sh ./build.sh

# Download model weights (mb1_120x120 – lightweight MobileNet model)
RUN mkdir -p 3DDFA_V2/weights \
    && wget -q "https://github.com/cleardusk/3DDFA_V2/releases/download/v1.0/mb1_120x120.pth" \
         -O 3DDFA_V2/weights/mb1_120x120.pth

# Copy app source
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py analyzer.py ./

EXPOSE 8000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
