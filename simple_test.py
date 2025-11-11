import requests

print("Testing 5-Class DR Detection System Integration...")
print("=" * 50)

# Test NextJS
print("1. Testing NextJS Frontend...")
try:
    resp = requests.get("http://localhost:3000", timeout=10)
    if resp.status_code == 200:
        print("   OK NextJS Frontend running")
        if "5-Class" in resp.text or "DenseNet201" in resp.text:
            print("   OK 5-Class info detected on homepage")
        else:
            print("   - Homepage content loaded")
    else:
        print(f"   ERROR NextJS issue: {resp.status_code}")
except Exception as e:
    print(f"   ERROR NextJS: {e}")

print()
print("2. Testing HuggingFace API...")
try:
    resp = requests.get("https://FadhliRajwaa-DiabeticRetinopathy.hf.space/", timeout=30)
    if resp.status_code == 200:
        data = resp.json()
        print("   OK HuggingFace API accessible")
        print(f"   Model: {data.get('model')}")
        print(f"   Classes: {data.get('classes')}")
        print(f"   Status: {data.get('status')}")
    else:
        print(f"   ERROR HuggingFace issue: {resp.status_code}")
except Exception as e:
    print(f"   ERROR HuggingFace: {e}")

print()
print("3. Testing NextJS API Route...")
try:
    resp = requests.get("http://localhost:3000/api/ai/dr/predict", timeout=10)
    if resp.status_code == 405:
        print("   OK API route accessible (expects POST)")
    else:
        print(f"   INFO API route response: {resp.status_code}")
except Exception as e:
    print(f"   ERROR API route: {e}")

print()
print("Integration test completed!")
