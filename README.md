# OPEN-KONSTRUKTOR
An open implementation for simulating the circuit logic of KOHCTPYKTOP: Engineer of the People,
and expanding on it.

[https://openkonstruktor.natecousins.com/](https://openkonstruktor.natecousins.com/)

*Working demo - some features may not be fully implemented, should be mostly stable but expect some bugs*

![App demo of Open-Konstructor](https://github.com/ief015/open-konstruktor/blob/main/app.png)

## Features

✅️ Realtime performance - simulate millions of Hz!  
✅️ Import/export designs with KOHCTPYKTOP compatibility  
✅️ Save designs and snippets in-game  
✅️ Improved controls such as selection rotating and flipping, undo history  
✅️ Design debugging tools: Pausing, stepping, looping, pause-on-error  
✅️ Original KOHCTPYKTOP level pack  
✅️ New tutorial levels  

## Work in progress

[Roadmap - Trello](https://trello.com/b/uPShETta)

The following features are planned:

### ✅️ Milestone 1
*Reimplementing circuit logic, design data compatibility*

### ✅️ Milestone 2
*UI for drawing circuits, running simulations, design verification*

### 🚧️ Milestone 3

*Custom levels, workspace UI features*

⬜️ UI Overhaul: support tabbed workspaces  
⬜️ Editable scope timings (Prerequisite for custom levels)  
⬜️ Custom levels and level packs  
⬜️ Graphical themes  

### Milestone 4

*Multi-circuit projects, finish Open-Kon. Level pack*

⬜️ Multi-circuit designs for simulating entire devices  
⬜️ Support multi-circuit levels  
⬜️ Open-Konstructor level pack  

## Setup

Install the dependencies:

```bash
npm install
```

## Development

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

Start Vitest unit test server:

```bash
npm test
```

Start Vitest benchmark server:

```bash
npm run bench
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```
