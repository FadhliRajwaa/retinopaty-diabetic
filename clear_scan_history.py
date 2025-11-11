import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_supabase_client():
    """Initialize Supabase client"""
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not service_key:
        print("❌ Error: Supabase credentials not found in environment variables")
        print("   Make sure .env file contains:")
        print("   - NEXT_PUBLIC_SUPABASE_URL")
        print("   - SUPABASE_SERVICE_ROLE_KEY")
        return None
    
    try:
        supabase: Client = create_client(url, service_key)
        return supabase
    except Exception as e:
        print(f"❌ Error connecting to Supabase: {e}")
        return None

def clear_scan_history(supabase: Client):
    """Clear all scan history from database"""
    
    print("=== CLEARING SCAN HISTORY ===")
    print()
    
    try:
        # Get current count before deletion
        print("1. Checking current scan count...")
        
        # Count scan_results
        scan_count_response = supabase.table('scan_results').select('id', count='exact').execute()
        scan_count = scan_count_response.count if scan_count_response.count else 0
        
        print(f"   📊 Current scan_results: {scan_count}")
        
        if scan_count == 0:
            print("   ✅ No scan_results found - database is already clean")
            return True
        
        # Confirm deletion
        print(f"\n⚠️  About to DELETE {scan_count} scan_results records!")
        print("   This action cannot be undone.")
        
        confirmation = input("\n🔴 Type 'DELETE' to confirm: ").strip()
        
        if confirmation != 'DELETE':
            print("❌ Operation cancelled")
            return False
        
        print("\n2. Deleting all scan_results records...")
        
        # Delete all scan_results (use a condition that matches all UUIDs)
        delete_response = supabase.table('scan_results').delete().not_.is_('id', 'null').execute()
        
        print(f"   ✅ Deletion completed")
        
        # Verify deletion
        print("\n3. Verifying deletion...")
        
        final_count_response = supabase.table('scan_results').select('id', count='exact').execute()
        final_count = final_count_response.count if final_count_response.count else 0
        
        print(f"   📊 Remaining scans: {final_count}")
        
        if final_count == 0:
            print("   ✅ All scan records successfully deleted!")
            
            # Reset auto-increment sequence (optional)
            print("\n4. Resetting ID sequence...")
            try:
                # Reset auto-increment sequence (optional)
                supabase.rpc('restart_sequence', {'sequence_name': 'scan_results_id_seq'}).execute()
                print("   ✅ ID sequence reset")
            except:
                print("   ⚠️  Could not reset ID sequence (this is normal)")
            
            return True
        else:
            print(f"   ⚠️  {final_count} records still remain")
            return False
            
    except Exception as e:
        print(f"❌ Error during deletion: {e}")
        import traceback
        traceback.print_exc()
        return False

def verify_database_state(supabase: Client):
    """Verify current database state"""
    
    print("\n=== DATABASE STATE VERIFICATION ===")
    print()
    
    try:
        # Check scan_results table
        scan_response = supabase.table('scan_results').select('id, patient_id, created_at, prediction', count='exact').limit(5).execute()
        scan_count = scan_response.count if scan_response.count else 0
        
        print(f"📊 Total scan_results: {scan_count}")
        
        if scan_count > 0:
            print("   Recent scans:")
            for scan in scan_response.data[:5]:
                created_at = scan.get('created_at', 'Unknown')[:19] if scan.get('created_at') else 'Unknown'
                prediction = scan.get('prediction', 'Unknown')
                patient_id = scan.get('patient_id', 'Unknown')
                print(f"     ID {scan['id']}: Patient {patient_id} - {prediction} ({created_at})")
        
        # Check users table (should remain intact)
        patient_response = supabase.table('user_profiles').select('id, full_name, role', count='exact').limit(5).execute()
        patient_count = patient_response.count if patient_response.count else 0
        
        print(f"\n👥 Total users: {patient_count}")
        
        if patient_count > 0:
            print("   Sample users:")
            for profile in patient_response.data[:5]:
                role = profile.get('role', 'Unknown')
                name = profile.get('full_name', 'Unknown')
                print(f"     ID {profile['id']}: {name} ({role})")
        
        return True
        
    except Exception as e:
        print(f"❌ Error checking database state: {e}")
        return False

def main():
    """Main function to clear scan history"""
    
    print("🗑️  SCAN HISTORY CLEANER")
    print("=" * 50)
    
    # Initialize Supabase client
    supabase = get_supabase_client()
    
    if not supabase:
        print("❌ Cannot proceed without Supabase connection")
        return False
    
    print("✅ Connected to Supabase successfully")
    
    # Verify current state
    verify_database_state(supabase)
    
    # Clear scan history
    success = clear_scan_history(supabase)
    
    if success:
        print("\n" + "=" * 50)
        print("✅ SCAN HISTORY CLEARED SUCCESSFULLY!")
        print()
        print("🔄 Next steps:")
        print("   1. ✅ Confidence format fixed (95% not 0.95)")
        print("   2. ✅ Database cleaned - fresh start")
        print("   3. 🔄 Test new scan to verify real-time updates")
        print("   4. 🔄 Check dashboard refreshes properly")
        
        # Final verification
        verify_database_state(supabase)
    else:
        print("\n❌ Failed to clear scan history")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
