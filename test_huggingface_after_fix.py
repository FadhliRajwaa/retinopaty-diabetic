import requests
import json
import time
import random
from pathlib import Path

def test_huggingface_space_after_fix():
    """Test HuggingFace Space API after class mapping fix"""
    
    print("=== TESTING HUGGINGFACE SPACE AFTER CLASS MAPPING FIX ===")
    print()
    
    # HuggingFace Space URL
    base_url = "https://fadhlirajwaa-diabeticretinopathy.hf.space"
    
    print("1. Testing API Health:")
    print("-" * 40)
    
    try:
        # Test health endpoint
        health_response = requests.get(f"{base_url}/health", timeout=30)
        if health_response.status_code == 200:
            health_data = health_response.json()
            print(f"   ✅ Health Status: {health_data.get('status', 'unknown')}")
            print(f"   ✅ Model Loaded: {health_data.get('model_loaded', False)}")
            print(f"   ✅ Total Classes: {health_data.get('model_info', {}).get('classes', 'unknown')}")
        else:
            print(f"   ❌ Health check failed: {health_response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Cannot connect to HuggingFace Space: {e}")
        return False
    
    print("\n2. Testing Classes Endpoint:")
    print("-" * 40)
    
    try:
        # Test classes endpoint
        classes_response = requests.get(f"{base_url}/classes", timeout=30)
        if classes_response.status_code == 200:
            classes_data = classes_response.json()
            print(f"   ✅ Total Classes: {classes_data.get('total_classes', 'unknown')}")
            
            print("   Classes mapping:")
            classes = classes_data.get('classes', {})
            for class_id, display_name in sorted(classes.items()):
                print(f"     {class_id}: {display_name}")
                
            # Check if model output order is included (new feature)
            model_order = classes_data.get('model_output_order', [])
            if model_order:
                print("   ✅ Model output order available:")
                for i, model_class in enumerate(model_order):
                    print(f"     Index {i}: {model_class}")
            
        else:
            print(f"   ❌ Classes endpoint failed: {classes_response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error testing classes endpoint: {e}")
        return False
    
    print("\n3. Testing Prediction with Sample Images:")
    print("-" * 40)
    
    # Test with sample images from dataset
    dataset_path = Path("E:/web-skripsi/dataset/colored_images")
    
    if not dataset_path.exists():
        print("   ⚠️  Dataset path not found, skipping image tests")
        return True
    
    # Test one image from each class
    test_results = {}
    
    for class_folder in ["No_DR", "Mild", "Moderate", "Severe", "Proliferate_DR"]:
        class_path = dataset_path / class_folder
        
        if not class_path.exists():
            print(f"   ⚠️  Class folder not found: {class_folder}")
            continue
            
        # Get a random image from this class
        image_files = list(class_path.glob("*.png"))
        if not image_files:
            print(f"   ⚠️  No images in: {class_folder}")
            continue
            
        test_image = random.choice(image_files)
        print(f"\n   Testing {class_folder} with: {test_image.name}")
        
        try:
            # Upload and predict
            with open(test_image, 'rb') as f:
                files = {'file': (test_image.name, f, 'image/png')}
                
                predict_response = requests.post(
                    f"{base_url}/predict", 
                    files=files, 
                    timeout=60
                )
            
            if predict_response.status_code == 200:
                prediction_data = predict_response.json()
                
                if prediction_data.get('success'):
                    pred = prediction_data['prediction']
                    
                    print(f"     ✅ Predicted: {pred['class_name']} (ID: {pred['class_id']})")
                    print(f"     📊 Confidence: {pred['confidence']:.1%}")
                    print(f"     📋 Severity: {pred['severity_level']}")
                    
                    # Store result
                    test_results[class_folder] = {
                        "predicted_class": pred['class_name'],
                        "predicted_id": pred['class_id'],
                        "confidence": pred['confidence'],
                        "severity": pred['severity_level'],
                        "image_file": test_image.name
                    }
                    
                    # Show all probabilities
                    all_probs = prediction_data.get('all_probabilities', {})
                    print("     🧮 All Probabilities:")
                    for class_name, prob in all_probs.items():
                        print(f"       {class_name}: {prob:.1%}")
                else:
                    print(f"     ❌ Prediction failed: {prediction_data}")
                    
            else:
                print(f"     ❌ Prediction request failed: {predict_response.status_code}")
                try:
                    error_detail = predict_response.json()
                    print(f"       Error: {error_detail}")
                except:
                    print(f"       Raw response: {predict_response.text}")
                    
        except Exception as e:
            print(f"     ❌ Error during prediction: {e}")
        
        # Small delay between requests
        time.sleep(2)
    
    print("\n4. Analysis of Results:")
    print("-" * 40)
    
    if test_results:
        # Check for diversity in predictions
        predicted_classes = set(result['predicted_class'] for result in test_results.values())
        
        print(f"   📊 Unique predictions: {len(predicted_classes)} out of {len(test_results)} tests")
        print("   🎯 Predicted classes:")
        for class_name in sorted(predicted_classes):
            count = sum(1 for r in test_results.values() if r['predicted_class'] == class_name)
            print(f"     {class_name}: {count} times")
        
        # Check if fix worked (should have variety, not always "Moderate DR")
        if len(predicted_classes) > 1:
            print("\n   ✅ SUCCESS: Predictions are DIVERSE!")
            print("   🎉 Class mapping fix is working!")
        elif len(predicted_classes) == 1 and "Moderate" in list(predicted_classes)[0]:
            print("\n   ❌ ISSUE: Still predicting only 'Moderate DR'")
            print("   🔧 Class mapping fix may not be deployed yet")
        else:
            print(f"\n   ⚠️  Only one class predicted: {list(predicted_classes)[0]}")
            print("   🔍 Need to investigate further")
        
        # Show detailed results
        print("\n   📋 Detailed Results:")
        for folder, result in test_results.items():
            expected_contains = folder.replace("_", " ").replace("Proliferate DR", "Proliferative DR")
            is_related = expected_contains.lower() in result['predicted_class'].lower()
            status = "✅" if is_related else "⚠️"
            
            print(f"     {status} {folder} → {result['predicted_class']} ({result['confidence']:.1%})")
    
    else:
        print("   ❌ No test results available")
    
    return len(test_results) > 0

