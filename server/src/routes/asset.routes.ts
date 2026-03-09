import { Router } from "express";
import {
  createAsset,
  listAssets,
  acceptAsset,
  completeAsset,
  getAssetById,
  getAssetsRaisedByUser,
  getAssetsSolvedByUser,
  getAssetsByStatus,
} from "../controllers/asset.controller";

const router = Router();

router.post("/", createAsset);
router.get("/", listAssets);

// put these BEFORE "/:id"
router.get("/raised/:userId", getAssetsRaisedByUser);
router.get("/solved/:userId", getAssetsSolvedByUser);
router.get("/status/:status", getAssetsByStatus);

router.get("/:id", getAssetById);
router.post("/:id/accept", acceptAsset);
router.post("/:id/complete", completeAsset);

export default router;