# 🤗 Backend - Hugging Face Spaces Deployment

## 📁 Files in This Folder

```
backend/
├── app.py              ← Main backend application
├── requirements.txt    ← Python dependencies
│
└── server/             ← Data folder (you need to add this)
    ├── products.json   ← Your product database
    └── assets/
        └── product/    ← Your product images
            ├── product_1.jpg
            ├── product_2.jpg
            └── ...
```

---

## 🚀 Deploy to Hugging Face Spaces

### **Step 1: Create HF Account**

1. Go to https://huggingface.co/join
2. Sign up (FREE, no credit card needed)
3. Verify your email

### **Step 2: Create New Space**

1. Click your profile → "New Space"
2. **Owner:** Your username
3. **Space name:** `visual-product-matcher`
4. **License:** MIT
5. **SDK:** Gradio
6. **Hardware:** CPU basic (FREE)
7. Click "Create Space"

### **Step 3: Upload Files**

#### **Method A: Web Upload (Easiest)**

1. Go to your Space page
2. Click "Files" tab
3. Upload these files:
   - `app.py` (from this folder)
   - `requirements.txt` (from this folder)
4. Create folder structure:
   - Click "Add file" → "Create file"
   - Path: `server/products.json`
   - Paste your products.json content
   - Commit
5. Upload images:
   - Click "Add file" → "Upload files"
   - Select path: `server/assets/product/`
   - Upload all your product images
   - Commit

#### **Method B: Git Upload (Advanced)**

```bash
# Clone your space
git clone https://huggingface.co/spaces/YOUR_USERNAME/visual-product-matcher
cd visual-product-matcher

# Copy files
cp app.py .
cp requirements.txt .
mkdir -p server/assets/product
cp /path/to/your/products.json server/
cp /path/to/your/images/* server/assets/product/

# Push
git add .
git commit -m "Initial deployment"
git push
```

### **Step 4: Wait for Build**

1. HF automatically builds your app
2. First build: 3-5 minutes
3. Watch logs in "App" tab
4. Status changes to "Running" when ready

### **Step 5: Get Your URLs**

Your backend will be available at:

**Gradio UI:**
```
https://huggingface.co/spaces/YOUR_USERNAME/visual-product-matcher
```

**API Endpoint:**
```
https://YOUR_USERNAME-visual-product-matcher.hf.space
```

**API Routes:**
- Health: `GET /api/health`
- Search: `POST /api/match`

---

## 🧪 Test Your Backend

### **1. Health Check**

```bash
curl https://YOUR_USERNAME-visual-product-matcher.hf.space/api/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "Visual Product Matcher",
  "model": "sentence-transformers/clip-ViT-B-32",
  "products_loaded": 100
}
```

### **2. Test Image Search**

```bash
curl -X POST https://YOUR_USERNAME-visual-product-matcher.hf.space/api/match \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://images.unsplash.com/photo-1523275335684-37898b6baf30"
  }'
```

### **3. Test in Browser**

Open: `https://YOUR_USERNAME-visual-product-matcher.hf.space`

You should see a Gradio interface where you can:
- Upload images
- Get similar product recommendations
- Test the AI model

---

## 📝 Important Notes

### **File Structure on HF Spaces**

Your Space must have this exact structure:

```
/ (root of Space)
├── app.py
├── requirements.txt
└── server/
    ├── products.json
    └── assets/
        └── product/
            └── *.jpg
```

### **Common Issues**

**Build fails:**
- Check all files are uploaded
- Verify products.json is valid JSON
- Check requirements.txt format

**Images not loading:**
- Verify images are in `server/assets/product/`
- Check image filenames match products.json
- Test direct URL: `https://YOUR_SPACE.hf.space/file/server/assets/product/product_1.jpg`

**API not responding:**
- Wait for build to complete
- Check Space status is "Running"
- Verify no errors in logs

---

## 🔧 Configuration

### **Environment Variables (Optional)**

HF Spaces doesn't require env vars for this app. Everything is auto-configured.

### **Hardware Upgrade (Optional)**

If you need faster performance:
1. Go to Space Settings
2. Hardware → Upgrade to "CPU upgrade" or "GPU"
3. HF offers free upgrades for popular spaces!

---

## 📊 What Gets Deployed

- **app.py:** 8 KB
- **requirements.txt:** 200 bytes
- **products.json:** ~600 KB
- **Product images:** ~2-3 MB
- **Installed packages:** ~2 GB (on HF servers)

Total deployment: ~3.5 MB

---

## 🎯 Next Steps

After backend is deployed:

1. Copy your API URL
2. Update frontend `.env` file
3. Deploy frontend to Vercel
4. Test the complete system

---

## 📞 Support

**Hugging Face:**
- Docs: https://huggingface.co/docs/hub/spaces
- Discord: https://discuss.huggingface.co/
- Issues: Check Space logs in "App" tab

---

**✅ Your backend is ready for deployment!**