import requests
import time

def validate_5class_deployment():
    """Validate 5-class system deployment on production"""
    
    print("🧪 VALIDATING 5-CLASS DEPLOYMENT")
    print("=" * 50)
    
    # Wait for Vercel deployment
    print("⏳ Waiting for Vercel deployment to complete...")
    print("   (Usually takes 2-3 minutes)")
    
    base_url = "https://detection-retina-ai.vercel.app"
    api_url = f"{base_url}/api/admin/scans/history?limit=5"
    
    max_attempts = 10
    attempt = 1
    
    while attempt <= max_attempts:
        print(f"\n🔍 Attempt {attempt}/{max_attempts}:")
        
        try:
            # Test API endpoint
            response = requests.get(api_url, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('ok') and data.get('data'):
                    sample_data = data['data']
                    print(f"   ✅ API working - {len(sample_data)} records")
                    
                    # Check for 5-class fields
                    if sample_data:
                        scan = sample_data[0]
                        fields_present = []
                        
                        if 'class_id' in scan:
                            fields_present.append(f"class_id: {scan['class_id']}")
                        if 'description' in scan:
                            fields_present.append(f"description: {scan['description'][:30] if scan['description'] else 'None'}...")
                        if 'severity_level' in scan:
                            fields_present.append(f"severity_level: {scan['severity_level']}")
                        if 'prediction' in scan:
                            fields_present.append(f"prediction: {scan['prediction']}")
                        
                        if fields_present:
                            print("   ✅ 5-Class fields detected:")
                            for field in fields_present:
                                print(f"      • {field}")
                            
                            # Validate specific cases
                            predictions = [s.get('prediction') for s in sample_data[:3]]
                            class_ids = [s.get('class_id') for s in sample_data[:3]]
                            
                            print(f"   📊 Sample predictions: {predictions}")
                            print(f"   📊 Sample class_ids: {class_ids}")
                            
                            # Check if we have 5-class predictions (not just DR/NO_DR)
                            five_class_predictions = [p for p in predictions if p in ['No DR', 'Mild DR', 'Moderate DR', 'Severe DR', 'Proliferative DR']]
                            
                            if five_class_predictions:
                                print("   🎉 5-CLASS SYSTEM ACTIVE!")
                                print(f"      Found: {five_class_predictions}")
                                return True
                            else:
                                print("   ⚠️  Still using legacy predictions")
                                legacy_predictions = [p for p in predictions if p in ['DR', 'NO_DR']]
                                if legacy_predictions:
                                    print(f"      Legacy format: {legacy_predictions}")
                        else:
                            print("   ❌ 5-Class fields missing")
                    else:
                        print("   ⚠️  No scan data available")
                else:
                    print(f"   ❌ API response issue: {data}")
            else:
                print(f"   ❌ API error {response.status_code}")
                if response.status_code == 401:
                    print("      (Unauthorized - expected for public API)")
                
        except requests.exceptions.Timeout:
            print("   ⏳ Request timeout - deployment still in progress")
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        if attempt < max_attempts:
            print("   ⏰ Waiting 30 seconds before retry...")
            time.sleep(30)
        
        attempt += 1
    
    print("\n" + "=" * 50)
    print("❌ VALIDATION TIMEOUT")
    print("💡 Manual check required:")
    print(f"   1. Visit: {base_url}/dashboard/admin/reports")
    print("   2. Check that cards show:")
    print("      • No DR, Mild DR, Moderate DR, Severe DR, Proliferative DR")
    print("   3. Upload a test image and verify result shows specific class")
    
    return False

def main():
    print("🚀 5-CLASS SYSTEM DEPLOYMENT VALIDATOR")
    print("Testing production deployment at Vercel...")
    print()
    
    success = validate_5class_deployment()
    
    if success:
        print("\n" + "🎉" * 20)
        print("✅ DEPLOYMENT SUCCESSFUL!")
        print("🎯 5-Class system is now active in production")
        print("📋 What changed:")
        print("   • Reports cards now show 5 separate severity levels")
        print("   • Patient details show specific DR classification")
        print("   • Color coding matches medical severity")
        print("   • No more generic 'DR Terdeteksi' messages")
    else:
        print("\n" + "⚠️" * 20)
        print("🔄 DEPLOYMENT IN PROGRESS OR NEEDS MANUAL CHECK")
        print("⏰ Vercel deployments can take up to 5 minutes")
        print("🔧 If issue persists, check Vercel deployment logs")

if __name__ == "__main__":
    main()
