import requests
import time
import json

def check_deployment_status():
    """Monitor HuggingFace Space deployment status"""
    
    print("=== MONITORING HUGGINGFACE SPACE DEPLOYMENT ===")
    
    base_url = "https://fadhlirajwaa-diabeticretinopathy.hf.space"
    
    for i in range(10):  # Check 10 times with delay
        print(f"\n🔍 Check #{i+1}:")
        
        try:
            # Check version
            response = requests.get(f"{base_url}/", timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                version = data.get('version', 'unknown')
                status = data.get('status', 'unknown')
                
                print(f"   ✅ API Status: {status}")
                print(f"   📋 Version: {version}")
                
                if version == "2.1.0":
                    print("   🎉 NEW VERSION DEPLOYED!")
                    
                    # Test confidence format quickly
                    print("   🧪 Quick confidence test...")
                    
                    # Create a minimal test (using a simple test image if available)
                    # For now, just check if the API is responding correctly
                    classes_response = requests.get(f"{base_url}/classes", timeout=30)
                    if classes_response.status_code == 200:
                        classes_data = classes_response.json()
                        print(f"   ✅ Classes endpoint working: {classes_data.get('total_classes')} classes")
                        
                        return True
                    else:
                        print(f"   ⚠️  Classes endpoint issue: {classes_response.status_code}")
                        
                elif version == "2.0.0":
                    print("   ⏳ Still old version, waiting...")
                else:
                    print(f"   ❓ Unexpected version: {version}")
                    
            else:
                print(f"   ❌ HTTP Error: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Connection Error: {e}")
        
        if i < 9:  # Don't wait after last check
            print(f"   ⏰ Waiting 30 seconds before next check...")
            time.sleep(30)
    
    print("\n❌ Deployment monitoring completed - version 2.1.0 not detected")
    return False

def main():
    """Main monitoring function"""
    
    print("🚀 HuggingFace Space Deployment Monitor")
    print("=" * 50)
    print("Waiting for version 2.1.0 deployment with confidence fix...")
    
    success = check_deployment_status()
    
    if success:
        print("\n" + "=" * 50)
        print("✅ DEPLOYMENT SUCCESSFUL!")
        print("🧪 Ready to test confidence format with:")
        print("   python test_confidence_format.py")
    else:
        print("\n" + "=" * 50) 
        print("⏳ Deployment still in progress")
        print("💡 HuggingFace Space might need more time to update")
        print("🔄 Try testing again in a few minutes")

if __name__ == "__main__":
    main()
