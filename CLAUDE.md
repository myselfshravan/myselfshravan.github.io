# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev          # Start dev server with Turbo for hot reload (localhost:3000)

# Production builds
npm run build        # Build static site for deployment
npm run start        # Start production server

# Code quality
npm run lint         # Run ESLint with Next.js configuration
```

## Project Architecture

This is a modern portfolio website built with **Next.js 15** using App Router, deployed as a static site to GitHub Pages. The architecture emphasizes performance, SEO, and modern web standards.

### Core Stack

- **Framework**: Next.js 15 (App Router with static export)
- **Language**: TypeScript with strict configuration
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Animations**: GSAP + Framer Motion for scroll-triggered effects
- **Theme**: Dark/light mode with next-themes and system preference detection
- **Fonts**: Inter (body) + JetBrains Mono (code/monospace)

### Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with SEO metadata from portfolio-data.json
│   ├── page.tsx           # Main page with GSAP scroll animations
│   └── globals.css        # Global Tailwind styles and CSS variables
├── components/
│   ├── layout/            # Header and Footer components
│   ├── sections/          # Page sections (hero, about, skills, projects, etc.)
│   ├── ui/               # shadcn/ui components (button, card, dialog, etc.)
│   ├── theme-provider.tsx # next-themes configuration
│   └── theme-toggle.tsx   # Theme switcher component
└── lib/
    ├── portfolio-data.json # Single source of truth for all content
    └── utils.ts           # Tailwind class utilities (cn function)
```

### Content Management System

All portfolio content is centralized in `src/lib/portfolio-data.json`:

- **Personal info**: name, bio, contact details, profile images
- **Skills & Technologies**: organized by languages and tools with devicon classes
- **Projects**: categorized as personal, team, and pending with images and links
- **Education & Work**: timeline with institutional details
- **SEO metadata**: titles, descriptions, keywords, Open Graph data

### Animation System

The site uses a sophisticated animation architecture:

- **GSAP ScrollTrigger**: Section fade-ins and parallax backgrounds
- **Framer Motion**: Component-level animations and transitions
- **Client-side only**: All animations are wrapped in client component checks
- **Performance optimized**: Scroll triggers refresh on window resize

### Theme Architecture

- **CSS Custom Properties**: Color system defined in globals.css
- **System Detection**: Automatic dark/light mode based on user preference
- **Persistent State**: Theme choice saved in localStorage
- **Component Integration**: All shadcn/ui components support theme variables

### Static Site Generation

- **Export Configuration**: Next.js configured for static export in `next.config.ts`
- **Asset Optimization**: Images served from `/public/assets/` directory
- **GitHub Pages**: Deployed via Actions workflow with CNAME for custom domain

## Key Development Patterns

### Component Architecture

- Use **shadcn/ui** components as base building blocks
- Components consume data from `portfolio-data.json` via imports
- Maintain responsive-first design with Tailwind breakpoints
- Implement proper TypeScript interfaces for data structures

### Styling Guidelines

- **Tailwind-first**: Use utility classes over custom CSS
- **Theme Variables**: Reference CSS custom properties for colors
- **Responsive Design**: Mobile-first breakpoint system
- **Glass Morphism**: Consistent backdrop-blur effects throughout

### Animation Best Practices

- Register GSAP plugins only on client-side (`typeof window !== "undefined"`)
- Use `ScrollTrigger.refresh()` after dynamic content changes
- Implement proper cleanup in useEffect hooks
- Test animations across different screen sizes

## Important Notes

- **Static Export**: Site builds to `/out` directory for GitHub Pages
- **Asset Paths**: All images use `/assets/` prefix for proper static serving
- **SEO Optimization**: Metadata automatically generated from portfolio-data.json
- **Performance**: Built-in Next.js optimizations with Image component
- **Legacy Assets**: Old portfolio files remain in `/old_portfolio/` for reference
