import torch
import json
import sys
import os
from glob import glob
import xml.etree.ElementTree as ET
sys.path.append('.')  # Add current directory to path

def analyze_emds7_dataset():
    """
    Analyze the EMDS7 dataset to extract class names
    """
    print("Analyzing EMDS7 dataset structure...")
    
    # Check if EMDS7 directory exists
    emds7_path = "EMDS7"
    if not os.path.exists(emds7_path):
        print(f"EMDS7 directory not found at {os.path.abspath(emds7_path)}")
        
        # Try common locations where it might be
        possible_paths = [
            "EMDS7",
            "EMDS7/", 
            "akc_sih_project/EMDS7",
            "akc_sih_project/EMDS7/",
            os.path.join(os.path.dirname(__file__), "EMDS7")
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                emds7_path = path
                print(f"Found EMDS7 dataset at: {os.path.abspath(path)}")
                break
        else:
            print("Could not find EMDS7 dataset. Please ensure the dataset is available.")
            print("Expected structure: EMDS7/EMDS7Img/ and EMDS7/EMDS7xml/")
            return None
    
    # Define paths
    image_folder = os.path.join(emds7_path, "EMDS7Img")
    xml_folder = os.path.join(emds7_path, "EMDS7xml")
    
    print(f"Looking for images in: {image_folder}")
    print(f"Looking for XML files in: {xml_folder}")
    
    if not os.path.exists(image_folder) or not os.path.exists(xml_folder):
        print(f"Expected directories not found!")
        print(f"Images should be in: {image_folder}")
        print(f"XML files should be in: {xml_folder}")
        return None

    # Collect all unique class names from XML files
    class_names_set = set()
    xml_files = glob(os.path.join(xml_folder, "**/*.xml"), recursive=True)
    
    print(f"Found {len(xml_files)} XML files")
    
    for xml_file in xml_files:
        try:
            tree = ET.parse(xml_file)
            root = tree.getroot()
            
            # Extract class labels from XML (assuming object names are in <name> tags)
            for obj in root.findall('object'):
                name = obj.find('name')
                if name is not None:
                    class_name = name.text
                    class_names_set.add(class_name)
        except Exception as e:
            print(f"Error processing XML file {xml_file}: {e}")
    
    class_names = sorted(list(class_names_set))
    print(f"Found {len(class_names)} unique classes in the dataset")
    
    if class_names:
        print("Classes found:")
        for i, cls in enumerate(class_names, 1):
            print(f"  {i:2d}. {cls}")
    
    return class_names

def analyze_model_and_save_class_names():
    """
    Analyze the trained model and save class names
    """
    print("\nAnalyzing the trained model file...")
    
    try:
        model_path = "best_model.pth"
        state_dict = torch.load(model_path, map_location='cpu', weights_only=True)
        
        # Determine number of classes by inspecting the model architecture
        num_classes = None
        
        # Look for the classifier layer (for MobileNetV2) or fc layer (for ResNet)
        for key in state_dict.keys():
            if 'classifier.1.weight' in key or 'classifier.1.bias' in key:
                num_classes = state_dict[key].shape[0]
                print(f"Found MobileNetV2 classifier layer with {num_classes} classes")
                break
            elif 'fc.weight' in key or 'fc.bias' in key:  # For ResNet models
                num_classes = state_dict[key].shape[0]
                print(f"Found ResNet FC layer with {num_classes} classes")
                break
        
        if num_classes is None:
            # Try to find any layer that looks like a classification layer
            for key in state_dict.keys():
                if 'weight' in key and len(state_dict[key].shape) == 2:
                    # Linear layers have shape (out_features, in_features)
                    # The classification layer will likely have out_features as the number of classes
                    shape = state_dict[key].shape
                    # For classification, the first dimension is typically the number of classes
                    if shape[0] < 1000:  # Heuristic: classification layers typically have < 1000 classes
                        num_classes = shape[0]
                        print(f"Guessing number of classes from layer '{key}': {num_classes}")
                        break
        
        if num_classes:
            print(f"Model has {num_classes} output classes")
            return num_classes
        else:
            print("Could not determine number of classes from the model file")
            return None
            
    except Exception as e:
        print(f"Error analyzing model: {e}")
        return None

def main():
    """
    Main function to analyze dataset and create class_names.json
    """
    print("Bacterial Classification Model Setup")
    print("=" * 40)
    
    # First, try to extract class names from the EMDS7 dataset
    dataset_class_names = analyze_emds7_dataset()
    
    # Analyze the model to get the number of classes
    model_num_classes = analyze_model_and_save_class_names()
    
    if dataset_class_names is not None and model_num_classes is not None:
        # Verify that the number of classes matches
        if len(dataset_class_names) != model_num_classes:
            print(f"\nWARNING: Dataset has {len(dataset_class_names)} classes but model has {model_num_classes} classes")
            print("This may indicate the model was trained on a different dataset or with different preprocessing.")
            print(f"Using the model's expected number of classes: {model_num_classes}")
            
            # Use the model's expected number of classes
            if len(dataset_class_names) > model_num_classes:
                class_names = dataset_class_names[:model_num_classes]
            else:
                # If the model expects more classes, we use generic names for the missing ones
                class_names = dataset_class_names + [f"Unknown_Class_{i}" for i in range(model_num_classes - len(dataset_class_names))]
        else:
            class_names = dataset_class_names
            print(f"\nModel and dataset class count match: {len(class_names)} classes")
    elif model_num_classes is not None:
        # If we can't access the dataset, use the model's class count with generic names
        print(f"\nCould not access dataset. Using {model_num_classes} generic class names.")
        class_names = [f"Class_{i+1}" for i in range(model_num_classes)]
    else:
        # If we can't determine the number of classes from the model, we have a problem
        print("\nERROR: Could not determine the number of classes from the model or dataset.")
        print("Please verify that 'best_model.pth' exists and is a valid PyTorch model file.")
        return False
    
    # Save class names to JSON file
    with open('class_names.json', 'w') as f:
        json.dump(class_names, f, indent=2)
    
    print(f"\nSuccessfully created class_names.json with {len(class_names)} classes")
    print(f"First few classes: {class_names[:5] if len(class_names) > 5 else class_names}")
    
    # Also create a backup of just the count in case needed
    with open('model_info.json', 'w') as f:
        json.dump({
            "num_classes": len(class_names),
            "class_names_count": len(class_names),
            "model_file": "best_model.pth"
        }, f, indent=2)
    
    print("\nSetup completed successfully!")
    print("You can now start the API server with: python api_server.py")
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1)