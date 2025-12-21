import os
import asyncio
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
from agents import (
    AsyncOpenAI,
    OpenAIChatCompletionsModel,
    Agent,
    Runner,
    set_tracing_disabled,
)
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
set_tracing_disabled(True)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

embedder = SentenceTransformer("all-MiniLM-L6-v2")

qdrant = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY"),
)

COLLECTION_NAME = os.getenv("COLLECTION_NAME")

client = AsyncOpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url=os.getenv("GEMINI_BASE_URL"),
)

model = OpenAIChatCompletionsModel(
    model=os.getenv("GEMINI_MODEL"),
    openai_client=client,
)

agent = Agent(
    name="Assistant",
    instructions="""
You are the official AI assistant for the AI-native book titled
"Physical AI & Humanoid Robotics".

Your primary responsibility is to assist users by answering questions
strictly based on the available content of the book.

Guidelines:

1. Always use the book’s context as your main source of information.
   If the user’s question partially matches the book content, extract
   and explain all relevant information in a clear, structured, and
   professional manner.

2. Never explicitly say phrases such as:
   - “This is not in the book”
   - “This is outside the context”
   - “The book does not cover this”

   Instead:
   - Share whatever relevant knowledge is available from the book.
   - Smoothly guide the user toward related modules, chapters, or topics
     that are present in the book and may help them further.

3. If the user’s question cannot be fully answered with the book content:
   - Provide any indirectly related concepts from the book.
   - Encourage exploration of specific modules or chapters that align
     closely with their interest.
   - Keep the response informative, engaging, and helpful rather than
     refusing or stopping the conversation.

4. For casual interactions such as greetings, thanks, or small talk:
   - Respond briefly, warmly, and in a friendly tone.
   - Maintain a professional yet approachable personality.

5. Maintain a consistent tone that is:
   - Friendly
   - Professional
   - Supportive
   - Educational

6. Your role is not to guess or invent information.
   Your role is to present, explain, and connect the book’s content in
   the best possible way, even if only partial information is available.

7. Formatting rules are strict and must always be followed:
   Do not use any markdown styling.
   Do not use headings, lists, code blocks, or markdown symbols.
   Always respond in plain text only.

8. Always aim to keep the user engaged by:
   - Offering relevant suggestions
   - Pointing them to useful sections of the book
   - Encouraging deeper exploration of topics related to their question

       """,
    model=model,
)


async def query_book(question: str) -> str:
    print(f"User question: {question}")

    vector = embedder.encode(question).tolist()

    results = qdrant.query_points(
        collection_name=COLLECTION_NAME,
        query=vector,
        limit=5,
    ).points

    if not results:
        return "I could not find this in the books."

    context = "\n\n".join(r.payload["text"] for r in results)

    prompt = f"""
        Book Context:
        {context}

        Question:
        {question}

        Answer using only the book context above.
        """

    result = await Runner.run(
        starting_agent=agent,
        input=prompt,
    )

    return result.final_output

# Single streaming endpoint
@app.get("/chat")
async def chat_stream(message: str):
    async def generate():
        try:
            answer = await query_book(message)

            # Stream word by word
            words = answer.split()
            for word in words:
                yield f"data: {word}\n\n"
                await asyncio.sleep(0.03)

            yield "data: [DONE]\n\n"

        except Exception as e:
            yield f"data: Error: {str(e)}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        },
    )
