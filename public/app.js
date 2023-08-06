//------------ the fixed header -----------//
 const baseURL = 'http://localhost:3000';

window.onscroll = function() {
  myFunction();
  scrollFunction();
};

let header = document.getElementById("myHeader");
let sticky = header.offsetTop;

function myFunction() {
  if (window.scrollY > sticky) {
    header.classList.add("sticky");

  } else {
    header.classList.remove("sticky");
  }
}
//------------    back to top button -----------//

function scrollFunction() {
  let mybutton = document.getElementById("myBtn");
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

const darkThemeButton = document.getElementById('darkThemeButton');
    const body = document.body;
    const skills=document.getElementById('skills');
    const header1=document.querySelectorAll('header');
    const icon = darkThemeButton.querySelector('i');

    darkThemeButton.addEventListener('click', function() {
      body.classList.toggle('dark-theme');

      if (body.classList.contains('dark-theme')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        body.style.backgroundColor = '#000';
        skills.style.color='black';

      } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        body.style.backgroundColor='#fff';
      }
    });
// ------------- burger menu ----------//
var burgerMenu = document.getElementById('burgerIcon');

var overlay = document.getElementById('menu');

burgerMenu.addEventListener('click', function() {
  this.classList.toggle("close");
  overlay.classList.toggle("overlay");
});



  // ---------- API section --------//
      async function fetchGlobalWarmingData() {
            try {
                const response = await fetch('https://global-warming.org/api/temperature-api');
                const data = await response.json();
                return data.result;
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        async function displayData() {
            const dataContainer = document.getElementById('data-container');
            const data = await fetchGlobalWarmingData();

            const firstData = data[0];
            const firstDataEntry = document.createElement('div');
            firstDataEntry.className = 'data-entry';
            firstDataEntry.innerHTML = `
                <p>First Data:</p>
                <p>Time: ${firstData.time}, Station Temp: ${firstData.station}, Land Temp: ${firstData.land}</p>
            `;
            dataContainer.appendChild(firstDataEntry);

            const lastData = data[data.length - 1];
            const lastDataEntry = document.createElement('div');
            lastDataEntry.className = 'data-entry';
            lastDataEntry.innerHTML = `
                <p>Last Data:</p>
                <p>Time: ${lastData.time}, Station Temp: ${lastData.station}, Land Temp: ${lastData.land}</p>
            `;
            dataContainer.appendChild(lastDataEntry);
        }

        displayData();

  //////////////// ADMIN SECTION ///////////



let isAdminLoggedIn = false;

// Function to set the login status and update UI accordingly
function setLoginStatus(isLoggedIn) {
  isAdminLoggedIn = isLoggedIn;
  const loginSection = document.getElementById('loginSection');
  const logoutSection = document.getElementById('logoutSection');
  const addButton = document.querySelector('button[data-add]');

  if (isAdminLoggedIn) {
    loginSection.style.display = 'none';
    logoutSection.style.display = 'block';
    addButton.style.display = 'block';
  } else {
    loginSection.style.display = 'block';
    logoutSection.style.display = 'none';
    addButton.style.display = 'none';
  }
}

function checkPassword() {
  const passwordInput = document.getElementById('password').value;

  fetch(`${baseURL}/check-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password: passwordInput }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setLoginStatus(true);
        document.getElementById('password').value = '';
        fetchAndDisplayProjects();
      } else {
        alert(data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred. Please try again later.');
    });
}

function logout() {
  setLoginStatus(false);
  fetchAndDisplayProjects();
}

function showAddForm() {
  const addButton = document.querySelector('button[data-add]');
  addButton.style.display = 'none';

  const addFormContainer = document.getElementById('add-form-container');
  addFormContainer.innerHTML = `
    <form onsubmit="addProject(); return false;">
      <input type="text" name="project_name" placeholder="Project Name" required>
      <input type="text" name="project_details" placeholder="Project Details" required>
      <input type="text" name="github_link" placeholder="GitHub Link" required>
      <button type="submit">Save</button>
    </form>
  `;
  addFormContainer.style.display = 'block';
}

function addProject() {
  const form = document.querySelector('form');
  const formData = new FormData(form);

  fetch(`${baseURL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(Object.fromEntries(formData.entries())),
  })
    .then(response => response.json())
    .then(project => {
      console.log('New project added:', project);

      const addFormContainer = document.getElementById('add-form-container');
      addFormContainer.style.display = 'none';

      form.reset();

      fetchAndDisplayProjects();
    })
    .catch(error => {
      console.error('Error adding project:', error);
    });
}

// Update editProject function
function editProject(projectId) {
  const editButton = document.querySelector(`button[data-edit="${projectId}"]`);
  const deleteButton = document.querySelector(`button[data-delete="${projectId}"]`);

  if (isAdminLoggedIn && editButton && deleteButton) {
    editButton.style.display = 'none';
    deleteButton.style.display = 'none';
  }

  // Find the parent project item to the clicked edit button using event delegation
  const projectItem = editButton.closest('.project-item');

  fetch(`${baseURL}/projects/${projectId}`)
    .then(response => response.json())
    .then(project => {
      const editFormContainer = document.getElementById('edit-form-container');
      editFormContainer.innerHTML = `
        <form onsubmit="saveProject(event, ${project.id}); return false;">
          <input type="text" name="project_name" value="${project.project_name}" required>
          <input type="text" name="project_details" value="${project.project_details}" required>
          <input type="text" name="github_link" value="${project.github_link}" required>
          <button type="submit">Save</button>
        </form>
      `;
      editFormContainer.style.display = 'block';
    })
    .catch(error => {
      console.error('Error fetching project:', error);
    });
}

// Function to save the edited project
function saveProject(event, projectId) {
  event.preventDefault(); // Prevent form submission and page reload

  const form = event.target;
  const formData = new FormData(form);

  fetch(`${baseURL}/projects/${projectId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(Object.fromEntries(formData.entries())),
  })
    .then(response => response.json())
    .then(data => {
      console.log(data.message); // Success message from the server

      const editFormContainer = document.getElementById('edit-form-container');
      editFormContainer.style.display = 'none';

      fetchAndDisplayProjects(); // Refresh the projects after editing is complete
    })
    .catch(error => {
      console.error('Error saving project:', error);
    });
}
// deleteProject function
function deleteProject(projectId) {
  fetch(`${baseURL}/projects/${projectId}`, {
    method: 'DELETE',
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error deleting project');
      }
      // No JSON parsing needed, as the server may not return JSON for a simple DELETE
      console.log('Project deleted successfully.');
      // Remove the project item from the DOM after successful deletion
      const projectItem = document.querySelector(`.project-item[data-id="${projectId}"]`);
      projectItem.remove();
    })
    .catch(error => {
      console.error('Error deleting project:', error);
    });
}

// Attach event listener for the projects container to handle delete button clicks
const projectsContainer = document.getElementById('projects-container');
projectsContainer.addEventListener('click', event => {
  const deleteButton = event.target.closest('.delete-button');
  if (deleteButton) {
    const projectId = deleteButton.getAttribute('data-delete');
    deleteProject(projectId);
  }
});

function fetchAndDisplayProjects() {
  fetch(`${baseURL}/projects`)
    .then(response => response.json())
    .then(projects => {
      projectsContainer.innerHTML = '';

      projects.forEach(project => {
        const projectItem = document.createElement('div');
        projectItem.classList.add('project-item');
        projectItem.setAttribute('data-id', project.id);

        const projectName = document.createElement('h3');
        projectName.textContent = project.project_name;

        const projectDetails = document.createElement('p');
        projectDetails.textContent = project.project_details;

        const link = document.createElement('a');
        link.textContent = 'Source code';
        link.setAttribute('href', project.github_link);
        link.setAttribute('target', '_blank');
        link.classList.add('source');

        const editButton = document.createElement('button');
        editButton.classList.add('edit-button', 'project-button');
        const editIcon = document.createElement('i');
        editIcon.classList.add('fa', 'fa-pen');
        editButton.appendChild(editIcon);
        editButton.setAttribute('data-edit', project.id);
        editButton.addEventListener('click', () => editProject(project.id));

        

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button', 'project-button');
        const deleteIcon = document.createElement('i');
        deleteIcon.classList.add('fa', 'fa-trash');
        deleteButton.appendChild(deleteIcon);
        deleteButton.setAttribute('data-delete', project.id);
        

        // Show or hide edit and delete buttons based on admin login status
        editButton.style.display = isAdminLoggedIn ? 'block' : 'none';
        deleteButton.style.display = isAdminLoggedIn ? 'block' : 'none';

        // Append project elements to the item container
        projectItem.appendChild(projectName);
        projectItem.appendChild(projectDetails);
        projectItem.appendChild(link);
        projectItem.appendChild(editButton);
        projectItem.appendChild(deleteButton);

        // Append project item container to the projects container
        projectsContainer.appendChild(projectItem);

        // Show or hide add button based on admin login status
        const addButton = document.querySelector('button[data-add]');
        addButton.style.display = isAdminLoggedIn ? 'block' : 'none';
      });
    })
    .catch(error => {
      console.error('Error fetching projects:', error);
    });
}

// Call the function to fetch and display projects when the page loads
document.addEventListener('DOMContentLoaded', fetchAndDisplayProjects);


