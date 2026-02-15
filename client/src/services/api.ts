import { Product } from "../types";

// Hugging Face Spaces API URL
// Replace YOUR_USERNAME with your actual HF username
const API_URL = "https://coder1208-visual-product-matcher.hf.space";

/**
 * Search for similar products using image
 * @param imageData - Base64 image data or URL
 * @param isUrl - Whether imageData is a URL (true) or base64 (false)
 * @returns Array of similar products
 */
export const searchProducts = async (
  imageData: string,
  isUrl: boolean = false
): Promise<Product[]> => {
  try {
    const payload: any = {};

    if (isUrl) {
      payload.imageUrl = imageData;
    } else {
      payload.image = imageData;
    }

    console.log("🔍 Searching products via HF Spaces API...");
    console.log("📡 API URL:", `${API_URL}/api/match`);

    const response = await fetch(`${API_URL}/api/match`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`✅ Found ${data.length} similar products`);
    
    // Transform image URLs to full HF Spaces URLs
    const transformedData = data.map((product: any) => ({
      ...product,
      // Convert relative HF paths to full URLs
      image: product.image.startsWith("http") 
        ? product.image 
        : `${API_URL}${product.image}`
    }));
    
    return transformedData;
    
  } catch (error) {
    console.error("❌ Search error:", error);
    
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Cannot connect to Hugging Face Spaces backend. Please check if the Space is running."
      );
    }
    throw error;
  }
};

/**
 * Health check to verify backend is running
 * @returns true if backend is healthy
 */
export const healthCheck = async (): Promise<boolean> => {
  try {
    console.log("🏥 Checking backend health...");
    const response = await fetch(`${API_URL}/api/health`, {
      method: "GET",
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Backend is healthy:", data);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("❌ Health check failed:", error);
    return false;
  }
};

/**
 * Get backend info (optional - for debugging)
 */
export const getBackendInfo = async () => {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    const data = await response.json();
    return data;
  } catch {
    return null;
  }
};
