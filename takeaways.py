from gemini_beater import flash_inferencer

def get_takeaways(data) -> str:
    prompt = """
    Generate a 3 takeaways from this entire conversation. The takeaways should be concise and capture the main points of the text. There should be 3 takeaways. The takeaways should be separated by commas (,). Do not do more than 1 sentence per takeaway, do not use periods or any other punctuations. The text is as follows:
    {data}

    takeaway:
"""
    response = flash_inferencer(prompt.format(data=data))
    #cleaning the response and remove everything except the whitespace, commas and words
    response = ''.join(e for e in response.text if e.isalnum() or e.isspace() or e == ',')
    takeaways = response.split(',')
    return takeaways