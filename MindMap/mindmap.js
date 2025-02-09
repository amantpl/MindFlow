// MindMap Class
class MindMap {
    constructor() {
        this.nodes = new Map();
        this.nextId = 1;
        this.selectedNode = null;
        this.draggedNode = null;
        this.dragOffset = { x: 0, y: 0 };
        this.isPanning = false;
        this.lastPanPosition = { x: 0, y: 0 };
        
        // canvas container
        this.container = document.getElementById('mindMapContainer');
        this.canvas = document.getElementById('connectionCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvasContainer = document.querySelector('.canvas-container');
        
        this.initializeEventListeners();
        this.resizeCanvas();
        this.loadThemePreference();
        this.setupPanTool();
        this.setupSavedMaps();
    }

    initializeEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        document.getElementById('createNewMap').addEventListener('click', () => this.createNewMap());
        document.getElementById('saveMap').addEventListener('click', () => this.saveMap());
        document.getElementById('savedMapsBtn').addEventListener('click', () => this.toggleSavedMaps());
        document.getElementById('toggleTheme').addEventListener('click', () => this.toggleTheme());
        
        // Text formatting controls
        document.querySelectorAll('[data-command]').forEach(button => {
            button.addEventListener('click', (e) => {
                if (this.selectedNode) {
                    const command = e.target.closest('button').dataset.command;
                    document.execCommand(command, false, null);
                    button.classList.toggle('active');
                }
            });
        });

        document.getElementById('fontSize').addEventListener('change', (e) => {
            if (this.selectedNode) {
                this.selectedNode.querySelector('.node-content').style.fontSize = e.target.value;
            }
        });

        document.getElementById('fontFamily').addEventListener('change', (e) => {
            if (this.selectedNode) {
                this.selectedNode.querySelector('.node-content').style.fontFamily = e.target.value;
            }
        });

        document.getElementById('textColor').addEventListener('input', (e) => {
            if (this.selectedNode) {
                this.selectedNode.querySelector('.node-content').style.color = e.target.value;
            }
        });
    }

    setupPanTool() {
        const panTool = document.getElementById('panTool');
        
        panTool.addEventListener('click', () => {
            panTool.classList.toggle('active');
            this.canvasContainer.classList.toggle('panning');
        });

        this.canvasContainer.addEventListener('mousedown', (e) => {
            if (panTool.classList.contains('active')) {
                this.isPanning = true;
                this.lastPanPosition = { x: e.clientX, y: e.clientY };
            }
        });

        this.canvasContainer.addEventListener('mousemove', (e) => {
            if (this.isPanning) {
                const dx = e.clientX - this.lastPanPosition.x;
                const dy = e.clientY - this.lastPanPosition.y;
                
                this.canvasContainer.scrollLeft -= dx;
                this.canvasContainer.scrollTop -= dy;
                
                this.lastPanPosition = { x: e.clientX, y: e.clientY };
            }
        });

        document.addEventListener('mouseup', () => {
            this.isPanning = false;
        });
    }

    setupSavedMaps() {
        const savedMaps = document.querySelector('.saved-maps');
        const savedMapsList = document.getElementById('savedMapsList');

        this.updateSavedMapsList();
    }

    updateSavedMapsList() {
        const savedMapsList = document.getElementById('savedMapsList');
        savedMapsList.innerHTML = '';
        
        const maps = this.getSavedMaps();
        maps.forEach(map => {
            const mapItem = document.createElement('div');
            mapItem.className = 'saved-map-item';
            mapItem.innerHTML = `
                <div class="title">${map.title}</div>
                <div class="date">${new Date(map.date).toLocaleDateString()}</div>
            `;
            mapItem.addEventListener('click', () => this.loadMap(map.id));
            savedMapsList.appendChild(mapItem);
        });
    }

    toggleSavedMaps() {
        const savedMaps = document.querySelector('.saved-maps');
        savedMaps.classList.toggle('show');
        this.updateSavedMapsList();
    }
    
// Saved Maps
    getSavedMaps() {
        const maps = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('mindmap_')) {
                const map = JSON.parse(localStorage.getItem(key));
                maps.push({
                    id: key.replace('mindmap_', ''),
                    title: map.title || 'Untitled Map',
                    date: map.date || new Date().toISOString()
                });
            }
        }
        return maps.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    loadThemePreference() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
    }
// Dark Mode Change (Toggle)
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    resizeCanvas() {
        this.canvas.width = this.container.offsetWidth;
        this.canvas.height = this.container.offsetHeight;
        this.drawConnections();
    }

    createNewMap() {
        this.container.innerHTML = '';
        this.nodes.clear();
        this.nextId = 1;
        this.createNode(null, this.container.offsetWidth / 2, 100, true);
        this.drawConnections();
    }
