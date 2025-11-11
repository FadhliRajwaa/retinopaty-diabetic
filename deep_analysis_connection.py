import requests
import json
from PIL import Image
import io

print("=== DEEP ANALYSIS: HuggingFace Space Connectivity ===")
print()

# 1. Test base endpoint
print("1. Testing Base Endpoint:")
try:
    resp = requests.get("https://FadhliRajwaa-DiabeticRetinopathy.hf.space/", timeout=30)
    print(f"   Status: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        print(f"   Model: {data.get('model')}")
        print(f"   Classes: {data.get('classes')}")
        print(f"   Status: {data.get('status')}")
        print("   ✓ Base endpoint OK")
    else:
        print(f"   ✗ Unexpected status: {resp.status_code}")
except Exception as e:
    print(f"   ✗ Error: {e}")

print()
print("2. Testing /predict Endpoint with Sample Image:")
try:
    # Create a simple test image (224x224 retina-like image)
    img = Image.new("RGB", (224, 224), color="red")
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="JPEG")
    img_bytes.seek(0)
    
    files = {"file": ("test.jpg", img_bytes, "image/jpeg")}
    resp = requests.post("https://FadhliRajwaa-DiabeticRetinopathy.hf.space/predict", 
                        files=files, timeout=60)
    
    print(f"   Status: {resp.status_code}")
    if resp.status_code == 200:
        result = resp.json()
        print("   ✓ Prediction endpoint responding")
        print(f"   Response keys: {list(result.keys())}")
        if "success" in result:
            print(f"   Success: {result['success']}")
        if "prediction" in result:
            pred = result["prediction"]
            print(f"   Predicted class: {pred.get('class_name')}")
            print(f"   Class ID: {pred.get('class_id')}")
            print(f"   Confidence: {pred.get('confidence')}%")
        if "all_probabilities" in result:
            print(f"   All probabilities: {result['all_probabilities']}")
    else:
        print(f"   ✗ Status: {resp.status_code}")
        print(f"   Response: {resp.text[:300]}")
        
except Exception as e:
    print(f"   ✗ Error: {e}")

print()
print("3. Testing NextJS API Route:")
try:
    resp = requests.post("http://localhost:3000/api/ai/dr/predict", timeout=10)
    print(f"   Status: {resp.status_code}")
    if resp.status_code == 400:
        print("   ✓ NextJS API route accessible (400 = missing image, expected)")
    else:
        print(f"   Response: {resp.text[:200]}")
except Exception as e:
    print(f"   Error: {e}")

print()
print("4. Testing End-to-End with Sample Image:")
try:
    # Test the full pipeline
    img = Image.new("RGB", (512, 512), color="darkred")
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="JPEG")
    img_bytes.seek(0)
    
    files = {"image": ("retina_test.jpg", img_bytes, "image/jpeg")}
    resp = requests.post("http://localhost:3000/api/ai/dr/predict", 
                        files=files, timeout=60)
    
    print(f"   NextJS API Status: {resp.status_code}")
    if resp.status_code == 200:
        result = resp.json()
        print("   ✓ End-to-end pipeline working!")
        if result.get("ok"):
            print(f"   Prediction: {result['result'].get('predicted_class')}")
            print(f"   Confidence: {result['result'].get('confidence')}%")
            print(f"   Class ID: {result['result'].get('class_id')}")
        else:
            print(f"   API Error: {result.get('error')}")
    else:
        print(f"   Response: {resp.text[:300]}")
        
except Exception as e:
    print(f"   ✗ Error: {e}")

print()
print("=== DIAGNOSIS SUMMARY ===")
print("Check all the above results to identify the connection issue.")
