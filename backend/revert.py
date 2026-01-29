import glob, json, re

HTML_GLOB = "./public/**/*.html"
CSS_GLOB  = "./public/**/*.css"

with open("map.json", "r", encoding="utf-8") as fp:
    data = json.load(fp)

# Invertir mapas: new -> old
rev_cls = {v: k for k, v in data["classes"].items()}
rev_ids = {v: k for k, v in data["ids"].items()}

# Ordena por longitud para evitar reemplazar subcadenas
rev_cls_items = sorted(rev_cls.items(), key=lambda kv: len(kv[0]), reverse=True)
rev_id_items  = sorted(rev_ids.items(), key=lambda kv: len(kv[0]), reverse=True)

def repl_html(text):
    # class="a b c"
    def sub_class(m):
        quote = m.group(1)
        value = m.group(2)
        parts = re.split(r"(\s+)", value)
        for i, p in enumerate(parts):
            if p.strip() and p in rev_cls:
                parts[i] = rev_cls[p]
        return f'class={quote}{"".join(parts)}{quote}'
    text = re.sub(r'class\s*=\s*([\'"])(.*?)\1', sub_class, text, flags=re.I | re.S)

    # id="x"
    def sub_id(m):
        quote = m.group(1)
        value = m.group(2).strip()
        if value in rev_ids:
            value = rev_ids[value]
        return f'id={quote}{value}{quote}'
    text = re.sub(r'\bid\s*=\s*([\'"])(.*?)\1', sub_id, text, flags=re.I | re.S)

    # for="x"
    def sub_for(m):
        quote = m.group(1)
        value = m.group(2).strip()
        if value in rev_ids:
            value = rev_ids[value]
        return f'for={quote}{value}{quote}'
    text = re.sub(r'\bfor\s*=\s*([\'"])(.*?)\1', sub_for, text, flags=re.I | re.S)

    # href="...#id"
    def sub_href(m):
        quote = m.group(1)
        url = m.group(2)
        if "#" not in url:
            return m.group(0)
        base, frag = url.split("#", 1)
        if re.fullmatch(r"[A-Za-z_][A-Za-z0-9_-]*", frag or "") and frag in rev_ids:
            frag = rev_ids[frag]
        return f'href={quote}{base}#{frag}{quote}'
    text = re.sub(r'\bhref\s*=\s*([\'"])(.*?)\1', sub_href, text, flags=re.I | re.S)

    return text

def repl_css(text):
    # Protege url(...)
    urls = []
    def stash_url(m):
        urls.append(m.group(0))
        return f"__URL_STASH_{len(urls)-1}__"
    text2 = re.sub(r'url\(\s*(?:[\'"].*?[\'"]|[^)]+)\s*\)', stash_url, text, flags=re.I | re.S)

    # Reemplaza .class y #id
    for a, b in rev_cls_items:
        text2 = re.sub(rf'\.{re.escape(a)}(?![A-Za-z0-9_-])', f'.{b}', text2)
    for a, b in rev_id_items:
        text2 = re.sub(rf'#{re.escape(a)}(?![A-Za-z0-9_-])', f'#{b}', text2)

    # También selectores por atributo [id="x"] y [for="x"]
    def sub_attr_id(m):
        quote = m.group(1)
        value = m.group(2)
        return f'[id={quote}{rev_ids.get(value, value)}{quote}]'
    text2 = re.sub(r'\[id\s*=\s*([\'"])(.*?)\1\]', sub_attr_id, text2, flags=re.I | re.S)

    def sub_attr_for(m):
        quote = m.group(1)
        value = m.group(2)
        return f'[for={quote}{rev_ids.get(value, value)}{quote}]'
    text2 = re.sub(r'\[for\s*=\s*([\'"])(.*?)\1\]', sub_attr_for, text2, flags=re.I | re.S)

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

print("Revertido usando map.json (clases + ids + for + anchors).")
