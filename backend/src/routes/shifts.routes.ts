import { Router } from "express";
import { Shift } from "../models/shift.model";
import { authenticateToken, authorize } from "../middleware/auth.middleware";

const router = Router();

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

router.get("/", authenticateToken, async (req, res) => {
    try {
      let shifts;
  
      if (req.user?.role === "admin") {
        shifts = await Shift.find().populate("assignedTo", "name email").populate("createdBy", "name email");
      } else {
        shifts = await Shift.find({ assignedTo: req.user?.userId }).populate("createdBy", "name email");
      }
  
      res.status(200).json(shifts);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch shifts", error: err });
    }
  });

router.put("/:id", authenticateToken, authorize("admin"), async (req, res) => {
  const { id } = req.params;
  const { date, startHour, endHour, assignedTo } = req.body;

  try {
    const updatedShift = await Shift.findByIdAndUpdate(
      id,
      { date, startHour, endHour, assignedTo },
      { new: true }
    );

    if (!updatedShift) {
      return res.status(404).json({ message: "Shift not found" });
    }

    res.status(200).json({ message: "Shift updated", shift: updatedShift });
  } catch (err) {
    res.status(500).json({ message: "Failed to update shift", error: err });
  }
});

router.delete("/:id", authenticateToken, authorize("admin"), async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Shift.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Shift not found" });
    }

    res.status(200).json({ message: "Shift deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete shift", error: err });
  }
});


export default router;
