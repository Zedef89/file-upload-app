import { json } from '@sveltejs/kit';
import prisma from '$lib/prisma';
import fs from 'fs';
import * as Minio from 'minio';
import mime from 'mime-types';
import { lookup } from 'mime-types';



// 📂 **Percorso di fallback per i file salvati localmente**
const uploadDir = './static/uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 🛠 **Configura MinIO client**
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
  secretKey: process.env.MINIO_SECRET_KEY || 'password',
});

const bucketName = process.env.MINIO_BUCKET_NAME || 'uploads';

// 📌 **Funzione per assicurarsi che il bucket esista**
async function ensureBucket() {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      console.log(`🚀 Creazione del bucket MinIO: ${bucketName}`);
      await minioClient.makeBucket(bucketName, 'us-east-1');
    }
  } catch (error) {
    console.warn('⚠️ MinIO non disponibile. Procedo solo con il salvataggio locale.');
  }
}


// 📌 **Funzione di upload che salva SEMPRE in locale e tenta MinIO**
async function parseAndUploadFile(event) {
  const formData = await event.request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    throw new Error('File mancante');
  }

  const fileName = `${Date.now()}-${file.name}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  // **Determina il MIME type basato sull'estensione del file**
  const mimeType = lookup(fileName) || 'application/octet-stream'; // Determina il MIME type

  // **1️⃣ Salviamo sempre il file in locale**
  const localFilePath = `/uploads/${fileName}`;
  fs.writeFileSync(`./static${localFilePath}`, fileBuffer);
  console.log(`✅ File salvato localmente: ${localFilePath}`);

  let minioFilePath = null; // **🔗 Percorso MinIO (se disponibile)**

  // **2️⃣ Tentiamo di caricare su MinIO con il Content-Type corretto**

  try {
    await ensureBucket();
    await minioClient.putObject(
      bucketName,            // Nome del bucket
      fileName,              // Nome del file
      fileBuffer,            // Buffer del file
      fileBuffer.length,     // 📏 Lunghezza del file in byte
      { 'Content-Type': mimeType }  // 🔹 Opzioni con il MIME type corretto
    );
    minioFilePath = `http://localhost:9000/${bucketName}/${fileName}`;
    console.log(`✅ File caricato su MinIO con Content-Type ${mimeType}: ${minioFilePath}`);
  } catch (error) {
    console.warn('⚠️ Errore con MinIO, il file sarà disponibile solo in locale.', error);
  }

  return {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    category: formData.get('category') as string,
    language: formData.get('language') as string,
    provider: formData.get('provider') as string,
    roles: (formData.get('roles') as string)?.split(',') || [],
    localPath: localFilePath,    // 📂 **Percorso locale**
    minioPath: minioFilePath,    // 🔗 **Percorso MinIO (se disponibile)**
    filePath: minioFilePath || localFilePath, // ✅ **Aggiungiamo il filePath con fallback**
    //mimeType: mimeType           // 🏷 **Salviamo il Content-Type nel database**
  };
}

// 📌 **Endpoint di upload**
export const POST = async (event) => {
  try {
    console.log('📩 Richiesta di upload ricevuta');

    const formData = await parseAndUploadFile(event);

    // **3️⃣ Salviamo entrambi i percorsi nel database**
    const newUpload = await prisma.upload.create({
      data: formData
    });

    console.log('✅ Upload salvato nel database:', newUpload);

    return json({ message: 'Upload riuscito', upload: newUpload });
  } catch (error) {
    console.error('❌ Errore durante l\'upload:', error);
    return json({ error: error.message || 'Errore generico' }, { status: 500 });
  }
};