"""rename_project.py — rename project to EMEA France"""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
sb = create_client(os.environ['VITE_SUPABASE_URL'], os.environ['VITE_SUPABASE_ANON_KEY'])

result = sb.table('projects').update({'name': 'EMEA France'}).eq('name', 'Loire Riparian Restoration').execute()
print(f'Updated {len(result.data)} project(s)')
for p in result.data:
    print(f"  id={p['id']}  name={p['name']}")
