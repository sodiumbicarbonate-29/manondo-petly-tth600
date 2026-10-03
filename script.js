const pencilIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
const trashIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;

const speciesLabels = {
   "dog": "Dog", "cat": "Cat", "rabbit": "Rabbit",
   "bird": "Bird", "hamster": "Hamster", "fish": "Fish",
   "turtle": "Turtle", "snake": "Snake", "guinea pig": "Guinea Pig"
};

function speciesFile(s) { return s; }
function formatDate(d) {
   return new Date(d).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit"
   });
}

function statusBadge(status) {
   const map = {
      "Scheduled": "badge-blue",
      "Completed": "badge-green",
      "Cancelled": "badge-red"
   };
   return `<span class="badge ${map[status] || 'badge-gray'}">${status}</span>`;
}

let pets = [];

async function loadPets() {
   const res = await fetch("/api/pets");
   pets = await res.json();
}

/* ===================== PATIENTS (index.html) ===================== */
if (document.getElementById("petList")) {

   const petListEl = document.getElementById("petList");
   const modal = document.getElementById("petModalBackdrop");
   const speciesInput = document.getElementById("petSpeciesInput");
   const petModalTitle = document.getElementById("petModalTitle");

   function setSpeciesPicker(value) {
      document.querySelectorAll(".species-option").forEach(opt => {
         opt.classList.toggle("selected", opt.dataset.value === value);
      });
      speciesInput.value = value;
   }

   document.querySelectorAll(".species-option").forEach(opt => {
      opt.addEventListener("click", () => setSpeciesPicker(opt.dataset.value));
   });
   setSpeciesPicker("dog");

   function renderPatients(list) {
      petListEl.innerHTML = "";
      document.getElementById("emptyPetNote").style.display = list.length ? "none" : "block";
      if (!list.length) return;

      const table = document.createElement("table");
      table.className = "data-table";
      table.innerHTML = `
         <thead>
            <tr>
               <th>Name</th>
               <th>Species</th>
               <th>Breed</th>
               <th>Age</th>
               <th>Owner</th>
               <th>Medical Notes</th>
               <th>Actions</th>
            </tr>
         </thead>
         <tbody>
            ${list.map(pet => {
               const key = speciesFile(pet.species);
               return `
               <tr>
                  <td><strong>${pet.name}</strong></td>
                  <td><span class="badge badge-gray">${speciesLabels[pet.species] || pet.species}</span></td>
                  <td>${pet.breed || "—"}</td>
                  <td>${pet.age ?? "—"} yrs</td>
                  <td>${pet.owner}</td>
                  <td>${pet.bio || "—"}</td>
                  <td>
                     <div style="display:flex;gap:6px;">
                        <button class="btn small ghost edit-pet-btn" data-id="${pet.id}"></button>
                        <button class="btn small ghost delete-pet-btn" data-id="${pet.id}"></button>
                     </div>
                  </td>
               </tr>`;
            }).join("")}
         </tbody>
      `;

      table.querySelectorAll(".edit-pet-btn").forEach(btn => {
         btn.innerHTML = pencilIcon;
         btn.addEventListener("click", () => openEditPet(Number(btn.dataset.id)));
      });
      table.querySelectorAll(".delete-pet-btn").forEach(btn => {
         btn.innerHTML = trashIcon;
         btn.addEventListener("click", async () => {
            const pet = pets.find(p => p.id === Number(btn.dataset.id));
            if (!confirm(`Delete ${pet.name}?`)) return;
            await fetch(`/api/pets/${btn.dataset.id}`, { method: "DELETE" });
            await loadAndShowPets();
         });
      });

      petListEl.appendChild(table);
   }

   async function loadAndShowPets() {
      await loadPets();
      renderPatients(pets);
   }

   document.getElementById("patientSearch").addEventListener("input", function () {
      const q = this.value.toLowerCase();
      renderPatients(pets.filter(p =>
         p.name.toLowerCase().includes(q) || p.owner.toLowerCase().includes(q)
      ));
   });

   document.getElementById("openPetModalBtn").onclick = () => {
      petModalTitle.textContent = "Add Patient";
      document.getElementById("petEditId").value = "";
      document.getElementById("petForm").reset();
      setSpeciesPicker("dog");
      modal.classList.add("open");
   };

   document.getElementById("cancelPetModalBtn").onclick = () => modal.classList.remove("open");

   window.openEditPet = function (id) {
      const pet = pets.find(p => p.id === id);
      if (!pet) return;
      petModalTitle.textContent = "Edit Patient";
      document.getElementById("petEditId").value = pet.id;
      document.getElementById("petNameInput").value = pet.name;
      document.getElementById("petBreedInput").value = pet.breed || "";
      document.getElementById("petAgeInput").value = pet.age ?? "";
      document.getElementById("petBioInput").value = pet.bio || "";
      document.getElementById("petOwnerInput").value = pet.owner;
      setSpeciesPicker(pet.species);
      modal.classList.add("open");
   };

   document.getElementById("petForm").onsubmit = async function (e) {
      e.preventDefault();
      const editId = document.getElementById("petEditId").value;
      const data = {
         name: document.getElementById("petNameInput").value,
         species: speciesInput.value.replace(".png", ""),
         breed: document.getElementById("petBreedInput").value,
         age: document.getElementById("petAgeInput").value || null,
         bio: document.getElementById("petBioInput").value,
         owner: document.getElementById("petOwnerInput").value
      };
      await fetch(editId ? `/api/pets/${editId}` : "/api/pets", {
         method: editId ? "PUT" : "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(data)
      });
      await loadAndShowPets();
      this.reset();
      modal.classList.remove("open");
   };

   loadAndShowPets();
}

