from gemini_beater import flash_inference

def get_mood(data, sentiment) -> str:
    prompt = """
    Predict the mood of the following text given the sentiment and the text. Output only one word that describes the mood of the text. The text is as follows:
    {data}

    sentiment: {sentiment}
    """

    response = flash_inference(prompt.format(data=data, sentiment=sentiment))
    response = response.replace('\n','').strip()
    return response