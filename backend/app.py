"""
Visual Product Matcher - Hugging Face Spaces Backend
AI-powered product similarity search using CLIP model
"""

import gradio as gr
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
from PIL import Image
import requests
import json
import numpy as np
import io
import base64
import os
import threading
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app for API endpoints
flask_app = Flask(__name__)

# Load model
print("🔄 Loading CLIP model...")
model = SentenceTransformer("sentence-transformers/clip-ViT-B-32")
print("✅ Model loaded successfully!")

# Load products database
print("📂 Loading products database...")
with open("server/products.json", "r", encoding="utf-8") as f:
    products = json.load(f)
print(f"✅ Loaded {len(products)} products")

# Configuration
IMAGE_FOLDER = "server/assets/product"

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def cosine_similarity(a, b):
    """Calculate cosine similarity between two vectors"""
    a = np.array(a)
    b = np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def load_image_from_base64(data_string):
    """Load image from base64 string"""
    try:
        if "," in data_string:
            image_bytes = base64.b64decode(data_string.split(",")[-1])
        else:
            image_bytes = base64.b64decode(data_string)
        return Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        raise ValueError(f"Failed to decode base64 image: {str(e)}")


def load_image_from_url(url):
    """Load image from URL"""
    if url.startswith("data:image"):
        return load_image_from_base64(url)
    
    headers = {'User-Agent': 'Mozilla/5.0'}
    response = requests.get(url, timeout=15, headers=headers)
    response.raise_for_status()
    return Image.open(io.BytesIO(response.content)).convert("RGB")


def search_similar_products(image, top_k=20):
    """
    Core search function - finds similar products
    Returns list of products sorted by similarity
    """
    query_embedding = model.encode(image)
    
    results = []
    for product in products:
        if "embedding" not in product:
            continue
        
        score = cosine_similarity(query_embedding, product["embedding"])
        
        # Use relative path for HF Spaces
        image_url = f"/file={IMAGE_FOLDER}/{product['image']}"
        
        results.append({
            "id": product.get("id", ""),
            "name": product["name"],
            "price": product["price"],
            "category": product.get("category", ""),
            "description": product.get("description", ""),
            "image": image_url,
            "similarity": score
        })
    
    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results[:top_k]


# ============================================================================
# FLASK API ENDPOINTS (for Vercel integration)
# ============================================================================

@flask_app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "service": "Visual Product Matcher",
        "model": "sentence-transformers/clip-ViT-B-32",
        "products_loaded": len(products)
    })


