from transformers import pipeline
sentiment_analysis = pipeline("sentiment-analysis",model="siebert/sentiment-roberta-large-english")

def get_sentiment(data):
    if isinstance(data, list):
        data = [i["content"] for i in data if i["role"]=="user"]
    print(sentiment_analysis(data))
    return sentiment_analysis(data)[0]["label"]