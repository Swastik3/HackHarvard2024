
from dotenv import load_dotenv
import os
from pydantic import BaseModel
import instructor
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from openai import OpenAI
from langchain_openai.embeddings import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone
load_dotenv()
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

client = OpenAI()
messages=[
            {
                'role': 'system',
                'content': """"You are a mental health professional and your job is to help the user with their query and if required recommend them to talk with 
                people who have similar experiences based on the information provided to you.

                **Guidelines:**
                Talk to them like a friend and provide them with the best possible advice while being a supportive listener.
                Only recommend people if you think it is necessary and if you think it will help the user.
                You can always ask for more information if required.
                Respond in the format provided to you"""
            }
]


PINECONE_API_KEY=os.getenv("PINECONE_API_KEY")
pc=Pinecone(api_key=PINECONE_API_KEY)
index=pc.Index("people")
embeddings = OpenAIEmbeddings( model="text-embedding-3-small")
vectorstore=PineconeVectorStore(index, embeddings)


class Person(BaseModel):
    name:str
    age:str
    issue:str
    story:str

class Output(BaseModel):
    response:str
    people: list[Person]


def answer(query):  
    print(messages)
    context=vectorstore.similarity_search(query, k=3)
    formatted_user_query = f"""
        This is the Query:\n
        {query}
        
        These are the people that you may recommend to the user:\n
        {context}
    """
    messages.append(
            {
                'role': 'user',
                'content': query
            })
    response = client.beta.chat.completions.parse(
        model="gpt-4o",
        messages=messages,
        response_format=Output
    )
    response = response.choices[0].message.parsed
    sm=messages
    messages.append({'role': 'assistant', 'content': str(response)})

    print(response)
    return sm, response

while True:
    user_input = input("You: ")
    response = answer(user_input)
    print("Bot:", response)