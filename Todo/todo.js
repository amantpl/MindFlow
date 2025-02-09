// Task management
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentTaskId = null;

// DOM Elements
const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const addTaskBtn = document.getElementById('addTask');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('searchInput');
const filterPriority = document.getElementById('filterPriority');
const filterStatus = document.getElementById('filterStatus');
const progressFill = document.getElementById('progressFill');
const notification = document.getElementById('notification');
const themeToggle = document.getElementById('themeToggle');

// Theme management
const theme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', theme);

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});

// Event Listeners
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask();
});
searchInput.addEventListener('input', filterTasks);
filterPriority.addEventListener('change', filterTasks);
filterStatus.addEventListener('change', filterTasks);

// Add new task
function addTask() {
  const taskName = taskInput.value.trim();
  if (!taskName) return;

  const task = {
    id: Date.now(),
    name: taskName,
    priority: prioritySelect.value,
    completed: false,
    createdAt: new Date()
  };

  tasks.push(task);
  saveTasks();
  renderTasks();
  showNotification('Task added successfully');
  taskInput.value = '';
}

// Render tasks
function renderTasks() {
  const filteredTasks = getFilteredTasks();
  taskList.innerHTML = '';

  filteredTasks.forEach(task => {
    const taskElement = createTaskElement(task);
    taskList.appendChild(taskElement);
  });

  updateProgress();
}

// Create task element
function createTaskElement(task) {
  const taskCard = document.createElement('div');
  taskCard.className = `task-card ${task.completed ? 'completed' : ''}`;
  taskCard.draggable = true;
  taskCard.dataset.taskId = task.id;

  taskCard.innerHTML = `
    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
    <div class="task-content">
      <div class="task-name">${task.name}</div>
      <span class="priority-badge priority-${task.priority}">${task.priority}</span>
    </div>
    <div class="task-actions">
      <button class="edit-btn" aria-label="Edit task">✏️</button>
      <button class="delete-btn" aria-label="Delete task">🗑️</button>
    </div>
  `;

  // Checkbox event
  taskCard.querySelector('.task-checkbox').addEventListener('change', (e) => {
    toggleTaskComplete(task.id);
  });

  // Edit and delete events
  taskCard.querySelector('.edit-btn').addEventListener('click', () => {
    editTask(task.id);
  });
  
  taskCard.querySelector('.delete-btn').addEventListener('click', () => {
    deleteTask(task.id);
  });

  // Drag and drop events
  taskCard.addEventListener('dragstart', handleDragStart);
  taskCard.addEventListener('dragend', handleDragEnd);
  taskCard.addEventListener('dragover', handleDragOver);
  taskCard.addEventListener('drop', handleDrop);

  return taskCard;
}

// Filter tasks
function getFilteredTasks() {
  const searchTerm = searchInput.value.toLowerCase();
  const priorityFilter = filterPriority.value;
  const statusFilter = filterStatus.value;

  return tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm);
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'completed' ? task.completed : !task.completed);

    return matchesSearch && matchesPriority && matchesStatus;
  });
}

function filterTasks() {
  renderTasks();
}

// Task actions
function toggleTaskComplete(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    showNotification(task.completed ? 'Task completed!' : 'Task uncompleted');
  }
}

function editTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  currentTaskId = taskId;
  const editModal = document.getElementById('editModal');
  const editTaskInput = document.getElementById('editTaskInput');
  const saveEditBtn = document.getElementById('saveEditBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');

  editTaskInput.value = task.name;
  editModal.classList.add('show');

  const handleSave = () => {
    const newName = editTaskInput.value.trim();
    if (newName) {
      task.name = newName;
      saveTasks();
      renderTasks();
      showNotification('Task updated successfully');
    }
    closeEditModal();
  };

  const handleCancel = () => {
    closeEditModal();
  };

  const handleKeydown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  saveEditBtn.addEventListener('click', handleSave);
  cancelEditBtn.addEventListener('click', handleCancel);
  editTaskInput.addEventListener('keydown', handleKeydown);

  editTaskInput.focus();

  function closeEditModal() {
    editModal.classList.remove('show');
    saveEditBtn.removeEventListener('click', handleSave);
    cancelEditBtn.removeEventListener('click', handleCancel);
    editTaskInput.removeEventListener('keydown', handleKeydown);
    currentTaskId = null;
  }
}

function deleteTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  currentTaskId = taskId;
  const deleteModal = document.getElementById('deleteModal');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

  deleteModal.classList.add('show');

  const handleConfirm = () => {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
    renderTasks();
    showNotification('Task deleted successfully');
    closeDeleteModal();
  };

  const handleCancel = () => {
    closeDeleteModal();
  };

  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  confirmDeleteBtn.addEventListener('click', handleConfirm);
  cancelDeleteBtn.addEventListener('click', handleCancel);
  document.addEventListener('keydown', handleKeydown);

  function closeDeleteModal() {
    deleteModal.classList.remove('show');
    confirmDeleteBtn.removeEventListener('click', handleConfirm);
    cancelDeleteBtn.removeEventListener('click', handleCancel);
    document.removeEventListener('keydown', handleKeydown);
    currentTaskId = null;
  }
}

// Drag and drop functionality
let draggedTask = null;

function handleDragStart(e) {
  draggedTask = e.target;
  e.target.classList.add('dragging');
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop(e) {
  e.preventDefault();
  const dropTarget = e.target.closest('.task-card');
  if (dropTarget && draggedTask !== dropTarget) {
    const allTasks = [...taskList.querySelectorAll('.task-card')];
    const draggedIndex = allTasks.indexOf(draggedTask);
    const droppedIndex = allTasks.indexOf(dropTarget);

    if (draggedIndex !== -1 && droppedIndex !== -1) {
      const [movedTask] = tasks.splice(draggedIndex, 1);
      tasks.splice(droppedIndex, 0, movedTask);
      saveTasks();
      renderTasks();
    }
  }
}

// Progress bar
function updateProgress() {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const progress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
  progressFill.style.width = `${progress}%`;
}

// Notifications
function showNotification(message) {
  notification.textContent = message;
  notification.classList.add('show');
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Local storage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Initial render
renderTasks();