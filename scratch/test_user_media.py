import sys
import os
import time
from dotenv import load_dotenv

sys.path.insert(0, '.')
sys.stdout.reconfigure(encoding='utf-8')
load_dotenv()

from backend.services.multilingual_service import translate_to_english, translate_from_english
from retrieve import retrieve_documents
from generate import generate_answer

test_queries = [
    ('mr', 'माझ्या गव्हाच्या पिकाला किती पाणी द्यावे?'),
    ('mr', 'भात पिकासाठी खत व्यवस्थापन कसे करावे?'),
    ('hi', 'धान में नाइट्रोजन और फास्फोरस का प्रयोग कैसे करें?')
]

print("==================================================")
print("VERIFYING FIXES FOR ALL 3 USER MEDIA ISSUES")
print("==================================================\n")

for code, q in test_queries:
    t0 = time.time()
    print(f">>> QUERY ({code.upper()}): '{q}'")
    eng_q = translate_to_english(q, code)
    docs = retrieve_documents(eng_q)
    eng_ans = generate_answer(eng_q, docs)
    final_ans = translate_from_english(eng_ans, code)
    elapsed = time.time() - t0
    
    headings = [line for line in final_ans.splitlines() if line.startswith('###')]
    
    print(f"    Total Time: {elapsed:.2f}s")
    print(f"    Final Answer Length: {len(final_ans)} chars")
    print(f"    Heading count (###): {len(headings)}")
    print(f"    Headings: {headings}")
    print("    Tail Preview:")
    print("    " + final_ans[-250:].replace('\n', ' '))
    print("\n" + "-"*50 + "\n")
