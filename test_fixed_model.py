#!/usr/bin/env python3
import os
import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import glob

# Configuration - FIXED VERSION
MODEL_FILE = "RetinaAI/DenseNet121_final.h5"
IMG_SIZE = (224, 224)
CLASSES = ["NO_DR", "DR"]

print("=" * 50)
print("TESTING FIXED MODEL LOGIC")
print("=" * 50)

def prepare_image(img_path, target_size=(224, 224)):
    """Prepare image same as in app.py"""
    img = Image.open(img_path)
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    img = img.resize(target_size)
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0
    
    return img_array

def test_fixed_logic():
    """Test with corrected logic"""
    try:
        model = load_model(MODEL_FILE, compile=False)
        print(f"✅ Model loaded successfully!")
        
        test_cases = [
            ("DR samples", "diabetic_retinopathy_data/organized/DR", 3),
            ("NO_DR samples", "diabetic_retinopathy_data/organized/No_DR", 3)
        ]
        
        correct_predictions = 0
        total_predictions = 0
        
        for category, folder_path, num_samples in test_cases:
            print(f"\n🔍 TESTING {category} WITH FIXED LOGIC:")
            print("-" * 40)
            
            image_files = glob.glob(os.path.join(folder_path, "*.jpg"))[:num_samples]
            
            for img_path in image_files:
                filename = os.path.basename(img_path)
                print(f"\n📸 {filename}")
                
                img_array = prepare_image(img_path)
                preds = model.predict(img_array, verbose=0)
                
                # FIXED LOGIC - INVERTED THRESHOLD
                p = float(preds[0][0])
                predicted_is_dr = p < 0.5  # INVERTED!
                predicted_class = CLASSES[1] if predicted_is_dr else CLASSES[0]
                confidence = ((1 - p) if predicted_is_dr else p) * 100
                
                print(f"   Raw sigmoid: {p:.6f}")
                print(f"   Logic: p < 0.5 = DR? {predicted_is_dr}")
                print(f"   Predicted: {predicted_class} ({confidence:.2f}%)")
                
                # Check correctness
                expected = "DR" if "DR" in folder_path else "NO_DR"
                is_correct = predicted_class == expected
                print(f"   Expected: {expected}")
                print(f"   {'✅ CORRECT!' if is_correct else '❌ WRONG!'}")
                
                if is_correct:
                    correct_predictions += 1
                total_predictions += 1
        
        accuracy = (correct_predictions / total_predictions) * 100
        print(f"\n📊 ACCURACY: {correct_predictions}/{total_predictions} = {accuracy:.1f}%")
        
        if accuracy > 80:
            print("🎉 FIX SUCCESSFUL! Model logic is now correct!")
        else:
            print("⚠️  Still issues - may need different approach")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_fixed_logic()
