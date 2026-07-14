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

  const ok = confirm("Are you sure you want to logout?");

  if (!ok) return;

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
    loadPrivateNote();

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

 const category = document.getElementById("taskCategory").value;

  if (!text) {
    alert("Please enter a task.");
    return;
  }

  set(push(taskRef()), {
  text: text,
  category: category,
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
      let categoryColor = "#0f766e";

switch(task.category){

  case "Study":
    categoryColor = "#2563eb"; // Blue
    break;

  case "Work":
    categoryColor = "#ea580c"; // Orange
    break;

  case "Personal":
    categoryColor = "#16a34a"; // Green
    break;

  case "Shopping":
    categoryColor = "#9333ea"; // Purple
    break;

  case "Important":
    categoryColor = "#dc2626"; // Red
    break;

}

    li.innerHTML = `
 <small style="color:${categoryColor};font-weight:bold;">
    ${task.category || "General"}
  </small>

  <br>

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
  document.getElementById("settingsPage").style.display = "none";
};

document.getElementById("tasksTab").onclick = () => {
  homePage.style.display = "none";
  tasksPage.style.display = "block";
  vaultPage.style.display = "none";
  document.getElementById("settingsPage").style.display = "none";
};

document.getElementById("vaultTab").onclick = () => {
  homePage.style.display = "none";
  tasksPage.style.display = "none";
  vaultPage.style.display = "block";
document.getElementById("settingsPage").style.display = "none";
  
  pinInput.value = "";
  pinInput.style.display = "block";
  unlockBtn.style.display = "block";
  vaultContent.style.display = "none";
};

document.getElementById("songsTab").onclick = () => {
  alert("🎵 Songs feature coming soon!");
};

document.getElementById("settingsTab").onclick = () => {

  homePage.style.display = "none";
  tasksPage.style.display = "none";
  vaultPage.style.display = "none";

  document.getElementById("privateNotesPage").style.display = "none";

  document.getElementById("settingsPage").style.display = "block";

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

document.getElementById("savePrivateNoteBtn").onclick = async () => {

  const note = document.getElementById("privateNoteInput").value.trim();

  if (!note) {
    alert("Please write a note.");
    return;
  }

  try {

    await set(
      ref(db, "users/" + currentUser.uid + "/vault/note"),
      note
    );

    alert("✅ Note Saved");

  } catch (error) {

    console.error(error);
    alert("Failed to save note.");

  }

};

// Load saved note
async function loadPrivateNote() {

  try {

    const snapshot = await get(
      ref(db, "users/" + currentUser.uid + "/vault/note")
    );

    if (snapshot.exists()) {

      document.getElementById("privateNoteInput").value =
        snapshot.val();

    }

  } catch (error) {

    console.error(error);

  }

}

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
    
    document.getElementById("verifyPinBox").style.display = "block";
  } catch (error) {

    console.error(error);
    alert("Failed to send verification email.");

  }

};

// Verify Email Code
document.getElementById("verifyCodeBtn").onclick = () => {

  const code = document.getElementById("verificationInput").value.trim();

  if (code === verificationCode) {

    alert("✅ Code Verified");

    document.getElementById("newPinInput").style.display = "block";
    document.getElementById("saveNewPinBtn").style.display = "block";

  } else {

    alert("❌ Invalid Verification Code");

  }

};

// Save New PIN
document.getElementById("saveNewPinBtn").onclick = async () => {

  const newPin = document.getElementById("newPinInput").value.trim();

  if (newPin.length !== 4) {
    alert("Please enter a 4-digit PIN.");
    return;
  }

  try {

    await set(
      ref(db, "users/" + currentUser.uid + "/vault/pin"),
      newPin
    );

    alert("🎉 PIN Reset Successfully!");

    document.getElementById("verifyPinBox").style.display = "none";
    document.getElementById("newPinInput").value = "";
    document.getElementById("verificationInput").value = "";

  } catch (error) {

    console.error(error);
    alert("Failed to reset PIN.");

  }

};

// =========================
// Dark Mode
// =========================

document.getElementById("darkModeBtn").onclick = () => {

  document.body.classList.add("dark-mode");

  localStorage.setItem("theme","dark");

};

document.getElementById("lightModeBtn").onclick = () => {

  document.body.classList.remove("dark-mode");

  localStorage.setItem("theme","light");

};

if(localStorage.getItem("theme")==="dark"){

  document.body.classList.add("dark-mode");

}

// =========================
// Change PIN
// =========================

document.getElementById("changePinBtn").onclick = () => {

  const box = document.getElementById("changePinBox");

  if (box.style.display === "none" || box.style.display === "") {
    box.style.display = "block";
  } else {
    box.style.display = "none";
  }

};

document.getElementById("saveChangedPinBtn").onclick = async () => {

  const currentPin = document.getElementById("currentPinInput").value.trim();
  const newPin = document.getElementById("newPinChangeInput").value.trim();

  if (currentPin.length !== 4 || newPin.length !== 4) {
    alert("Please enter valid 4-digit PINs.");
    return;
  }

  try {

    const pinRef = ref(db, "users/" + currentUser.uid + "/vault/pin");

    const snapshot = await get(pinRef);

    if (!snapshot.exists()) {
      alert("No PIN found.");
      return;
    }

    if (snapshot.val() !== currentPin) {
      alert("❌ Current PIN is incorrect.");
      return;
    }

    await set(pinRef, newPin);

    alert("✅ PIN changed successfully!");

    document.getElementById("currentPinInput").value = "";
    document.getElementById("newPinChangeInput").value = "";
    document.getElementById("changePinBox").style.display = "none";

  } catch (error) {

    console.error(error);
    alert("Failed to change PIN.");

  }

};

// =========================
// Language Settings
// =========================

document.getElementById("englishBtn").onclick = () => {

  localStorage.setItem("language", "en");

  applyLanguage("en");

  alert("🇺🇸 English Selected");

};

document.getElementById("hindiBtn").onclick = () => {

  localStorage.setItem("language", "hi");

  applyLanguage("hi");

  alert("🇮🇳 हिन्दी चुनी गई");

};

function applyLanguage(lang){

  if(lang === "hi"){

    document.getElementById("homeTitle").textContent = "🏠 होम";
    document.getElementById("taskTitle").textContent = "मेरे कार्य";
    document.getElementById("vaultTitle").textContent = "🔒 प्राइवेट वॉल्ट";
    document.getElementById("settingsTitle").textContent = "⚙️ सेटिंग्स";

  }else{

    document.getElementById("homeTitle").textContent = "🏠 Home";
    document.getElementById("taskTitle").textContent = "Your Tasks";
    document.getElementById("vaultTitle").textContent = "🔒 Private Vault";
    document.getElementById("settingsTitle").textContent = "⚙️ Settings";

  }

}

// Load Saved Language

const appLanguage = localStorage.getItem("language");

applyLanguage(appLanguage || "en");

if (appLanguage === "hi") {

  console.log("Hindi Mode");

} else {

  console.log("English Mode");

}

// =========================
// Settings Logout
// =========================

document.getElementById("logoutSettingBtn").onclick = async () => {

  const ok = confirm("Are you sure you want to logout?");

  if (!ok) return;

  await signOut(auth);

};
