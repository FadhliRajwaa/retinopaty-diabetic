import requests
import json
from PIL import Image
import io
import time

print("=== DETAIL 502 ERROR DIAGNOSIS ===")
print()

def test_huggingface_space():
    """Test HuggingFace Space availability"""
    print("1. HuggingFace Space Status:")
    
    # Test base endpoint
    try:
        resp = requests.get("https://fadhlirajwaa-diabeticretinopathy.hf.space/", timeout=30)
        print(f"   Base Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            print(f"   ✓ Model: {data.get('model')}")
            print(f"   ✓ Classes: {data.get('classes')}")
            print(f"   ✓ Status: {data.get('status')}")
            
            # Test health check endpoint
            health_resp = requests.get("https://fadhlirajwaa-diabeticretinopathy.hf.space/health", timeout=30)
            print(f"   Health Check: {health_resp.status_code}")
            
            return True
        else:
            print(f"   ✗ Error: {resp.status_code} - {resp.text[:200]}")
            return False
            
    except requests.exceptions.Timeout:
        print("   ✗ TIMEOUT: HuggingFace Space not responding")
        return False
    except requests.exceptions.ConnectionError as e:
        print(f"   ✗ CONNECTION ERROR: {e}")
        return False
    except Exception as e:
        print(f"   ✗ UNKNOWN ERROR: {e}")
        return False

def test_prediction_endpoint():
    """Test HuggingFace prediction endpoint with real image"""
    print("2. Prediction Endpoint Test:")
    
    try:
        # Create a proper test image
        img = Image.new("RGB", (224, 224), color=(139, 69, 19))  # Brown retina-like color
        img_bytes = io.BytesIO()
        img.save(img_bytes, format="JPEG", quality=90)
        img_bytes.seek(0)
        
        files = {"file": ("test_retina.jpg", img_bytes, "image/jpeg")}
        
        start_time = time.time()
        resp = requests.post("https://fadhlirajwaa-diabeticretinopathy.hf.space/predict", 
                            files=files, timeout=60)
        duration = time.time() - start_time
        
        print(f"   Status: {resp.status_code} (took {duration:.2f}s)")
        
        if resp.status_code == 200:
            result = resp.json()
            print("   ✓ Prediction endpoint working")
            if result.get("success"):
                pred = result["prediction"]
                print(f"   ✓ Result: {pred['class_name']} ({pred['confidence']:.1f}%)")
                return True
            else:
                print(f"   ✗ API Error: {result}")
                return False
        else:
            print(f"   ✗ HTTP Error: {resp.text[:300]}")
            return False
            
    except Exception as e:
        print(f"   ✗ Prediction Error: {e}")
        return False

def test_production_environment():
    """Check production environment variables"""
    print("3. Production Environment Check:")
    
    # This would require access to Vercel, but we can check if API responds
    try:
        resp = requests.get("https://detection-retina-ai.vercel.app/api/health", timeout=30)
        print(f"   Production Health: {resp.status_code}")
    except:
        print("   Production health endpoint not available")
        
    # Test if production API exists (should return 400 for GET without image)
    try:
        resp = requests.get("https://detection-retina-ai.vercel.app/api/ai/dr/predict", timeout=30)
        print(f"   Production API Status: {resp.status_code}")
        if resp.status_code == 400:
            print("   ✓ Production API endpoint exists")
        elif resp.status_code == 500:
            print("   ⚠️ Production API has server error")
            print(f"   Error details: {resp.text[:200]}")
        else:
            print(f"   ? Unexpected status: {resp.text[:200]}")
    except Exception as e:
        print(f"   ✗ Production API Error: {e}")

def test_local_environment():
    """Test local NextJS server"""
    print("4. Local Environment Check:")
    
    try:
        resp = requests.get("http://localhost:3000/api/ai/dr/predict", timeout=10)
        print(f"   Local API Status: {resp.status_code}")
        
        if resp.status_code == 400:
            print("   ✓ Local API responding correctly")
        else:
            print(f"   Response: {resp.text[:200]}")
            
    except requests.exceptions.ConnectionError:
        print("   ✗ Local server not running")
    except Exception as e:
        print(f"   ✗ Local error: {e}")

def main():
    """Run all diagnostic tests"""
    
    # Test each component
    hf_status = test_huggingface_space()
    print()
    
    pred_status = test_prediction_endpoint()
    print()
    
    test_production_environment()
    print()
    
    test_local_environment()
    print()
    
    # Diagnosis
    print("=== DIAGNOSIS SUMMARY ===")
    
    if not hf_status:
        print("❌ PROBLEM: HuggingFace Space is not accessible")
        print("   Solutions:")
        print("   - Check if Space is sleeping (first request might take longer)")
        print("   - Verify Space URL spelling")
        print("   - Check HuggingFace status page")
        
    elif not pred_status:
        print("❌ PROBLEM: HuggingFace Space accessible but prediction fails")
        print("   Solutions:")
        print("   - Check model loading in Space")
        print("   - Verify image format requirements")
        print("   - Check Space logs for errors")
        
    else:
        print("⚠️ PROBLEM: HuggingFace works but production deployment has issues")
        print("   Solutions:")
        print("   - Check Vercel environment variables")
        print("   - Verify HF_SPACE_URL in Vercel dashboard")
        print("   - Check Vercel function logs")
        print("   - Redeploy with updated environment variables")
        
    print()
    print("🔧 IMMEDIATE ACTIONS NEEDED:")
    print("1. Verify Vercel environment variable: HF_SPACE_URL")
    print("2. Check Vercel function logs for detailed errors")
    print("3. Ensure environment variables are set for 'Production' environment")

if __name__ == "__main__":
    main()