/* ===================== VETS (vets.html) ===================== */
if (document.getElementById("vetList")) {

   const vetListEl = document.getElementById("vetList");
   const modal = document.getElementById("vetModalBackdrop");
   const vetModalTitle = document.getElementById("vetModalTitle");
   let vets = [];

   async function loadAndShowVets() {
      const res = await fetch("/api/vets");
      vets = await res.json();
      renderVets(vets);
   }

   function renderVets(list) {
      vetListEl.innerHTML = "";
      document.getElementById("emptyVetNote").style.display = list.length ? "none" : "block";
      if (!list.length) return;

      const table = document.createElement("table");
      table.className = "data-table";
      table.innerHTML = `
         <thead>
            <tr>
               <th>Name</th>
               <th>Specialization</th>
               <th>Phone</th>
               <th>Email</th>
               <th>Actions</th>
            </tr>
         </thead>
         <tbody>
            ${list.map(v => `
            <tr>
               <td><strong>${v.name}</strong></td>
               <td>${v.specialization || "—"}</td>
               <td>${v.phone || "—"}</td>
               <td>${v.email || "—"}</td>
               <td>
                  <div style="display:flex;gap:6px;">
                     <button class="btn small ghost edit-vet-btn" data-id="${v.id}"></button>
                     <button class="btn small ghost delete-vet-btn" data-id="${v.id}"></button>
                  </div>
               </td>
            </tr>`).join("")}
         </tbody>
      `;

      table.querySelectorAll(".edit-vet-btn").forEach(btn => {
         btn.innerHTML = pencilIcon;
         btn.addEventListener("click", () => openEditVet(Number(btn.dataset.id)));
      });
      table.querySelectorAll(".delete-vet-btn").forEach(btn => {
         btn.innerHTML = trashIcon;
         btn.addEventListener("click", async () => {
            const vet = vets.find(v => v.id === Number(btn.dataset.id));
            if (!confirm(`Delete ${vet.name}?`)) return;
            await fetch(`/api/vets/${btn.dataset.id}`, { method: "DELETE" });
            await loadAndShowVets();
         });
      });

      vetListEl.appendChild(table);
   }

   document.getElementById("vetSearch").addEventListener("input", function () {
      const q = this.value.toLowerCase();
      renderVets(vets.filter(v =>
         v.name.toLowerCase().includes(q) ||
         (v.specialization || "").toLowerCase().includes(q)
      ));
   });

   document.getElementById("openVetModalBtn").onclick = () => {
      vetModalTitle.textContent = "Add Vet";
      document.getElementById("vetEditId").value = "";
      document.getElementById("vetForm").reset();
      modal.classList.add("open");
   };

   document.getElementById("cancelVetModalBtn").onclick = () => modal.classList.remove("open");

   window.openEditVet = function (id) {
      const vet = vets.find(v => v.id === id);
      if (!vet) return;
      vetModalTitle.textContent = "Edit Vet";
      document.getElementById("vetEditId").value = vet.id;
      document.getElementById("vetNameInput").value = vet.name;
      document.getElementById("vetSpecInput").value = vet.specialization || "";
      document.getElementById("vetPhoneInput").value = vet.phone || "";
      document.getElementById("vetEmailInput").value = vet.email || "";
      modal.classList.add("open");
   };

   document.getElementById("vetForm").onsubmit = async function (e) {
      e.preventDefault();
      const editId = document.getElementById("vetEditId").value;
      const data = {
         name: document.getElementById("vetNameInput").value,
         specialization: document.getElementById("vetSpecInput").value,
         phone: document.getElementById("vetPhoneInput").value,
         email: document.getElementById("vetEmailInput").value
      };
      await fetch(editId ? `/api/vets/${editId}` : "/api/vets", {
         method: editId ? "PUT" : "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(data)
      });
      await loadAndShowVets();
      this.reset();
      modal.classList.remove("open");
   };

   loadAndShowVets();
}

