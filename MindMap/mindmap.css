* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --bg-color: #f8f9fa;
    --text-color: #2c3e50;
    --node-bg: #ffffff;
    --node-border: #3498db;
    --toolbar-bg: #ffffff;
    --toolbar-border: #e9ecef;
    --hover-bg: #f8f9fa;
    --central-node-bg: linear-gradient(135deg, #3498db, #2980b9);
    --central-node-text: #ffffff;
    --connection-color: #95a5a6;
    --shadow-color: rgba(0,0,0,0.1);
    --editing-border: #2ecc71;
    --button-hover: #e9ecef;
    --saved-maps-bg: #ffffff;
    --saved-maps-border: #dee2e6;
}

[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #ecf0f1;
    --node-bg: #2d2d2d;
    --node-border: #3498db;
    --toolbar-bg: #2d2d2d;
    --toolbar-border: #404040;
    --hover-bg: #3d3d3d;
    --central-node-bg: linear-gradient(135deg, #3498db, #2980b9);
    --central-node-text: #ffffff;
    --connection-color: #95a5a6;
    --shadow-color: rgba(0,0,0,0.3);
    --editing-border: #2ecc71;
    --button-hover: #404040;
    --saved-maps-bg: #2d2d2d;
    --saved-maps-border: #404040;
}

body {
    font-family: 'Segoe UI', sans-serif;
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s, color 0.3s;
}
#not{
    padding-top: 80px;
  }

.toolbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    margin-top: 80px;
    padding: 15px;
    background-color: var(--toolbar-bg);
    box-shadow: 0 2px 8px var(--shadow-color);
    display: flex;
    gap: 15px;
    align-items: center;
    justify-content: space-between;
}

.text-controls {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 0 15px;
    border-left: 2px solid var(--toolbar-border);
    border-right: 2px solid var(--toolbar-border);
}

.toolbar-group {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 0 15px;
    border-right: 2px solid var(--toolbar-border);
}

button {
    padding: 8px 15px;
    border: 1px solid var(--toolbar-border);
    background: var(--node-bg);
    color: var(--text-color);
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 5px;
}

button:hover {
    background: var(--button-hover);
    transform: translateY(-1px);
}

button.active {
    background: var(--node-border);
    color: white;
}

select, input[type="color"] {
    padding: 6px;
    border: 1px solid var(--toolbar-border);
    border-radius: 6px;
    background: var(--node-bg);
    color: var(--text-color);
}

.theme-toggle {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 8px;
}

.canvas-container {
    margin-top: 70px;
    position: relative;
    width: 100%;
    height: calc(100vh - 70px);
    overflow: auto;
    cursor: grab;
}

.canvas-container.panning {
    cursor: grabbing;
}

#connectionCanvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

#mindMapContainer {
    position: relative;
    min-height: 100%;
    padding: 20px;
}

.node {
    position: absolute;
    background: var(--node-bg);
    border: 2px solid var(--node-border);
    border-radius: 12px;
    padding: 12px 20px;
    min-width: 150px;
    cursor: move;
    user-select: none;
    box-shadow: 0 4px 6px var(--shadow-color);
    transition: all 0.2s ease;
}

.node:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px var(--shadow-color);
}

.node.central {
    background: var(--central-node-bg);
    color: var(--central-node-text);
    font-weight: bold;
    box-shadow: 0 6px 12px var(--shadow-color);
}

.node-controls {
    display: none;
    position: absolute;
    right: -110px;
    top: 50%;
    transform: translateY(-50%);
    background: var(--node-bg);
    border: 1px solid var(--toolbar-border);
    border-radius: 8px;
    padding: 8px;
    gap: 8px;
    box-shadow: 0 4px 6px var(--shadow-color);
}

.node:hover .node-controls {
    display: flex;
    flex-direction: column;
}

.node-control-button {
    width: 90px;
    height: 32px;
    padding: 5px;
    border: 1px solid var(--toolbar-border);
    background: var(--node-bg);
    color: var(--text-color);
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
}

.node-control-button i {
    font-size: 14px;
}

.node-control-button:hover {
    background: var(--hover-bg);
}

.node.editing {
    border-color: var(--editing-border);
    box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.2);
}

.node-content {
    min-height: 20px;
    outline: none;
    line-height: 1.4;
}

.saved-maps {
    position: fixed;
    top: 70px;
    right: 20px;
    background: var(--saved-maps-bg);
    border: 1px solid var(--saved-maps-border);
    border-radius: 8px;
    padding: 15px;
    width: 250px;
    max-height: calc(100vh - 100px);
    overflow-y: auto;
    box-shadow: 0 4px 6px var(--shadow-color);
    z-index: 1000;
    display: none;
}

.saved-maps.show {
    display: block;
}

.saved-maps h3 {
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--saved-maps-border);
}

.saved-map-item {
    padding: 8px;
    border: 1px solid var(--saved-maps-border);
    border-radius: 4px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.saved-map-item:hover {
    background: var(--hover-bg);
}

.saved-map-item .title {
    font-weight: 500;
    margin-bottom: 4px;
}

.saved-map-item .date {
    font-size: 12px;
    color: var(--text-color);
    opacity: 0.7;
}