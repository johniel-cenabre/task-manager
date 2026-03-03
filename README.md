# Task Manager

A modern task management system built with Vue.js 3, Tailwind CSS, and IndexedDB.

## Features

- 🎨 Modern, responsive UI with light/dark theme support
- 📋 Kanban-style board with draggable tasks
- 💾 Offline-first with IndexedDB storage
- 🔄 Service Worker API for data operations
- ✨ Smooth animations and transitions

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── common/          # Shared components
│   ├── Header.vue
│   └── ThemeToggle.vue
├── components/      # Feature components
│   ├── TaskBoard.vue
│   ├── TaskColumn.vue
│   └── TaskCard.vue
├── utils/          # Utilities
│   ├── db.js       # IndexedDB API wrapper
│   └── theme.js    # Theme management
├── App.vue
├── main.js
└── style.css
public/
└── sw.js           # Service Worker
```

## Usage

1. **Create a Task**: Click the "+ Add Task" button to create a new task
2. **Move Tasks**: Drag and drop tasks between columns to update their status
3. **Delete Tasks**: Click the X button on any task card to delete it
4. **Toggle Theme**: Use the theme toggle button in the header to switch between light and dark modes

## Technologies

- Vue.js 3 - Progressive JavaScript framework
- Tailwind CSS - Utility-first CSS framework
- IndexedDB - Browser database for offline storage
- Service Worker - Background script for data operations
