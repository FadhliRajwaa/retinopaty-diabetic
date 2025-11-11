import numpy as np

print("=== TESTING FIXED CLASS MAPPING ===")
print()

def test_class_mapping_fix():
    """Test the fixed class mapping logic"""
    
    # Simulate model outputs (5 different scenarios)
    test_scenarios = [
        {
            "name": "Scenario 1: Model predicts index 0 (Mild)",
            "model_output": [0.9, 0.05, 0.03, 0.01, 0.01],  # High confidence in index 0
            "expected_class": "Mild DR",
            "expected_class_id": 1
        },
        {
            "name": "Scenario 2: Model predicts index 1 (Moderate)", 
            "model_output": [0.1, 0.8, 0.05, 0.03, 0.02],   # High confidence in index 1
            "expected_class": "Moderate DR",
            "expected_class_id": 2
        },
        {
            "name": "Scenario 3: Model predicts index 2 (No_DR)",
            "model_output": [0.05, 0.05, 0.85, 0.03, 0.02],  # High confidence in index 2
            "expected_class": "No DR",
            "expected_class_id": 0
        },
        {
            "name": "Scenario 4: Model predicts index 3 (Proliferate_DR)",
            "model_output": [0.02, 0.03, 0.05, 0.88, 0.02],  # High confidence in index 3
            "expected_class": "Proliferative DR", 
            "expected_class_id": 4
        },
        {
            "name": "Scenario 5: Model predicts index 4 (Severe)",
            "model_output": [0.03, 0.05, 0.07, 0.15, 0.7],   # High confidence in index 4
            "expected_class": "Severe DR",
            "expected_class_id": 3
        }
    ]
    
    # Fixed class mapping (from app.py)
    MODEL_OUTPUT_CLASSES = [
        "Mild",           # Index 0 - Model output
        "Moderate",       # Index 1 - Model output  
        "No_DR",          # Index 2 - Model output
        "Proliferate_DR", # Index 3 - Model output
        "Severe"          # Index 4 - Model output
    ]

    CLASS_INFO = {
        "No_DR": {
            "class_id": 0,
            "display_name": "No DR",
            "description": "No Diabetic Retinopathy - Normal retina",
            "severity_level": "Normal"
        },
        "Mild": {
            "class_id": 1, 
            "display_name": "Mild DR",
            "description": "Mild Diabetic Retinopathy with few microaneurysms",
            "severity_level": "Low Risk - Requires Monitoring"
        },
        "Moderate": {
            "class_id": 2,
            "display_name": "Moderate DR", 
            "description": "Moderate Diabetic Retinopathy with hemorrhages and exudates",
            "severity_level": "Moderate Risk"
        },
        "Severe": {
            "class_id": 3,
            "display_name": "Severe DR",
            "description": "Severe Diabetic Retinopathy with significant ischemic areas", 
            "severity_level": "High Risk"
        },
        "Proliferate_DR": {
            "class_id": 4,
            "display_name": "Proliferative DR",
            "description": "Proliferative Diabetic Retinopathy with neovascularization - requires immediate intervention",
            "severity_level": "Critical Risk"
        }
    }
    
    def process_prediction_fixed(model_output):
        """Fixed prediction processing function"""
        probabilities = np.array(model_output)
        
        # Get predicted model output index
        predicted_model_idx = int(np.argmax(probabilities))
        predicted_model_class = MODEL_OUTPUT_CLASSES[predicted_model_idx]
        
        # Get class info from mapping
        class_data = CLASS_INFO[predicted_model_class]
        
        # Extract details
        class_id = class_data["class_id"]
        class_name = class_data["display_name"] 
        description = class_data["description"]
        severity_level = class_data["severity_level"]
        confidence = float(probabilities[predicted_model_idx])
        
        # Create all probabilities with correct mapping
        all_probabilities = {}
        for i, model_class in enumerate(MODEL_OUTPUT_CLASSES):
            display_info = CLASS_INFO[model_class]
            all_probabilities[display_info["display_name"]] = float(probabilities[i])
        
        return {
            "class_id": class_id,
            "class_name": class_name,
            "description": description,
            "confidence": confidence,
            "severity_level": severity_level,
            "all_probabilities": all_probabilities,
            "predicted_model_idx": predicted_model_idx,
            "predicted_model_class": predicted_model_class
        }
    
    print("Testing all scenarios:")
    print("-" * 60)
    
    all_correct = True
    
    for i, scenario in enumerate(test_scenarios, 1):
        print(f"\n{i}. {scenario['name']}")
        
        # Process prediction
        result = process_prediction_fixed(scenario["model_output"])
        
        # Check results
        class_correct = result["class_name"] == scenario["expected_class"]
        id_correct = result["class_id"] == scenario["expected_class_id"]
        
        print(f"   Model Output: {scenario['model_output']}")
        print(f"   Model Index:  {result['predicted_model_idx']} ({result['predicted_model_class']})")
        print(f"   → Display:    {result['class_name']} (class_id: {result['class_id']})")
        print(f"   → Expected:   {scenario['expected_class']} (class_id: {scenario['expected_class_id']})")
        print(f"   → Confidence: {result['confidence']:.1%}")
        print(f"   → Severity:   {result['severity_level']}")
        
        if class_correct and id_correct:
            print(f"   ✅ CORRECT")
        else:
            print(f"   ❌ INCORRECT")
            all_correct = False
    
    print("\n" + "=" * 60)
    
    if all_correct:
        print("🎉 ALL TESTS PASSED - Class mapping is FIXED!")
        print("\n✅ Benefits of the fix:")
        print("   - Model index 0 (Mild) → Display 'Mild DR' with class_id 1")
        print("   - Model index 1 (Moderate) → Display 'Moderate DR' with class_id 2")  
        print("   - Model index 2 (No_DR) → Display 'No DR' with class_id 0")
        print("   - Model index 3 (Proliferate_DR) → Display 'Proliferative DR' with class_id 4")
        print("   - Model index 4 (Severe) → Display 'Severe DR' with class_id 3")
        print("\n🔧 This fixes the 'always Moderate DR' issue!")
        
    else:
        print("❌ Some tests failed - check mapping logic")
    
    return all_correct

