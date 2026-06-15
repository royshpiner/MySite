# Repository Guidelines

## Project Structure & Module Organization

This repository is a Hugo static site using the Ananke theme as a git submodule at `themes/ananke`.

- `hugo.toml` contains the site configuration, including `baseURL`, locale, title, and theme.
- `content/` holds authored Markdown content. Blog posts currently live in `content/posts/`.
- `archetypes/` contains front matter templates for new content.
- `layouts/`, `assets/`, `static/`, `data/`, and `i18n/` are available for site customizations.
- `public/`, `resources/_gen/`, `.hugo_build.lock`, and `.DS_Store` are generated or local files and should not be committed.
- `.github/workflows/hugo.yaml` builds and deploys the site to GitHub Pages.

## Build, Test, and Development Commands

- `hugo server -D`: run the site locally with drafts enabled.
- `hugo server`: run the local site without draft content.
- `hugo --minify`: build the production site into `public/`, matching the deploy workflow.
- `git submodule update --init --recursive`: ensure the Ananke theme is present after cloning.

There is no package manager setup for this root project.

## Coding Style & Naming Conventions

Use TOML for Hugo configuration and Markdown with TOML front matter for content. Keep Markdown prose concise and use meaningful post filenames such as `content/posts/my-new-post.md`. Prefer lowercase, hyphenated slugs for content paths and static assets.

When editing templates or configuration, follow Hugo conventions and keep indentation consistent with the surrounding file. Do not edit generated files under `public/`; change source content, layouts, or config instead.

## Testing Guidelines

There is no dedicated test framework in this repository. Validate changes by running `hugo --minify` before submitting. For visual or content changes, also run `hugo server -D` and inspect the affected pages locally.

Check that links, images, front matter dates, and draft status are correct. New posts should set `draft = false` only when ready to publish.

## Commit & Pull Request Guidelines

Recent commit messages use short, imperative summaries, for example `Add Hugo CI/CD pipeline` and `Initial Hugo setup with first markdown post`. Follow that style and keep each commit focused.

Pull requests should include a brief summary, the pages or files changed, and any local validation performed. For visible site changes, include screenshots or note what was checked in the local Hugo server.

## Security & Configuration Tips

Keep deployment settings in `.github/workflows/hugo.yaml` and avoid committing local machine files. Update `baseURL` in `hugo.toml` when moving from the placeholder domain to the production GitHub Pages URL.
