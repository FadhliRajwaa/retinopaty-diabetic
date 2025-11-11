import requests
from pathlib import Path

def debug_deployment():
    """Debug HuggingFace Space deployment to check exact response format"""
    
    print("=== DEBUGGING HUGGINGFACE SPACE DEPLOYMENT ===")
    
    base_url = "https://fadhlirajwaa-diabeticretinopathy.hf.space"
    
    print("1. API Info:")
    print("-" * 30)
    
    # Get API info
    try:
        response = requests.get(f"{base_url}/", timeout=30)
        if response.status_code == 200:
            data = response.json()
            print(f"   Version: {data.get('version')}")
            print(f"   Status: {data.get('status')}")
            print(f"   Classes: {data.get('classes')}")
        else:
            print(f"   Error: {response.status_code}")
            return
    except Exception as e:
        print(f"   Error: {e}")
        return
    
    print("\n2. Single Image Test:")
    print("-" * 30)
    
    # Test dengan satu gambar untuk debug detail
    dataset_path = Path("E:/web-skripsi/dataset/colored_images/No_DR")
    
    if dataset_path.exists():
        images = list(dataset_path.glob("*.png"))
        if images:
            test_image = images[0]
            print(f"   Testing: {test_image.name}")
            
            try:
                with open(test_image, 'rb') as f:
                    files = {'file': (test_image.name, f, 'image/png')}
                    response = requests.post(f"{base_url}/predict", files=files, timeout=60)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    print("   ✅ Response received")
                    print(f"   Success: {data.get('success')}")
                    
                    if data.get('success'):
                        pred = data.get('prediction', {})
                        print(f"   Prediction: {pred.get('class_name')}")
                        print(f"   Confidence: {pred.get('confidence')} (type: {type(pred.get('confidence'))})")
                        
                        print("\n   All Probabilities (RAW):")
                        all_probs = data.get('all_probabilities', {})
                        for name, prob in all_probs.items():
                            print(f"     {name}: {prob} (type: {type(prob)})")
                        
                        # Check which ones are percentage format
                        print("\n   Format Analysis:")
                        main_conf = pred.get('confidence', 0)
                        if isinstance(main_conf, (int, float)) and main_conf > 1:
                            print(f"   ✅ Main confidence in percentage: {main_conf}")
                        else:
                            print(f"   ❌ Main confidence NOT percentage: {main_conf}")
                        
                        percentage_count = 0
                        decimal_count = 0
                        
                        for name, prob in all_probs.items():
                            if isinstance(prob, (int, float)):
                                if prob > 1:
                                    percentage_count += 1
                                else:
                                    decimal_count += 1
                                    print(f"     ❌ {name}: {prob} (decimal, should be {prob*100}%)")
                        
                        print(f"\n   Summary: {percentage_count} percentage, {decimal_count} decimal")
                        
                        if decimal_count > 0:
                            print("   🔧 ISSUE: Some probabilities still in decimal format!")
                            print("   💡 This means the * 100 multiplication is not working for all_probabilities")
                        else:
                            print("   ✅ All probabilities in percentage format!")
                            
                    else:
                        print(f"   ❌ Prediction failed: {data}")
                else:
                    print(f"   ❌ HTTP Error: {response.status_code}")
                    print(f"   Response: {response.text[:500]}")
                    
            except Exception as e:
                print(f"   ❌ Exception: {e}")
        else:
            print("   ❌ No images found")
    else:
        print("   ❌ Dataset path not found")

def main():
    print("🔍 HuggingFace Space Deployment Debugger")
    print("=" * 50)
    
    debug_deployment()
    
    print("\n" + "=" * 50)
    print("💡 If all_probabilities are still decimal:")
    print("   1. HuggingFace Space might be using cached version")
    print("   2. The * 100 multiplication is not applied to all_probabilities")
    print("   3. May need to restart HuggingFace Space or wait longer")

if __name__ == "__main__":
    main()
