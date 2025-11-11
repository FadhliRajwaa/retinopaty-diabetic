import requests
import json
import numpy as np
from PIL import Image
import io
import tensorflow as tf

print("=== DEBUGGING 5-CLASS MAPPING ISSUE ===")
print()

def analyze_model_classes():
    """Analyze the H5 model to understand class mapping"""
    print("1. Model Analysis:")
    
    try:
        # Load the model
        model_path = r"E:\web-skripsi\DiabeticRetinopathy\DenseNet201_success.h5"
        model = tf.keras.models.load_model(model_path)
        
        print(f"   ✓ Model loaded successfully")
        print(f"   ✓ Model input shape: {model.input_shape}")
        print(f"   ✓ Model output shape: {model.output_shape}")
        
        # Get the last layer
        last_layer = model.layers[-1]
        print(f"   ✓ Output layer: {last_layer.name}")
        print(f"   ✓ Output units: {last_layer.units}")
        
        if hasattr(last_layer, 'activation'):
            print(f"   ✓ Output activation: {last_layer.activation}")
        
        return model
        
    except Exception as e:
        print(f"   ✗ Error loading model: {e}")
        return None

def test_huggingface_classes():
    """Test HuggingFace Space class definitions"""
    print("2. HuggingFace Space Class Mapping:")
    
    try:
        # Test classes endpoint
        resp = requests.get("https://fadhlirajwaa-diabeticretinopathy.hf.space/classes", timeout=30)
        if resp.status_code == 200:
            classes_data = resp.json()
            print(f"   ✓ Classes endpoint response:")
            classes = classes_data.get("classes", {})
            
            print("   Class ID → Class Name mapping:")
            for class_id, class_name in sorted(classes.items()):
                print(f"     {class_id}: {class_name}")
                
            return classes
        else:
            print(f"   ✗ Classes endpoint error: {resp.status_code}")
            return None
            
    except Exception as e:
        print(f"   ✗ HuggingFace classes error: {e}")
        return None

def test_sample_predictions():
    """Test with different sample images to see prediction patterns"""
    print("3. Sample Predictions Test:")
    
    # Create different colored test images to see response patterns
    test_cases = [
        ("Very Dark", (20, 20, 20)),      # Very dark - might be severe
        ("Dark Red", (139, 69, 19)),      # Brown/red - retina-like
        ("Light", (200, 150, 100)),       # Light brown - healthy-ish
        ("Green Tint", (100, 150, 100)),  # Greenish - normal vessels
        ("Red", (180, 50, 50))            # Reddish - hemorrhages
    ]
    
    results = {}
    
    for test_name, color in test_cases:
        try:
            # Create test image
            img = Image.new("RGB", (224, 224), color=color)
            img_bytes = io.BytesIO()
            img.save(img_bytes, format="JPEG", quality=90)
            img_bytes.seek(0)
            
            files = {"file": (f"test_{test_name.lower().replace(' ', '_')}.jpg", img_bytes, "image/jpeg")}
            
            resp = requests.post("https://fadhlirajwaa-diabeticretinopathy.hf.space/predict", 
                               files=files, timeout=60)
            
            if resp.status_code == 200:
                result = resp.json()
                if result.get("success"):
                    pred = result["prediction"]
                    probs = result["all_probabilities"]
                    
                    print(f"   {test_name} ({color}):")
                    print(f"     → Predicted: {pred['class_name']} (ID: {pred['class_id']})")
                    print(f"     → Confidence: {pred['confidence']:.1f}%")
                    print(f"     → Probabilities: {probs}")
                    
                    results[test_name] = {
                        'prediction': pred,
                        'probabilities': probs
                    }
                else:
                    print(f"   {test_name}: API Error - {result.get('error')}")
            else:
                print(f"   {test_name}: HTTP Error {resp.status_code}")
                
        except Exception as e:
            print(f"   {test_name}: Exception - {e}")
    
    return results

def analyze_training_data_order():
    """Analyze the original training data class order"""
    print("4. Training Data Class Order Analysis:")
    
    # From the code analysis, the classes appear to be:
    training_classes = [
        "Mild",           # ID 0?
        "Moderate",       # ID 1?
        "No_DR",          # ID 2?
        "Proliferate_DR", # ID 3?
        "Severe"          # ID 4?
    ]
    
    print("   Training data classes (alphabetical order):")
    for i, class_name in enumerate(training_classes):
        print(f"     {i}: {class_name}")
    
    # Expected mapping based on severity
    severity_order = [
        "No_DR",          # 0 - No disease
        "Mild",           # 1 - Mild
        "Moderate",       # 2 - Moderate  
        "Severe",         # 3 - Severe
        "Proliferate_DR"  # 4 - Most severe
    ]
    
    print("   Expected severity-based order:")
    for i, class_name in enumerate(severity_order):
        print(f"     {i}: {class_name}")
    
    return training_classes, severity_order

def main():
    """Run complete class mapping analysis"""
    print("Starting comprehensive 5-class mapping analysis...")
    print("=" * 60)
    
    # Analyze model
    model = analyze_model_classes()
    print()
    
    # Test HuggingFace classes
    hf_classes = test_huggingface_classes()
    print()
    
    # Test predictions
    predictions = test_sample_predictions()
    print()
    
    # Analyze training data
    training_order, severity_order = analyze_training_data_order()
    print()
    
    # Final analysis
    print("=== DIAGNOSIS SUMMARY ===")
    
    if hf_classes:
        print("✅ HuggingFace class mapping found")
        
        # Check if order matches expected severity
        hf_order = [hf_classes.get(str(i), f"Unknown_{i}") for i in range(5)]
        
        print(f"HuggingFace order: {hf_order}")
        print(f"Expected severity:  {severity_order}")
        
        if hf_order != severity_order:
            print("⚠️  POTENTIAL ISSUE: Class order mismatch detected!")
            print("This could explain why predictions always show 'Moderate'")
            
            print("\n🔧 POSSIBLE SOLUTIONS:")
            print("1. Check HuggingFace Space class mapping implementation")
            print("2. Verify model training class order vs prediction mapping")
            print("3. Update class_id mapping in HuggingFace Space")
        else:
            print("✅ Class order appears correct")
    
    # Analyze prediction patterns
    if predictions:
        pred_classes = [pred['prediction']['class_name'] for pred in predictions.values()]
        unique_preds = set(pred_classes)
        
        if len(unique_preds) == 1:
            print(f"\n⚠️  ISSUE CONFIRMED: All predictions return '{list(unique_preds)[0]}'")
            print("This indicates a class mapping or model loading problem")
        else:
            print(f"\n✅ Predictions vary: {unique_preds}")

if __name__ == "__main__":
    main()
