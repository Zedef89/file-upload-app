<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { fade } from 'svelte/transition';

  interface Upload {
  id: string;
  title: string;
  description: string;
  category: string;
  language: string;
  provider: string;
  roles: string[];
  localPath: string;  // 📂 Percorso locale obbligatorio
  minioPath?: string; // 🔗 Percorso MinIO opzionale (può essere undefined)
  uploadedAt: Date;
}


// Variabili per la modale di benvenuto
let showWelcomeModal = writable(true);

// Funzione per chiudere la modale di benvenuto
const closeWelcomeModal = () => {
  showWelcomeModal.set(false);
};



  let title = '';
  let description = '';
  let category = '';
  let language = '';
  let provider = '';
  let roles = [];
  let file: File | null = null;
  let isUploading = writable(false);
  let message = writable('');
  let uploads = writable([]);
  let showModal = writable(false);
  let searchQuery = writable('');

  let showNotification = writable(false); // Per mostrare il popup

  // Opzioni per i dropdown
  const categories = [
    "Leadership", "Managing Complexity", "Conflict Resolution",
    "Communication", "Personal Growth", "Innovation", "Teamwork", "Strategy"
  ];

  const languages = [
    "English", "Italian", "Spanish", "French", "German", "Portuguese",
    "Chinese", "Japanese", "Russian", "Arabic", "Hindi", "Korean",
    "Dutch", "Greek", "Swedish", "Turkish", "Polish", "Hebrew"
  ];

  const providers = ["Skilla", "Linkedin", "Pack", "Mentor", "Udemy", "Coursera", "HarvardX", "Google Academy"];

  const roleOptions = [
    "Mentor / Coach", "Mentee / Coachee", "Team Leader", "Project Manager", "HR Specialist",
    "Entrepreneur", "Freelancer", "Consultant", "Trainer", "Developer"
  ];


  // Carica i file già presenti
  const loadUploads = async () => {
    const res = await fetch('/api/uploads');
    const data = await res.json();
    uploads.set(data);
  };

  onMount(loadUploads);



 


  const deleteUpload = async (id: string) => {
  if (!confirm("❗ Are you sure you want to delete this resource?")) return;

  const res = await fetch(`/api/uploads/${id}`, { method: 'DELETE' });

  if (res.ok) {
    message.set('✅ File deleted successfully!');
    showNotification.set(true); // Mostra il popup
    loadUploads();

    // Nasconde il popup dopo 3 secondi
    setTimeout(() => {
      showNotification.set(false);
      message.set('');
    }, 3000);
  } else {
    message.set('❌ Error during deletion');
  }
};

  // Gestione upload
  const handleUpload = async () => {
  if (!file) {
    message.set('⚠️ Select a file before uploading!');
    return;
  }

  isUploading.set(true);
  message.set('');

  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('category', category);
  formData.append('language', language);
  formData.append('provider', provider);
  formData.append('roles', roles.join(','));
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });

  isUploading.set(false);

  if (res.ok) {
    message.set('✅ File uploaded successfully!');
    showNotification.set(true); // Mostra il popup
    loadUploads();

    // Pulisce i campi dopo l'upload
    title = '';
    description = '';
    category = '';
    language = '';
    provider = '';
    roles = [];
    file = null;

    // Chiudi il modal e nascondi il popup dopo 3 secondi
    showModal.set(false);
    setTimeout(() => {
      
      showNotification.set(false);
      message.set('');
    }, 3000);
  } else {
    message.set('❌ Error during upload.');
  }
};

let previewUrl = writable('');
  let showPreviewModal = writable(false);
  let fileType = writable('');

  async function previewFile(upload: Upload) {
  try {
    const url = upload.minioPath || upload.localPath; // 🔹 Usa MinIO se disponibile, altrimenti locale

    if (!url) {
      console.error('❌No valid URL found.');
      return;
    }

    previewUrl.set(url);

    // 🔹 Determina il tipo di file per la preview
    const ext = url.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      fileType.set('image');
    } else if (['mp4', 'webm', 'ogg'].includes(ext)) {
      fileType.set('video');
    } else if (['pdf'].includes(ext)) {
      fileType.set('pdf');
    } else {
      fileType.set('unknown');
    }

    showPreviewModal.set(true);
  } catch (err) {
    console.error('❌ Error retrieving the preview:', err);
  }
}
</script>

