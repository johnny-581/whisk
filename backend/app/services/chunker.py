from langchain_text_splitters import CharacterTextSplitter
import asyncio
import json


chunker = CharacterTextSplitter.from_tiktoken_encoder(encoding_name="cl100k_base", chunk_size=1000, chunk_overlap=0, separator="---")   
    
    
