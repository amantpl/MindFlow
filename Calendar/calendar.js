// Calendar Class
class Calendar {
    constructor(taskManager) {
      this.taskManager = taskManager;
      this.currentDate = new Date();
      this.selectedDate = new Date();
    }
  
    renderMonth() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      let html = '<div class="month-grid">';
      
      // Add day headers
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      days.forEach(day => {
        html += `<div class="calendar-cell">${day}</div>`;
      });
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < firstDay.getDay(); i++) {
        html += '<div class="calendar-cell"></div>';
      }
      
      // Add days of the month
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        const tasks = this.taskManager.getTasksForDate(date);
        const isCurrentDay = this.isSameDay(date, new Date());
        
        html += `
          <div class="calendar-cell ${isCurrentDay ? 'current-day' : ''}" data-date="${date.toISOString()}">
            <div class="calendar-date">${day}</div>
            <div class="task-list">
              ${tasks.length > 0 ? `
                <div class="task-count">${tasks.length} task${tasks.length > 1 ? 's' : ''}</div>
                ${tasks.slice(0, 2).map(task => `
                  <div class="task-item" data-id="${task.id}">
                    <div class="task-time">${task.startTime}</div>
                    <div class="task-name">${task.name}</div>
                  </div>
                `).join('')}
                ${tasks.length > 2 ? `<div class="more-tasks">+${tasks.length - 2} more</div>` : ''}
              ` : ''}
            </div>
          </div>
        `;
      }
      
      html += '</div>';
      return html;
    }
  
    renderDay() {
      const tasks = this.taskManager.getTasksForDate(this.currentDate);
      tasks.sort((a, b) => a.startTime.localeCompare(b.startTime));
      
      let html = `
        <div class="day-view">
          <div class="day-header">
            ${this.currentDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div class="day-tasks">
      `;
      
      if (tasks.length === 0) {
        html += '<div class="no-tasks">No tasks scheduled for this day</div>';
      } else {
        tasks.forEach(task => {
          html += `
            <div class="task-item" data-id="${task.id}">
              <div class="task-time">${task.startTime} - ${task.endTime}</div>
              <div class="task-content">
                <div class="task-name">${task.name}</div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
              </div>
              <button class="delete-task-btn" data-id="${task.id}">×</button>
            </div>
          `;
        });
      }
      
      html += '</div></div>';
      return html;
    }
  
    renderWeek() {
      const startOfWeek = new Date(this.currentDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      
      let html = '<div class="week-view">';
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(date.getDate() + i);
        const tasks = this.taskManager.getTasksForDate(date);
        const isCurrentDay = this.isSameDay(date, new Date());
        
        html += `
          <div class="week-day ${isCurrentDay ? 'current-day' : ''}" data-date="${date.toISOString()}">
            <div class="week-date">
              <div class="day-name">${date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div class="date-number">${date.getDate()}</div>
            </div>
            <div class="week-tasks">
              ${tasks.length > 0 ? tasks.map(task => `
                <div class="task-item" data-id="${task.id}">
                  <div class="task-time">${task.startTime}</div>
                  <div class="task-name">${task.name}</div>
                  <button class="delete-task-btn" data-id="${task.id}">×</button>
                </div>
              `).join('') : '<div class="no-tasks">No tasks</div>'}
            </div>
          </div>
        `;
      }
      
      html += '</div>';
      return html;
    }
  
    isSameDay(date1, date2) {
      return date1.getDate() === date2.getDate() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getFullYear() === date2.getFullYear();
    }
  
    navigate(direction) {
      const currentView = document.querySelector('.view-button.active').dataset.view;
      
      switch (currentView) {
        case 'month':
          this.currentDate.setMonth(
            this.currentDate.getMonth() + (direction === 'next' ? 1 : -1)
          );
          break;
        case 'week':
          this.currentDate.setDate(
            this.currentDate.getDate() + (direction === 'next' ? 7 : -7)
          );
          break;
        case 'day':
          this.currentDate.setDate(
            this.currentDate.getDate() + (direction === 'next' ? 1 : -1)
          );
          break;
      }
      
      return this.render(currentView);
    }
  
    render(view = 'month') {
      switch (view) {
        case 'month':
          return this.renderMonth();
        case 'week':
          return this.renderWeek();
        case 'day':
          return this.renderDay();
        default:
          return this.renderMonth();
      }
    }
  }
  // TaskManager Class
  class TaskManager {
    constructor() {
      this.tasks = this.loadTasks();
    }
  
    loadTasks() {
      const savedTasks = localStorage.getItem('calendarTasks');
      return savedTasks ? JSON.parse(savedTasks) : [];
    }
  
    saveTasks() {
      localStorage.setItem('calendarTasks', JSON.stringify(this.tasks));
    }
  
    addTask(task) {
      task.id = Date.now().toString();
      
      // Generate tasks for each day in the date range
      const startDate = new Date(task.startDate);
      const endDate = new Date(task.endDate);
      const currentDate = new Date(startDate);
  
      while (currentDate <= endDate) {
        const taskForDay = {
          ...task,
          id: Date.now().toString() + '-' + currentDate.toISOString().split('T')[0],
          date: currentDate.toISOString().split('T')[0]
        };
        this.tasks.push(taskForDay);
        currentDate.setDate(currentDate.getDate() + 1);
      }
  
      this.saveTasks();
      return task;
    }
  
    updateTask(taskId, updatedTask) {
      const task = this.getTask(taskId);
      if (!task) return false;
  
      const baseId = taskId.split('-')[0];
      this.tasks = this.tasks.filter(t => !t.id.startsWith(baseId));
  
      this.addTask(updatedTask);
      return true;
    }
  
    deleteTask(taskId) {
      const task = this.getTask(taskId);
      if (!task) return false;
  
      const baseId = taskId.split('-')[0];
      this.tasks = this.tasks.filter(t => !t.id.startsWith(baseId));
      this.saveTasks();
      return true;
    }
  
    getTasksForDate(date) {
      const dateString = new Date(date).toISOString().split('T')[0];
      return this.tasks.filter(task => task.date === dateString);
    }
  
    getTask(taskId) {
      return this.tasks.find(task => task.id === taskId);
    }
  }
  // ThemeManager Class
  class ThemeManager {
    constructor() {
      this.theme = localStorage.getItem('theme') || 'light';
    }
  
    initialize() {
      this.applyTheme();
      this.updateToggleButton();
    }
  
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', this.theme);
      this.applyTheme();
      this.updateToggleButton();
    }
  
    applyTheme() {
      document.documentElement.setAttribute('data-theme', this.theme);
    }
  
    updateToggleButton() {
      const button = document.getElementById('darkModeToggle');
    }
  }
  
  //ViewManager Class 
  class ViewManager {
    constructor(calendar, taskManager) {
      this.calendar = calendar;
      this.taskManager = taskManager;
      this.currentView = 'month';
    }
  
    initialize() {
      this.render();
      this.setupTaskListeners();
    }
  
    switchView(view) {
      this.currentView = view;
      document.querySelectorAll('.view-button').forEach(button => {
        button.classList.toggle('active', button.dataset.view === view);
      });
      this.render();
    }
  
    navigate(direction) {
      const calendarView = document.getElementById('calendarView');
      calendarView.innerHTML = this.calendar.navigate(direction);
      this.updateDateDisplay();
      this.setupTaskListeners();
    }
  
    render() {
      const calendarView = document.getElementById('calendarView');
      calendarView.innerHTML = this.calendar.render(this.currentView);
      this.updateDateDisplay();
      this.setupTaskListeners();
    }
  
    updateDateDisplay() {
      const dateDisplay = document.getElementById('currentDate');
      const options = {
        month: 'long',
        year: 'numeric'
      };
      
      if (this.currentView === 'day') {
        options.day = 'numeric';
      }
      
      dateDisplay.textContent = this.calendar.currentDate.toLocaleDateString('en-US', options);
    }
  
    setupTaskListeners() {
      // Task click listeners for editing
      document.querySelectorAll('.task-item').forEach(task => {
        task.addEventListener('click', (e) => {
          if (e.target.classList.contains('delete-task-btn')) {
            e.stopPropagation();
            const taskId = e.target.dataset.id;
            this.taskManager.deleteTask(taskId);
            this.render();
          } else {
            const taskId = e.target.closest('.task-item').dataset.id;
            this.openTaskModal(taskId);
          }
        });
      });
  
      // Date click listeners for adding new tasks
      document.querySelectorAll('.calendar-cell, .week-day').forEach(cell => {
        cell.addEventListener('click', (e) => {
          if (e.target.closest('.task-item')) return;
          const date = new Date(e.target.closest('[data-date]').dataset.date);
          this.openTaskModal(null, date);
        });
      });
  
      // Cancel button
      const cancelButton = document.getElementById('cancelTask');
      if (cancelButton) {
        cancelButton.addEventListener('click', () => {
          this.closeTaskModal();
        });
      }
  
      // Delete task button in modal
      const deleteButton = document.getElementById('deleteTask');
      if (deleteButton) {
        deleteButton.addEventListener('click', () => {
          const taskId = document.getElementById('taskId').value;
          if (taskId) {
            this.taskManager.deleteTask(taskId);
            this.closeTaskModal();
            this.render();
          }
        });
      }
    }
  
    openTaskModal(taskId = null, date = null) {
      const modal = document.getElementById('taskModal');
      const form = document.getElementById('taskForm');
      const modalTitle = document.getElementById('modalTitle');
      const deleteButton = document.getElementById('deleteTask');
  
      if (taskId) {
        const task = this.taskManager.getTask(taskId);
        modalTitle.textContent = 'Edit Task';
        this.populateTaskForm(task);
        deleteButton.style.display = 'block';
      } else {
        modalTitle.textContent = 'Add Task';
        form.reset();
        if (date) {
          const currentTime = new Date();
          const hours = currentTime.getHours().toString().padStart(2, '0');
          const minutes = currentTime.getMinutes().toString().padStart(2, '0');
          
          const dateString = date.toISOString().split('T')[0];
          document.getElementById('taskStartDate').value = dateString;
          document.getElementById('taskEndDate').value = dateString;
          
          document.getElementById('taskStartTime').value = `${hours}:${minutes}`;
          const endHour = (currentTime.getHours() + 1) % 24;
          document.getElementById('taskEndTime').value = `${endHour.toString().padStart(2, '0')}:${minutes}`;
        }
        deleteButton.style.display = 'none';
      }
  
      modal.classList.add('active');
    }
  
    closeTaskModal() {
      const modal = document.getElementById('taskModal');
      modal.classList.remove('active');
    }
  
    populateTaskForm(task) {
      document.getElementById('taskId').value = task.id;
      document.getElementById('taskStartDate').value = task.startDate;
      document.getElementById('taskEndDate').value = task.endDate;
      document.getElementById('taskName').value = task.name;
      document.getElementById('taskStartTime').value = task.startTime;
      document.getElementById('taskEndTime').value = task.endTime;
      document.getElementById('taskDescription').value = task.description || '';
    }
  
    handleTaskSubmit() {
      const form = document.getElementById('taskForm');
      const taskId = document.getElementById('taskId').value;
      
      const taskData = {
        startDate: document.getElementById('taskStartDate').value,
        endDate: document.getElementById('taskEndDate').value,
        name: document.getElementById('taskName').value,
        startTime: document.getElementById('taskStartTime').value,
        endTime: document.getElementById('taskEndTime').value,
        description: document.getElementById('taskDescription').value
      };
  
      if (taskId) {
        this.taskManager.updateTask(taskId, taskData);
      } else {
        this.taskManager.addTask(taskData);
      }
  
      this.closeTaskModal();
      this.render();
    }
  }
  
  // Initialize managers
  const taskManager = new TaskManager();
  const themeManager = new ThemeManager();
  const calendar = new Calendar(taskManager);
  const viewManager = new ViewManager(calendar, taskManager);
  
  // Start the application
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    themeManager.initialize();
    
    // Initialize calendar view
    viewManager.initialize();
    
    // Set up event listeners
    setupEventListeners(viewManager);
  });
  
  function setupEventListeners(viewManager) {
    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('click', () => {
        themeManager.toggleTheme();
      });
    }
  
    // View switching
    document.querySelectorAll('.view-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const view = e.target.dataset.view;
        viewManager.switchView(view);
      });
    });
  
    // Navigation
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    
    if (prevButton) {
      prevButton.addEventListener('click', () => {
        viewManager.navigate('prev');
      });
    }
    
    if (nextButton) {
      nextButton.addEventListener('click', () => {
        viewManager.navigate('next');
      });
    }
  
    // Task form submission
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
      taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        viewManager.handleTaskSubmit();
      });
    }
  }