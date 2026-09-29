const storageKey = 'daymark-tasks';
const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');
const taskList = document.querySelector('#task-list');
const taskCount = document.querySelector('#task-count');
const emptyState = document.querySelector('#empty-state');
const emptyMessage = document.querySelector('#empty-message');
const filterButtons = document.querySelectorAll('.filter-button');
const clearCompletedButton = document.querySelector('#clear-completed');
const todayLabel = document.querySelector('#today-label');

let tasks = loadTasks();
let activeFilter = 'all';

todayLabel.textContent = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
}).format(new Date());

taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = taskInput.value.trim();
    if (!title) return;

    tasks.unshift({ id: crypto.randomUUID(), title, done: false });
    taskInput.value = '';
    saveAndRender();
    taskInput.focus();
});

filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
        activeFilter = button.dataset.filter;
        filterButtons.forEach((filterButton) => {
            const isActive = filterButton === button;
            filterButton.classList.toggle('is-active', isActive);
            filterButton.setAttribute('aria-pressed', String(isActive));
        });
        renderTasks();
    });
});

taskList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const task = tasks.find((item) => item.id === button.dataset.id);
    if (!task) return;

    if (button.dataset.action === 'toggle') task.done = !task.done;
    if (button.dataset.action === 'delete') tasks = tasks.filter((item) => item.id !== task.id);
    saveAndRender();
});

clearCompletedButton.addEventListener('click', () => {
    tasks = tasks.filter((task) => !task.done);
    saveAndRender();
});

function loadTasks() {
    try {
        const savedTasks = JSON.parse(localStorage.getItem(storageKey) || '[]');
        return Array.isArray(savedTasks) ? savedTasks : [];
    } catch {
        return [];
    }
}

function saveAndRender() {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    const visibleTasks = tasks.filter((task) => {
        if (activeFilter === 'open') return !task.done;
        if (activeFilter === 'done') return task.done;
        return true;
    });
    const openCount = tasks.filter((task) => !task.done).length;

    taskCount.textContent = `${openCount} ${openCount === 1 ? 'task' : 'tasks'} left`;
    taskList.replaceChildren(...visibleTasks.map(createTaskElement));
    emptyState.hidden = visibleTasks.length > 0;

    if (tasks.length === 0) {
        emptyMessage.textContent = 'A fresh page. Add your first task above.';
    } else if (visibleTasks.length === 0 && activeFilter === 'done') {
        emptyMessage.textContent = 'Nothing completed just yet.';
    } else if (visibleTasks.length === 0) {
        emptyMessage.textContent = 'You’re all caught up.';
    }
}

function createTaskElement(task) {
    const item = document.createElement('li');
    item.className = `task-item${task.done ? ' is-done' : ''}`;

    const toggle = document.createElement('button');
    toggle.className = 'task-toggle';
    toggle.type = 'button';
    toggle.dataset.action = 'toggle';
    toggle.dataset.id = task.id;
    toggle.setAttribute('aria-label', task.done ? `Mark ${task.title} as open` : `Complete ${task.title}`);
    toggle.textContent = task.done ? '✓' : '';

    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.title;

    const remove = document.createElement('button');
    remove.className = 'delete-button';
    remove.type = 'button';
    remove.dataset.action = 'delete';
    remove.dataset.id = task.id;
    remove.setAttribute('aria-label', `Delete ${task.title}`);
    remove.textContent = '×';

    item.append(toggle, text, remove);
    return item;
}

renderTasks();