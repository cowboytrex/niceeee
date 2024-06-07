// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Function to create a task card
function createTaskCard(task) {
  const card = document.createElement('div');
  card.className = 'task-card card';
  card.setAttribute('data-id', task.id);

  card.innerHTML = `
    <div class="card-body">
      <h5 class="card-title">${task.title}</h5>
      <p class="card-text">${task.description}</p>
      <button class="btn btn-danger btn-sm delete-btn">Delete</button>
    </div>
  `;

  card.querySelector('.delete-btn').addEventListener('click', handleDeleteTask);

  return card;
}


// Function to render the task list and make cards draggable
function renderTaskList() {
  document.querySelectorAll('.lane .card-body').forEach(lane => lane.innerHTML = '');

  taskList.forEach(task => {
    const taskCard = createTaskCard(task);
    document.querySelector(`#${task.status}-cards`).appendChild(taskCard);
  });

  $(".task-card").draggable({
    revert: "invalid",
    helper: "clone",
    start: function(event, ui) {
      $(this).hide();
    },
    stop: function(event, ui) {
      $(this).show();
    }
  });

  $(".lane .card-body").droppable({
    accept: ".task-card",
    drop: handleDrop
  });
}

// Make task cards draggable
$('.draggable').draggable({
  opacity: 0.7,
  zIndex: 100,
  helper: function (e) {
    const original = $(e.target).hasClass('ui-draggable')
      ? $(e.target)
      : $(e.target).closest('.ui-draggable');
    return original.clone().css({ width: original.outerWidth() });
  },
});

// Remove a project from local storage and update the UI
function handleDeleteProject() {
  const projectId = $(this).attr('data-project-id');
  let projects = readProjectsFromStorage();

  projects = projects.filter(project => project.id !== projectId);

  saveProjectsToStorage(projects);
  printProjectData();
}

// Add a project to local storage and update the UI
function handleProjectFormSubmit(event) {
  event.preventDefault();

  const projectName = projectNameInputEl.val().trim();
  const projectType = projectTypeInputEl.val();
  const projectDate = projectDateInputEl.val().trim();

  if (!projectName || !projectType || !projectDate) {
    alert('Please fill out all fields!');
    return;
  }
}

const newProject = {
  id: crypto.randomUUID(),
  name: projectName,
  type: projectType,
  dueDate: projectDate,
  status: 'to-do',
};

const projects = readProjectsFromStorage();
projects.push(newProject);

saveProjectsToStorage(projects);
printProjectData();

projectNameInputEl.val('');
projectTypeInputEl.val('Project Type');
projectDateInputEl.val('');

// Update project status on drop
function handleDrop(event, ui) {
  const projects = readProjectsFromStorage();
  const taskId = ui.draggable[0].dataset.projectId;
  const newStatus = event.target.id;

  for (let project of projects) {
    if (project.id === taskId) {
      project.status = newStatus;
    }
  }

  saveProjectsToStorage(projects);
  printProjectData();
}


// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const task = {
    id: generateTaskId(),
    title: $('#taskTitle').val(),
    description: $('#taskDescription').val(),
    dueDate: $('#taskDueDate').val(),
    status: $('#taskStatus').val()
  };

  taskList.push(task);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", nextId);

  renderTaskList();
  $('#formModal').modal('hide');
  $('#taskForm').on('submit', handleAddTask);

}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  // Add your code to handle the drop event here
}

// Function to handle deleting a task
function handleDeleteTask(event) {
  const card = event.target.closest('.task-card');
  const id = parseInt(card.getAttribute('data-id'), 10);

  taskList = taskList.filter(task => task.id !== id); // Filter out the task to be deleted

  renderTaskList(); // Re-render the task list after deletion
}

// Call renderTaskList when the page loads
$(document).ready(function () {
  renderTaskList();
});
