# Import necessary libraries
from flask import Blueprint, request, jsonify
import os
from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain.document_loaders.csv_loader import CSVLoader
from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

main = Blueprint('main', __name__)

# Load environment variables from .env file
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

# Create an OpenAI instance
llm = ChatOpenAI(temperature=0, openai_api_key=openai_api_key, verbose=False)

# Create OpenAIEmbeddings
embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)

# Load data and create a vector database for retrieval
csv_file_path = os.path.join(os.path.dirname(__file__), 'data', 'codebasics_faqs.csv')
loader = CSVLoader(file_path=csv_file_path, source_column="prompt")
data = loader.load()

# Create a FAISS instance for vector database from 'data'
vectordb = FAISS.from_documents(documents=data, embedding=embeddings)

# Save vector database locally
vectordb_file_path = "faiss_index"
vectordb.save_local(vectordb_file_path)

# Load the vector database from the local folder
vectordb = FAISS.load_local(vectordb_file_path, embeddings, allow_dangerous_deserialization=True)

# Create a retriever for querying the vector database
retriever = vectordb.as_retriever(score_threshold=0.7)

qa = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=retriever,
)

@main.route('/query', methods=['POST'])
def query():
    user_query = request.json.get('query')
    response = qa.run(user_query)
    return jsonify({'response': response})
