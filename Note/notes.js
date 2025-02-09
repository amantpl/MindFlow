// NotesApp Class
class NotesApp {
    constructor() {
      this.notes = JSON.parse(localStorage.getItem('notes')) || [];
      this.currentNoteId = null;
      this.isDarkMode = localStorage.getItem('darkMode') === 'true';
      this.setupEventListeners();
      this.renderNotes();
      this.applyTheme();
    }
  
    setupEventListeners() {
      // Theme toggle
      document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
  
      // Add note button
      document.getElementById('add-note-btn').addEventListener('click', () => this.openNoteModal());
  
      // Save note
      document.getElementById('save-note').addEventListener('click', () => this.saveNote());
  
      // Close modals
      document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => this.closeModals());
      });
  
      // Search
      document.getElementById('search').addEventListener('input', (e) => this.searchNotes(e.target.value));
  
      // Rich text editor toolbar
      document.querySelectorAll('.toolbar button').forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const command = button.dataset.command;
          document.execCommand(command, false, null);
          document.getElementById('note-content').focus();
        });
      });
  
      // Image upload
      document.getElementById('image-input').addEventListener('change', (e) => this.handleImageUpload(e));
  
      // Delete confirmation
      document.getElementById('confirm-delete').addEventListener('click', () => this.deleteNote());
      document.getElementById('cancel-delete').addEventListener('click', () => this.closeModals());
    }
  
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem('darkMode', this.isDarkMode);
      this.applyTheme();
    }
  
    applyTheme() {
      document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
    }
  
    openNoteModal(noteId = null) {
      this.currentNoteId = noteId;
      const modal = document.getElementById('note-modal');
      const titleInput = document.getElementById('note-title');
      const contentDiv = document.getElementById('note-content');
  
      if (noteId) {
        const note = this.notes.find(n => n.id === noteId);
        titleInput.value = note.title;
        contentDiv.innerHTML = note.content;
      } else {
        titleInput.value = '';
        contentDiv.innerHTML = '';
      }
  
      modal.classList.add('active');
    }
  
    closeModals() {
      document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
      });
    }
  
    async handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.src = e.target.result;
          img.style.maxWidth = '100%';
          document.getElementById('note-content').appendChild(img);
        };
        reader.readAsDataURL(file);
      }
    }
  
    saveNote() {
      const title = document.getElementById('note-title').value;
      const content = document.getElementById('note-content').innerHTML;
  
      if (!title.trim()) {
        alert('Please enter a title');
        return;
      }
  
      if (this.currentNoteId) {
        const index = this.notes.findIndex(n => n.id === this.currentNoteId);
        this.notes[index] = { ...this.notes[index], title, content };
      } else {
        this.notes.unshift({
          id: Date.now().toString(),
          title,
          content,
          createdAt: new Date().toISOString()
        });
      }
  
      this.saveToLocalStorage();
      this.renderNotes();
      this.closeModals();
    }
  
    confirmDelete(noteId) {
      this.currentNoteId = noteId;
      document.getElementById('delete-modal').classList.add('active');
    }
  
    deleteNote() {
      this.notes = this.notes.filter(note => note.id !== this.currentNoteId);
      this.saveToLocalStorage();
      this.renderNotes();
      this.closeModals();
    }
  
    searchNotes(query) {
      const filteredNotes = this.notes.filter(note => {
        const searchText = `${note.title} ${note.content}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
      });
      this.renderNotes(filteredNotes);
    }
  
    renderNotes(notesToRender = this.notes) {
      const container = document.getElementById('notes-container');
      container.innerHTML = notesToRender.map(note => `
        <div class="note-card" data-id="${note.id}">
          <div class="note-header">
            <h3 class="note-title">${note.title}</h3>
            <div class="note-actions">
              <button onclick="app.openNoteModal('${note.id}')" title="Edit">✏️</button>
              <button onclick="app.confirmDelete('${note.id}')" title="Delete">🗑️</button>
            </div>
          </div>
          <div class="note-content">${note.content}</div>
        </div>
      `).join('');
    }
  
    saveToLocalStorage() {
      try {
        localStorage.setItem('notes', JSON.stringify(this.notes));
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          alert('Storage limit reached. Please delete some notes to add new ones.');
        }
      }
    }
  }
  
  // Initialize the app
  window.app = new NotesApp();