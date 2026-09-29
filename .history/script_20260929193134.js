/* ---------------------------------------------------------
   PETLY — script.js
   Shared across index.html (Feed), profile.html (Pet Profiles),
   and pet-request.html (Buddy Requests)

   Talks to the Express + MySQL API in server.js.
   Open the app via http://localhost:3000/index.html (not by
   double-clicking the file) so these relative /api/... paths work.
--------------------------------------------------------- */

let pets = [];

/* same mood list as the mood ENUM in petly_schema.sql */
const moodOptions = [
   "Zoomies",
   "Sleepy",
   "Hungry",
   "Feeling Fancy",
   "Suspicious of the vacuum",
   "Plotting Something",
   "Extremely Offended",
   "Living My Best Life",
   "Guarding the Door",
   "Judging You",
   "Cuddle Mode",
   "Chaotic Good"
];

/* species filename -> readable label */
const speciesLabels = {
   "dog.png": "Dog",
   "cat.png": "Cat",
   "rabbit.png": "Rabbit",
   "bird.png": "Bird"
};

/* the DB stores species as "dog"/"cat"/etc with no extension;
   this normalizes either form into a real filename */
function speciesFile(species) {
   return species.endsWith(".png") ? species : species + ".png";
}

/* reads a chosen <input type="file"> as a data URL — local preview
   only, since pets/posts have no photo column in the database */
function readFileAsDataURL(fileInput) {
   return new Promise((resolve) => {
      const file = fileInput.files[0];
      if (!file) { resolve(""); return; }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
   });
}

/* shared: every page needs the pets list for its dropdown(s) */
async function loadPets() {
   const res = await fetch("/api/pets");
   pets = await res.json();
}

/* ===================== FEED PAGE (index.html) ===================== */
if (document.getElementById("postList")) {

   const postList = document.getElementById("postList");
   const petSelect = document.getElementById("petSelect");
   const moodSelect = document.getElementById("moodSelect");
   const postPhotoInput = document.getElementById("postPhotoInput");
   const photoPreview = document.getElementById("photoPreview");
   const modal = document.getElementById("modalBackdrop");
   const composerAvatar = document.getElementById("composerAvatar");
   const modalAvatar = document.getElementById("modalAvatar");
   const composerTrigger = document.getElementById("composerTrigger");
   const captionInput = document.getElementById("captionInput");
   const postForm = document.getElementById("postForm");

   function petAvatar(pet) {
      return "assets/" + speciesFile(pet.species);
   }

   function updateComposerForSelectedPet() {
      const pet = pets.find(p => p.id === Number(petSelect.value));
      if (!pet) return;
      const avatarSrc = petAvatar(pet);
      composerAvatar.src = avatarSrc;
      modalAvatar.src = avatarSrc;
      const placeholder = `What's on ${pet.name}'s mind?`;
      composerTrigger.textContent = placeholder;
      captionInput.placeholder = placeholder;
   }

   petSelect.addEventListener("change", updateComposerForSelectedPet);

   // GET api/posts -> posts (joined with pet_name / pet_species)
   async function loadPosts() {
      const res = await fetch("/api/posts");
      const posts = await res.json();
      showPosts(posts);
   }

   function showPosts(posts) {
      postList.innerHTML = "";
      document.getElementById("emptyNote").style.display = posts.length ? "none" : "block";

      posts.forEach(post => {
         const avatarSrc = "assets/" + speciesFile(post.pet_species);
         postList.innerHTML += `
            <div class="post">
               <div class="post-head">
                  <img src="${avatarSrc}" alt="${post.pet_name}" class="avatar">
                  <strong>${post.pet_name}</strong>
               </div>
               <div class="post-body">
                  <p class="caption">${post.caption}</p>
                  ${post.mood ? `<span class="mood-tag">${post.mood}</span>` : ""}
               </div>
            </div>
         `;
      });
   }

   function openComposer() {
      modal.classList.add("open");
      updateComposerForSelectedPet();
   }

   document.getElementById("composerBar").onclick = openComposer;
   document.getElementById("cancelModalBtn").onclick = () => {
      modal.classList.remove("open");
      postForm.reset();
      photoPreview.style.display = "none";
   };

   // local preview only — not sent to the server (no photo column on posts)
   postPhotoInput.addEventListener("change", async () => {
      const dataUrl = await readFileAsDataURL(postPhotoInput);
      if (dataUrl) {
         photoPreview.src = dataUrl;
         photoPreview.style.display = "block";
      } else {
         photoPreview.style.display = "none";
      }
   });

   postForm.onsubmit = async function (e) {
      e.preventDefault();

      // POST api/posts <- { pet_id, caption, mood }
      await fetch("/api/posts", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            pet_id: Number(petSelect.value),
            caption: captionInput.value,
            mood: moodSelect.value
         })
      });

      await loadPosts();
      this.reset();
      photoPreview.style.display = "none";
      modal.classList.remove("open");
   };

   (async function initFeed() {
      await loadPets();
      petSelect.innerHTML = pets.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
      moodSelect.innerHTML = moodOptions.map(m => `<option value="${m}">${m}</option>`).join("");
      updateComposerForSelectedPet();
      await loadPosts();
   })();
}

