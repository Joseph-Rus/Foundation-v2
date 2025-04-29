# Note-Taking Electron App

## Overview
This project is a modern note-taking application built with React, TypeScript, and Electron. It allows users to create, edit, save, and delete notes. The app features an interactive timeline view to track note history, along with a customizable settings page for personalizing the experience. It uses OpenAI to help students take notes and leverages Overleaf to format formulas and render graphs in real time.

## Table of Contents
* [Features](#features)
* [Installation](#installation)
   * [Prerequisites](#prerequisites)
   * [Steps](#steps)
* [Usage](#usage)
* [Project Structure](#project-structure)
* [Technology Stack](#technology-stack)
* [Electron API Integration](#electron-api-integration)
* [Contributing](#contributing)
* [License](#license)
* [Acknowledgments](#acknowledgments)

## Features
* **Note Management:** Create, edit, save, and delete notes via a convenient UI.
* **Timeline View:** See a visual representation of your note history.
* **Settings & Customization:** Adjust app settings such as theme, font size, and AI integration (e.g., OpenAI GPT models) using the Settings page.
* **Auto-Save Functionality:** Automatically saves your work at a specified interval (default is every 30 seconds).
* **Robust Error Handling:** Provides clear error messages when issues occur (for instance, if Electron API is unavailable).

## Installation
### Prerequisites
Ensure you have the following installed on your machine:
* Node.js (v12 or later)
* npm or yarn
* Electron (if running as a desktop app)

### Steps
1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/your-note-app.git
cd your-note-app
```

2. **Install dependencies:**
Using npm:
```bash
npm install
```
Or using yarn:
```bash
yarn install
```

## Usage
Start the application in development mode with:
```bash
npm run electron:dev
```
This command launches the Electron app with hot-reloading enabled for a smooth development experience.

## Project Structure
```
your-note-app/
├── public/
│   └── index.html           # Main HTML template
├── src/
│   ├── components/          # React components folder
│   │   ├── Sidebar.tsx      # Sidebar for creating notes
│   │   ├── NotesList.tsx    # Displays the list of notes
│   │   ├── Timeline/        # Timeline view for note history
│   │   ├── Settings.tsx     # Settings page for app customization
│   │   └── Editor/
│   │       └── NoteEditor.tsx  # Editor for individual notes
│   ├── types.ts             # Type definitions (e.g., AppSettings, Note, NoteMetadata)
│   └── App.tsx              # Main application component
├── main.js (or main.ts)     # Electron main process file (if applicable)
├── package.json             # NPM configuration and scripts
└── README.md                # This file
```

## Technology Stack
* **React** and **TypeScript:** For building a dynamic and robust front-end.
* **Electron:** To run the application as a cross-platform desktop app.
* **react-router-dom:** Manages in-app navigation.
* **Custom Electron API:** Provides functions for loading/saving settings and managing note operations.

## Electron API Integration
The app uses a custom Electron API, which is made available on the global `window` object as `window.electronAPI`. This API handles:
* **Settings:** Loading and saving user configuration.
* **Note Operations:** Creating new notes, fetching existing notes, loading individual notes, saving changes, and deleting notes.

If the Electron API is not detected, the application displays an error message and prevents further data loading to ensure stability.

## Contributing
Contributions are welcome! Please follow these steps:
1. **Fork the repository.**
2. **Create a new branch:**
```bash
git checkout -b feature/your-feature
```
3. **Commit your changes:**
```bash
git commit -am 'Add new feature'
```
4. **Push to the branch:**
```bash
git push origin feature/your-feature
```
5. **Open a pull request:** Provide a clear description of your changes and their benefits.

Ensure your code adheres to the existing style and includes any necessary tests.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.

## Acknowledgments
* React Community
* Electron Community
* All contributors for their support and feedback.
