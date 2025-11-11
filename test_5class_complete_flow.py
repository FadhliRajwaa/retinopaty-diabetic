import requests
import json
import time
from pathlib import Path

def test_5class_complete_flow():
    """Test complete 5-class flow: HuggingFace → Save → Dashboard"""
    
    print("=== COMPREHENSIVE 5-CLASS SYSTEM TEST ===")
    print("Testing: HuggingFace → NextJS API → Database → Dashboard")
    print()
    
    # Test URLs
    hf_space_url = "https://fadhlirajwaa-diabeticretinopathy.hf.space"
    local_api = "http://localhost:3000/api"
    
    # Test image
    dataset_path = Path("E:/web-skripsi/dataset/colored_images")
    test_image = None
    
    if dataset_path.exists():
        for folder in ["No_DR", "Mild", "Moderate", "Severe", "Proliferate_DR"]:
            folder_path = dataset_path / folder
            if folder_path.exists():
                images = list(folder_path.glob("*.png"))
                if images:
                    test_image = (folder, images[0])
                    break
    
    if not test_image:
        print("❌ No test images found - cannot proceed")
        return False
    
    expected_class, image_path = test_image
    print(f"🖼️  Test Image: {expected_class} → {image_path.name}")
    print()
    
    # Step 1: Test HuggingFace Space (5-class output)
    print("1. Testing HuggingFace Space API:")
    print("-" * 40)
    
    try:
        with open(image_path, 'rb') as f:
            files = {'file': (image_path.name, f, 'image/png')}
            response = requests.post(f"{hf_space_url}/predict", files=files, timeout=60)
        
        if response.status_code == 200:
            hf_data = response.json()
            
            if hf_data.get('success'):
                prediction = hf_data['prediction']
                print(f"   ✅ HuggingFace Response:")
                print(f"     Class ID: {prediction['class_id']}")
                print(f"     Class Name: {prediction['class_name']}")
                print(f"     Confidence: {prediction['confidence']}%")
                print(f"     Description: {prediction['description']}")
                print(f"     Severity: {prediction['severity_level']}")
                
                # Check if it's 5-class format
                if 'class_id' in prediction and 'severity_level' in prediction:
                    print("   ✅ 5-Class format confirmed")
                    hf_success = True
                else:
                    print("   ❌ Not 5-class format")
                    hf_success = False
            else:
                print(f"   ❌ HuggingFace prediction failed: {hf_data}")
                hf_success = False
        else:
            print(f"   ❌ HuggingFace API error: {response.status_code}")
            hf_success = False
            
    except Exception as e:
        print(f"   ❌ HuggingFace connection error: {e}")
        hf_success = False
    
    print()
    
    # Step 2: Test NextJS API prediction route
    print("2. Testing NextJS API Prediction:")
    print("-" * 40)
    
    try:
        with open(image_path, 'rb') as f:
            files = {'file': (image_path.name, f, 'image/png')}
            response = requests.post(f"{local_api}/ai/dr/predict", files=files, timeout=60)
        
        if response.status_code == 200:
            api_data = response.json()
            
            if api_data.get('success'):
                pred_result = api_data['prediction']
                print(f"   ✅ NextJS API Response:")
                print(f"     Class ID: {pred_result.get('class_id', 'N/A')}")
                print(f"     Class Name: {pred_result.get('class_name', 'N/A')}")
                print(f"     Confidence: {pred_result.get('confidence', 'N/A')}%")
                print(f"     Description: {pred_result.get('description', 'N/A')}")
                print(f"     Severity: {pred_result.get('severity_level', 'N/A')}")
                
                nextjs_success = True
                prediction_data = pred_result
            else:
                print(f"   ❌ NextJS API prediction failed: {api_data}")
                nextjs_success = False
                prediction_data = None
        else:
            print(f"   ❌ NextJS API error: {response.status_code}")
            try:
                error_detail = response.json()
                print(f"     Detail: {error_detail}")
            except:
                print(f"     Raw: {response.text[:200]}")
            nextjs_success = False
            prediction_data = None
            
    except requests.exceptions.ConnectionError:
        print("   ⚠️  NextJS server not running (run 'npm run dev')")
        nextjs_success = False
        prediction_data = None
    except Exception as e:
        print(f"   ❌ NextJS API error: {e}")
        nextjs_success = False
        prediction_data = None
    
    print()
    
    # Step 3: Test Dashboard APIs
    print("3. Testing Dashboard APIs:")
    print("-" * 40)
    
    dashboard_success = True
    
    # Test admin dashboard API
    try:
        response = requests.get(f"{local_api}/admin/dashboard", timeout=30)
        if response.status_code == 200:
            admin_data = response.json()
            diag_stats = admin_data.get('diagnosisStats', {})
            
            print("   ✅ Admin Dashboard API:")
            print(f"     No DR: {diag_stats.get('No DR', 0)}")
            print(f"     Mild DR: {diag_stats.get('Mild DR', 0)}")
            print(f"     Moderate DR: {diag_stats.get('Moderate DR', 0)}")
            print(f"     Severe DR: {diag_stats.get('Severe DR', 0)}")
            print(f"     Proliferative DR: {diag_stats.get('Proliferative DR', 0)}")
            
            # Check if it has 5-class stats
            if 'No DR' in diag_stats and 'Proliferative DR' in diag_stats:
                print("   ✅ 5-Class statistics confirmed")
            else:
                print("   ❌ Missing 5-class statistics")
                dashboard_success = False
        else:
            print(f"   ❌ Admin dashboard API error: {response.status_code}")
            dashboard_success = False
            
    except Exception as e:
        print(f"   ❌ Admin dashboard API error: {e}")
        dashboard_success = False
    
    # Test patient dashboard API
    try:
        response = requests.get(f"{local_api}/patient/dashboard", timeout=30)
        if response.status_code == 200:
            patient_data = response.json()
            latest_scan = patient_data.get('latestScan')
            
            print("   ✅ Patient Dashboard API:")
            if latest_scan:
                print(f"     Latest: {latest_scan.get('prediction', 'N/A')}")
                print(f"     Class ID: {latest_scan.get('class_id', 'N/A')}")
                print(f"     Severity: {latest_scan.get('severity_level', 'N/A')}")
                
                if 'class_id' in latest_scan and 'severity_level' in latest_scan:
                    print("   ✅ 5-Class patient data confirmed")
                else:
                    print("   ❌ Missing 5-class patient data")
                    dashboard_success = False
            else:
                print("   ⚠️  No scan data (expected for fresh database)")
        else:
            print(f"   ❌ Patient dashboard API error: {response.status_code}")
            dashboard_success = False
            
    except Exception as e:
        print(f"   ❌ Patient dashboard API error: {e}")
        dashboard_success = False
    
    print()
    
    # Summary
    print("=" * 60)
    print("🏁 COMPREHENSIVE TEST RESULTS:")
    print()
    
    total_tests = 0
    passed_tests = 0
    
    results = [
        ("HuggingFace Space 5-Class", hf_success),
        ("NextJS API Integration", nextjs_success), 
        ("Dashboard APIs 5-Class", dashboard_success)
    ]
    
    for test_name, success in results:
        total_tests += 1
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"   {status}: {test_name}")
        if success:
            passed_tests += 1
    
    print()
    print(f"📊 OVERALL: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 ALL SYSTEMS GO - 5-Class integration complete!")
        print("✅ Ready for production use")
        print("\n🎯 What works now:")
        print("   • HuggingFace Space returns 5-class predictions")
        print("   • NextJS API processes 5-class format")
        print("   • Dashboard shows 5-class statistics")
        print("   • No more 'DR Terdeteksi' / 'Scan Normal' - now shows specific severity")
    else:
        print("⚠️  Some components need attention")
        if not hf_success:
            print("   🔧 HuggingFace Space: Check deployment")
        if not nextjs_success:
            print("   🔧 NextJS API: Start development server")
        if not dashboard_success:
            print("   🔧 Dashboard: Check API routes")
    
    return passed_tests == total_tests

if __name__ == "__main__":
    success = test_5class_complete_flow()
    exit(0 if success else 1)
