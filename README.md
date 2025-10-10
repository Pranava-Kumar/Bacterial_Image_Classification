# Bacterial Image Classification App

This application uses a deep learning model to classify bacterial species from microscopic images. It features a Next.js frontend with an interactive UI and a Python FastAPI backend for model inference.

## Project Structure

- `frontend/` - Next.js frontend application
- `best_model.pth` - Trained PyTorch model
- `akc_sih_project.py` - Original Python training script
- `api_server.py` - Python FastAPI backend
- `requirements.txt` - Python dependencies
- `setup_model.py` - Script to extract class names from the model
- `class_names.json` - File containing class names (generated automatically)
- `start_application.bat` - Batch file to start both services
- `run_application.bat` - Batch file to run the application (after initial setup)

## Setup Instructions

1. **Install Python Dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

2. **Extract Model Information**:

   Run the setup script to analyze your EMDS7 dataset and trained model to extract class names:
   ```bash
   python setup_model.py
   ```
   
   This will:
   - Analyze your EMDS7 dataset (EMDS7/EMDS7Img and EMDS7/EMDS7xml directories)
   - Extract class names from the XML annotations
   - Verify the number of classes matches your trained model
   - Create a `class_names.json` file with the correct class names
   - Create a `model_info.json` file with model information

3. **Install Node.js Dependencies** (in the frontend directory):

   ```bash
   cd frontend
   npm install
   ```

## Running the Application

### Option 1: Using Batch Files (Recommended)

After the initial setup, simply run:
```bash
run_application.bat
```

This will start both the backend and frontend automatically.

### Option 2: Manual Start

1. **Start the Python Backend**:

   ```bash
   cd ..
   python api_server.py
   ```
   
   The backend will start on `http://localhost:8000`

2. **Start the Next.js Frontend** (in a new terminal):

   ```bash
   cd frontend
   npm run dev
   ```
   
   The frontend will start on `http://localhost:3000`

3. **Access the Application**:

   Open your browser and go to `http://localhost:3000`

## How to Use

1. Upload a bacterial image (JPG, PNG, BMP formats supported)
2. Click "Classify Bacteria" 
3. View the results including:
   - Predicted bacterial species
   - Confidence scores
   - Visual charts showing classification probabilities
   - Bacterial information and characteristics
   - Classification history

## Features

- Interactive drag-and-drop image upload
- Real-time classification results
- Visual confidence charts (bar and pie charts)
- Detailed bacterial information
- Classification history
- Responsive design for all devices

## Technologies Used

- **Frontend**: Next.js 15.5, React 19, TypeScript, Tailwind CSS
- **Visualization**: Recharts
- **Backend**: FastAPI, PyTorch, TorchVision
- **Model**: MobileNetV2 with transfer learning