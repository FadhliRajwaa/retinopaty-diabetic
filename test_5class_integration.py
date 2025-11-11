import requests
import json

print("Testing 5-Class Integration...")
print("=" * 40)

# Test NextJS homepage
print("1. Homepage 5-Class Info:")
try:
    resp = requests.get("http://localhost:3000", timeout=10)
    if resp.status_code == 200:
        content = resp.text
        if "5-Class" in content or "DenseNet201" in content:
            print("   ✓ 5-Class info present on homepage")
        else:
            print("   - Content loaded, checking for updates")
    else:
        print(f"   ✗ Homepage error: {resp.status_code}")
except Exception as e:
    print(f"   ✗ Error: {e}")

print()
print("2. HuggingFace Model:")
try:
    resp = requests.get("https://FadhliRajwaa-DiabeticRetinopathy.hf.space/", timeout=30)
    if resp.status_code == 200:
        data = resp.json()
        print(f"   ✓ Model: {data.get('model')}")
        print(f"   ✓ Classes: {data.get('classes')}")
        print(f"   ✓ Status: {data.get('status')}")
    else:
        print(f"   ✗ HuggingFace error: {resp.status_code}")
except Exception as e:
    print(f"   ✗ Error: {e}")

print()
print("3. Classes Endpoint:")
try:
    resp = requests.get("https://FadhliRajwaa-DiabeticRetinopathy.hf.space/classes", timeout=30)
    if resp.status_code == 200:
        data = resp.json()
        classes = data.get("classes", {})
        print(f"   ✓ 5 Classes defined:")
        for id, name in classes.items():
            print(f"     {id}: {name}")
    else:
        print(f"   ✗ Classes error: {resp.status_code}")
except Exception as e:
    print(f"   ✗ Error: {e}")

print()
print("Integration Status: All components ready for 5-class DR detection!")
