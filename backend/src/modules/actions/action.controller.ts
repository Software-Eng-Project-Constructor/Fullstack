// action.controller.ts
import { Request, Response } from "express";
import * as ActionService from "./action.service";

export const createAction = async (req: Request, res: Response) => {
  try {
    
    console.log("Create Action hit!!!!", req.body);
    const userId = req.session!.user.id;

    const isAuthorized = await ActionService.isTeamMember(userId, req.body.stepId);
    if (!isAuthorized) return res.status(403).json({ error: "Forbidden" });

    const action = await ActionService.createAction(req.body);
    res.status(201).json({ action });
  } catch (error) {
    console.error("Create Action Error:", error);
    res.status(500).json({ error: "Failed to create action" });
  }
};

export const getActionsByStep = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.user.id;
    const { stepId } = req.params;

    console.log("➡️  Fetching actions for stepId:", stepId);
    const isAuthorized = await ActionService.isTeamMember(userId, stepId);
    if (!isAuthorized) return res.status(403).json({ error: "Forbidden" });

    const actions = await ActionService.getActionsByStep(stepId);
    res.json({ actions });
  } catch (error) {
    console.error("🔥 Get Actions Error:", error);
    res.status(500).json({ error: "Failed to fetch actions" });
  }
};


export const updateAction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.session!.user.id;

    // Log full incoming data
    console.log("📦 incoming PATCH req.body", req.body);

    // Authorization check
    const isAuthorized = await ActionService.isTeamMemberByAction(userId, id);
    if (!isAuthorized) return res.status(403).json({ error: "Forbidden" });

    // Clean update payload
    const updates = { ...req.body };

    // ❗ Delete completed if not explicitly sent
    if (!("completed" in req.body)) {
      delete updates.completed;
    }

    // Apply all updates (status, title, priority, etc.)
    const updated = await ActionService.updateAction(id, updates);

    // Send full updated action back
    res.json({ action: updated });
  } catch (error) {
    console.error("🔥 Update Action Error:", error);
    res.status(500).json({ error: "Failed to update action" });
  }
};


export const deleteAction = async (req: Request, res: Response) => {
  try {
    console.log("deleteAction hit");
    const userId = req.session!.user.id;
    const { id: actionId } = req.params;

    const isAuthorized = await ActionService.isTeamMemberByAction(userId, actionId);
    if (!isAuthorized) return res.status(403).json({ error: "Forbidden" });

    await ActionService.deleteAction(actionId);
    res.status(204).send();
  } catch (error) {
    console.error("Delete Action Error:", error);
    res.status(500).json({ error: "Failed to delete action" });
  }
};
