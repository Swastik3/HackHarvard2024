from selenium import webdriver
from selenium.webdriver.common.by import By
import time

# Set up the Selenium WebDriver
driver = webdriver.Chrome()

# Open the URL
url = 'https://www.pleaselive.org/hotlines/'
driver.get(url)

# Wait for the page to load completely
time.sleep(3)  # Adjust if necessary

# Scrape the hotlines section
hotline_pairs = []

# Get all <em> elements
em_elements = driver.find_elements(By.TAG_NAME, "em")

# Check what is in em_elements
print(f"Found {len(em_elements)} <em> elements.")

for em_element in em_elements:
    try:
        # Attempt to find child span elements directly from em_element
        if em_element.find_elements(By.CLASS_NAME, "red-text") and em_element.find_elements(By.CLASS_NAME, "blue-text"):
            red_text_element = em_element.find_element(By.CLASS_NAME, "red-text")
            blue_text_element = em_element.find_element(By.CLASS_NAME, "blue-text")
            hotline_pairs.append((red_text_element.text, blue_text_element.text))
    except Exception as e:
        print(f"An error occurred: {e}")
        continue

# Close the driver
print("Hotline pairs:", hotline_pairs)
print("no. of pairs: ", len(hotline_pairs))
print("Program ending now....")
driver.quit()
