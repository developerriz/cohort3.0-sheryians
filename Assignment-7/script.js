const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const categorySelect = document.getElementById("categorySelect");
const taskContainer = document.getElementById("taskContainer");
const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");
const totalCount = document.getElementById("totalCount");
const completedCount = document.getElementById("completedCount");
const pendingCount = document.getElementById("pendingCount");
const themeToggle = document.getElementById("themeToggle");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateCounters(visibleTasks) {
  totalCount.textContent = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "completed",
  ).length;

  completedCount.textContent = completedTasks;
  pendingCount.textContent = tasks.length - completedTasks;

  taskContainer.dataset.visibleCount = visibleTasks.length;
}

function createEmptyState(searchValue, selectedCategory) {
  const hasFilters = searchValue || selectedCategory !== "All";

  const title = hasFilters ? "No matching tasks" : "Nothing queued yet";
  const message = hasFilters
    ? "Try a different search term or switch the category filter to widen the results."
    : "Start by adding a task on the left. Your board will update instantly and stay saved in this browser.";

  taskContainer.innerHTML = `
    <article class="empty-state">
      <div class="empty-illustration" aria-hidden="true">✦</div>
      <div>
        <h3>${title}</h3>
        <p>${message}</p>
      </div>
    </article>
  `;
}

function renderTasks() {
  const searchValue = searchInput.value.trim().toLowerCase();
  const selectedCategory = filterCategory.value;

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchValue);
    const matchesCategory =
      selectedCategory === "All" || task.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  taskContainer.innerHTML = "";

  if (filteredTasks.length === 0) {
    createEmptyState(searchValue, selectedCategory);
    updateCounters(filteredTasks);
    return;
  }

  const fragment = document.createDocumentFragment();

  filteredTasks.forEach((task) => {
    const card = document.createElement("article");
    card.className = "task-card";
    card.dataset.id = task.id;
    card.dataset.status = task.status;
    card.dataset.category = task.category;

    if (task.status === "completed") {
      card.classList.add("completed");
    }

    const taskInfo = document.createElement("div");
    taskInfo.className = "task-info";

    const title = document.createElement("h3");
    title.textContent = task.title;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    const categoryBadge = document.createElement("span");
    categoryBadge.className = "badge";
    categoryBadge.textContent = task.category;

    const statusBadge = document.createElement("span");
    statusBadge.className =
      task.status === "completed"
        ? "badge completed-badge"
        : "badge pending-badge";
    statusBadge.textContent = task.status;

    meta.append(categoryBadge, statusBadge);
    taskInfo.append(title, meta);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "edit-btn";
    editButton.textContent = "Edit";

    const completeButton = document.createElement("button");
    completeButton.type = "button";
    completeButton.className = "complete-btn";
    completeButton.textContent =
      task.status === "completed" ? "Reopen" : "Complete";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";

    actions.append(editButton, completeButton, deleteButton);
    card.append(taskInfo, actions);
    fragment.appendChild(card);
  });

  taskContainer.appendChild(fragment);
  updateCounters(filteredTasks);
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = taskInput.value.trim();

  if (!title) {
    return;
  }

  tasks.unshift({
    id: Date.now(),
    title,
    category: categorySelect.value,
    status: "pending",
  });

  saveTasks();
  taskForm.reset();
  renderTasks();
  taskInput.focus();
});

taskContainer.addEventListener("click", (event) => {
  const card = event.target.closest(".task-card");

  if (!card) {
    return;
  }

  const taskId = Number(card.dataset.id);
  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    return;
  }

  if (event.target.classList.contains("delete-btn")) {
    tasks = tasks.filter((item) => item.id !== taskId);
  }

  if (event.target.classList.contains("complete-btn")) {
    task.status = task.status === "completed" ? "pending" : "completed";
  }

  if (event.target.classList.contains("edit-btn")) {
    const updatedTitle = prompt("Edit task title", task.title);

    if (updatedTitle && updatedTitle.trim()) {
      task.title = updatedTitle.trim();
    }
  }

  saveTasks();
  renderTasks();
});

searchInput.addEventListener("input", renderTasks);
filterCategory.addEventListener("change", renderTasks);

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  localStorage.setItem("theme", theme);
  themeToggle.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
}

themeToggle.addEventListener("click", () => {
  const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
});

const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);
renderTasks();
