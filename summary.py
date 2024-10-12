from gemini_beater import flash_inferencer


def get_summary(data) -> str:
    prompt = """
    Generate a summary of the following text. The summary should be concise and capture the main points of the text. The summary is of the user's conversation with a bot and we want to highlight the summary back to the user. The text is as follows:
    {data}

    summarise:
"""
    response = flash_inferencer(prompt.format(data=data))
    return response