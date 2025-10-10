from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import torch
import torchvision.transforms as transforms
from PIL import Image
import io
import json
import time
import logging

# Import the model creation function from your project
from akc_sih_project import create_pretrained_model

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Bacterial Classification API",
    description="API for classifying bacterial images using a trained PyTorch model",
    version="1.0.0"
)

# Add CORS middleware for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to store model and class names
model = None
class_names = None
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

@app.on_event("startup")
async def startup_event():
    """Load the model when the application starts"""
    global model, class_names
    
    logger.info("Loading model...")
    
    # Load your trained model from best_model.pth
    model_path = "best_model.pth"
    
    # First, let's load the original training script to get the class names and number of classes
    # This requires that the training script has been run and we know the class names
    # For this implementation, we'll determine the number of classes by examining the model
    
    # Load state dict to determine the number of classes
    state_dict = torch.load(model_path, map_location=device, weights_only=True)
    
    # Try to determine the number of classes by looking at the classifier layer
    num_classes = -1
    
    # Check for MobileNetV2 classifier layer
    for key in state_dict.keys():
        if key.startswith('classifier.1.weight') or key.startswith('classifier.1.bias'):
            num_classes = state_dict[key].shape[0]
            break
        elif key.startswith('fc.weight') or key.startswith('fc.bias'):
            num_classes = state_dict[key].shape[0]
            break
    
    if num_classes == -1:
        # As a fallback, try to guess from common model patterns
        # Look for any weight parameters that might indicate the number of classes
        for key in state_dict.keys():
            if 'weight' in key and len(state_dict[key].shape) == 2:  # Linear layer
                # The first dimension of a classifier weight matrix is the number of classes
                num_classes = state_dict[key].shape[0]
                break
    
    if num_classes == -1:
        raise ValueError("Could not determine number of classes from the model. Please check your model file.")
    
    logger.info(f"Detected {num_classes} classes from the model")
    
    # Create the model architecture with the correct number of classes
    model = create_pretrained_model(num_classes, "mobilenet_v2")
    
    if model is None:
        raise ValueError("Could not create model architecture")
    
    # Load the trained weights from your best_model.pth file
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()
    
    # Load class names - these should match exactly what your model was trained on
    try:
        with open('class_names.json', 'r') as f:
            import json
            class_names = json.load(f)
        logger.info(f"Loaded {len(class_names)} class names from class_names.json")
    except FileNotFoundError:
        # If class_names.json doesn't exist, we'll need to handle this gracefully
        # For now, create a generic list with the right number of classes
        logger.warning(f"class_names.json not found. Using generic names for {num_classes} classes.")
        class_names = [f"Class_{i}" for i in range(num_classes)]
    
    logger.info(f"Model loaded successfully on {device} with {num_classes} classes")

@app.get("/")
async def root():
    return {"message": "Bacterial Classification API", "status": "running"}

@app.post("/classify")
async def classify_image(file: UploadFile = File(...)):
    start_time = time.time()
    
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            raise ValueError("Uploaded file must be an image")
        
        # Read the image file
        contents = await file.read()
        image_stream = io.BytesIO(contents)
        image = Image.open(image_stream).convert('RGB')
        
        # Preprocess the image using the same transforms as during training
        # From the original training script, the validation transform was:
        IMG_SIZE = 224
        transform = transforms.Compose([
            transforms.Resize((IMG_SIZE, IMG_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])  # ImageNet normalization
        ])
        
        image_tensor = transform(image).unsqueeze(0).to(device)  # Add batch dimension and move to device
        
        # Make prediction
        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            confidence, predicted_idx = torch.max(probabilities, 1)
            
            # Get class name
            predicted_class = class_names[predicted_idx.item()]
            confidence_value = confidence.item()
            
            # Get top 5 predictions (or all if fewer than 5 classes)
            num_predictions = min(5, len(class_names))
            top_confidences, top_indices = torch.topk(probabilities[0], num_predictions)
            all_predictions = []
            for i in range(num_predictions):
                class_idx = top_indices[i].item()
                class_name = class_names[class_idx]
                conf_value = top_confidences[i].item()
                all_predictions.append({
                    "class": class_name,
                    "confidence": conf_value
                })
        
        processing_time = time.time() - start_time
        
        result = {
            "predicted_class": predicted_class,
            "confidence": confidence_value,
            "all_predictions": all_predictions,
            "processing_time": round(processing_time, 3),
            "image_size": f"{image.width}x{image.height}"
        }
        
        logger.info(f"Classification completed in {processing_time:.3f}s. Predicted: {predicted_class} (confidence: {confidence_value:.3f})")
        
        return result
        
    except Exception as e:
        logger.error(f"Error during classification: {str(e)}")
        logger.exception("Full traceback:")  # Log the full traceback for debugging
        return {
            "error": str(e),
            "processing_time": time.time() - start_time
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)