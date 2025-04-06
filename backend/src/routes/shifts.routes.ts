import { Router } from "express";
import { Shift } from "../models/shift.model";
import { authenticateToken, authorize } from "../middleware/auth.middleware";

const router = Router();

// יצירת משמרת - רק למנהלים
router.post("/", authenticateToken, authorize("admin"), async (req, res) => {
  const { date, startHour, endHour, assignedTo } = req.body;

  if (!date || !startHour || !endHour || !assignedTo) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const newShift = await Shift.create({
      date,
      startHour,
      endHour,
      assignedTo,
      createdBy: req.user!.userId,
    });

    res.status(201).json({ message: "Shift created", shift: newShift });
  } catch (err) {
    res.status(500).json({ message: "Failed to create shift", error: err });
  }
});

export default router;
