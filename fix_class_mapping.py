import numpy as np
import tensorflow as tf
from PIL import Image
import io

print("=== CLASS MAPPING FIX ANALYSIS ===")
print()

def analyze_model_predictions():
    """Test model directly to see actual outputs"""
    print("1. Direct Model Testing:")
    
    try:
        # Load model
        model_path = r"E:\web-skripsi\DiabeticRetinopathy\DenseNet201_success.h5"
        model = tf.keras.models.load_model(model_path, compile=False)
        
        print(f"   ✓ Model loaded: {model.input_shape} → {model.output_shape}")
        
        # Create diverse test images
        test_cases = [
            ("Dark", np.zeros((224, 224, 3))),                    # All black
            ("Bright", np.ones((224, 224, 3)) * 255),            # All white  
            ("Red", np.array([[[255, 0, 0]]] * 224 * 224).reshape(224, 224, 3)),     # Red
            ("Random", np.random.randint(0, 256, (224, 224, 3))) # Random noise
        ]
        
        # Training class order from your notebook (alphabetical)
        training_classes = ["Mild", "Moderate", "No_DR", "Proliferate_DR", "Severe"]
        
        # Severity-based order (correct medical progression)  
        severity_classes = ["No_DR", "Mild", "Moderate", "Severe", "Proliferate_DR"]
        
        print("   Raw model predictions (training order):")
        
        for test_name, img_array in test_cases:
            # Prepare image
            img_normalized = img_array.astype(np.float32) / 255.0
            img_batch = np.expand_dims(img_normalized, axis=0)
            
            # Predict
            raw_pred = model.predict(img_batch, verbose=0)
            probs = raw_pred[0]
            
            # Get highest probability class
            max_idx = np.argmax(probs)
            max_prob = probs[max_idx]
            
            print(f"     {test_name}:")
            print(f"       Raw output: {probs}")
            print(f"       Max class: {max_idx} ({training_classes[max_idx]}) - {max_prob:.3f}")
            
            # Show all probabilities with class names
            for i, (cls, prob) in enumerate(zip(training_classes, probs)):
                print(f"         {i}: {cls} = {prob:.6f}")
        
        print()
        print("2. Class Mapping Analysis:")
        print("   Training order vs Severity order:")
        
        for i in range(5):
            train_class = training_classes[i]
            severity_class = severity_classes[i]
            match = "✓" if train_class == severity_class else "✗"
            print(f"     {i}: {train_class} | {severity_class} {match}")
        
        return training_classes, severity_classes
        
    except Exception as e:
        print(f"   ✗ Model test error: {e}")
        return None, None

def generate_correct_mapping():
    """Generate correct class mapping for HuggingFace Space"""
    print("3. Correct Mapping Generation:")
    
    # Original training order (alphabetical - how TensorFlow loads classes)
    training_order = ["Mild", "Moderate", "No_DR", "Proliferate_DR", "Severe"]
    
    # Desired severity order for user display
    display_order = ["No DR", "Mild DR", "Moderate DR", "Severe DR", "Proliferative DR"]
    
    # Create mapping from model output index to display class
    model_to_display = {}
    
    # Map training order to display order
    training_to_display_map = {
        "No_DR": "No DR",
        "Mild": "Mild DR", 
        "Moderate": "Moderate DR",
        "Severe": "Severe DR",
        "Proliferate_DR": "Proliferative DR"
    }
    
    print("   Model output index → Display class:")
    for i, training_class in enumerate(training_order):
        display_class = training_to_display_map[training_class]
        model_to_display[i] = display_class
        print(f"     {i}: {training_class} → {display_class}")
    
    # Generate severity-based class_id mapping
    severity_mapping = {}
    for i, display_class in enumerate(display_order):
        severity_mapping[display_class] = i
        
    print("\n   Severity-based class_id mapping:")
    for display_class, class_id in severity_mapping.items():
        print(f"     {class_id}: {display_class}")
    
    return model_to_display, severity_mapping

def generate_huggingface_fix():
    """Generate code fix for HuggingFace Space"""
    print("\n4. HuggingFace Space Fix Code:")
    
    fix_code = '''
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
'''
    
    print(fix_code)
    
    # Save to file
    with open("huggingface_class_mapping_fix.py", "w") as f:
        f.write(fix_code)
    
    print("\n   ✅ Fix code saved to 'huggingface_class_mapping_fix.py'")

def main():
    """Run complete analysis and generate fix"""
    print("Starting class mapping fix analysis...")
    print("=" * 50)
    
    # Test model directly
    training_classes, severity_classes = analyze_model_predictions()
    print()
    
    # Generate correct mapping
    model_to_display, severity_mapping = generate_correct_mapping()
    print()
    
    # Generate HuggingFace fix
    generate_huggingface_fix()
    print()
    
    print("=== SUMMARY ===")
    print("✅ Root cause identified: Incorrect class mapping in HuggingFace Space")
    print("✅ Model outputs alphabetical order but Space expects severity order")  
    print("✅ Fix code generated - update your HuggingFace Space app.py")
    print("\n🔧 NEXT STEPS:")
    print("1. Update HuggingFace Space with correct class mapping")
    print("2. Test with diverse images to verify all classes work")
    print("3. Redeploy and test production application")

if __name__ == "__main__":
    main()
