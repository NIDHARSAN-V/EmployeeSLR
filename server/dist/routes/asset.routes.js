"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asset_controller_1 = require("../controllers/asset.controller");
const router = (0, express_1.Router)();
router.post("/", asset_controller_1.createAsset);
router.get("/", asset_controller_1.listAssets);
// put these BEFORE "/:id"
router.get("/raised/:userId", asset_controller_1.getAssetsRaisedByUser);
router.get("/solved/:userId", asset_controller_1.getAssetsSolvedByUser);
router.get("/accepted/:userId", asset_controller_1.getAssetsAcceptedByUser);
router.get("/status/:status", asset_controller_1.getAssetsByStatus);
router.get("/:id", asset_controller_1.getAssetById);
router.post("/:id/accept", asset_controller_1.acceptAsset);
router.post("/:id/complete", asset_controller_1.completeAsset);
exports.default = router;
