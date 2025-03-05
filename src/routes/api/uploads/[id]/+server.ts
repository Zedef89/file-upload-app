import { json, error } from '@sveltejs/kit';
import prisma from '$lib/prisma';
import fs from 'fs';
import path from 'path';
import * as Minio from 'minio';

// Configura MinIO client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
  secretKey: process.env.MINIO_SECRET_KEY || 'password',
});

const bucketName = process.env.MINIO_BUCKET_NAME || 'uploads';
const uploadDir = './static/uploads/'; // Percorso di fallback per i file salvati localmente

/**
 * 📌 **GET** - Recupera un file (MinIO o locale)
 */
export const GET = async ({ params }) => {
  try {
    const { id } = params;
    console.log(`🔍 Recupero file con ID: ${id}`);

    // **1️⃣ Trova il file nel database**
    const fileRecord = await prisma.upload.findUnique({ where: { id } });

    if (!fileRecord) {
      throw error(404, 'File non trovato');
    }

    let fileUrl = fileRecord.minioPath || fileRecord.localPath;
    console.log(`📂 Percorso scelto per la preview: ${fileUrl}`);

    return json({ url: fileUrl });
  } catch (err) {
    console.error('❌ Errore nel recupero del file:', err);
    return json({ error: err.message || 'Errore generico' }, { status: 500 });
  }
};
/**
 * ❌ **DELETE** - Elimina un file (da MinIO o locale + database)
 */
export const DELETE = async ({ params }) => {
  try {
    const { id } = params;
    console.log(`🗑 Eliminazione file con ID: ${id}`);

    // 🔹 **1. Cerca il file nel database**
    const fileRecord = await prisma.upload.findUnique({
      where: { id }
    });

    if (!fileRecord) {
      console.warn(`⚠️ File con ID ${id} non trovato nel database.`);
      return json({ error: 'File non trovato' }, { status: 404 });
    }

    const filePath = fileRecord.filePath;
    let deletedFromMinio = false;
    let deletedLocally = false;

    // 🔹 **2. Se il file è su MinIO, prova a eliminarlo**
    if (filePath.startsWith('http')) {
      const fileName = path.basename(filePath);
      try {
        await minioClient.removeObject(bucketName, fileName);
        console.log(`✅ File eliminato da MinIO: ${fileName}`);
        deletedFromMinio = true;
      } catch (err) {
        console.error(`❌ Errore durante l'eliminazione da MinIO: ${err.message}`);
      }
    } else {
      // 🔹 **3. Se il file è locale, prova a eliminarlo**
      const localPath = path.join(uploadDir, path.basename(filePath));
      try {
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
          console.log(`✅ File eliminato localmente: ${localPath}`);
          deletedLocally = true;
        } else {
          console.warn(`⚠️ File locale non trovato: ${localPath}`);
        }
      } catch (err) {
        console.error(`❌ Errore durante l'eliminazione locale: ${err.message}`);
      }
    }

    // 🔹 **4. Se almeno una eliminazione è riuscita, rimuovi il record dal database**
    if (deletedFromMinio || deletedLocally) {
      await prisma.upload.delete({ where: { id } });
      console.log(`🗑 Record eliminato dal database`);
    } else {
      console.warn(`⚠️ Nessun file eliminato, ma il record rimane nel database.`);
    }

    return json({ message: 'File eliminato con successo' });
  } catch (err) {
    console.error('❌ Errore nella cancellazione:', err);
    return json({ error: err.message || 'Errore generico' }, { status: 500 });
  }
};