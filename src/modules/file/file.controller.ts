import { Request, Response } from "express";
import { FileService } from "./file.service";

export class FileController {
  private service = new FileService();

 uploadFile = async (req: Request, res: Response) => {
  try {
    // Try session first, fall back to query param or header
    const userId = req.session?.user?.id || req.query.userId || req.headers['x-user-id'];
    const projectId = parseInt(req.params.projectId, 10);
    const file = req.file;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated or userId not provided." });
    }

    if (!file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const saved = await this.service.saveFile(file, String(userId), projectId);
    res.status(201).json(saved);
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Failed to upload file." });
  }
};

  deleteFile = async (req: Request, res: Response) => {
    try {
      const userId = req.session?.user?.id;
      const fileId = req.params.fileId;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated." });
      }

      await this.service.deleteFile(fileId, userId);
      console.log(`🗑️ File ${fileId} deleted by user ${userId}`);
      res.status(204).send();
    } catch (err) {
      console.error("❌ Deletion failed:", err);
      res.status(500).json({ error: "Failed to delete file." });
    }
  };

  getFilesByProject = async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId, 10);

      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID." });
      }

      console.log("📥 Fetching files for project:", projectId);
      const files = await this.service.getFilesByProject(projectId);
      res.json(files);
    } catch (err) {
      console.error("❌ Fetch failed:", err);
      res.status(500).json({ error: "Failed to fetch files." });
    }
  };
}
