#!/usr/bin/env python3
"""Verify link-group template URLs resolve all placeholders."""

import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
LINK_GROUPS = ROOT / "data" / "link-groups.yaml"

def build_url(category: dict, group_name: str, item: dict) -> str:
    group = category["groups"][group_name]
    keys = group["keys"]
    values = item["values"]
    if len(keys) != len(values):
        raise ValueError(
            f"{group_name}.{item['id']}: {len(keys)} keys, {len(values)} values"
        )
    query = group["template"]
    for key, value in zip(keys, values):
        query = query.replace(f"{{{key}}}", str(value))
    if group.get("join") == "path":
        return f"{category['base']}{query}"
    return f"{category['base']}?{query}"


def main() -> int:
    data = yaml.safe_load(LINK_GROUPS.read_text())
    errors: list[str] = []
    total = 0

    for category_name, category in data.items():
        for group_name, group in category["groups"].items():
            for item in group["items"]:
                total += 1
                url = build_url(category, group_name, item)
                if "{" in url or "}" in url:
                    errors.append(
                        f"unresolved placeholder in {category_name}:{group_name}.{item['id']}: {url}"
                    )

    if errors:
        for err in errors:
            print(err, file=sys.stderr)
        return 1

    groups = sum(len(c["groups"]) for c in data.values())
    print(f"OK: {total} links in {groups} groups across {len(data)} categories")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
