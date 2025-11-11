#!/usr/bin/env python3
"""
Test connectivity to HuggingFace Space for 5-class Diabetic Retinopathy Detection
"""

import requests
import json

# HuggingFace Space URL
HUGGINGFACE_URL = "https://FadhliRajwaa-DiabeticRetinopathy.hf.space"

def test_huggingface_endpoints():
    print("🧪 Testing HuggingFace Space Connectivity")
    print("=" * 50)
    
    # Test health endpoint
    print("1. Testing Health Endpoint...")
    try:
        response = requests.get(f"{HUGGINGFACE_URL}/health", timeout=30)
        if response.status_code == 200:
            print("✅ Health check successful!")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")
    
    # Test root endpoint
    print("\n2. Testing Root Endpoint...")
    try:
        response = requests.get(f"{HUGGINGFACE_URL}/", timeout=30)
        if response.status_code == 200:
            print("✅ Root endpoint successful!")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")
    
    # Test classes endpoint
    print("\n3. Testing Classes Endpoint...")
    try:
        response = requests.get(f"{HUGGINGFACE_URL}/classes", timeout=30)
        if response.status_code == 200:
            print("✅ Classes endpoint successful!")
            classes_data = response.json()
            print(f"   Classes: {json.dumps(classes_data, indent=2)}")
        else:
            print(f"❌ Classes endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Classes endpoint error: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 HuggingFace Space Testing Complete")

if __name__ == "__main__":
    test_huggingface_endpoints()