def test_api_endpoints():
    """Test all API endpoints"""
    
    base_url = "https://fadhlirajwaa-diabeticretinopathy.hf.space"
    
    endpoints = [
        ("/", "Root endpoint"),
        ("/health", "Health check"),
        ("/classes", "Classes info")
    ]
    
    print("\n5. Testing All Endpoints:")
    print("-" * 40)
    
    for endpoint, description in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=30)
            
            if response.status_code == 200:
                print(f"   ✅ {description}: OK")
                
                # Show some key info
                if endpoint == "/":
                    data = response.json()
                    print(f"     Version: {data.get('version', 'unknown')}")
                    print(f"     Status: {data.get('status', 'unknown')}")
                elif endpoint == "/classes":
                    data = response.json()
                    print(f"     Classes: {data.get('total_classes', 'unknown')}")
                    
            else:
                print(f"   ❌ {description}: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ {description}: Error - {e}")

def main():
    """Run comprehensive HuggingFace Space testing"""
    
    print("🧪 Starting HuggingFace Space testing after class mapping fix...")
    print("=" * 60)
    
    # Test main functionality
    success = test_huggingface_space_after_fix()
    
    # Test all endpoints
    test_api_endpoints()
    
    print("\n" + "=" * 60)
    print("🏁 TESTING COMPLETE")
    
    if success:
        print("✅ HuggingFace Space is responding")
        print("🎯 Check results above to verify class mapping fix")
        print("\n📝 Key indicators of successful fix:")
        print("   • Predictions should be diverse (not always 'Moderate DR')")
        print("   • Different images should produce different results")
        print("   • Confidence scores should vary appropriately")
        print("   • No DR images should predict 'No DR' class")
    else:
        print("❌ HuggingFace Space testing failed")
        print("🔧 Check if Space is running and app.py is deployed")

if __name__ == "__main__":
    main()
