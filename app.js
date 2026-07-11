import {
  auth,
  db,
  provider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "./firebase.js";

import {
  ref,
  push,
  set,
  onValue,
  remove,
  update
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

let currentUser = null;

// Login
document.getElementById("loginBtn").onclick = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    alert(err.message);
  }
};

// Logout
document.getElementById("logoutBtn").onclick = async () => {
  await signOut(auth);
};

// User Login Check
onAuthStateChanged(auth, (user) => {

  if (user) {

    currentUser = user;

    document.getElementById("loginPage").style.display = "none";

    document.getElementById("appPage").style.display = "block";

    document.getElementById("userName").innerHTML =
      "Welcome, " + user.displayName;

    loadTasks();

  } else {

    currentUser = null;

    document.getElementById("loginPage").style.display = "block";

    document.getElementById("appPage").style.display = "none";

  }

});

// Firebase Path
function taskRef() {

  return ref(db, "users/" + currentUser.uid + "/tasks");

}
// =========================
// Part 2 - Tasks
// =========================

// Add Task
document.getElementById("addTaskBtn").onclick = () => {

  const input = document.getElementById("taskInput");

  const text = input.value.trim();

  if (!text) {
    alert("Please enter a task.");
    return;
  }

  set(push(taskRef()), {
    text: text,
    done: false,
    created: Date.now()
  });

  input.value = "";

};

// Load Tasks
function loadTasks() {

  onValue(taskRef(), (snapshot) => {

    const data = snapshot.val() || {};

    const list = document.getElementById("taskList");

    list.innerHTML = "";

    let total = 0;
    let completed = 0;

    Object.entries(data).forEach(([id, task]) => {

      total++;

      if (task.done) completed++;

      const li = document.createElement("li");

      li.innerHTML = `
        <span style="${task.done ? 'text-decoration:line-through;color:gray;' : ''}">
          ${task.text}
        </span>
        <div style="margin-top:8px;">
          <button onclick="toggleTask('${id}', ${task.done})">✔</button>
          <button onclick="deleteTask('${id}')">🗑</button>
        </div>
      `;

      list.appendChild(li);

    });

    updateDashboard(total, completed);

  });

}
// =========================
// Part 3 - Final
// =========================

// Complete Task
window.toggleTask = function(id, done) {

  update(ref(db, "users/" + currentUser.uid + "/tasks/" + id), {
    done: !done
  });

};

// Delete Task
window.deleteTask = function(id) {

  if (confirm("Delete this task?")) {

    remove(ref(db, "users/" + currentUser.uid + "/tasks/" + id));

  }

};

// Dashboard Update
function updateDashboard(total, completed) {

  const totalEl = document.getElementById("totalTask");
  const pendingEl = document.getElementById("pendingTask");
  const doneEl = document.getElementById("doneTask");

  if (totalEl) totalEl.textContent = total;
  if (pendingEl) pendingEl.textContent = total - completed;
  if (doneEl) doneEl.textContent = completed;

}
// =========================
// Bottom Navigation
// =========================

const homePage = document.getElementById("homePage");
const tasksPage = document.getElementById("tasksPage");

document.getElementById("homeTab").onclick = () => {

  homePage.style.display = "block";
  tasksPage.style.display = "none";
  vaultPage.style.display = "none";
  
};
document.getElementById("tasksTab").onclick = () => {

  homePage.style.display = "none";
  tasksPage.style.display = "block";
  vaultPage.style.display = "none";

};
document.getElementById("songsTab").onclick = () => {
  alert("🎵 Songs feature coming soon!");
};

const vaultPage = document.getElementById("vaultPage");

document.getElementById("vaultTab").onclick = () => {

  homePage.style.display = "none";
  tasksPage.style.display = "none";
  vaultPage.style.display = "block";

};

document.getElementById("settingsTab").onclick = () => {
  alert("⚙️ Settings coming soon!");
};
