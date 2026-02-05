from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
import os
from dotenv import load_dotenv

load_dotenv()

llm = ChatOpenAI(
    model="fireworks-ai/kimi-k2-instruct-0905",  # or "fireworks-ai/kimi-k2p5"
    openai_api_key=os.getenv("UNBOUND_API_KEY"),
    openai_api_base=os.getenv("UNBOUND_API_BASE"),
    temperature=0.7,
    max_tokens=512,
)

# Modern LCEL (no deprecated LLMChain)
chain = PromptTemplate.from_template("Tell me a joke about {topic}") | llm

result = chain.invoke({"topic": "programming"})
print(result.content.strip())