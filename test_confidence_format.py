import requests
import json
import random
from pathlib import Path

def test_confidence_format():
    """Test that confidence is returned as percentage (95, not 0.95)"""
    
    print("=== TESTING CONFIDENCE FORMAT ===")
    print("Checking HuggingFace Space returns confidence as percentage (95% not 0.95)")
    print()
    
    base_url = "https://fadhlirajwaa-diabeticretinopathy.hf.space"
    
    # Test with sample image from dataset
    dataset_path = Path("E:/web-skripsi/dataset/colored_images")
    
    if not dataset_path.exists():
        print("❌ Dataset path not found, using test without image")
        return False
    
    # Get a random image to test
    test_folders = ["No_DR", "Mild", "Moderate", "Severe", "Proliferate_DR"]
    test_images = []
    
    for folder in test_folders:
        folder_path = dataset_path / folder
        if folder_path.exists():
            images = list(folder_path.glob("*.png"))
            if images:
                test_images.append((folder, random.choice(images)))
    
    if not test_images:
        print("❌ No test images found")
        return False
    
    print(f"📸 Testing with {len(test_images)} sample images:")
    print()
    
    success_count = 0
    
    for i, (folder_name, image_path) in enumerate(test_images[:3], 1):  # Test 3 images max
        print(f"{i}. Testing {folder_name} image: {image_path.name}")
        
        try:
            # Upload and predict
            with open(image_path, 'rb') as f:
                files = {'file': (image_path.name, f, 'image/png')}
                
                response = requests.post(
                    f"{base_url}/predict", 
                    files=files, 
                    timeout=60
                )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success'):
                    pred = data['prediction']
                    confidence = pred['confidence']
                    all_probs = data.get('all_probabilities', {})
                    
                    print(f"   ✅ Predicted: {pred['class_name']}")
                    print(f"   📊 Main Confidence: {confidence}")
                    
                    # Check confidence format
                    if isinstance(confidence, (int, float)) and confidence > 1:
                        print(f"   ✅ Confidence format CORRECT: {confidence}% (percentage format)")
                        confidence_ok = True
                    else:
                        print(f"   ❌ Confidence format WRONG: {confidence} (should be percentage like 95, not 0.95)")
                        confidence_ok = False
                    
                    # Check all probabilities format
                    print("   🧮 All Probabilities:")
                    all_probs_ok = True
                    for class_name, prob in all_probs.items():
                        print(f"       {class_name}: {prob}")
                        if isinstance(prob, (int, float)) and prob <= 1:
                            print(f"       ❌ {class_name} probability {prob} should be percentage format!")
                            all_probs_ok = False
                        elif isinstance(prob, (int, float)) and prob > 1:
                            pass  # OK - percentage format
                    
                    if confidence_ok and all_probs_ok:
                        print(f"   ✅ ALL FORMATS CORRECT for {folder_name}")
                        success_count += 1
                    else:
                        print(f"   ❌ FORMAT ISSUES for {folder_name}")
                        
                else:
                    print(f"   ❌ Prediction failed: {data}")
                    
            else:
                print(f"   ❌ HTTP Error: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"      Error: {error_data}")
                except:
                    print(f"      Raw: {response.text[:200]}")
                    
        except Exception as e:
            print(f"   ❌ Exception: {e}")
        
        print()
    
    print("=" * 50)
    print("CONFIDENCE FORMAT TEST RESULTS:")
    
    if success_count == len(test_images[:3]):
        print("✅ ALL TESTS PASSED - Confidence format is CORRECT!")
        print("   • Main confidence returned as percentage (95, not 0.95)")
        print("   • All probabilities returned as percentage")
        print("   • Ready for frontend integration")
        return True
    else:
        print(f"❌ {success_count}/{len(test_images[:3])} tests passed")
        print("   • Need to check HuggingFace Space deployment")
        print("   • Confidence should be percentage format")
        return False

def test_api_health():
    """Quick health check of HuggingFace Space"""
    
    print("=== API HEALTH CHECK ===")
    
    base_url = "https://fadhlirajwaa-diabeticretinopathy.hf.space"
    
    try:
        response = requests.get(f"{base_url}/health", timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ API is healthy")
            print(f"   Status: {data.get('status')}")
            print(f"   Model loaded: {data.get('model_loaded')}")
            print(f"   Classes: {data.get('model_info', {}).get('classes')}")
            return True
        else:
            print(f"❌ API health check failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Cannot reach API: {e}")
        return False

def main():
    """Run confidence format tests"""
    
    print("🧪 CONFIDENCE FORMAT VALIDATOR")
    print("=" * 50)
    print("Testing that HuggingFace Space returns confidence as percentage")
    print("This validates the fix: confidence * 100 in app.py")
    print()
    
    # Health check first
    if not test_api_health():
        print("❌ Cannot proceed - API not healthy")
        return False
    
    print()
    
    # Test confidence format
    success = test_confidence_format()
    
    print("\n" + "=" * 50)
    print("FINAL SUMMARY:")
    
    if success:
        print("🎉 CONFIDENCE FORMAT FIX IS WORKING!")
        print("✅ HuggingFace Space returns confidence as percentage")
        print("✅ Frontend will receive user-friendly format (95% not 0.95)")
        print("✅ All probabilities are in percentage format")
        print("\n🚀 Ready to test full workflow:")
        print("   1. Upload image via frontend")
        print("   2. Check confidence displays as 95%")
        print("   3. Verify real-time dashboard updates")
    else:
        print("❌ Confidence format fix needs attention")
        print("🔧 Check if app.py changes were deployed to HuggingFace Space")
    
    return success

if __name__ == "__main__":
    main()
