import express from "express";
import {
    getCompanyMembers,
    getCompanyMemberById,
} from "./companyMemberController.js";

const router = express.Router();


router.route("/").get(getCompanyMembers);

router.route("/:id").get(getCompanyMemberById);

export default router;
