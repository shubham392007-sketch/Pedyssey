import sqlite3
import json

conn = sqlite3.connect('D:/Real Working Project/Pedyssey/data/database/pedyssey.db')
cursor = conn.cursor()

cursor.execute('SELECT role, content, citations_json, created_at FROM chat_messages ORDER BY created_at ASC')
rows = cursor.fetchall()
print(f'Total messages in DB: {len(rows)}')
for role, content, citations_json, created_at in rows:
    print(f'=== [{role.upper()}] ({created_at}) ===')
    print(content[:500])
    if citations_json:
        cits = json.loads(citations_json)
        print('Citations:')
        for c in cits:
            p_start = c.get('page_start')
            p_end = c.get('page_end')
            print(f"  - Doc: {c.get('filename')}, Page: {p_start}-{p_end}, Score: {c.get('relevance_score')}")
    print()
