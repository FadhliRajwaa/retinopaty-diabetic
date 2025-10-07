#!/usr/bin/env python3
import os
import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import glob

# Configuration
MODEL_FILE = "RetinaAI/DenseNet121_final.h5"
IMG_SIZE = (224, 224)
CLASSES = ["NO_DR", "DR"]

print("=" * 50)
print("DIABETIC RETINOPATHY MODEL ANALYSIS")
print("=" * 50)

def prepare_image(img_path, target_size=(224, 224)):
    """Prepare image same as in app.py"""
    img = Image.open(img_path)
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    img = img.resize(target_size)
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0  # Same normalization as app.py
    
    return img_array

def analyze_model():
    """Analyze model structure and predictions"""
    try:
        # Load model
        print(f"Loading model: {MODEL_FILE}")
        model = load_model(MODEL_FILE, compile=False)
        print(f"✅ Model loaded successfully!")
        
        # Model info
        print(f"\n📊 MODEL INFO:")
        print(f"Input shape: {model.input_shape}")
        print(f"Output shape: {model.output_shape}")
        print(f"Classes: {CLASSES}")
        
        # Test with sample images
        test_cases = [
            ("DR samples", "diabetic_retinopathy_data/organized/DR", 3),
            ("NO_DR samples", "diabetic_retinopathy_data/organized/No_DR", 3)
        ]
        
        for category, folder_path, num_samples in test_cases:
            print(f"\n🔍 TESTING {category}:")
            print("-" * 30)
            
            # Get sample images
            image_files = glob.glob(os.path.join(folder_path, "*.jpg"))[:num_samples]
            if not image_files:
                image_files = glob.glob(os.path.join(folder_path, "*.jpeg"))[:num_samples]
            if not image_files:
                image_files = glob.glob(os.path.join(folder_path, "*.png"))[:num_samples]
            
            for img_path in image_files:
                try:
                    filename = os.path.basename(img_path)
                    print(f"\n📸 Testing: {filename}")
                    
                    # Prepare image
                    img_array = prepare_image(img_path)
                    print(f"   Image shape: {img_array.shape}")
                    print(f"   Pixel range: [{img_array.min():.3f}, {img_array.max():.3f}]")
                    
                    # Predict
                    preds = model.predict(img_array, verbose=0)
                    print(f"   Raw prediction: {preds}")
                    print(f"   Prediction shape: {preds.shape}")
                    
                    # Interpret prediction
                    if preds.shape[-1] == 1:
                        # Sigmoid output
                        p = float(preds[0][0])
                        predicted_is_dr = p >= 0.5
                        predicted_class = CLASSES[1] if predicted_is_dr else CLASSES[0]
                        confidence = (p if predicted_is_dr else (1 - p)) * 100
                        
                        print(f"   📊 SIGMOID ANALYSIS:")
                        print(f"      Raw sigmoid: {p:.6f}")
                        print(f"      Threshold: 0.5")
                        print(f"      Is DR? {predicted_is_dr}")
                        print(f"      Predicted: {predicted_class}")
                        print(f"      Confidence: {confidence:.2f}%")
                        print(f"      Probabilities: NO_DR={((1-p)*100):.2f}%, DR={p*100:.2f}%")
                        
                        # Check if prediction matches expected
                        expected = "DR" if "DR" in folder_path else "NO_DR"
                        is_correct = predicted_class == expected
                        print(f"      Expected: {expected}")
                        print(f"      ✅ CORRECT" if is_correct else f"      ❌ WRONG!")
                        
                    else:
                        # Softmax output
                        class_idx = np.argmax(preds[0])
                        predicted_class = CLASSES[class_idx]
                        confidence = float(np.max(preds[0])) * 100
                        
                        print(f"   📊 SOFTMAX ANALYSIS:")
                        print(f"      Class index: {class_idx}")
                        print(f"      Predicted: {predicted_class}")
                        print(f"      Confidence: {confidence:.2f}%")
                        print(f"      All probabilities: {preds[0]}")
                        
                except Exception as e:
                    print(f"   ❌ Error testing {filename}: {e}")
        
        # Summary
        print(f"\n📋 ANALYSIS COMPLETE")
        print(f"If predictions are consistently wrong, the issue might be:")
        print(f"1. Class mapping (CLASSES array)")
        print(f"2. Threshold direction (>= vs <=)")
        print(f"3. Model training labels")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    analyze_model()
