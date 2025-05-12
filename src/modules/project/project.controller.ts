import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/:projectId/members', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    
    const members = await prisma.teamMember.findMany({
      where: {
        projectId: parseInt(projectId)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            privilege: true,
            profilePicPath: true
          }
        }
      }
    });

    res.json(members);
  } catch (error) {
    console.error('Error fetching project members:', error);
    res.status(500).json({ error: 'Failed to fetch project members' });
  }
});

export default router; 