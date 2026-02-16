# Next.js Scenario Builder

A full-stack Next.js (App Router) web application featuring interactive scenario pages and a dynamic Tabs Generator tool.

This project demonstrates modern React architecture, state persistence, accessibility best practices, automated testing, Docker containerisation, and backend API integration.

---

## Overview

The application provides multiple interactive pages and scenario-based experiences, including:

* Escape Room scenario
* Coding Races scenario
* Court Room scenario
* Tabs Generator tool
* About page

The project focuses on modular architecture, user experience, persistent state management, and clean separation of concerns.

---

## Core Features

### Multi-Page Architecture

* Built using Next.js App Router
* Shared layout structure
* Responsive navigation
* Breadcrumb navigation system

### Theme System

* Light/Dark mode toggle
* Theme persistence via local storage
* System-aware theme handling

### Scenario Pages

* Interactive story-based pages
* Conditional logic
* User-driven progression
* State-aware UI elements

### Tabs Generator Tool

* Create dynamic tabbed content
* Edit existing tabs
* Reset tab state
* Persist tabs to storage
* Export standalone HTML
* Copy-to-clipboard functionality

### State Persistence

* Remembers last visited page
* Remembers active tab selection
* Stores user preferences locally

### Accessibility

* Skip-to-content link
* Keyboard navigation support
* Semantic HTML structure
* ARIA roles and landmarks
* Focus management

### API Integration

* Server-side API routes
* CRUD-style interactions
* Backend logic separation

### Testing

* Playwright automated testing
* Functional and navigation testing

### Containerisation

* Dockerfile included
* Production-ready container build
* Local container execution support

---

## Tech Stack

* Next.js (App Router)
* React
* TypeScript
* Playwright
* Prisma (database schema & migrations)
* Docker
* Node.js

---

## Project Structure

```
app/            → Pages, layouts, API routes
components/     → Reusable UI components
lib/            → Shared utilities and logic
prisma/         → Database schema and migrations
tests/          → Playwright test suite
public/         → Static assets
Dockerfile      → Container configuration
```

---

## Running Locally

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## Running with Docker

Build the container:

```bash
docker build -t nextjs-scenario-builder .
```

Run the container:

```bash
docker run -p 3000:3000 nextjs-scenario-builder
```

Access via:

```
http://localhost:3000
```

---

## Running Tests

Execute Playwright tests:

```bash
npx playwright test
```

---

## What This Project Demonstrates

* Modern React application structure
* Next.js App Router implementation
* Client/server component separation
* Persistent UI state management
* Accessible web design
* API route integration
* Containerised deployment workflow
* Automated browser testing

---

## Potential Improvements

* Authentication system
* Role-based access control
* Database-backed persistence for tabs
* CI/CD integration
* Cloud deployment automation
* Expanded scenario content
* Enhanced analytics logging

---

## Portfolio Context

This repository is shared as a portfolio project to demonstrate:

* Full-stack development capability
* Clean project architecture
* Production-aware practices
* Testing and containerisation
* Modern frontend engineering patterns

Environment-specific secrets and deployment credentials are not included.



Your GitHub is now looking serious.
