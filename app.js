// =========================
// Firebase Imports
// =========================

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
  update,
  get,
  child
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

// Email Verification
let verificationCode = "";

// =========================
// Global Variables
// =========================

let currentUser = null;

const loginPage = document.getElementById("loginPage");
const appPage = document.getElementById("appPage");

const homePage = document.getElementById("homePage");
const tasksPage = document.getElementById("tasksPage");
const vaultPage = document.getElementById("vaultPage");

const userName = document.getElementById("userName");

const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

const pinInput = document.getElementById("vaultPin");
const unlockBtn = document.getElementById("unlockVaultBtn");
const vaultContent = document.getElementById("vaultContent");

// =========================
// Login
// =========================

document.getElementById("loginBtn").onclick = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    alert(err.message);
  }
};

// =========================
// Logout
// =========================

document.getElementById("logoutBtn").onclick = async () => {
  await signOut(auth);
};

// =========================
// Auth State
// =========================

onAuthStateChanged(auth, (user) => {

  if (user) {

    currentUser = user;

    loginPage.style.display = "none";
    appPage.style.display = "block";

    homePage.style.display = "block";
    tasksPage.style.display = "none";
    vaultPage.style.display = "none";

    userName.textContent = "Welcome, " + user.displayName;

    loadTasks();

  } else {

    currentUser = null;

    loginPage.style.display = "block";
    appPage.style.display = "none";
    vaultPage.style.display = "none";

  }

});

// =========================
// Firebase Task Path
// =========================

function taskRef() {
  return ref(db, "users/" + currentUser.uid + "/tasks");
}
// =========================
// Add Task
// =========================

document.getElementById("addTaskBtn").onclick = () => {

  const text = taskInput.value.trim();

  if (!text) {
    alert("Please enter a task.");
    return;
  }

  set(push(taskRef()), {
    text: text,
    done: false,
    created: Date.now()
  });

  taskInput.value = "";

};

// =========================
// Load Tasks
// =========================

function loadTasks() {

  onValue(taskRef(), (snapshot) => {

    const data = snapshot.val() || {};

    taskList.innerHTML = "";

    let total = 0;
    let completed = 0;

    Object.entries(data).forEach(([id, task]) => {

      total++;

      if (task.done) completed++;

      const li = document.createElement("li");

      li.innerHTML = `
        <span style="${task.done ? "text-decoration:line-through;color:gray;" : ""}">
          ${task.text}
        </span>

        <div style="margin-top:8px;">
          <button onclick="toggleTask('${id}', ${task.done})">✔</button>
          <button onclick="deleteTask('${id}')">🗑</button>
        </div>
      `;

      taskList.appendChild(li);

    });

    updateDashboard(total, completed);

  });

}

// =========================
// Complete Task
// =========================

window.toggleTask = function(id, done) {

  update(ref(db, "users/" + currentUser.uid + "/tasks/" + id), {
    done: !done
  });

};

// =========================
// Delete Task
// =========================

window.deleteTask = function(id) {

  if (confirm("Delete this task?")) {

    remove(ref(db, "users/" + currentUser.uid + "/tasks/" + id));

  }

};

// =========================
// Dashboard
// =========================

function updateDashboard(total, completed) {

  document.getElementById("totalTask").textContent = total;
  document.getElementById("pendingTask").textContent = total - completed;
  document.getElementById("doneTask").textContent = completed;

}
// =========================
// Bottom Navigation
// =========================

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

document.getElementById("vaultTab").onclick = () => {
  homePage.style.display = "none";
  tasksPage.style.display = "none";
  vaultPage.style.display = "block";

  pinInput.value = "";
  pinInput.style.display = "block";
  unlockBtn.style.display = "block";
  vaultContent.style.display = "none";
};

document.getElementById("songsTab").onclick = () => {
  alert("🎵 Songs feature coming soon!");
};

document.getElementById("settingsTab").onclick = () => {
  alert("⚙️ Settings feature coming soon!");
};

// =========================
// Private Vault PIN
// =========================

unlockBtn.onclick = async () => {

  const pin = pinInput.value.trim();

  if (pin.length !== 4) {
    alert("Please enter a 4-digit PIN");
    return;
  }

  const pinRef = ref(db, "users/" + currentUser.uid + "/vault/pin");

  try {

    const snapshot = await get(pinRef);

    // First time - Save PIN
    if (!snapshot.exists()) {

      await set(pinRef, pin);

      alert("✅ PIN saved successfully!");

      pinInput.style.display = "none";
      unlockBtn.style.display = "none";
      vaultContent.style.display = "block";

      return;
    }

    // Verify PIN
    const savedPin = snapshot.val();

    if (savedPin === pin) {

      pinInput.style.display = "none";
      unlockBtn.style.display = "none";
      vaultContent.style.display = "block";

    } else {

      alert("❌ Wrong PIN");

    }

  } catch (error) {

    console.error(error);
    alert("Error connecting to Firebase.");

  }

};

// =========================
// Private Notes (Basic)
// =========================

document.getElementById("privateNotesBtn").onclick = () => {

  document.getElementById("vaultContent").style.display = "none";
  document.getElementById("privateNotesPage").style.display = "block";

};

document.getElementById("savePrivateNoteBtn").onclick = () => {

  const note = document.getElementById("privateNoteInput").value.trim();

  if (!note) {
    alert("Please write a note.");
    return;
  }

  localStorage.setItem(
    "privateNote_" + currentUser.uid,
    note
  );

  alert("✅ Note Saved");

};

// Load saved note
window.addEventListener("load", () => {

  if (!currentUser) return;

  const note = localStorage.getItem(
    "privateNote_" + currentUser.uid
  );

  if (note) {
    document.getElementById("privateNoteInput").value = note;
  }

});

document.getElementById("forgotPinBtn").onclick = async () => {

  verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {

    await emailjs.send(
      "service_ansh4309",
      "template_21kqq98",
      {
        to_name: currentUser.displayName,
        to_email: currentUser.email,
        verification_code: verificationCode
      }
    );

    alert("Verification code sent to: " + currentUser.email);

  } catch (error) {

    console.error(error);
    alert("Failed to send verification email.");

  }

};
