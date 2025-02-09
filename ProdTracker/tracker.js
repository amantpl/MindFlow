// Theme Management
const themeToggle = document.getElementById('themeToggle');
let isDarkMode = false;

// Check and apply the default theme
function applyDefaultTheme() {
    // Check if a preference exists in localStorage
    const storedTheme = localStorage.getItem('theme');
    
    if (storedTheme) {
        // Apply the stored theme
        isDarkMode = storedTheme === 'dark';
    } else {
        // Detect system preference for dark mode
        isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // Apply the theme
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
}

// Toggle theme and store the preference
function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');

    // Save the preference in localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

// Event listener for theme toggle
themeToggle.addEventListener('click', toggleTheme);

// Apply the default theme on page load
applyDefaultTheme();


// Time Slots Generation
const timeSlots = [];
for (let hour = 4; hour < 28; hour++) {
    const displayHour = hour % 24;
    const startTime = `${displayHour.toString().padStart(2, '0')}:00`;
    const endTime = `${((displayHour + 1) % 24).toString().padStart(2, '0')}:00`;
    timeSlots.push(`${startTime}-${endTime}`);
}

// Initialize Task Table
function initializeTaskTable() {
    const tbody = document.getElementById('taskTableBody');
    timeSlots.forEach(slot => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${slot}</td>
            <td><input type="text" class="task-input" placeholder="Enter task..."></td>
            <td>
                <select class="urgent-select">
                    <option value="">Select...</option>
                    <option value="Y">Y</option>
                    <option value="N">N</option>
                </select>
            </td>
            <td>
                <select class="important-select">
                    <option value="">Select...</option>
                    <option value="Y">Y</option>
                    <option value="N">N</option>
                </select>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Calculate Productivity Score
function calculateProductivity() {
    const rows = document.querySelectorAll('#taskTableBody tr');
    let totalTasks = 0;
    let weightedScore = 0;
    let matrix = {
        urgentImportant: 0,
        urgentNotImportant: 0,
        notUrgentImportant: 0,
        notUrgentNotImportant: 0
    };
    let urgentCount = { Y: 0, N: 0 };
    let importantCount = { Y: 0, N: 0 };

    rows.forEach(row => {
        const task = row.querySelector('.task-input').value;
        const urgent = row.querySelector('.urgent-select').value;
        const important = row.querySelector('.important-select').value;

        if (task && urgent && important) {
            totalTasks++;
            
            // Update counts
            urgentCount[urgent]++;
            importantCount[important]++;

            // Calculate weighted score
            if (urgent === 'Y' && important === 'Y') {
                weightedScore += 3;
                matrix.urgentImportant++;
            } else if (urgent === 'N' && important === 'Y') {
                weightedScore += 2;
                matrix.notUrgentImportant++;
            } else if (urgent === 'Y' && important === 'N') {
                weightedScore += 1;
                matrix.urgentNotImportant++;
            } else {
                matrix.notUrgentNotImportant++;
            }
        }
    });

    // Update productivity score
    const maxPossibleScore = totalTasks * 3;
    const productivityPercentage = totalTasks ? Math.round((weightedScore / maxPossibleScore) * 100) : 0;
    document.getElementById('productivityScore').textContent = `${productivityPercentage}%`;
    document.querySelector('.circle').style.background = 
        `conic-gradient(var(--primary-color) ${productivityPercentage}%, #2c2c2c ${productivityPercentage}%)`;

    // Update matrix percentages
    const updateMatrixCell = (selector, value) => {
        const percentage = totalTasks ? Math.round((value / totalTasks) * 100) : 0;
        document.querySelector(selector).textContent = `${percentage}%`;
    };

    updateMatrixCell('.urgent-important .percentage', matrix.urgentImportant);
    updateMatrixCell('.urgent-not-important .percentage', matrix.urgentNotImportant);
    updateMatrixCell('.not-urgent-important .percentage', matrix.notUrgentImportant);
    updateMatrixCell('.not-urgent-not-important .percentage', matrix.notUrgentNotImportant);

    // Update summary
    document.getElementById('totalHours').textContent = totalTasks;
    document.getElementById('urgentYes').textContent = 
        `${totalTasks ? Math.round((urgentCount.Y / totalTasks) * 100) : 0}%`;
    document.getElementById('urgentNo').textContent = 
        `${totalTasks ? Math.round((urgentCount.N / totalTasks) * 100) : 0}%`;
    document.getElementById('importantYes').textContent = 
        `${totalTasks ? Math.round((importantCount.Y / totalTasks) * 100) : 0}%`;
    document.getElementById('importantNo').textContent = 
        `${totalTasks ? Math.round((importantCount.N / totalTasks) * 100) : 0}%`;
}

// Save Data
function saveData() {
    const rows = document.querySelectorAll('#taskTableBody tr');
    const tasks = [];

    rows.forEach(row => {
        tasks.push({
            timeSlot: row.cells[0].textContent,
            task: row.querySelector('.task-input').value,
            urgent: row.querySelector('.urgent-select').value,
            important: row.querySelector('.important-select').value
        });
    });

    const data = {
        date: new Date().toISOString().split('T')[0],
        tasks,
        satisfaction: document.getElementById('satisfaction').value,
        feedback: document.getElementById('feedbackText').value,
        productivityScore: document.getElementById('productivityScore').textContent
    };

    const savedData = JSON.parse(localStorage.getItem('productivityData') || '[]');
    savedData.push(data);
    localStorage.setItem('productivityData', JSON.stringify(savedData));

    showConfirmation('Data saved successfully!');
}

// View Past Data
function viewPastData() {
    const savedData = JSON.parse(localStorage.getItem('productivityData') || '[]');
    const modal = document.getElementById('pastDataModal');
    const content = document.getElementById('pastDataContent');

    if (savedData.length === 0) {
        content.innerHTML = '<p>No past data available.</p>';
    } else {
        content.innerHTML = savedData.map(day => `
            <div class="past-day">
                <h3>Date: ${day.date}</h3>
                <p>Productivity Score: ${day.productivityScore}</p>
                <p>Satisfaction: ${day.satisfaction || 'Not specified'}</p>
                <p>Feedback: ${day.feedback || 'None'}</p>
                <details>
                    <summary>View Tasks</summary>
                    <table>
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Task</th>
                                <th>Urgent</th>
                                <th>Important</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${day.tasks.filter(task => task.task).map(task => `
                                <tr>
                                    <td>${task.timeSlot}</td>
                                    <td>${task.task}</td>
                                    <td>${task.urgent}</td>
                                    <td>${task.important}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </details>
            </div>
        `).join('<hr>');
    }

    modal.style.display = 'block';
}

// Clear All Data
function clearAll() {
    showConfirmationDialog(
        'Are you sure you want to clear all data? This cannot be undone.',
        () => {
            document.querySelectorAll('.task-input').forEach(input => input.value = '');
            document.querySelectorAll('select').forEach(select => select.value = '');
            document.getElementById('satisfaction').value = '';
            document.getElementById('feedbackText').value = '';
            calculateProductivity();
            showConfirmation('All data cleared successfully!');
        }
    );
}

// Modal Management
function showConfirmation(message) {
    const modal = document.getElementById('confirmationModal');
    document.getElementById('confirmationMessage').textContent = message;
    modal.style.display = 'block';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 2000);
}

function showConfirmationDialog(message, onConfirm) {
    const modal = document.getElementById('confirmationModal');
    document.getElementById('confirmationMessage').textContent = message;
    
    const handleYes = () => {
        onConfirm();
        modal.style.display = 'none';
        cleanup();
    };
    
    const handleNo = () => {
        modal.style.display = 'none';
        cleanup();
    };
    
    const cleanup = () => {
        document.getElementById('confirmYes').removeEventListener('click', handleYes);
        document.getElementById('confirmNo').removeEventListener('click', handleNo);
    };
    
    document.getElementById('confirmYes').addEventListener('click', handleYes);
    document.getElementById('confirmNo').addEventListener('click', handleNo);
    
    modal.style.display = 'block';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeTaskTable();
    
    // Add input event listeners for real-time updates
    document.querySelectorAll('.task-input, .urgent-select, .important-select')
        .forEach(element => {
            element.addEventListener('input', calculateProductivity);
        });
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').style.display = 'none';
        });
    });

    // Action buttons
    document.getElementById('saveData').addEventListener('click', saveData);
    document.getElementById('viewPastData').addEventListener('click', viewPastData);
    document.getElementById('clearAll').addEventListener('click', clearAll);

    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
});