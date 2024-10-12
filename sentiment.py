from transformers import pipeline
sentiment_analysis = pipeline("sentiment-analysis",model="siebert/sentiment-roberta-large-english")

def get_sentiment(data):
    return sentiment_analysis(data)[0]["label"]