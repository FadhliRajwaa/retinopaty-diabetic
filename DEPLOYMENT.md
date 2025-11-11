# 🚀 Deployment Guide - RetinaAI 5-Class DR Detection

## Environment Variables Required

### For Local Development (.env.local)
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ondofyitpogbzsklpalo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# HuggingFace Space Configuration
HF_SPACE_URL=https://fadhlirajwaa-diabeticretinopathy.hf.space

# App Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### For Production Deployment (Vercel)

**CRITICAL**: Update these environment variables in Vercel Dashboard:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables

2. Add/Update these variables:

```bash
# Supabase (Same as local)
NEXT_PUBLIC_SUPABASE_URL=https://ondofyitpogbzsklpalo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# HuggingFace Space - UPDATED URL ⚠️
HF_SPACE_URL=https://fadhlirajwaa-diabeticretinopathy.hf.space

# Production Settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://detection-retina-ai.vercel.app
NEXT_PUBLIC_VERCEL_URL=https://detection-retina-ai.vercel.app
```

## 🔄 Deployment Steps

### 1. Local Testing
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Test API endpoint
curl -X POST http://localhost:3000/api/ai/dr/predict \
  -F "image=@path/to/retina_image.jpg"
```

### 2. Vercel Deployment
```bash
# Deploy to Vercel
npx vercel

# Or push to GitHub (auto-deploy)
git add .
git commit -m "feat: update HuggingFace Space URL for 5-class detection"
git push origin main
```

### 3. Post-Deployment Verification
1. **Test HuggingFace Space**: https://fadhlirajwaa-diabeticretinopathy.hf.space/
2. **Test Production API**: `https://your-app.vercel.app/api/ai/dr/predict`
3. **Test Frontend Upload**: Upload retina image and verify 5-class prediction

## 🧪 Testing Endpoints

### HuggingFace Space Direct
```bash
curl https://fadhlirajwaa-diabeticretinopathy.hf.space/
# Expected: {"model": "DenseNet201", "classes": 5, "status": "ready"}
```

### Production API
```bash
curl -X POST https://detection-retina-ai.vercel.app/api/ai/dr/predict \
  -F "image=@retina_sample.jpg"
# Expected: {"ok": true, "result": {"predicted_class": "...", "class_id": 0-4, ...}}
```

## ⚠️ Common Issues & Solutions

### 1. "FastAPI returned error"
- **Cause**: Wrong HF_SPACE_URL in environment variables
- **Solution**: Ensure URL is `https://fadhlirajwaa-diabeticretinopathy.hf.space`

### 2. "Timeout" errors
- **Cause**: HuggingFace Space cold start or network issues
- **Solution**: Retry mechanism built-in, spaces auto-wake after first request

### 3. "Cannot connect to AI service"
- **Cause**: HuggingFace Space not accessible or wrong URL
- **Solution**: Check Space status and verify URL spelling

### 4. Environment variables not loading
- **Cause**: Vercel deployment didn't update env vars
- **Solution**: 
  1. Update in Vercel Dashboard
  2. Redeploy: `npx vercel --prod`

## 🎯 Multi-Environment Features

This deployment supports both local development and production with:

- ✅ Environment-specific timeout settings
- ✅ Automatic retry mechanism for network failures  
- ✅ Comprehensive error handling with user-friendly messages
- ✅ Development vs production error verbosity
- ✅ Multi-environment URL configuration
- ✅ Robust image processing pipeline

## 📊 Expected Response Format

The API returns 5-class diabetic retinopathy predictions:

```json
{
  "ok": true,
  "result": {
    "predicted_class": "Mild DR",
    "class_id": 1,
    "confidence": 87.3,
    "description": "Mild Diabetic Retinopathy with few microaneurysms",
    "severity_level": "Low Risk - Requires Monitoring",
    "probabilities": {
      "No DR": 0.078,
      "Mild DR": 0.873,
      "Moderate DR": 0.042,
      "Severe DR": 0.005,
      "Proliferative DR": 0.002
    },
    "model_info": {
      "name": "DenseNet201",
      "version": "2.0.0",
      "total_classes": 5
    }
  }
}
```
