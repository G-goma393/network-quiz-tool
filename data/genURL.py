import json
import re

weekJson = "week" + input("第何回の要点整理資料を読み込みますか？半角英数で入力⇒: ") + ".json"
print(weekJson)

try:
    with open(weekJson, 'r', encoding='utf-8') as f:
        questions = json.load(f)
except FileNotFoundError:
    print("ファイルが見つかりませんでした。")
    questions = []

def get_quiz_path(source_text):
    # 除外キーワードが含まれていればスキップ
    if any(keyword in source_text for keyword in ["特別", "基本", "(AD)", "免基本"]):
        return None

    period_map = {"春": "haru", "秋": "aki"}

    # 変更点1: HまたはRを検知するように正規表現を変更 ([HR])
    # 変更点2: 元号(era)と年(year)を分けて取得
    match = re.search(r'([HR])(\d+)(春|秋).*問(\d+)', source_text)

    if match:
        era = match.group(1)   # 'H' または 'R'
        year = match.group(2)  # 数字部分 (例: '25' や '01')
        period = period_map.get(match.group(3))
        q_num = match.group(4)

        return f"{year}_{period}/q{q_num}.html"

    return None

base_url = input("ベースURLを入力してください（例：https://example.com/s/kakomon/）: ")
print("\n=== 生成されたパス一覧 ===")

if questions:
    for q in questions:
        path = get_quiz_path(q['source'])
        if path:
            print(f"[{q['id']}] {base_url}{path}")
        else:
            print(f"[{q['id']}] スキップされました (対象外)")
