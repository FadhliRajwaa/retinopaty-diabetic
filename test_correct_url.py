import requests
import json

print("=== TESTING CORRECT HUGGINGFACE URL ===")
print()

# Test the correct URL
url = "https://fadhlirajwaa-diabeticretinopathy.hf.space/"
try:
    resp = requests.get(url, timeout=30)
    if resp.status_code == 200:
        data = resp.json()
        print("✓ HuggingFace Space Response:")
        print(f"  Model: {data.get('model')}")
        print(f"  Classes: {data.get('classes')}")  
        print(f"  Status: {data.get('status')}")
        print(f"  Version: {data.get('version')}")
        print()
        print("✅ URL is CORRECT and Space is READY!")
        
        # Test local NextJS server with correct URL
        print()
        print("Testing local NextJS with corrected environment:")
        
        from PIL import Image
        import io
        
        # Create test image
        img = Image.new("RGB", (224, 224), color="darkred")
        img_bytes = io.BytesIO()
        img.save(img_bytes, format="JPEG")
        img_bytes.seek(0)
        
        files = {"image": ("test_retina.jpg", img_bytes, "image/jpeg")}
        
        try:
            resp = requests.post("http://localhost:3000/api/ai/dr/predict", 
                               files=files, timeout=60)
            print(f"NextJS API Status: {resp.status_code}")
            
            if resp.status_code == 200:
                result = resp.json()
                if result.get("ok"):
                    res = result["result"]
                    print("✅ SUCCESS! Full pipeline working:")
                    print(f"  Prediction: {res['predicted_class']}")
                    print(f"  Class ID: {res['class_id']}")
                    print(f"  Confidence: {res['confidence']:.1f}%")
                    print(f"  Description: {res['description']}")
                else:
                    print(f"❌ API Error: {result.get('error')}")
            else:
                print(f"❌ HTTP Error: {resp.status_code}")
                try:
                    error = resp.json()
                    print(f"   Error: {error.get('error')}")
                except:
                    print(f"   Response: {resp.text[:200]}")
                    
        except Exception as e:
            print(f"❌ NextJS Test Error: {e}")
        
    else:
        print(f"✗ Error: {resp.status_code}")
except Exception as e:
    print(f"✗ Error: {e}")

print()
print("=== ENVIRONMENT VARIABLES VERIFICATION ===")
print("Make sure these are set correctly:")
print("1. Local: .env.local")
print("2. Production: Vercel Dashboard")
print("3. URL: https://fadhlirajwaa-diabeticretinopathy.hf.space")
