import { json } from '@sveltejs/kit';
import prisma from '$lib/prisma';

export const GET = async () => {
  const uploads = await prisma.upload.findMany();
  return json(uploads);
};