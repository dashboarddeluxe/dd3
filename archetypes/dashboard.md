---
title: "New Section"
link_name: "Short Label"
weight: 10
hidden: false
type: dashboard
build:
  render: never
  list: always
blocks:
  - row:
      - "Example | https://example.com"
      - "Secret | https://example.org | hidden"
      - "Filter | header"
  - label: "Filter row"
    from: bgg:complexity
  - title: "Named Group"
    row:
      - "Grouped Link | https://example.com"
---
