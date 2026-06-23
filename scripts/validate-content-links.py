#!/usr/bin/env python3
"""Validate link syntax and URLs in content/*.md dashboard files."""

import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
LINK_GROUPS = ROOT / "data" / "link-groups.yaml"
FRONT_MATTER = re.compile(r"^---\n(.*?)\n---", re.DOTALL)


def build_url(category: dict, group_name: str, item: dict) -> str:
    group = category["groups"][group_name]
    keys = group["keys"]
    values = item["values"]
    query = group["template"]
    for key, value in zip(keys, values):
        query = query.replace(f"{{{key}}}", str(value))
    if group.get("join") == "path":
        return f"{category['base']}{query}"
    return f"{category['base']}?{query}"


def resolve_link(data: dict, link: str) -> str:
    if link.startswith("http"):
        return link
    if ":" not in link:
        return link

    cat_name, path = link.split(":", 1)
    category = data.get(cat_name)
    if not category:
        return link

    if "." not in path:
        return link

    group_name, item_id = path.split(".", 1)
    group = category.get("groups", {}).get(group_name)
    if not group:
        return link

    for item in group["items"]:
        if item["id"] == item_id:
            return build_url(category, group_name, item)
    return link


def is_link_group_ref(link: str, data: dict) -> bool:
    if ":" not in link or link.startswith("http"):
        return False
    cat_name, path = link.split(":", 1)
    category = data.get(cat_name)
    if not category:
        return False
    if "." in path:
        group_name, item_id = path.split(".", 1)
        group = category.get("groups", {}).get(group_name)
        if not group:
            return False
        return any(item["id"] == item_id for item in group["items"])
    return path in category.get("groups", {})


def parse_item(raw: str, data: dict) -> dict:
    parts = [part.strip() for part in raw.split("|")]
    hidden = False
    header = False

    for _ in range(3):
        if not parts:
            break
        flag = parts[-1].lower()
        if flag == "hidden":
            hidden = True
            parts.pop()
        elif flag == "header":
            header = True
            parts.pop()
        else:
            break

    title = ""
    link = ""
    count = len(parts)

    if count == 1:
        title = parts[0]
        header = True
    elif count >= 2:
        last = parts[-1]
        if last.startswith("http") or is_link_group_ref(last, data):
            link = last
            title = " | ".join(parts[:-1])
        else:
            title = " | ".join(parts)
            header = True

    return {"title": title, "link": link, "header": header, "hidden": hidden}


def expand_from(data: dict, from_ref: str) -> list[str]:
    if ":" not in from_ref:
        return []
    cat_name, group_name = from_ref.split(":", 1)
    category = data.get(cat_name)
    if not category:
        return []
    group = category.get("groups", {}).get(group_name)
    if not group:
        return []
    return [
        f"{item['title']} | {cat_name}:{group_name}.{item['id']}"
        for item in group["items"]
    ]


def block_items(block: dict, data: dict) -> list[str]:
    items: list[str] = []
    if block.get("label"):
        items.append(f"{block['label']} | header")
    if block.get("from"):
        items.extend(expand_from(data, block["from"]))
    elif block.get("row"):
        items.extend(block["row"])
    elif block.get("links"):
        items.extend(block["links"])
    return items


def validate_url(url: str, source: str, title: str) -> list[str]:
    errors: list[str] = []
    if ".onion" in url:
        if not url.startswith("http://") and not url.startswith("https://"):
            errors.append(f'{source} "{title}": onion URL needs http(s) scheme')
        return errors
    if url.startswith("http://"):
        errors.append(f'{source} "{title}": use https:// instead of http://')
    elif not url.startswith("https://"):
        errors.append(f'{source} "{title}": URL missing https:// scheme ({url})')
    elif "{" in url or "}" in url:
        errors.append(f'{source} "{title}": unresolved placeholder in URL')
    return errors


def validate_file(path: Path, data: dict) -> tuple[int, list[str]]:
    text = path.read_text()
    match = FRONT_MATTER.match(text)
    if not match:
        return 0, [f"{path}: missing front matter"]

    meta = yaml.safe_load(match.group(1)) or {}
    if meta.get("type") != "dashboard":
        return 0, []

    errors: list[str] = []
    count = 0
    blocks = meta.get("blocks") or []

    for index, block in enumerate(blocks):
        for raw in block_items(block, data):
            if not isinstance(raw, str):
                errors.append(f"{path} block {index}: item is not a string")
                continue

            parsed = parse_item(raw, data)
            if not parsed["title"]:
                errors.append(f'{path} block {index}: empty link title ({raw!r})')
                continue

            link = parsed["link"]
            if parsed["header"] or not link:
                continue

            source = f"{path.name} block {index}"
            if is_link_group_ref(link, data):
                url = resolve_link(data, link)
                if url == link:
                    errors.append(f'{source} "{parsed["title"]}": unknown link group ref ({link})')
                    continue
                errors.extend(validate_url(url, source, parsed["title"]))
            elif not is_link_group_ref(link, data) and ":" in link and not link.startswith("http"):
                errors.append(f'{source} "{parsed["title"]}": unknown link group ref ({link})')
                continue
            else:
                errors.extend(validate_url(link, source, parsed["title"]))

            count += 1

    return count, errors


def main() -> int:
    data = yaml.safe_load(LINK_GROUPS.read_text())
    errors: list[str] = []
    total = 0
    files = 0

    for path in sorted(CONTENT.glob("*.md")):
        if path.name == "_index.md":
            continue
        count, file_errors = validate_file(path, data)
        if count or file_errors:
            files += 1
        total += count
        errors.extend(file_errors)

    if errors:
        for err in errors:
            print(err, file=sys.stderr)
        return 1

    print(f"OK: {total} links across {files} dashboard files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
