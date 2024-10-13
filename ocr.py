import fitz  # PyMuPDF
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import words
import os
import shutil
from PIL import Image
import base64
import io
import time
import string
import google.generativeai as genai

nltk.download('words')
nltk.download('punkt_tab')
nltk.download('punkt')
def extract_pdf_content(file_path, image_output_dir):
    # Open the PDF file
    pdf_document = fitz.open(file_path)

    # Initialize variables to store text and image information
    text_content = ""
    image_count = 0

    # Ensure the output directory exists
    if os.path.exists(image_output_dir):
        # Delete the contents of the directory
        for filename in os.listdir(image_output_dir):
            file_path = os.path.join(image_output_dir, filename)
            if os.path.isfile(file_path):
                os.remove(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)

    os.makedirs(image_output_dir, exist_ok=True)

    # Iterate through all pages
    for page_num in range(len(pdf_document)):
        page = pdf_document[page_num]

        # Extract text
        page_text = page.get_text()
        cleaned_page_text = clean_text(page_text)
        text_content += cleaned_page_text + "\n\n"
        print(text_content)
        print("Content extracted from page ", page_num + 1, ": \n", cleaned_page_text)

        # Extract images
        image_list = page.get_images(full=True)
        for img_index, img in enumerate(image_list):
            xref = img[0]
            base_image = pdf_document.extract_image(xref)
            image_bytes = base_image["image"]

            # Save the image
            image = Image.open(io.BytesIO(image_bytes))
            image_count += 1
            image_filename = f"image_{page_num + 1}_{img_index + 1}.png"
            image_path = os.path.join(image_output_dir, image_filename)
            image.save(image_path)

    pdf_document.close()

    return text_content, image_count


def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')


def clean_text(text):
    # Tokenize the text
    tokens = word_tokenize(text)

    # Load English words
    english_words = set(words.words())

    # Remove punctuation
    tokens = [token.lower() for token in tokens if token not in string.punctuation]

    # Filter out non-words and very short words
    cleaned_tokens = [token for token in tokens if token in english_words and len(token) > 1]

    # Join the cleaned tokens back into a string
    cleaned_text = ' '.join(cleaned_tokens)

    return cleaned_text


def perform_ocr_with_gemini(image_path):
    # Encode the image
    print("OCR starting")
    ocr_start_time = time.time()
    base64_image = encode_image(image_path)
    # Set up the model
    model = genai.GenerativeModel('gemini-1.5-flash')

    # Create the contents list with the image and prompt
    contents = [
        {
            "parts": [
                {
                    "text": "Perform OCR on this image and extract all visible text as MARKDOWN. Return only the extracted text without any additional commentary or explanation. Please DONT output LaTeX"},
                {"inline_data": {"mime_type": "image/jpeg", "data": base64_image}}
            ]
        }
    ]
    # Generate content
    response = model.generate_content(contents)
    print("OCR done. Time taken: ", time.time() - ocr_start_time)
    return response.text


def process_images_with_ocr(image_dir):
    ocr_results = ""
    for filename in os.listdir(image_dir):
        if filename.endswith(('.png', '.jpg', '.jpeg')):
            image_path = os.path.join(image_dir, filename)
            ocr_text = perform_ocr_with_gemini(image_path)
            ocr_results += ocr_text + "\n"
    return ocr_results