import json
import re
weekJson = "week" + input("第何回の要点整理資料を読み込みますか？半角英数で入力⇒: ") + ".json"
print(weekJson)
with open(weekJson, 'r', encoding='utf-8') as f:
    questions = json.load(f)

def get_quiz_path(source_text):
    if any(keyword in source_text for keyword in ["特別", "基本"]):
        return None
    period_map = {"春": "haru", "秋": "aki"}
    match = re.search(r'H(\d+)(春|秋).*問(\d+)', source_text)
    if match:
        year = match.group(1)
        period = period_map.get(match.group(2))
        q_num = match.group(3)
        return f"{year}_{period}/q{q_num}.html"
    return None

base_url = input("ベースURLを入力してください（例：https://example.com/s/kakomon/）: ")
print("\n=== 生成されたパス一覧 ===")
for q in questions:
    path = get_quiz_path(q['source'])
    if path:
        print(f"[{q['id']}] {base_url}{path}")
    else:
        print(f"[{q['id']}] スキップされました (対象外)")
