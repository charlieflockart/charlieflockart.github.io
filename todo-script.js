// Get DOM elements
const taskInput = document.getElementById('taskInput');
const dateInput = document.getElementById('dateInput');
const taskList = document.getElementById('taskList');

// Set default date to today
dateInput.valueAsDate = new Date();

// Load tasks from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Function to save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Function to check if a date is overdue
function isOverdue(dateString) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    return dueDate < today;
}

// Function to create a new task element
function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    if (task.completed) {
        li.classList.add('completed');
    }

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const contentDiv = document.createElement('div');
    contentDiv.className = 'task-content';

    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;

    const dateSpan = document.createElement('span');
    dateSpan.className = 'due-date';
    if (isOverdue(task.dueDate) && !task.completed) {
        dateSpan.classList.add('overdue');
        dateSpan.textContent = `Overdue! Due: ${formatDate(task.dueDate)}`;
    } else {
        dateSpan.textContent = `Due: ${formatDate(task.dueDate)}`;
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    contentDiv.appendChild(textSpan);
    contentDiv.appendChild(dateSpan);

    li.appendChild(checkbox);
    li.appendChild(contentDiv);
    li.appendChild(deleteBtn);

    return li;
}

// Function to render all tasks
function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        taskList.appendChild(createTaskElement(task));
    });
}

// Function to add a new task
function addTask() {
    const text = taskInput.value.trim();
    const dueDate = dateInput.value;
    
    if (text && dueDate) {
        const newTask = {
            id: Date.now(),
            text: text,
            dueDate: dueDate,
            completed: false
        };
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        taskInput.value = '';
        dateInput.valueAsDate = new Date(); // Reset to today
    }
}

// Function to toggle task completion
function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveTasks();
    renderTasks();
}

// Function to delete a task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

// Add task when Enter key is pressed
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Initial render
renderTasks(); 