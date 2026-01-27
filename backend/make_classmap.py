import glob, json, random, re, string

HTML_GLOB = "./public/**/*.html"
CSS_GLOB  = "./public/**/*.css"

def gen_name(n=8):
    first = random.choice(string.ascii_letters)  # evita iniciar con dígito (mejor para selectores CSS) [web:237]
    rest = "".join(random.choice(string.ascii_letters + string.digits) for _ in range(n - 1))
    return first + rest

def extract_classes_from_html(text):
    classes = set()
    for m in re.finditer(r'class\s*=\s*([\'"])(.*?)\1', text, flags=re.I | re.S):
        for c in re.split(r'\s+', m.group(2).strip()):
            if c:
                classes.add(c)
    return classes

def extract_ids_from_html(text):
    ids = set()
    for m in re.finditer(r'\bid\s*=\s*([\'"])(.*?)\1', text, flags=re.I | re.S):
        v = m.group(2).strip()
        if v:
            ids.add(v)
    return ids

def strip_css_urls_and_strings(text):
    # Remueve url(...) para no capturar .png/.css/.com etc. [web:202]
    text = re.sub(r'url\(\s*(?:[\'"].*?[\'"]|[^)]+)\s*\)', 'url()', text, flags=re.I | re.S)
    # Remueve strings para reducir falsos positivos
    text = re.sub(r'"(?:\\.|[^"\\])*"', '""', text)
    text = re.sub(r"'(?:\\.|[^'\\])*'", "''", text)
    return text

def extract_classes_from_css(text):
    text = strip_css_urls_and_strings(text)
    return set(re.findall(r'\.([A-Za-z_][A-Za-z0-9_-]*)', text))

def extract_ids_from_css(text):
    text = strip_css_urls_and_strings(text)

    candidates = re.findall(r'#([A-Za-z_][A-Za-z0-9_-]*)', text)

    # Filtra colores hex: #fff, #ffffff, #ffffffff (3/6/8 hex)
    ids = set()
    for c in candidates:
        if re.fullmatch(r'[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8}', c):
            continue
        ids.add(c)

    return ids

classes = set()
ids = set()

for f in glob.glob(HTML_GLOB, recursive=True):
    with open(f, "r", encoding="utf-8", errors="ignore") as fp:
        t = fp.read()
    classes |= extract_classes_from_html(t)
    ids |= extract_ids_from_html(t)

for f in glob.glob(CSS_GLOB, recursive=True):
    with open(f, "r", encoding="utf-8", errors="ignore") as fp:
        t = fp.read()
    classes |= extract_classes_from_css(t)
    ids |= extract_ids_from_css(t)

def build_mapping(items):
    mp = {}
    used = set()
    for k in sorted(items):
        new = gen_name(8)
        while new in used:
            new = gen_name(8)
        used.add(new)
        mp[k] = new
    return mp

data = {
    "classes": build_mapping(classes),
    "ids": build_mapping(ids),
}

with open("map.json", "w", encoding="utf-8") as fp:
    json.dump(data, fp, ensure_ascii=False, indent=2)

print(f"Clases mapeadas: {len(data['classes'])} | IDs mapeados: {len(data['ids'])} -> map.json")
