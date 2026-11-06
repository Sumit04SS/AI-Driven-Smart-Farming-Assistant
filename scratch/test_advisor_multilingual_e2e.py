import os
import sys
sys.path.insert(0, os.path.abspath('.'))
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import json
import time
from fastapi.testclient import TestClient
from jose import jwt
from backend.main import app
from backend.core.security import SECRET_KEY, ALGORITHM

client = TestClient(app)
token = jwt.encode({"sub": "1"}, SECRET_KEY, algorithm=ALGORITHM)
headers = {"Authorization": f"Bearer {token}"}

print("=" * 60)
print("RUNNING END-TO-END VERIFICATION TESTS")
print("=" * 60)

# TEST 1: Long English RAG Answer
print("\n--- TEST 1: Long English RAG Answer ---")
t0 = time.time()
resp_en = client.post(
    "/api/rag/query",
    json={"question": "What are the recommended irrigation scheduling, water requirements, and soil management practices for crops?"},
    headers=headers
)
t_en = time.time() - t0
print(f"Status: {resp_en.status_code} in {t_en:.2f}s")
assert resp_en.status_code == 200, f"Expected 200, got {resp_en.status_code}: {resp_en.text}"
data_en = resp_en.json()
answer_en = data_en.get("answer", "")
sources_en = data_en.get("sources", [])
print(f"English Answer Length: {len(answer_en)} chars")
print(f"English Sources Count: {len(sources_en)}")
PUNCTUATION = ('.', '!', '?', '।', '"', "'", ')', '*', '`')
print(f"Ends cleanly with punctuation: {answer_en.strip()[-1] in PUNCTUATION}")
print(f"First 150 chars: {answer_en[:150]}...")
print(f"Last 150 chars: ...{answer_en[-150:]}")
for s in sources_en[:2]:
    print(f"Citation: {s.get('source')} (Page {s.get('page')}) Score: {s.get('score')}")

# TEST 2: Long Marathi Answer
print("\n--- TEST 2: Long Marathi Answer ---")
t0 = time.time()
resp_mr = client.post(
    "/api/multilingual/query",
    json={
        "question": "गव्हाच्या पिकासाठी योग्य पाणी व्यवस्थापन, खत नियोजन आणि जमिनीची मशागत कशी करावी सविस्तर सांगा.",
        "language": "mr"
    },
    headers=headers
)
t_mr = time.time() - t0
print(f"Status: {resp_mr.status_code} in {t_mr:.2f}s")
assert resp_mr.status_code == 200, f"Expected 200, got {resp_mr.status_code}: {resp_mr.text}"
data_mr = resp_mr.json()
answer_mr = data_mr.get("answer", "")
sources_mr = data_mr.get("sources", [])
print(f"Marathi Answer Length: {len(answer_mr)} chars")
print(f"Marathi Language: {data_mr.get('language')} ({data_mr.get('language_name')})")
print(f"Marathi Sources Count: {len(sources_mr)}")
print(f"Ends cleanly: {answer_mr.strip()[-1] in PUNCTUATION}")
print(f"First 150 chars: {answer_mr[:150]}...")
print(f"Last 150 chars: ...{answer_mr[-150:]}")

# TEST 3: Long Hindi Answer
print("\n--- TEST 3: Long Hindi Answer ---")
t0 = time.time()
resp_hi = client.post(
    "/api/multilingual/query",
    json={
        "question": "धान और गेहूं की खेती में सिंचाई प्रबंधन और खाद का सही उपयोग कैसे करें?",
        "language": "hi"
    },
    headers=headers
)
t_hi = time.time() - t0
print(f"Status: {resp_hi.status_code} in {t_hi:.2f}s")
assert resp_hi.status_code == 200, f"Expected 200, got {resp_hi.status_code}: {resp_hi.text}"
data_hi = resp_hi.json()
answer_hi = data_hi.get("answer", "")
sources_hi = data_hi.get("sources", [])
print(f"Hindi Answer Length: {len(answer_hi)} chars")
print(f"Hindi Language: {data_hi.get('language')} ({data_hi.get('language_name')})")
print(f"Hindi Sources Count: {len(sources_hi)}")
print(f"Ends cleanly: {answer_hi.strip()[-1] in PUNCTUATION}")
print(f"First 150 chars: {answer_hi[:150]}...")
print(f"Last 150 chars: ...{answer_hi[-150:]}")

# TEST 4: Listen to Answer for English
print("\n--- TEST 4: Listen to Answer for English ---")
t0 = time.time()
resp_tts_en = client.post(
    "/api/multilingual/tts",
    json={"text": answer_en, "language": "en"},
    headers=headers
)
t_tts_en = time.time() - t0
print(f"Status: {resp_tts_en.status_code} in {t_tts_en:.2f}s")
print(f"Content-Type: {resp_tts_en.headers.get('content-type')}")
print(f"Content-Length: {len(resp_tts_en.content)} bytes")
assert resp_tts_en.status_code == 200 and len(resp_tts_en.content) > 1000

# TEST 5: Listen to Answer for Marathi
print("\n--- TEST 5: Listen to Answer for Marathi ---")
t0 = time.time()
resp_tts_mr = client.post(
    "/api/multilingual/tts",
    json={"text": answer_mr, "language": "mr"},
    headers=headers
)
t_tts_mr = time.time() - t0
print(f"Status: {resp_tts_mr.status_code} in {t_tts_mr:.2f}s")
print(f"Content-Type: {resp_tts_mr.headers.get('content-type')}")
print(f"Content-Length: {len(resp_tts_mr.content)} bytes")
assert resp_tts_mr.status_code == 200 and len(resp_tts_mr.content) > 1000

# TEST 6: Listen to Answer for Hindi
print("\n--- TEST 6: Listen to Answer for Hindi ---")
t0 = time.time()
resp_tts_hi = client.post(
    "/api/multilingual/tts",
    json={"text": answer_hi, "language": "hi"},
    headers=headers
)
t_tts_hi = time.time() - t0
print(f"Status: {resp_tts_hi.status_code} in {t_tts_hi:.2f}s")
print(f"Content-Type: {resp_tts_hi.headers.get('content-type')}")
print(f"Content-Length: {len(resp_tts_hi.content)} bytes")
assert resp_tts_hi.status_code == 200 and len(resp_tts_hi.content) > 1000

print("\nALL 6 VERIFICATION TESTS PASSED SUCCESSFULLY!")
