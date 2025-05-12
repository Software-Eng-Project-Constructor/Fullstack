import { prisma } from "../../core/prismaClient";
import fs from "fs/promises";
import path from "path";

export class FileService {
  async saveFile(file: Express.Multer.File, userId: string, projectId: number) {
    return await prisma.file.create({
      data: {
        filename: file.originalname,
        mimetype: file.mimetype,
        path: file.path,
        userId,
        projectId,
      },
    });
  }

  async deleteFile(fileId: string, userId: string) {
    const file = await prisma.file.findFirst({
      where: { id: fileId, userId },
    });

    if (!file) throw new Error("File not found or unauthorized.");

    await fs.unlink(path.resolve(file.path));
    await prisma.file.delete({ where: { id: fileId } });
  }

  async getFilesByProject(projectId: number) {
    return await prisma.file.findMany({
      where: { projectId },
      select: {
        id: true,
        filename: true,
        mimetype: true,
        uploadedAt: true,
        user: { select: { id: true, name: true } },
      },
      orderBy: { uploadedAt: "desc" },
    });
  }
}
