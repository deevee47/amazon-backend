import { Router } from "express";
import { getAddresses, createAddress, setDefault } from "../controllers/address.controller.ts";

const router = Router();

router.get("/", getAddresses);
router.post("/", createAddress);
router.patch("/:id/default", setDefault);

export default router;
