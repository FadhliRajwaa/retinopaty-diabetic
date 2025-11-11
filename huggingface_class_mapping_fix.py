
# CORRECT CLASS MAPPING FOR HUGGINGFACE SPACE
# Add this to your FastAPI app.py

# Model output index to class name mapping (alphabetical training order)
MODEL_OUTPUT_CLASSES = [
    "Mild",           # Index 0
    "Moderate",       # Index 1  
    "No_DR",          # Index 2
    "Proliferate_DR", # Index 3
    "Severe"          # Index 4
]

# Display mapping with severity-based class_id
CLASS_INFO = {
    "No_DR": {
        "class_id": 0,
        "display_name": "No DR",
        "description": "No Diabetic Retinopathy - Normal retina",
        "severity_level": "Normal"
    },
    "Mild": {
        "class_id": 1, 
        "display_name": "Mild DR",
        "description": "Mild Diabetic Retinopathy with few microaneurysms",
        "severity_level": "Low Risk - Requires Monitoring"
    },
    "Moderate": {
        "class_id": 2,
        "display_name": "Moderate DR", 
        "description": "Moderate Diabetic Retinopathy with hemorrhages and exudates",
        "severity_level": "Moderate Risk"
    },
    "Severe": {
        "class_id": 3,
        "display_name": "Severe DR",
        "description": "Severe Diabetic Retinopathy with significant ischemic areas", 
        "severity_level": "High Risk"
    },
    "Proliferate_DR": {
        "class_id": 4,
        "display_name": "Proliferative DR",
        "description": "Proliferative Diabetic Retinopathy with neovascularization - requires immediate intervention",
        "severity_level": "Critical Risk"
    }
}

# Fix prediction function
def process_prediction(model_output):
    """Convert model output to correct class info"""
    # Get predicted class from model output
    predicted_idx = np.argmax(model_output)
    predicted_class_name = MODEL_OUTPUT_CLASSES[predicted_idx]
    
    # Get class info
    class_info = CLASS_INFO[predicted_class_name]
    
    # Calculate all probabilities with correct mapping
    all_probs = {}
    for i, model_class in enumerate(MODEL_OUTPUT_CLASSES):
        display_info = CLASS_INFO[model_class]
        all_probs[display_info["display_name"]] = float(model_output[i])
    
    return {
        "class_name": class_info["display_name"],
        "class_id": class_info["class_id"], 
        "confidence": float(model_output[predicted_idx]) * 100,
        "description": class_info["description"],
        "severity_level": class_info["severity_level"]
    }, all_probs
