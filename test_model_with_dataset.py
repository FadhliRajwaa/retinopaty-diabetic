import tensorflow as tf
import numpy as np
from PIL import Image
import os
import json
import random
from tensorflow.keras.preprocessing.image import ImageDataGenerator

print("=== TESTING MODEL WITH REAL DATASET IMAGES ===")
print()

def get_class_mapping():
    """Get the correct class mapping from training"""
    # From dr_densenet201_success_replication.py analysis:
    # Model training uses alphabetical class order (flow_from_directory default)
    TRAINING_ORDER = ["Mild", "Moderate", "No_DR", "Proliferate_DR", "Severe"]
    
    # Display mapping with medical information  
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
    
    return TRAINING_ORDER, CLASS_INFO

def process_prediction(model_output, training_order, class_info):
    """Convert model output to correct class info with proper mapping"""
    # Get predicted class from model output (argmax)
    predicted_idx = np.argmax(model_output)
    predicted_class_name = training_order[predicted_idx]
    
    # Get class info
    class_data = class_info[predicted_class_name]
    
    # Calculate all probabilities with correct mapping
    all_probs = {}
    for i, model_class in enumerate(training_order):
        display_info = class_info[model_class]
        all_probs[display_info["display_name"]] = float(model_output[i])
    
    return {
        "class_name": class_data["display_name"],
        "class_id": class_data["class_id"], 
        "confidence": float(model_output[predicted_idx]) * 100,
        "description": class_data["description"],
        "severity_level": class_data["severity_level"]
    }, all_probs

