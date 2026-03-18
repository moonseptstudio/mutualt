import json
import os

si_replacements = {
    'විභව එකඟතාවයන්': 'ගැලපීම්',
    'විභව එකඟතාවය': 'ගැලපීම',
    'අභිරුචි': 'තේරීම්',
    'එකඟතා විස්තර': 'ගැලපෙන විස්තර',
    'එකඟතාවය': 'ගැලපීම',
    'එකඟතාවයන්': 'ගැලපීම්',
    'සැලකීම්': 'ගැලපීම්',
    'උපකරණ පුවරුව': 'ඔබේ පිටුව',
    'තහවුරු කිරීමේ ක්‍රියාවලිය': 'තහවුරු කිරීම',
    'ස්ථාන මාරු අභිරුචි': 'මාරුවීම් තේරීම්',
    'අන්‍යෝන්‍ය මාරුව': 'එකිනෙකා මාරුවීම',
    'දාම මාරුව': 'දාම මාරුවීම',
    'ආරම්භක මාර්ගෝපදේශය': 'ආරම්භ කිරීම සඳහා උපදෙස්',
    'ප්‍රමුඛතා ගැලපුම් ක්‍රමය': 'ගැලපීම් සොයන ආකාරය',
    'ප්‍රමුඛතා ලැයිස්තුව': 'ඔබේ තේරීම් ලැයිස්තුව',
    'එකඟතා සමූහ සංවාදය': 'පණිවිඩ සමූහය',
    'එකඟතා ක්‍රියාවලිය': 'ගැලපෙන ක්‍රියාවලිය',
    'එකඟතා': 'ගැලපෙන',
    'විභව': 'හැකි',
    'පොරොත්තු ඉල්ලීම්': 'තීරණයක් නොදුන් ඉල්ලීම්'
}

ta_replacements = {
    'விருப்பத்தேர்வுகள்': 'விருப்பங்கள்',
    'சாத்தியமான பொருத்தங்கள்': 'பொருத்தங்கள்',
    'கருவிப்பலகை': 'முகப்பு பக்கம்',
    'பரஸ்பர பரிமாற்றம்': 'பரஸ்பர இடமாற்றம்',
    'சங்கிலி பரிமாற்றம்': 'சங்கிலி இடமாற்றம்',
    'முன்னுரிமை பொருத்த தர்க்கம்': 'பொருத்தப்படும் முறை',
    'நம்பிக்கை மற்றும் சரிபார்ப்பு': 'நம்பகத்தன்மை & சரிபார்ப்பு',
    'அடையாள ஆவணம்': 'அடையாள அட்டை'
}

def apply_replacements(data, replacements):
    if isinstance(data, dict):
        return {k: apply_replacements(v, replacements) for k, v in data.items()}
    elif isinstance(data, list):
        return [apply_replacements(item, replacements) for item in data]
    elif isinstance(data, str):
        for old, new in replacements.items():
            data = data.replace(old, new)
        return data
    else:
        return data

def process_file(lang, replacements):
    path = f'src/locales/{lang}.json'
    if not os.path.exists(path):
        print(f'{path} not found')
        return
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    data = apply_replacements(data, replacements)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f'Done {lang}')

process_file('si', si_replacements)
process_file('ta', ta_replacements)
