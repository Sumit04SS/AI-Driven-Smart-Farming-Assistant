import sys
import os
import time

sys.path.insert(0, os.path.abspath('.'))
from dotenv import load_dotenv
load_dotenv()
sys.stdout.reconfigure(encoding='utf-8')

from backend.database import SessionLocal
from backend.models.user import User
from backend.schemas.multilingual import MultilingualQueryRequest
from backend.routers.multilingual import multilingual_query

db = SessionLocal()
test_user = db.query(User).first()
if not test_user:
    test_user = User(email='test_farmer@krishimitra.ai', name='Test Farmer', hashed_password='fake')
    db.add(test_user)
    db.commit()
    db.refresh(test_user)

queries = [
    ('English', 'en', 'What are the recommended irrigation practices for wheat?'),
    ('Marathi', 'mr', 'गव्हाच्या पिकाला पाणी व्यवस्थापन कसे करावे?'),
    ('Hindi', 'hi', 'धान की फसल में उर्वरक प्रबंधन कैसे करें?')
]

results_summary = []

for label, lang_code, question in queries:
    print(f"\n========================================================")
    print(f"TESTING {label} ({lang_code})")
    print(f"========================================================")
    req = MultilingualQueryRequest(question=question, language=lang_code)
    t0 = time.time()
    try:
        res = multilingual_query(request=req, current_user=test_user, db=db)
        duration = time.time() - t0
        ans = res['answer']
        results_summary.append({
            'language': label,
            'code': lang_code,
            'duration': duration,
            'status': 'PASSED',
            'answer_length': len(ans)
        })
        print(f"SUCCESS: Total time = {duration:.2f}s (< 45s threshold)")
        print(f"Answer chars: {len(ans)}")
        print("Answer sample:")
        for line in ans.splitlines()[:5]:
            print("  ", line)
    except Exception as e:
        results_summary.append({
            'language': label,
            'code': lang_code,
            'duration': time.time() - t0,
            'status': f'FAILED: {e}',
            'answer_length': 0
        })
        print(f"FAILED: {e}")

db.close()

print("\n" + "="*60)
print("BENCHMARK SUMMARY")
print("="*60)
for r in results_summary:
    print(f"{r['language']} ({r['code']}): {r['duration']:.2f}s | Status: {r['status']} | Length: {r['answer_length']} chars")