def load_and_predict_samples():
    """Load model and test with real dataset samples"""
    print("1. Loading DenseNet201 Model:")
    
    try:
        model_path = r"E:\web-skripsi\DiabeticRetinopathy\DenseNet201_success.h5"
        model = tf.keras.models.load_model(model_path, compile=False)
        
        print(f"   ✓ Model loaded successfully")
        print(f"   ✓ Input shape: {model.input_shape}")
        print(f"   ✓ Output shape: {model.output_shape}")
        print(f"   ✓ Total parameters: {model.count_params():,}")
        
    except Exception as e:
        print(f"   ✗ Error loading model: {e}")
        return
    
    print("\n2. Getting Class Mapping:")
    training_order, class_info = get_class_mapping()
    
    print("   Training order (model output indices):")
    for i, class_name in enumerate(training_order):
        info = class_info[class_name] 
        print(f"     {i}: {class_name} → {info['display_name']} (class_id: {info['class_id']})")
    
    print("\n3. Testing with Real Dataset Images:")
    
    dataset_path = r"E:\web-skripsi\dataset\colored_images"
    
    # Test samples from each class
    test_results = {}
    
    for class_folder in training_order:
        class_path = os.path.join(dataset_path, class_folder)
        
        if not os.path.exists(class_path):
            print(f"   ⚠️  Class folder not found: {class_folder}")
            continue
            
        # Get random samples from this class
        image_files = [f for f in os.listdir(class_path) 
                      if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        
        if not image_files:
            print(f"   ⚠️  No images found in: {class_folder}")
            continue
            
        # Test 3 random samples per class
        sample_files = random.sample(image_files, min(3, len(image_files)))
        
        print(f"\n   Testing {class_folder} (Expected: {class_info[class_folder]['display_name']}):")
        
        correct_predictions = 0
        
        for i, img_file in enumerate(sample_files):
            img_path = os.path.join(class_path, img_file)
            
            try:
                # Load and preprocess image
                img = Image.open(img_path).convert('RGB')
                img_resized = img.resize((224, 224))
                img_array = np.array(img_resized).astype(np.float32) / 255.0
                img_batch = np.expand_dims(img_array, axis=0)
                
                # Predict
                raw_output = model.predict(img_batch, verbose=0)
                
                # Process prediction
                prediction, all_probabilities = process_prediction(
                    raw_output[0], training_order, class_info
                )
                
                # Check if prediction matches expected class
                expected_display = class_info[class_folder]["display_name"]
                is_correct = prediction["class_name"] == expected_display
                
                if is_correct:
                    correct_predictions += 1
                    status = "✓"
                else:
                    status = "✗"
                
                print(f"     {status} {img_file[:20]}... → {prediction['class_name']} ({prediction['confidence']:.1f}%)")
                
                # Store detailed results
                if class_folder not in test_results:
                    test_results[class_folder] = []
                
                test_results[class_folder].append({
                    "file": img_file,
                    "expected": expected_display,
                    "predicted": prediction["class_name"],
                    "confidence": prediction["confidence"],
                    "correct": is_correct,
                    "all_probabilities": all_probabilities,
                    "description": prediction["description"],
                    "severity": prediction["severity_level"]
                })
                
            except Exception as e:
                print(f"     ✗ Error processing {img_file}: {e}")
        
        accuracy = (correct_predictions / len(sample_files)) * 100
        print(f"     Class Accuracy: {correct_predictions}/{len(sample_files)} ({accuracy:.1f}%)")
    
    print("\n4. Overall Analysis:")
    
    total_correct = 0
    total_tested = 0
    
    for class_name, results in test_results.items():
        class_correct = sum(1 for r in results if r["correct"])
        class_total = len(results)
        class_accuracy = (class_correct / class_total) * 100
        
        total_correct += class_correct
        total_tested += class_total
        
        print(f"   {class_name}: {class_correct}/{class_total} ({class_accuracy:.1f}%) correct")
        
        # Show detailed prediction distribution
        predictions = {}
        for result in results:
            pred_class = result["predicted"]
            if pred_class not in predictions:
                predictions[pred_class] = 0
            predictions[pred_class] += 1
        
        print(f"     Predictions: {predictions}")
    
    overall_accuracy = (total_correct / total_tested) * 100 if total_tested > 0 else 0
    print(f"\n   ✅ OVERALL ACCURACY: {total_correct}/{total_tested} ({overall_accuracy:.1f}%)")
    
    # Analyze prediction patterns
    print("\n5. Prediction Pattern Analysis:")
    
    all_predictions = []
    for results in test_results.values():
        all_predictions.extend(results)
    
    # Count predictions by class
    pred_counts = {}
    for result in all_predictions:
        pred_class = result["predicted"] 
        if pred_class not in pred_counts:
            pred_counts[pred_class] = 0
        pred_counts[pred_class] += 1
    
    print("   Prediction frequency:")
    for pred_class, count in sorted(pred_counts.items()):
        percentage = (count / len(all_predictions)) * 100
        print(f"     {pred_class}: {count} times ({percentage:.1f}%)")
    
    # Check for bias
    if len(set(pred_counts.values())) == 1:
        print("   ⚠️  BIAS DETECTED: All predictions are the same!")
    elif max(pred_counts.values()) / len(all_predictions) > 0.8:
        dominant_class = max(pred_counts.keys(), key=lambda k: pred_counts[k])
        print(f"   ⚠️  POTENTIAL BIAS: {dominant_class} dominates predictions")
    
    return test_results

def main():
    """Run complete model testing with dataset"""
    print("Starting comprehensive model testing with real dataset images...")
    print("=" * 60)
    
    # Set random seed for reproducible results
    np.random.seed(42)
    random.seed(42)
    tf.random.set_seed(42)
    
    # Run tests
    results = load_and_predict_samples()
    
    if results:
        print("\n" + "=" * 60)
        print("✅ Model testing completed!")
        print("\n🔍 KEY FINDINGS:")
        print("- Check if model shows bias towards specific classes")
        print("- Verify class mapping correctness") 
        print("- Analyze prediction confidence patterns")
        print("- Compare with expected 96% accuracy claim")
        
        # Save results
        with open("model_test_results.json", "w") as f:
            # Convert numpy types to native Python types for JSON serialization
            serializable_results = {}
            for class_name, class_results in results.items():
                serializable_results[class_name] = []
                for result in class_results:
                    serializable_result = {k: v for k, v in result.items()}
                    # Convert numpy types
                    for key in ['confidence']:
                        if isinstance(serializable_result[key], (np.float32, np.float64)):
                            serializable_result[key] = float(serializable_result[key])
                    # Convert probability dict
                    if 'all_probabilities' in serializable_result:
                        probs = {}
                        for k, v in serializable_result['all_probabilities'].items():
                            probs[k] = float(v) if isinstance(v, (np.float32, np.float64)) else v
                        serializable_result['all_probabilities'] = probs
                    serializable_results[class_name].append(serializable_result)
            
            json.dump(serializable_results, f, indent=2)
        
        print("📁 Results saved to 'model_test_results.json'")
    
    else:
        print("❌ Model testing failed!")

if __name__ == "__main__":
    main()
