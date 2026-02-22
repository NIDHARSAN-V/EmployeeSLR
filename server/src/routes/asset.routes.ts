import { Router } from "express";
import {
  createAsset,
  listAssets,
  acceptAsset,
  completeAsset,
  getAssetsRaisedByUser,
  getAssetsSolvedByUser,
  getAssetsByStatus,
} from "../controllers/asset.controller";

const router = Router();

router.post("/", createAsset);
router.get("/", listAssets);
router.post("/:id/accept", acceptAsset);
router.post("/:id/complete", completeAsset);
router.get("/raised/:userId", getAssetsRaisedByUser);
router.get("/solved/:userId", getAssetsSolvedByUser);
router.get("/status/:status", getAssetsByStatus);

export default router;