/* ===================== APPOINTMENTS (index.html) ===================== */
if (document.getElementById("upcomingList")) {

   const modal = document.getElementById("apptModalBackdrop");
   const apptForm = document.getElementById("apptForm");
   let allAppts = [];

   async function loadAppts() {
      await loadPets();
      const res = await fetch("/api/appointments");
      allAppts = await res.json();
      renderAppts(allAppts);
      document.getElementById("apptPetSelect").innerHTML = pets.map(p =>
         `<option value="${p.id}">${p.name} (${p.owner})</option>`
      ).join("");
   }

   function renderAppts(list) {
      const upcoming = list.filter(a => a.status === "Scheduled");
      const completed = list.filter(a => a.status !== "Scheduled");

      document.getElementById("emptyUpcoming").style.display = upcoming.length ? "none" : "block";
      document.getElementById("emptyCompleted").style.display = completed.length ? "none" : "block";
      document.getElementById("upcomingList").innerHTML = apptTable(upcoming);
      document.getElementById("completedList").innerHTML = apptTable(completed);
   }

   function apptTable(list) {
      if (!list.length) return "";
      return `
         <table class="data-table">
            <thead>
               <tr>
                  <th>Patient</th>
                  <th>Owner</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>Actions</th>
               </tr>
            </thead>
            <tbody>
               ${list.map(a => {
                  const statusClass = { Scheduled: "badge-blue", Completed: "badge-green", Cancelled: "badge-red" };
                  return `
                  <tr>
                     <td><strong>${a.pet_name}</strong></td>
                     <td>${a.pet_owner}</td>
                     <td>${formatDate(a.date)}</td>
                     <td>${a.reason}</td>
                     <td>${a.notes || "—"}</td>
                     <td><span class="badge ${statusClass[a.status] || 'badge-gray'}">${a.status}</span></td>
                     <td>
                        <div style="display:flex;gap:6px;">
                           <button class="btn small ghost" onclick="openEditAppt(${a.id})">${pencilIcon}</button>
                           <button class="btn small ghost" onclick="deleteAppt(${a.id})">${trashIcon}</button>
                        </div>
                     </td>
                  </tr>`;
               }).join("")}
            </tbody>
         </table>
      `;
   }

   document.getElementById("apptSearch").addEventListener("input", function () {
      const q = this.value.toLowerCase();
      renderAppts(allAppts.filter(a =>
         a.pet_name.toLowerCase().includes(q) || a.pet_owner.toLowerCase().includes(q)
      ));
   });

   document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", function () {
         document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
         this.classList.add("active");
         document.getElementById("tab-upcoming").style.display = this.dataset.tab === "upcoming" ? "block" : "none";
         document.getElementById("tab-completed").style.display = this.dataset.tab === "completed" ? "block" : "none";
      });
   });

   document.getElementById("openApptModalBtn").onclick = () => {
      document.getElementById("apptModalTitle").textContent = "New Appointment";
      document.getElementById("apptEditId").value = "";
      apptForm.reset();
      modal.classList.add("open");
   };

   document.getElementById("cancelApptModalBtn").onclick = () => modal.classList.remove("open");

   window.openEditAppt = function (id) {
      const a = allAppts.find(x => x.id === id);
      if (!a) return;
      document.getElementById("apptModalTitle").textContent = "Edit Appointment";
      document.getElementById("apptEditId").value = a.id;
      document.getElementById("apptPetSelect").value = a.pet_id;
      document.getElementById("apptDate").value = new Date(a.date).toISOString().slice(0, 16);
      document.getElementById("apptReason").value = a.reason;
      document.getElementById("apptNotes").value = a.notes || "";
      document.getElementById("apptStatus").value = a.status;
      modal.classList.add("open");
   };

   window.deleteAppt = async function (id) {
      if (!confirm("Delete this appointment?")) return;
      await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      await loadAppts();
   };

   apptForm.onsubmit = async function (e) {
      e.preventDefault();
      const editId = document.getElementById("apptEditId").value;
      const data = {
         pet_id: Number(document.getElementById("apptPetSelect").value),
         date: document.getElementById("apptDate").value,
         reason: document.getElementById("apptReason").value,
         notes: document.getElementById("apptNotes").value,
         status: document.getElementById("apptStatus").value
      };
      await fetch(editId ? `/api/appointments/${editId}` : "/api/appointments", {
         method: editId ? "PUT" : "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(data)
      });
      await loadAppts();
      this.reset();
      modal.classList.remove("open");
   };

   loadAppts();
}
