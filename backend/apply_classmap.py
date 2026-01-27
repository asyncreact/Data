import glob, json, re

HTML_GLOB = "./public/**/*.html"
CSS_GLOB  = "./public/**/*.css"

with open("map.json", "r", encoding="utf-8") as fp:
    data = json.load(fp)

cls = data["classes"]
ids = data["ids"]

# Ordena por longitud para evitar reemplazar subcadenas
cls_items = sorted(cls.items(), key=lambda kv: len(kv[0]), reverse=True)
id_items  = sorted(ids.items(), key=lambda kv: len(kv[0]), reverse=True)

def repl_html(text):
    # class="a b c"
    def sub_class(m):
        quote = m.group(1)
        value = m.group(2)
        parts = re.split(r"(\s+)", value)  # preserva espacios
        for i, p in enumerate(parts):
            if p.strip() and p in cls:
                parts[i] = cls[p]
        return f'class={quote}{"".join(parts)}{quote}'
    text = re.sub(r'class\s*=\s*([\'"])(.*?)\1', sub_class, text, flags=re.I | re.S)

    # id="x"
    def sub_id(m):
        quote = m.group(1)
        value = m.group(2).strip()
        if value in ids:
            value = ids[value]
        return f'id={quote}{value}{quote}'
    text = re.sub(r'\bid\s*=\s*([\'"])(.*?)\1', sub_id, text, flags=re.I | re.S)

    # href="#id" o href="page.html#id" (anchors / fragment identifiers) [web:262]
    def sub_href(m):
        quote = m.group(1)
        url = m.group(2)

        # Solo tocamos si hay fragmento '#...'
        if "#" not in url:
            return m.group(0)

        base, frag = url.split("#", 1)

        # Solo si el fragmento asoma como un id típico
        if re.fullmatch(r"[A-Za-z_][A-Za-z0-9_-]*", frag or "") and frag in ids:
            frag = ids[frag]

        return f'href={quote}{base}#{frag}{quote}'

    # Solo modifica el atributo href (no src, no link a CSS, etc.)
    text = re.sub(r'\bhref\s*=\s*([\'"])(.*?)\1', sub_href, text, flags=re.I | re.S)

    return text

def repl_css(text):
    # Protege url(...) para no modificar rutas aunque aparezcan con '.' o '#'. [web:202]
    urls = []

    def stash_url(m):
        urls.append(m.group(0))
        return f"__URL_STASH_{len(urls)-1}__"

    text2 = re.sub(r'url\(\s*(?:[\'"].*?[\'"]|[^)]+)\s*\)', stash_url, text, flags=re.I | re.S)

    # Reemplaza clases e ids en selectores
    for a, b in cls_items:
        text2 = re.sub(rf'\.{re.escape(a)}(?![A-Za-z0-9_-])', f'.{b}', text2)
    for a, b in id_items:
        text2 = re.sub(rf'#{re.escape(a)}(?![A-Za-z0-9_-])', f'#{b}', text2)

    # Restaura url(...)
    for i, u in enumerate(urls):
        text2 = text2.replace(f"__URL_STASH_{i}__", u)

    return text2

def rewrite(glob_pat, fn):
    for f in glob.glob(glob_pat, recursive=True):
        with open(f, "r", encoding="utf-8", errors="ignore") as fp:
            old = fp.read()
        new = fn(old)
        if new != old:
            with open(f, "w", encoding="utf-8") as fp:
                fp.write(new)

rewrite(HTML_GLOB, repl_html)
rewrite(CSS_GLOB, repl_css)

print("Aplicado map.json a HTML/CSS (clases + ids + anchors).")