// Create Node
    createNode(parentId, x, y, isCentral = false) {
        const node = document.createElement('div');
        const id = this.nextId++;
        
        node.className = `node ${isCentral ? 'central' : ''}`;
        node.dataset.id = id;
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        
        node.innerHTML = `
            <div class="node-content" contenteditable="true">New Node</div>
            <div class="node-controls">
                <button class="node-control-button" data-action="child">
                    <i class="fas fa-plus"></i> Add Child
                </button>
                <button class="node-control-button" data-action="sibling">
                    <i class="fas fa-arrow-right"></i> Add Sibling
                </button>
                <button class="node-control-button" data-action="childRight">
                    <i class="fas fa-arrow-right"></i> Child Right
                </button>
                <button class="node-control-button" data-action="childLeft">
                    <i class="fas fa-arrow-left"></i> Child Left
                </button>
            </div>
        `;

        this.nodes.set(id, { element: node, parentId, children: [] });
        this.container.appendChild(node);

        if (parentId !== null) {
            const parent = this.nodes.get(parentId);
            if (parent) {
                parent.children.push(id);
            }
        }

        this.setupNodeEvents(node);
        return node;
    }

    setupNodeEvents(node) {
        const content = node.querySelector('.node-content');
        
        content.addEventListener('focus', () => {
            this.selectedNode = node;
            node.classList.add('editing');
        });

        content.addEventListener('blur', () => {
            node.classList.remove('editing');
        });

        node.addEventListener('mousedown', (e) => {
            if (document.getElementById('panTool').classList.contains('active')) {
                return;
            }

            if (e.target.classList.contains('node-control-button')) {
                const action = e.target.dataset.action;
                const parentNode = node.getBoundingClientRect();
                const nodeId = parseInt(node.dataset.id);
                const currentNode = this.nodes.get(nodeId);
                
                if (!currentNode) return;
                
                const childrenCount = currentNode.children.length;
                
                switch(action) {
                    case 'child':
                        this.createNode(nodeId, 
                            parentNode.left + parentNode.width + 150, 
                            parentNode.top + childrenCount * 80);
                        break;
                    case 'childRight':
                        this.createNode(nodeId,
                            parentNode.left + parentNode.width + 150,
                            parentNode.top + childrenCount * 80);
                        break;
                    case 'childLeft':
                        this.createNode(nodeId,
                            parentNode.left - 150,
                            parentNode.top + childrenCount * 80);
                        break;
                    case 'sibling':
                        if (currentNode.parentId !== null) {
                            const parent = this.nodes.get(currentNode.parentId);
                            if (parent) {
                                this.createNode(currentNode.parentId,
                                    parentNode.left,
                                    parentNode.top + 100);
                            }
                        }
                        break;
                }
                this.drawConnections();
                return;
            }

            this.draggedNode = node;
            const rect = node.getBoundingClientRect();
            this.dragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        });

        document.addEventListener('mousemove', (e) => {
            if (this.draggedNode && !document.getElementById('panTool').classList.contains('active')) {
                const x = e.clientX - this.dragOffset.x;
                const y = e.clientY - this.dragOffset.y;
                
                this.draggedNode.style.left = `${x}px`;
                this.draggedNode.style.top = `${y}px`;
                this.drawConnections();
            }
        });

        document.addEventListener('mouseup', () => {
            this.draggedNode = null;
        });
    }

    drawConnections() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--connection-color');
        this.ctx.lineWidth = 2;

        this.nodes.forEach((node, id) => {
            if (node.parentId !== null) {
                const parent = this.nodes.get(node.parentId);
                if (!parent) return;
                
                const parentRect = parent.element.getBoundingClientRect();
                const childRect = node.element.getBoundingClientRect();
                const containerRect = this.container.getBoundingClientRect();

                const startX = parentRect.left + parentRect.width / 2 - containerRect.left;
                const startY = parentRect.top + parentRect.height / 2 - containerRect.top;
                const endX = childRect.left + childRect.width / 2 - containerRect.left;
                const endY = childRect.top + childRect.height / 2 - containerRect.top;

                this.ctx.beginPath();
                this.ctx.moveTo(startX, startY);
                this.ctx.bezierCurveTo(
                    startX + (endX - startX) / 2, startY,
                    startX + (endX - startX) / 2, endY,
                    endX, endY
                );
                this.ctx.stroke();
            }
        });
    }

    saveMap() {
        const title = this.nodes.get(1)?.element.querySelector('.node-content').innerHTML || 'Untitled Map';
        const data = {
            title,
            date: new Date().toISOString(),
            nodes: Array.from(this.nodes.entries()).map(([id, node]) => ({
                id,
                parentId: node.parentId,
                content: node.element.querySelector('.node-content').innerHTML,
                position: {
                    x: parseInt(node.element.style.left),
                    y: parseInt(node.element.style.top)
                },
                style: {
                    fontSize: node.element.querySelector('.node-content').style.fontSize,
                    fontFamily: node.element.querySelector('.node-content').style.fontFamily,
                    color: node.element.querySelector('.node-content').style.color
                }
            }))
        };
        
        const mapId = `mindmap_${Date.now()}`;
        localStorage.setItem(mapId, JSON.stringify(data));
        this.updateSavedMapsList();
    }

    loadMap(id) {
        const data = JSON.parse(localStorage.getItem(`mindmap_${id}`));
        if (!data) return;

        this.container.innerHTML = '';
        this.nodes.clear();
        this.nextId = 1;

        data.nodes.forEach(nodeData => {
            const node = this.createNode(nodeData.parentId, nodeData.position.x, nodeData.position.y);
            const content = node.querySelector('.node-content');
            content.innerHTML = nodeData.content;
            Object.assign(content.style, nodeData.style);
        });

        this.drawConnections();
        document.querySelector('.saved-maps').classList.remove('show');
    }
}

// Initialize the mind map
const mindMap = new MindMap();
mindMap.createNewMap();