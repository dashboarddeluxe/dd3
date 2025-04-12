# Jorap Theme for Hugo

A clean, responsive Hugo theme with Tailwind CSS integration.

## Features

- TailwindCSS v4 integration
- Responsive design
- Clean, accessible UI
- Dashboard layout for organizing links and resources
- Mobile-friendly navigation

## Installation

1. Add the theme to your Hugo site:
   ```bash
   git submodule add https://github.com/yourname/jorap-theme.git themes/jorap
   ```

2. Update your `hugo.toml` configuration:
   ```toml
   theme = "jorap"
   ```

## Configuration

The theme uses the dashboard.yaml data file to configure sections and links.

### Theme Parameters

You can customize the theme behavior by adding the following parameters to your `hugo.toml` file:

```toml
[params]
  # Set to true to show all sections and links, ignoring their hidden status
  disableHiding = false
```

## Development

To develop the theme:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

## License

MIT 