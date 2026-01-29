import glob, json, re

HTML_GLOB = "./public/**/*.html"
CSS_GLOB  = "./public/**/*.css"
JS_GLOB   = "./public/**/*.{js,mjs,cjs}"   # agrega ts/tsx si aplica

with open("map.json", "r", encoding="utf-8") as fp:
    data = json.load(fp)

cls = data["classes"]
ids = data["ids"]

cls_items = sorted(cls.items(), key=lambda kv: len(kv[0]), reverse=True)
id_items  = sorted(ids.items(), key=lambda kv: len(kv[0]), reverse=True)

def repl_html(text):
    def sub_class(m):
        quote = m.group(1)
        value = m.group(2)
        parts = re.split(r"(\s+)", value)
        for i, p in enumerate(parts):
            if p.strip() and p in cls:
                parts[i] = cls[p]
        return f'class={quote}{"".join(parts)}{quote}'
    text = re.sub(r'class\s*=\s*([\'"])(.*?)\1', sub_class, text, flags=re.I | re.S)

    def sub_id(m):
        quote = m.group(1)
        value = m.group(2).strip()
        if value in ids:
            value = ids[value]
        return f'id={quote}{value}{quote}'
    text = re.sub(r'\bid\s*=\s*([\'"])(.*?)\1', sub_id, text, flags=re.I | re.S)

    def sub_for(m):
        quote = m.group(1)
        value = m.group(2).strip()
        if value in ids:
            value = ids[value]
        return f'for={quote}{value}{quote}'
    text = re.sub(r'\bfor\s*=\s*([\'"])(.*?)\1', sub_for, text, flags=re.I | re.S)

    def sub_href(m):
        quote = m.group(1)
        url = m.group(2)
        if "#" not in url:
            return m.group(0)
        base, frag = url.split("#", 1)
        if re.fullmatch(r"[A-Za-z_][A-Za-z0-9_-]*", frag or "") and frag in ids:
            frag = ids[frag]
        return f'href={quote}{base}#{frag}{quote}'
    text = re.sub(r'\bhref\s*=\s*([\'"])(.*?)\1', sub_href, text, flags=re.I | re.S)

    return text

def repl_css(text):
    urls = []
    def stash_url(m):
        urls.append(m.group(0))
        return f"__URL_STASH_{len(urls)-1}__"
    text2 = re.sub(r'url\(\s*(?:[\'"].*?[\'"]|[^)]+)\s*\)', stash_url, text, flags=re.I | re.S)

    for a, b in cls_items:
        text2 = re.sub(rf'\.{re.escape(a)}(?![A-Za-z0-9_-])', f'.{b}', text2)
    for a, b in id_items:
        text2 = re.sub(rf'#{re.escape(a)}(?![A-Za-z0-9_-])', f'#{b}', text2)

    def sub_attr_id(m):
        quote = m.group(1); value = m.group(2)
        return f'[id={quote}{ids.get(value, value)}{quote}]'
    text2 = re.sub(r'\[id\s*=\s*([\'"])(.*?)\1\]', sub_attr_id, text2, flags=re.I | re.S)

    def sub_attr_for(m):
        quote = m.group(1); value = m.group(2)
        return f'[for={quote}{ids.get(value, value)}{quote}]'
    text2 = re.sub(r'\[for\s*=\s*([\'"])(.*?)\1\]', sub_attr_for, text2, flags=re.I | re.S)

    for i, u in enumerate(urls):
        text2 = text2.replace(f"__URL_STASH_{i}__", u)

    return text2

def repl_js(text):
    # Reemplaza dentro de strings: "..." o '...' o `...` (sin parsear JS completo).
    # En la práctica cubre: getElementById("x"), querySelector("#x"), classList.add("c"), etc. [web:53][web:60]
    def sub_string(m):
        quote = m.group(1)
        s = m.group(2)

        # 1) strings que son IDs directos: "header"
        if s in ids:
            return f"{quote}{ids[s]}{quote}"

        # 2) strings que son selectores CSS comunes (muy típico en querySelector): "#id" y ".class"
        #    Solo reemplaza el token después del primer # o . si es exacto.
        if s.startswith("#"):
            key = s[1:]
            if key in ids and re.fullmatch(r"[A-Za-z_][A-Za-z0-9_-]*", key):
                return f"{quote}#{ids[key]}{quote}"

        if s.startswith("."):
            key = s[1:]
            if key in cls and re.fullmatch(r"[A-Za-z_][A-Za-z0-9_-]*", key):
                return f"{quote}.{cls[key]}{quote}"

        # 3) strings que contienen clases separadas por espacios (ej: element.className="a b")
        parts = re.split(r"(\s+)", s)
        changed = False
        for i, p in enumerate(parts):
            if p.strip() and p in cls:
                parts[i] = cls[p]
                changed = True
        if changed:
            return f"{quote}{''.join(parts)}{quote}"

        return m.group(0)

    # Captura strings simples (no cubre todos los escapes posibles, pero suele bastar)
    text = re.sub(r'(")([^"\\]*(?:\\.[^"\\]*)*)"', sub_string, text)
    text = re.sub(r"(')([^'\\]*(?:\\.[^'\\]*)*)'", sub_string, text)
    text = re.sub(r"(`)([^`\\]*(?:\\.[^`\\]*)*)`", sub_string, text)

    return text

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

# Ejecuta para cada extensión (glob con llaves no funciona en glob estándar en todos los entornos)
for pat in ["./public/**/*.js", "./public/**/*.mjs", "./public/**/*.cjs"]:
    rewrite(pat, repl_js)

print("Aplicado map.json a HTML/CSS/JS (clases + ids + for + anchors + strings comunes en scripts).")
