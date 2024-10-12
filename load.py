import os
import ast
from dotenv import load_dotenv
from langchain_openai.chat_models import ChatOpenAI
from langchain_openai.embeddings import OpenAIEmbeddings
from langchain_community.document_loaders import TextLoader
from langchain_pinecone import PineconeVectorStore
from langchain_text_splitters import CharacterTextSplitter
from pinecone import Pinecone
from langchain_community.vectorstores import Pinecone as Pine
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from langchain_community.llms import Ollama

load_dotenv()
OPENAI_KEY=os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY=os.getenv("PINECONE_API_KEY")

parser = StrOutputParser()

pc=Pinecone(api_key=PINECONE_API_KEY)
index=pc.Index("people")
embeddings = OpenAIEmbeddings( model="text-embedding-3-small", openai_api_key=OPENAI_KEY)
vectorstore=PineconeVectorStore(index, embeddings)

def load_data():
    loader = TextLoader(r"people.txt")
    documents = loader.load()
    text_splitter = CharacterTextSplitter(
        separator=";",
        chunk_size=300,
        chunk_overlap=150,
        length_function=len,
        is_separator_regex=False, )
    docs=text_splitter.split_documents(documents)
    embeddings = OpenAIEmbeddings( model="text-embedding-3-small", openai_api_key=OPENAI_KEY)
    index_name="people"
    Pinecone=PineconeVectorStore.from_documents(docs,embeddings,index_name=index_name)
    print(Pinecone.similarity_search("eating disorder", k=3))
    


if __name__=="__main__":
   load_data()