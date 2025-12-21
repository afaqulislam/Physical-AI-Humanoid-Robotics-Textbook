import os
import uuid
import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
from dotenv import load_dotenv

# load env
load_dotenv()

SITEMAP_URL = os.getenv("SITEMAP_URL")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

EMBED_MODEL = "all-MiniLM-L6-v2"

# app
app = FastAPI()

# load embedding model
print("Loading embedding model...")
embedder = SentenceTransformer(EMBED_MODEL)
VECTOR_SIZE = embedder.get_sentence_embedding_dimension()
print(f"Embedding model loaded, vector size {VECTOR_SIZE}")

# connect qdrant
print("Connecting to Qdrant...")
qdrant = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

qdrant.recreate_collection(
    collection_name=COLLECTION_NAME,
    vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
)

print("Qdrant collection ready")


# fetch urls from sitemap
def fetch_sitemap_urls():
    print(f"Fetching sitemap {SITEMAP_URL}")
    xml = requests.get(SITEMAP_URL, timeout=30).text
    soup = BeautifulSoup(xml, "xml")
    urls = [loc.text for loc in soup.find_all("loc")]
    print(f"Found {len(urls)} urls")
    return urls


# fetch page content
def fetch_page_text(url):
    html = requests.get(url, timeout=30).text
    soup = BeautifulSoup(html, "html.parser")
    main = soup.find("main") or soup.body
    return main.get_text(" ", strip=True) if main else ""


# split text into chunks
def chunk_text(text, chunk_size=300):
    words = text.split()
    for i in range(0, len(words), chunk_size):
        yield " ".join(words[i : i + chunk_size])


# ingest website into qdrant
def ingest_site():
    print("Starting ingestion")
    urls = fetch_sitemap_urls()
    total_chunks = 0
    points = []

    for idx, url in enumerate(urls, start=1):
        print(f"Processing {idx}/{len(urls)} -> {url}")
        text = fetch_page_text(url)

        if not text:
            print("No content found, skipping")
            continue

        for chunk in chunk_text(text):
            vector = embedder.encode(chunk).tolist()
            points.append(
                PointStruct(
                    id=str(uuid.uuid4()),
                    vector=vector,
                    payload={"text": chunk, "source": url},
                )
            )
            total_chunks += 1

        print(f"Chunks embedded so far {total_chunks}")

    if points:
        print("Uploading vectors to Qdrant")
        qdrant.upsert(collection_name=COLLECTION_NAME, points=points)

    print("Ingestion completed")
    print(f"Total pages {len(urls)}")
    print(f"Total chunks {total_chunks}")


# run ingestion on startup
@app.on_event("startup")
def startup():
    ingest_site()


# request model
class Query(BaseModel):
    question: str


# health check
@app.get("/")
def health():
    return {"status": "RAG server running"}


# ask endpoint
@app.post("/ask")
def ask(query: Query):
    print(f"User question: {query.question}")

    vector = embedder.encode(query.question).tolist()
    results = qdrant.query_points(
        collection_name=COLLECTION_NAME,
        query=vector,
        limit=5,
    ).points

    context = "\n".join(r.payload["text"] for r in results)
    sources = list(set(r.payload["source"] for r in results))

    print(f"Returned {len(results)} chunks")

    return {"context": context, "sources": sources}
