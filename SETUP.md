# How to Run the Application

This guide explains how to run both the backend and frontend of the W3Connect application.

## Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 16+ and npm** (for frontend)
- **OpenAI API Key** (required for the backend to work)

## Option 1: Manual Setup (Recommended for Development)

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Mac/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set your OpenAI API key:**
   ```bash
   # Windows (PowerShell)
   $env:OPENAI_API_KEY="your-api-key-here"

   # Windows (CMD)
   set OPENAI_API_KEY=your-api-key-here

   # Mac/Linux
   export OPENAI_API_KEY="your-api-key-here"
   ```

5. **Run the backend server:**
   ```bash
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   The backend will be available at: **http://localhost:8000**

### Frontend Setup

1. **Open a new terminal and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

   The frontend will be available at: **http://localhost:3000**

   The browser should open automatically. If not, navigate to `http://localhost:3000` manually.

## Option 2: Docker Setup

If you prefer using Docker:

1. **Set your OpenAI API key:**
   ```bash
   # Windows (PowerShell)
   $env:OPENAI_API_KEY="your-api-key-here"

   # Windows (CMD)
   set OPENAI_API_KEY=your-api-key-here

   # Mac/Linux
   export OPENAI_API_KEY="your-api-key-here"
   ```

2. **Run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

   This will start both services:
   - Backend: http://localhost:8000
   - Frontend: http://localhost:3000

3. **To stop the services:**
   ```bash
   docker-compose down
   ```

## Verifying Everything Works

1. **Check backend is running:**
   - Visit: http://localhost:8000
   - You should see: `{"message":"Hello from backend"}`

2. **Check frontend is running:**
   - Visit: http://localhost:3000
   - You should see the W3Connect homepage

3. **Test the full flow:**
   - Go to the "Build" tab in the frontend
   - Enter an idea (e.g., "A decentralized marketplace for digital art")
   - Click "Generate Framework"
   - The backend should process your request using OpenAI and return a framework

## Troubleshooting

### Backend Issues

- **"Module not found" errors:**
  - Make sure you've activated your virtual environment
  - Run `pip install -r requirements.txt` again

- **OpenAI API errors:**
  - Verify your `OPENAI_API_KEY` environment variable is set correctly
  - Check that you have credits/access to the OpenAI API

- **Port 8000 already in use:**
  - Change the port in `main.py` (line 247) or kill the process using port 8000

### Frontend Issues

- **"Cannot connect to backend" errors:**
  - Make sure the backend is running on port 8000
  - Check that `API_BASE` in `frontend/src/components/BuildSection.js` is set to `http://localhost:8000`

- **Port 3000 already in use:**
  - React will automatically ask to use a different port, or you can specify one:
    ```bash
    PORT=3001 npm start
    ```

- **Dependencies not installing:**
  - Try deleting `node_modules` and `package-lock.json`, then run `npm install` again

## Important Notes

- The backend requires an **OpenAI API key** to function. Without it, the framework generation will fail.
- The frontend expects the backend to be running on `http://localhost:8000` (this is hardcoded in `BuildSection.js`).
- For production, you'll want to:
  - Use environment variables for the API base URL
  - Set up proper CORS configuration
  - Use a production build of the frontend (`npm run build`)

