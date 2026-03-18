import json
import os

updates = {
    'en': "{{name}}'s Dashboard",
    'si': "{{name}} ගේ පුවරුව",
    'ta': "{{name}} இன் பக்கம்"
}

for lang, heading in updates.items():
    path = f'src/locales/{lang}.json'
    if not os.path.exists(path):
        continue
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    if 'dashboard' in data:
        data['dashboard']['welcome_heading'] = heading
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f'Updated {lang}')
