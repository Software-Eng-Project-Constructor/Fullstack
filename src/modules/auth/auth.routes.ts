import { Router } from "express";
import * as Ctrl from "./auth.controller";

const router = Router();

router.post("/signup", Ctrl.signup);
router.post("/signin", Ctrl.signin);
router.get("/me",     Ctrl.whoAmI);
router.post("/logout",Ctrl.logout);

export default router;