@flask_app.route("/api/match", methods=["POST", "OPTIONS"])
def match_products():
    """
    Main API endpoint for product matching
    Accepts: {"image": "base64_data"} or {"imageUrl": "http://..."}
    Returns: List of matching products
    """
    # Handle CORS preflight
    if request.method == "OPTIONS":
        response = jsonify({"status": "ok"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        return response
    
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        image_data = data.get("image")
        image_url = data.get("imageUrl")
        
        if not image_data and not image_url:
            return jsonify({"error": "No image provided"}), 400
        
        # Load image
        if image_data:
            image = load_image_from_base64(image_data)
        else:
            image = load_image_from_url(image_url)
        
        # Search for similar products
        results = search_similar_products(image, top_k=20)
        
        # Add CORS headers
        response = jsonify(results)
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        
        return response
        
    except Exception as e:
        logger.error(f"Error in match_products: {str(e)}")
        error_response = jsonify({"error": str(e)})
        error_response.headers.add("Access-Control-Allow-Origin", "*")
        return error_response, 400


# ============================================================================
# GRADIO UI (for web interface)
# ============================================================================

def gradio_search(image):
    """Gradio interface function"""
    if image is None:
        return "⚠️ Please upload an image", []
    
    try:
        results = search_similar_products(image, top_k=6)
        
        # Format text output
        output_lines = ["# 🔍 Search Results\n"]
        
        for i, product in enumerate(results, 1):
            output_lines.append(f"### {i}. {product['name']}")
            output_lines.append(f"**Price:** ${product['price']}")
            output_lines.append(f"**Similarity:** {product['similarity']:.1%}")
            output_lines.append(f"**Category:** {product['category']}")
            if product['description']:
                output_lines.append(f"*{product['description']}*")
            output_lines.append("---")
        
        text_output = "\n".join(output_lines)
        
        # Get images for gallery
        image_paths = []
        for product in results:
            img_path = f"{IMAGE_FOLDER}/{product['image'].split('/')[-1]}"
            if os.path.exists(img_path):
                image_paths.append(img_path)
        
        return text_output, image_paths
        
    except Exception as e:
        logger.error(f"Error in gradio_search: {str(e)}")
        return f"❌ Error: {str(e)}", []


# Create Gradio interface (moved theme and css to launch method for Gradio 6.0)
with gr.Blocks(title="🔍 Visual Product Matcher") as gradio_interface:
    
    gr.Markdown(
        """
        # 🔍 Visual Product Matcher
        
        Upload a product image to find similar items!
        
        **Features:**
        - 🤖 AI-powered similarity search using CLIP
        - 📸 Upload images or use camera
        - ⚡ Instant results
        
        ---
        """
    )
    
    with gr.Row():
        with gr.Column(scale=1):
            image_input = gr.Image(
                type="pil",
                label="📸 Upload Product Image",
                sources=["upload", "webcam", "clipboard"]
            )
            
            search_btn = gr.Button(
                "🔍 Search Similar Products",
                variant="primary",
                size="lg"
            )
            
            gr.Markdown(
                """
                ### 💡 Tips:
                - Upload clear product images
                - Works best with centered products
                - Supported: JPG, PNG, WebP
                """
            )
        
        with gr.Column(scale=1):
            text_output = gr.Markdown(label="Results")
    
    with gr.Row():
        gallery = gr.Gallery(
            label="🎨 Similar Products",
            columns=3,
            rows=2,
            height="auto",
            object_fit="contain"
        )
    
    search_btn.click(
        fn=gradio_search,
        inputs=[image_input],
        outputs=[text_output, gallery]
    )
    
    # Example images
    example_images = []
    for i in [1, 2, 10]:
        img_path = f"{IMAGE_FOLDER}/product_{i}.jpg"
        if os.path.exists(img_path):
            example_images.append([img_path])
    
    if example_images:
        gr.Markdown("---\n### 📌 Try These Examples:")
        gr.Examples(examples=example_images, inputs=image_input)
    
    gr.Markdown(
        """
        ---
        
        ### 📌 API Access
        
        **Endpoint:** `POST /api/match`
        
        **Request:**
        ```json
        {
          "image": "base64_image_data",
          "imageUrl": "https://example.com/image.jpg"
        }
        ```
        
        **Response:** Array of similar products with similarity scores
        
        ---
        
        Built with ❤️ using Sentence Transformers CLIP
        """
    )


# ============================================================================
# LAUNCH APP
# ============================================================================

def run_flask():
    """Run Flask API in background thread on port 5000"""
    try:
        flask_app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)
    except Exception as e:
        logger.error(f"Flask error: {str(e)}")


if __name__ == "__main__":
    # Start Flask API in background on port 5000
    flask_thread = threading.Thread(target=run_flask, daemon=True)
    flask_thread.start()
    
    print("\n" + "="*60)
    print("🚀 Visual Product Matcher Started!")
    print("="*60)
    print(f"📊 Products loaded: {len(products)}")
    print(f"🤖 Model: sentence-transformers/clip-ViT-B-32")
    print("="*60)
    print("\n🌐 Gradio UI: Will be available at Space URL")
    print("🔌 Flask API Endpoints (port 5000):")
    print("   - GET  http://localhost:5000/api/health")
    print("   - POST http://localhost:5000/api/match")
    print("="*60 + "\n")
    
    gradio_interface.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        theme=gr.themes.Soft(),
        css=".gradio-container {max-width: 1200px; margin: auto;}"
    )