<style>

.modal-welcome-content {
  background: white;
  padding: 40px;  /* Aggiunto più padding per separare il contenuto dai bordi */
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  text-align: center;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2);  /* Aggiunta ombra per un aspetto più professionale */
}

.modal-welcome h2 {
  margin-bottom: 20px;
  font-size: 24px;  /* Aumentata la dimensione del titolo per migliorare la leggibilità */
}

.modal-welcome p {
  margin-bottom: 20px;
  font-size: 16px;  /* Aumentata la dimensione del testo per una lettura più facile */
}

.modal-welcome ul {
  list-style-type: disc;
  margin-left: 30px;  /* Aggiunto spazio per l'elenco */
  margin-bottom: 20px;
}

.modal-welcome {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }



  .close-btn {
    background-color: #ff6b00;
    color: white;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    border-radius: 8px;
    font-weight: bold;
  }

  .close-btn:hover {
    background-color: #e65a00;
  }

@media (max-width: 768px) {
    .container {
      width: 95%;
      padding: 15px;
    }

    .input-field, select {
      font-size: 16px;
    }

    .button-container {
      flex-direction: column;
    }

    .button {
      width: 100%;
      padding: 12px;
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      display: block;
      width: 100%;
      overflow-x: auto;
      white-space: nowrap;
    }

    .modal-upload-content, .modal-preview-content {
      width: 90%;
      max-width: 400px;
    }

    .preview-content {
      max-width: 100%;
      height: auto;
    }

    .pdf-preview {
      height: 60vh;
    }
  }

  .container {
    max-width: 800px;
    margin: auto;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  }

  .search-bar {
    width: calc(100% - 20px);
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-right: 10px;
  }

  .input-field, select {
    width: 100%;
    padding: 4px;
    margin-bottom: 40px;
    border: 1px solid #ddd;
    border-radius: 12px;
  }

  textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    resize: vertical;
    min-height: 50px;
  }

  .button-container {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 10px;
  }

  .button {
    background-color: #ff6b00;
    color: white;
    padding: 10px 20px;
    border: none;
    cursor: pointer;
    border-radius: 8px;
    font-weight: bold;
  }

  .button:disabled {
    background-color: gray;
    cursor: not-allowed;
  }

  .table-container {
    margin-top: 20px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 10px;
    border-bottom: 1px solid #ddd;
    text-align: left;
  }

  th {
    background-color: #f3f3f3;
  }

  /* Modal upload */
  .modal-upload {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-upload-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 500px;
    position: relative;
  }

  

  .delete-button {
  background-color: #e63946;
  color: white;
  border: none;
  padding: 7px 14px;
  margin-left: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: 0.3s ease;
}

.delete-button:hover {
  background-color: #c62828;
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  transition: opacity 0.5s ease-in-out;
}

/* Modal Preview */
.modal-preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center; /* Centra verticalmente */
  justify-content: center; /* Centra orizzontalmente */
  z-index: 1000;
}

.modal-preview-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto; /* Aggiunge lo scroll se il contenuto è troppo grande */
  position: relative;
  text-align: center; /* Centra il contenuto */
}

/* Stile per il contenuto della preview */
.preview-content {
  max-width: 100%;
  height: 100vh;
  display: block;
  margin: auto;
  border-radius: 8px;
}

/* Video e PDF devono adattarsi senza uscire */
.video-preview, .pdf-preview {
  width: 100%;
  max-width: 100%;
  max-height: 60vh;
}


.pdf-preview {
  width: 100%;
  height: 80vh; /* Altezza dinamica basata sul viewport */
  border: none;
}



.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #ff6b00;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

