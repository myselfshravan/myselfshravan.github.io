# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Shravan Revanna, built as a static HTML/CSS/JavaScript site. The portfolio showcases skills, projects, education, and experience with a modern, responsive design featuring dark/light theme toggle and interactive animations.

## Development Commands

Since this is a static website, there are no build scripts or package managers. Development is straightforward:

- **Local Development**: Open `index.html` directly in a browser or use a local server (e.g., `python -m http.server 8000`)
- **CSS Development**: Edit SCSS files in `assets/sass/` and compile to `assets/css/styles.css` manually if needed
- **Deployment**: Push to GitHub Pages (hosted at shravanrevanna.me via CNAME)

## Architecture & Code Structure

### Core Structure
- `index.html` - Main portfolio page with all sections (about, skills, projects, education, contact)
- `404.html` - Custom 404 page with space theme in `/space/` directory
- `assets/` - All static assets organized by type

### CSS Architecture
- `assets/css/styles.css` - Main compiled styles
- `assets/css/animation.css` - Animation definitions
- `assets/css/media_query.css` - Responsive breakpoints
- `assets/css/oldstyle.css` - Legacy styles
- `assets/sass/styles.scss` - SCSS source (compile to styles.css when modified)

### JavaScript Functionality
- `assets/js/main.js` - Core functionality (navigation, theme toggle, animations)
- `assets/js/resume.js` - Resume download functionality using config.json

### Configuration
- `assets/config.json` - Stores resume file path for easy updates
- `CNAME` - Custom domain configuration for GitHub Pages

### Theme System
The site implements a dark/light theme toggle:
- Theme persistence using localStorage
- CSS custom properties for color management
- Toggle button with sun/moon icons in `assets/`

### Content Management
- Project images: `assets/img/project_*.png`
- Profile images: `assets/img/profile_*.jpg/png`
- Education images: `assets/img/education_*.jpg`
- Resume PDF: `Shravan_Resume_v9.pdf` (update filename in config.json when changed)

## Key Features to Maintain
- Responsive design across all devices
- Dark/light theme functionality
- Smooth scroll animations and reveal effects
- Resume download feature
- Social media integration
- SEO optimization with proper meta tags

## Important Notes
- No build process - direct file editing
- Images should be optimized before adding
- Test theme toggle functionality after CSS changes
- Update config.json when changing resume file
- Maintain mobile-first responsive design principles