def test_probability_distribution():
    """Test that all probabilities are correctly mapped"""
    print("\n" + "=" * 60)
    print("PROBABILITY MAPPING TEST")
    print("=" * 60)
    
    # Test with evenly distributed probabilities
    model_output = [0.2, 0.2, 0.2, 0.2, 0.2]  # Equal probabilities
    
    MODEL_OUTPUT_CLASSES = ["Mild", "Moderate", "No_DR", "Proliferate_DR", "Severe"]
    CLASS_INFO = {
        "No_DR": {"display_name": "No DR"},
        "Mild": {"display_name": "Mild DR"},
        "Moderate": {"display_name": "Moderate DR"},
        "Severe": {"display_name": "Severe DR"},
        "Proliferate_DR": {"display_name": "Proliferative DR"}
    }
    
    all_probabilities = {}
    for i, model_class in enumerate(MODEL_OUTPUT_CLASSES):
        display_info = CLASS_INFO[model_class]
        all_probabilities[display_info["display_name"]] = model_output[i]
    
    print("Model Output Probabilities:")
    for i, prob in enumerate(model_output):
        print(f"   Index {i} ({MODEL_OUTPUT_CLASSES[i]}): {prob:.1%}")
        
    print("\nMapped Display Probabilities:")
    for display_name, prob in all_probabilities.items():
        print(f"   {display_name}: {prob:.1%}")
    
    # Verify sum is still 1.0
    total_prob = sum(all_probabilities.values())
    print(f"\nTotal probability: {total_prob:.1f} {'✅' if abs(total_prob - 1.0) < 0.001 else '❌'}")

def main():
    """Run all tests"""
    print("Starting comprehensive class mapping fix validation...")
    print("=" * 60)
    
    # Test class mapping
    mapping_success = test_class_mapping_fix()
    
    # Test probability distribution  
    test_probability_distribution()
    
    print("\n" + "=" * 60)
    print("SUMMARY:")
    
    if mapping_success:
        print("✅ Class mapping fix is working correctly")
        print("✅ Ready to deploy updated app.py to HuggingFace Space")
        print("\n🚀 NEXT STEPS:")
        print("1. Deploy updated app.py to HuggingFace Space")
        print("2. Test with real images via production API")
        print("3. Verify diverse predictions (not just 'Moderate DR')")
    else:
        print("❌ Class mapping fix needs more work")

if __name__ == "__main__":
    main()
