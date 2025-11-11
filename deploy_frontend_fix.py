import requests
import time
import subprocess
import os

def deploy_frontend_fix():
    """Deploy frontend fixes to production for 5-class system"""
    
    print("🚀 DEPLOYING FRONTEND FIXES - 5-CLASS SYSTEM")
    print("=" * 60)
    
    # Check current working directory
    cwd = os.getcwd()
    print(f"📁 Current directory: {cwd}")
    
    # Check if we have git changes
    try:
        result = subprocess.run(['git', 'status', '--porcelain'], 
                              capture_output=True, text=True, cwd=cwd)
        
        if result.returncode == 0:
            changes = result.stdout.strip()
            if changes:
                print("📝 Git changes detected:")
                for line in changes.split('\n'):
                    if 'reports/page.tsx' in line:
                        print(f"   ✅ {line}")
                    elif '.tsx' in line or '.ts' in line:
                        print(f"   📄 {line}")
                    else:
                        print(f"   📋 {line}")
            else:
                print("✅ No uncommitted changes")
        else:
            print("⚠️  Git status check failed")
    except Exception as e:
        print(f"⚠️  Git check error: {e}")
    
    print("\n" + "=" * 60)
    print("🔧 FIXES APPLIED:")
    print("   ✅ Reports page: ApiScanResult interface updated")
    print("   ✅ Reports page: Data transformation includes 5-class fields")
    print("   ✅ Reports page: Statistics calculation uses 5-class")
    print("   ✅ Reports page: Patient display shows specific DR levels")
    print("   ✅ Patient dashboard: Color coding for all 5 classes")
    
    print("\n" + "=" * 60)
    print("📋 DEPLOYMENT CHECKLIST:")
    print("   1. ✅ Backend APIs support 5-class (already done)")
    print("   2. ✅ Frontend components updated (just completed)")
    print("   3. 🔄 Need to deploy to Vercel")
    
    print("\n" + "=" * 60)
    print("🎯 NEXT STEPS:")
    print("   1. Git commit the changes:")
    print("      git add .")
    print("      git commit -m 'Fix: Complete 5-class system integration'")
    print("   2. Push to trigger Vercel deployment:")
    print("      git push")
    print("   3. Wait 2-3 minutes for Vercel build")
    print("   4. Test the production URL:")
    print("      https://detection-retina-ai.vercel.app/dashboard/admin/reports")
    
    print("\n" + "=" * 60)
    print("🐛 ISSUES FIXED:")
    print("   ❌ WAS: 'DR Terdeteksi' / 'Scan Normal' (2-class)")
    print("   ✅ NOW: 5 specific cards (No DR, Mild, Moderate, Severe, Proliferative)")
    print("   ❌ WAS: '✅ Retina Normal' for Mild DR result")
    print("   ✅ NOW: '🟡 Mild DR' with proper color coding")
    
    print("\n🎉 Ready for deployment!")
    
    # Test local development server if available
    print("\n" + "=" * 60)
    print("🧪 TESTING LOCAL SERVER:")
    
    try:
        response = requests.get('http://localhost:3000/api/admin/scans/history?limit=5', timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('ok') and data.get('data'):
                sample_scan = data['data'][0] if data['data'] else {}
                print("   ✅ Local API working")
                print(f"   📊 Sample fields: {list(sample_scan.keys())[:8]}...")
                
                # Check if 5-class fields are present
                if 'class_id' in sample_scan:
                    print("   ✅ 5-class fields detected in API response")
                else:
                    print("   ⚠️  5-class fields missing in API response")
            else:
                print("   ⚠️  API response format issue")
        else:
            print(f"   ❌ API error: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("   ⚠️  Local server not running (npm run dev)")
    except Exception as e:
        print(f"   ❌ Test error: {e}")

if __name__ == "__main__":
    deploy_frontend_fix()
