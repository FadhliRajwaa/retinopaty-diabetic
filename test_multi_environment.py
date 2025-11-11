import requests
import json
from PIL import Image
import io
import time
import os

print("=== MULTI-ENVIRONMENT TESTING ===")
print()

def create_test_image(size=(224, 224), color="darkred"):
    """Create a test retina-like image"""
    img = Image.new("RGB", size, color=color)
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="JPEG", quality=85)
    img_bytes.seek(0)
    return img_bytes

def test_huggingface_direct():
    """Test direct HuggingFace Space connectivity"""
    print("1. Testing HuggingFace Space Direct:")
    
    try:
        # Test base endpoint
        resp = requests.get("https://FadhliRajwaa-DiabeticRetinopathy.hf.space/", timeout=30)
        if resp.status_code == 200:
            data = resp.json()
            print(f"   ✓ Base endpoint: {data.get('status')} - {data.get('model')} ({data.get('classes')} classes)")
        else:
            print(f"   ✗ Base endpoint error: {resp.status_code}")
            return False
            
        # Test prediction endpoint
        img_bytes = create_test_image()
        files = {"file": ("test.jpg", img_bytes, "image/jpeg")}
        
        start_time = time.time()
        resp = requests.post("https://FadhliRajwaa-DiabeticRetinopathy.hf.space/predict", 
                            files=files, timeout=60)
        duration = time.time() - start_time
        
        if resp.status_code == 200:
            result = resp.json()
            if result.get("success"):
                pred = result["prediction"]
                print(f"   ✓ Prediction endpoint: {pred['class_name']} ({pred['confidence']:.1f}%) in {duration:.2f}s")
                return True
            else:
                print(f"   ✗ Prediction failed: {result.get('error')}")
                return False
        else:
            print(f"   ✗ Prediction endpoint error: {resp.status_code}")
            return False
            
    except Exception as e:
        print(f"   ✗ HuggingFace error: {e}")
        return False

def test_nextjs_api(base_url="http://localhost:3000"):
    """Test NextJS API route"""
    print(f"2. Testing NextJS API ({base_url}):")
    
    try:
        # Create test image
        img_bytes = create_test_image(size=(512, 512))
        files = {"image": ("retina_test.jpg", img_bytes, "image/jpeg")}
        
        start_time = time.time()
        resp = requests.post(f"{base_url}/api/ai/dr/predict", files=files, timeout=90)
        duration = time.time() - start_time
        
        print(f"   Status: {resp.status_code} (took {duration:.2f}s)")
        
        if resp.status_code == 200:
            result = resp.json()
            if result.get("ok"):
                res = result["result"]
                print(f"   ✓ Prediction: {res['predicted_class']}")
                print(f"   ✓ Class ID: {res['class_id']}")
                print(f"   ✓ Confidence: {res['confidence']:.1f}%")
                print(f"   ✓ Description: {res['description']}")
                print(f"   ✓ Severity: {res['severity_level']}")
                return True
            else:
                print(f"   ✗ API Error: {result.get('error')}")
                return False
        else:
            try:
                error_data = resp.json()
                print(f"   ✗ Error: {error_data.get('error', 'Unknown error')}")
            except:
                print(f"   ✗ Error: {resp.text[:200]}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("   ✗ Connection refused - NextJS server not running")
        return False
    except requests.exceptions.Timeout:
        print("   ✗ Timeout - Request took too long")
        return False
    except Exception as e:
        print(f"   ✗ NextJS API error: {e}")
        return False

def test_error_handling():
    """Test error handling with invalid requests"""
    print("3. Testing Error Handling:")
    
    try:
        # Test without image
        resp = requests.post("http://localhost:3000/api/ai/dr/predict", timeout=10)
        if resp.status_code == 400:
            print("   ✓ Missing image validation works")
        else:
            print(f"   ? Unexpected status for missing image: {resp.status_code}")
            
        # Test with invalid image
        resp = requests.post("http://localhost:3000/api/ai/dr/predict", 
                           files={"image": ("test.txt", io.StringIO("invalid"), "text/plain")}, 
                           timeout=30)
        print(f"   Invalid file test: {resp.status_code}")
        
        return True
        
    except Exception as e:
        print(f"   Error testing: {e}")
        return False

def main():
    """Run all tests"""
    print("Starting comprehensive multi-environment test...")
    print("=" * 50)
    
    # Test HuggingFace Space
    hf_success = test_huggingface_direct()
    print()
    
    # Test NextJS API
    nextjs_success = test_nextjs_api()
    print()
    
    # Test error handling
    error_success = test_error_handling()
    print()
    
    # Summary
    print("=== TEST SUMMARY ===")
    print(f"HuggingFace Direct: {'✓ PASS' if hf_success else '✗ FAIL'}")
    print(f"NextJS API Route:   {'✓ PASS' if nextjs_success else '✗ FAIL'}")
    print(f"Error Handling:     {'✓ PASS' if error_success else '✗ FAIL'}")
    print()
    
    if hf_success and nextjs_success and error_success:
        print("🎉 ALL TESTS PASSED - Multi-environment ready!")
    elif hf_success and not nextjs_success:
        print("⚠️  HuggingFace OK but NextJS failed - Check server status")
    elif not hf_success:
        print("❌ HuggingFace connection failed - Check Space URL")
    else:
        print("❌ Some tests failed - Check logs above")

if __name__ == "__main__":
    main()