/* ===================== PET PROFILES PAGE (profile.html) ===================== */
if (document.getElementById("petList")) {

   const petListEl = document.getElementById("petList");
   const modal = document.getElementById("petModalBackdrop");
   const speciesSelect = document.getElementById("petSpeciesInput");
   const speciesPreview = document.getElementById("speciesPreview");

   // GET api/pets -> pets
   async function loadAndShowPets() {
      await loadPets();
      showPets();
   }

   function showPets() {
      petListEl.innerHTML = "";
      document.getElementById("emptyPetNote").style.display = pets.length ? "none" : "block";

      pets.forEach(pet => {
         const mainPhoto = "assets/" + speciesFile(pet.species);
         const speciesKey = speciesFile(pet.species);
         petListEl.innerHTML += `
            <div class="pet-card">
               <img src="${mainPhoto}" alt="${pet.name}" class="pet-photo">
               <div class="pet-card-body">
                  <h3>${pet.name}</h3>
                  <p class="pet-species">
                     <img src="assets/${speciesKey}" alt="${speciesLabels[speciesKey]}" class="species-icon">
                     ${speciesLabels[speciesKey]}
                  </p>
                  <p class="pet-meta">${pet.breed || ""} · ${pet.age ?? "?"} yrs old · owner: ${pet.owner}</p>
                  <p class="pet-bio">${pet.bio || ""}</p>
                  <button class="btn ghost small" onclick="deletePet(${pet.id})">Delete</button>
               </div>
            </div>
         `;
      });
   }

   // DELETE api/pets/:id
   window.deletePet = async function (id) {
      await fetch(`/api/pets/${id}`, { method: "DELETE" });
      await loadAndShowPets();
   };

   document.getElementById("openPetModalBtn").onclick = () => modal.classList.add("open");
   document.getElementById("cancelPetModalBtn").onclick = () => modal.classList.remove("open");

   if (speciesSelect && speciesPreview) {
      speciesSelect.addEventListener("change", function () {
         speciesPreview.src = "assets/" + this.value;
      });
   }

   document.getElementById("petForm").onsubmit = async function (e) {
      e.preventDefault();

      // species select uses "dog.png" etc — strip the extension for the DB's ENUM
      const speciesValue = speciesSelect.value.replace(".png", "");

      // POST api/pets <- { name, species, breed, age, bio, owner }
      await fetch("/api/pets", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            name: document.getElementById("petNameInput").value,
            species: speciesValue,
            breed: document.getElementById("petBreedInput").value,
            age: document.getElementById("petAgeInput").value || null,
            bio: document.getElementById("petBioInput").value,
            owner: document.getElementById("petOwnerInput").value
         })
      });

      await loadAndShowPets();
      this.reset();
      modal.classList.remove("open");
   };

   loadAndShowPets();
}

/* ===================== BUDDY REQUESTS PAGE (pet-request.html) ===================== */
if (document.getElementById("requestList")) {

   const requestListEl = document.getElementById("requestList");
   const emptyRequestNote = document.getElementById("emptyRequestNote");
   const modal = document.getElementById("requestModalBackdrop");
   const fromSelect = document.getElementById("fromPetSelect");
   const toSelect = document.getElementById("toPetSelect");

   // GET api/requests -> requests (joined with from_name / to_name)
   async function loadRequests() {
      const res = await fetch("/api/requests");
      const requests = await res.json();
      showRequests(requests);
   }

   function showRequests(requests) {
      requestListEl.innerHTML = "";
      emptyRequestNote.style.display = requests.length ? "none" : "block";

      requests.forEach(req => {
         requestListEl.innerHTML += `
            <div class="post">
               <div class="post-body">
                  <p class="caption"><strong>${req.from_name}</strong> wants to be friends with <strong>${req.to_name}</strong></p>
                  <span class="mood-tag">${req.status}</span>
                  <div class="post-actions">
                     ${req.status === "Pending"
                        ? `<button class="btn small" onclick="acceptRequest(${req.id})">Accept</button>
                           <button class="btn ghost small" onclick="declineRequest(${req.id})">Decline</button>`
                        : `<button class="btn ghost small" onclick="deleteRequest(${req.id})">Remove</button>`
                     }
                  </div>
               </div>
            </div>
         `;
      });
   }

   // PATCH api/requests/:id <- { status: "Accepted" }
   window.acceptRequest = async function (id) {
      await fetch(`/api/requests/${id}`, {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ status: "Accepted" })
      });
      await loadRequests();
   };

   // DELETE api/requests/:id
   window.declineRequest = async function (id) {
      await fetch(`/api/requests/${id}`, { method: "DELETE" });
      await loadRequests();
   };
   window.deleteRequest = async function (id) {
      await fetch(`/api/requests/${id}`, { method: "DELETE" });
      await loadRequests();
   };

   document.getElementById("openRequestModalBtn").onclick = () => modal.classList.add("open");
   document.getElementById("cancelRequestModalBtn").onclick = () => modal.classList.remove("open");

   document.getElementById("requestForm").onsubmit = async function (e) {
      e.preventDefault();

      // POST api/requests <- { from_pet_id, to_pet_id }
      await fetch("/api/requests", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            from_pet_id: Number(fromSelect.value),
            to_pet_id: Number(toSelect.value)
         })
      });

      await loadRequests();
      this.reset();
      modal.classList.remove("open");
   };

   (async function initRequests() {
      await loadPets();
      fromSelect.innerHTML = pets.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
      toSelect.innerHTML = pets.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
      await loadRequests();
   })();
}