<!-- Modale di benvenuto -->
{#if $showWelcomeModal}
  <div class="modal-welcome">
    <div class="modal-welcome-content">
      <h2>Welcome to the File Upload App!</h2>
      <p>This app allows you to upload, manage, and preview various resources such as videos, images, and PDFs.</p>
      <p>Here's what you can do:</p>
      <ul>
        <li>Upload files and provide metadata like title, description, and category.</li>
        <li>Search through your uploaded resources based on title, description, category, language, and provider.</li>
        <li>Preview files in different formats (image, video, PDF) directly within the app.</li>
        <li>Delete resources you no longer need.</li>
      </ul>
      <button class="close-btn" on:click={closeWelcomeModal}>Got it, show me the app!</button>
    </div>
  </div>
{/if}

<div class="container">
  <h2>Resources</h2>

    {#if $showNotification}
    <div class="notification" transition:fade>{$message}</div>
  {/if}

  <!-- Barra di ricerca -->
  <input 
    type="text" 
    bind:value={$searchQuery} 
    placeholder="🔍 Search..." 
    class="search-bar" 
  />

  <button class="button" on:click={() => showModal.set(true)}>➕ Upload</button>

  {#if $showPreviewModal}
  <div class="modal-preview">
    <div class="modal-preview-content">
      <button on:click={() => showPreviewModal.set(false)} class="close-btn">✖</button>

      {#if $fileType === 'unknown'}
      <p>⚠️ Preview not available for this format.</p>
      <a href={$previewUrl} download>
        <button class="button">Download File</button>
      </a>
    {:else}
      {#if $fileType === 'image'}
        <img src={$previewUrl} alt="Preview" class="preview-content">
      {:else if $fileType === 'video'}
        <video controls class="preview-content">
          <source src={$previewUrl} type="video/mp4">
          Your browser does not support video playback.
        </video>
      {:else if $fileType === 'pdf'}
        <iframe src={$previewUrl} class="pdf-preview"></iframe>
      {/if}
    {/if}
    </div>
  </div>
{/if}
  <!-- Tabella con i file caricati -->
  <div class="table-container">
    <h2>Files</h2>
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Description</th> 
          <th>Category</th>
          <th>Language</th>
          <th>Provider</th>
          <th>Roles</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each $uploads.filter(upload => {
          const query = $searchQuery.toLowerCase();
          return (
            upload.title.toLowerCase().includes(query) ||
            upload.description.toLowerCase().includes(query) || 
            upload.category.toLowerCase().includes(query) ||
            upload.language.toLowerCase().includes(query) ||
            upload.provider.toLowerCase().includes(query) ||
            (upload.roles ? upload.roles.join(', ').toLowerCase().includes(query) : false)
          );
        }) as upload}
          <tr>
            <td>{upload.title}</td>
            <td>{upload.description || 'N/A'}</td> 
            <td>{upload.category}</td>
            <td>{upload.language}</td>
            <td>{upload.provider}</td>
            <td>{upload.roles ? upload.roles.join(', ') : 'N/A'}</td>
            <td>
              <button on:click={() => previewFile(upload)}>🔗 View</button>
              <button on:click={() => deleteUpload(upload.id)} class="delete-button">🗑️ Delete</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if $showModal}

  {#if $isUploading}
  <div class="loading-overlay">
    <div class="loading-spinner"></div>
    <p>Loading...</p>
  </div>
{/if}

    <div class="modal-upload">
      <div class="modal-upload-content">
        <h2>Upload Resource</h2>
        <form on:submit|preventDefault={handleUpload}>
          <input type="text" bind:value={title} placeholder="Title" class="input-field" required />
          <textarea bind:value={description} placeholder="Description" class="input-field"></textarea>
          
          <select bind:value={category} class="input-field">
            <option value="" disabled selected>Category</option>
            {#each categories as cat}
              <option value={cat}>{cat}</option>
            {/each}
          </select>
          
          <select bind:value={language} class="input-field">
            <option value="" disabled selected>Language</option>
            {#each languages as lang}
              <option value={lang}>{lang}</option>
            {/each}
          </select>

          <select bind:value={provider} class="input-field">
            <option value="" disabled selected>Provider</option>
            {#each providers as prov}
              <option value={prov}>{prov}</option>
            {/each}
          </select>

          <select multiple bind:value={roles} class="input-field">
            {#each roleOptions as role}
              <option value={role}>{role}</option>
            {/each}
          </select>

          <input type="file" on:change={(e) => file = e.target.files[0]} class="input-field" required />

          <div class="button-container">
            <button type="submit" class="button" disabled={$isUploading}>
              {#if $isUploading}
                ⏳ Loading...
              {:else}
                Upload
              {/if}
            </button>            <button type="button" class="button" style="background-color: gray;" on:click={() => showModal.set(false)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>