const { validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createParking(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { code, name, location, totalSpaces, feePerHour } = req.body;
  try {
    const parking = await prisma.parking.create({
      data: {
        code: code.toUpperCase(),
        name,
        location,
        totalSpaces: parseInt(totalSpaces),
        availableSpaces: parseInt(totalSpaces),
        feePerHour: parseFloat(feePerHour),
      },
    });
    res.status(201).json({ message: "Parking created", parking });
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ message: "Parking code already exists" });
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function getAllParking(req, res) {
  try {
    const parkings = await prisma.parking.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(parkings);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function getParkingByCode(req, res) {
  try {
    const parking = await prisma.parking.findUnique({
      where: { code: req.params.code.toUpperCase() },
    });
    if (!parking) return res.status(404).json({ message: "Parking not found" });
    res.json(parking);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function updateParking(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const code = req.params.code.toUpperCase();
  const { name, location, totalSpaces, feePerHour } = req.body;

  try {
    const existing = await prisma.parking.findUnique({ where: { code } });
    if (!existing) return res.status(404).json({ message: "Parking not found" });

    const data = {};
    if (name)     data.name     = name.trim();
    if (location) data.location = location.trim();
    if (totalSpaces !== undefined && totalSpaces !== "") {
      const newTotal = parseInt(totalSpaces);
      const occupied = existing.totalSpaces - existing.availableSpaces;
      if (newTotal < occupied) {
        return res.status(400).json({
          message: `Cannot reduce capacity below ${occupied} (currently occupied spaces)`,
        });
      }
      data.totalSpaces    = newTotal;
      data.availableSpaces = newTotal - occupied;
    }
    if (feePerHour !== undefined && feePerHour !== "") {
      data.feePerHour = parseFloat(feePerHour);
    }

    const updated = await prisma.parking.update({ where: { code }, data });
    res.json({ message: "Parking updated", parking: updated });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "Parking not found" });
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function deleteParking(req, res) {
  const code = req.params.code.toUpperCase();

  try {
    const parking = await prisma.parking.findUnique({
      where: { code },
      include: { _count: { select: { entries: true } } },
    });
    if (!parking) return res.status(404).json({ message: "Parking not found" });

    if (parking._count.entries > 0) {
      return res.status(400).json({
        message: "Cannot delete parking that has car entry records. Remove all records first.",
      });
    }

    await prisma.parking.delete({ where: { code } });
    res.json({ message: "Parking deleted" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "Parking not found" });
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = { createParking, getAllParking, getParkingByCode, updateParking, deleteParking };
