from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration
import requests

class SingaporeImageCaptioner:
    def __init__(self):
        # Load the pretrained BLIP model
        self.processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large")
        self.model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-large")
        
        # Singapore-related keywords to enhance relevance
        self.sg_keywords = [
            "Singapore", "SG", "HDB", "MRT", "LTA", "NEA", "public", "government",
            "housing", "transport", "infrastructure", "estate", "urban", "city",
            "road", "street", "building", "facility", "service", "ministry"
        ]
    
    def generate_caption(self, image_path, text_prompt=None):
        """
        Generate a caption for a Singapore government-related image. Focus on objects, not people.
        
        Args:
            image_path: Path to image file or URL
            text_prompt: Optional prompt to guide caption generation 
                        (e.g., "a photo showing")
        
        Returns:
            Generated caption string
        """
        # Load image
        if image_path.startswith('http'):
            image = Image.open(requests.get(image_path, stream=True).raw).convert('RGB')
        else:
            image = Image.open(image_path).convert('RGB')
        
        # Process image and generate caption
        inputs = self.processor(image, text_prompt, return_tensors="pt") if text_prompt else self.processor(image, return_tensors="pt")
        out = self.model.generate(**inputs, max_new_tokens=50)
        
        caption = self.processor.decode(out[0], skip_special_tokens=True)
        
        # Post-process to make more relevant to Singapore context
        caption = self._enhance_sg_relevance(caption)
        
        return caption
    
    def _enhance_sg_relevance(self, caption):
        """
        Post-process caption to make it more relevant for Singapore context
        """
        # Check if any SG keywords are already present
        has_keywords = any(word.lower() in caption.lower() for word in self.sg_keywords)
        
        if not has_keywords:
            # Add Singapore context if missing
            if "Singapore" not in caption and "SG" not in caption:
                caption = f"In Singapore: {caption}"
        
        return caption


# Example usage
if __name__ == "__main__":
    captioner = SingaporeImageCaptioner()
    
    # Example with local image
    local_image_path = ".."
    caption = captioner.generate_caption(local_image_path)
    print(f"Generated caption: {caption}")
    
    # Example with URL and custom prompt
    # url = "https://example.com/mrt_station.jpg"
    # caption = captioner.generate_caption(url, "a photo of a train station")
    # print(f"Generated caption: {caption}")