const $ = (s, r = document) => r.querySelector(s);
let password = "";
let content = null;

const blank = {
  department: { name: "", tag: "", description: "" },
  core: { role: "", name: "" },
  resource: { category: "research", title: "", description: "", level: 50 },
  competition: { title: "", description: "" },
  step: { title: "", tag: "", description: "" }
};

$("#loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  password = $("#adminPassword").value;
  const msg = $("#loginMessage");
  const login = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });
  if (!login.ok) {
    msg.textContent = "Incorrect password.";
    return;
  }
  await loadContent();
});

async function loadContent() {
  const msg = $("#loginMessage");
  try {
    const res = await fetch("/api/content", { cache: "no-store" });
    content = await res.json();
    $("#adminLock").hidden = true;
    $("#adminPanel").hidden = false;
    render();
  } catch {
    msg.textContent = "Could not load content.";
  }
}

function field(label, value, onInput, type = "text") {
  const wrap = document.createElement("label");
  wrap.textContent = label;
  const input = type === "textarea" ? document.createElement("textarea") : document.createElement("input");
  input.value = value || "";
  if (type === "number") input.type = "number";
  input.addEventListener("input", () => onInput(type === "number" ? Number(input.value) : input.value));
  wrap.append(input);
  return wrap;
}

function removeButton(fn) {
  const button = document.createElement("button");
  button.className = "button ghost";
  button.type = "button";
  button.textContent = "Remove";
  button.addEventListener("click", fn);
  return button;
}

function renderList(root, list, fields, addRemove = true) {
  root.innerHTML = "";
  list.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "admin-row";
    fields.forEach(([label, key, type]) => row.append(field(label, item[key], value => item[key] = value, type)));
    if (addRemove) row.append(removeButton(() => { list.splice(index, 1); render(); }));
    root.append(row);
  });
}

function renderClasses() {
  const root = $("#classEditor");
  root.innerHTML = "";
  ["12", "11", "10", "9", "8"].forEach(cls => {
    const box = document.createElement("div");
    box.className = "admin-row";
    const members = content.classMembers[cls] || [];
    box.append(field(`Class ${cls} names`, members.join(", "), value => {
      content.classMembers[cls] = value.split(",").map(x => x.trim()).filter(Boolean);
    }, "textarea"));
    root.append(box);
  });
}

function renderInductions() {
  const root = $("#inductionsEditor");
  root.innerHTML = "";
  root.append(field("Status", content.inductions.status, value => content.inductions.status = value));
  root.append(field("Summary", content.inductions.summary, value => content.inductions.summary = value, "textarea"));
  root.append(field("Deadline", content.inductions.deadline, value => content.inductions.deadline = value));
  root.append(field("Registration URL", content.inductions.registrationUrl, value => content.inductions.registrationUrl = value));
  const stepsTitle = document.createElement("h3");
  stepsTitle.textContent = "Steps";
  root.append(stepsTitle);
  const stepsRoot = document.createElement("div");
  root.append(stepsRoot);
  renderList(stepsRoot, content.inductions.steps, [["Title", "title"], ["Tag", "tag"], ["Description", "description", "textarea"]]);
  const add = document.createElement("button");
  add.className = "button ghost";
  add.type = "button";
  add.textContent = "Add Step";
  add.addEventListener("click", () => { content.inductions.steps.push({ ...blank.step }); render(); });
  root.append(add);
}

function renderContact() {
  if (!content.contact) content.contact = { email: "", phone: "", note: "" };
  const root = $("#contactEditor");
  root.innerHTML = "";
  root.append(field("General Email ID", content.contact.email, value => content.contact.email = value));
  root.append(field("Phone Number", content.contact.phone, value => content.contact.phone = value));
  root.append(field("Contact Note", content.contact.note, value => content.contact.note = value, "textarea"));
}

function render() {
  renderList($("#departmentsEditor"), content.departments, [["Name", "name"], ["Tag", "tag"], ["Description", "description", "textarea"]]);
  renderList($("#coreEditor"), content.coreTeam, [["Role", "role"], ["Name", "name"]]);
  renderClasses();
  renderList($("#resourcesEditor"), content.resources, [["Category", "category"], ["Title", "title"], ["Description", "description", "textarea"], ["Level", "level", "number"]]);
  renderInductions();
  renderList($("#competitionsEditor"), content.competitions, [["Title", "title"], ["Description", "description", "textarea"]]);
  renderContact();
}

document.addEventListener("click", e => {
  const type = e.target.dataset?.add;
  if (!type || !content) return;
  if (type === "departments") content.departments.push({ ...blank.department });
  if (type === "coreTeam") content.coreTeam.push({ ...blank.core });
  if (type === "resources") content.resources.push({ ...blank.resource });
  if (type === "competitions") content.competitions.push({ ...blank.competition });
  render();
});

$("#saveContent").addEventListener("click", async () => {
  const msg = $("#saveMessage");
  msg.textContent = "Saving...";
  const res = await fetch("/api/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, content })
  });
  const data = await res.json();
  msg.textContent = data.ok ? "Saved. Refresh the public site to see changes." : data.error || "Save failed.";
});
