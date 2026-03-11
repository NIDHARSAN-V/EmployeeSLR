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
  getAssetsAcceptedByUser
} from "../controllers/asset.controller";

const router = Router();

router.post("/", createAsset);
router.get("/", listAssets);

router.get("/raised/:userId", getAssetsRaisedByUser);
router.get("/solved/:userId", getAssetsSolvedByUser);
router.get("/accepted/:userId" , getAssetsAcceptedByUser);
router.get("/status/:status", getAssetsByStatus);
router.get("/:id", getAssetById);
router.post("/:id/accept", acceptAsset);
router.post("/:id/complete", completeAsset);

export default router;