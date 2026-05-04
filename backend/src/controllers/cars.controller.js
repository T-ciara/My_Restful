const { validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(" ");
}

async function carEntry(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { plateNumber, parkingCode } = req.body;
  const plate = plateNumber.toUpperCase();
  const code = parkingCode.toUpperCase();

  try {
    const parking = await prisma.parking.findUnique({ where: { code } });
    if (!parking) return res.status(404).json({ message: "Parking not found" });
    if (parking.availableSpaces === 0) return res.status(400).json({ message: "No available spaces" });

    const active = await prisma.carEntry.findFirst({
      where: { plateNumber: plate, exitDateTime: null },
    });
    if (active) return res.status(400).json({ message: "Car is already parked" });

    const [entry] = await prisma.$transaction([
      prisma.carEntry.create({
        data: { plateNumber: plate, parkingCode: code },
      }),
      prisma.parking.update({
        where: { code },
        data: { availableSpaces: { decrement: 1 } },
      }),
    ]);

    res.status(201).json({
      message: "Car entered successfully",
      ticket: {
        plateNumber: plate,
        parkingName: parking.name,
        parkingCode: code,
        entryDateTime: entry.entryDateTime,
        feePerHour: parking.feePerHour,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function carExit(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const plate = req.params.plateNumber.toUpperCase();

  try {
    const entry = await prisma.carEntry.findFirst({
      where: { plateNumber: plate, exitDateTime: null },
      include: { parking: true },
    });
    if (!entry) return res.status(404).json({ message: "No active entry found for this plate" });

    const exitTime = new Date();
    const durationMs = exitTime - entry.entryDateTime;
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
    const chargedAmount = durationHours * entry.parking.feePerHour;
    const durationFormatted = formatDuration(durationMs);

    const [updated] = await prisma.$transaction([
      prisma.carEntry.update({
        where: { id: entry.id },
        data: { exitDateTime: exitTime, chargedAmount },
      }),
      prisma.parking.update({
        where: { code: entry.parkingCode },
        data: { availableSpaces: { increment: 1 } },
      }),
    ]);

    res.json({
      message: "Car exited successfully",
      bill: {
        plateNumber: plate,
        parkingName: entry.parking.name,
        entryDateTime: entry.entryDateTime,
        exitDateTime: exitTime,
        durationFormatted,
        durationHours,
        feePerHour: entry.parking.feePerHour,
        chargedAmount,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function getActiveCars(req, res) {
  try {
    const records = await prisma.carEntry.findMany({
      where: { exitDateTime: null },
      include: { parking: { select: { name: true, feePerHour: true } } },
      orderBy: { entryDateTime: "desc" },
    });

    const result = records.map((r) => {
      const durationMs = new Date() - r.entryDateTime;
      const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
      return {
        id: r.id,
        plateNumber: r.plateNumber,
        parkingName: r.parking.name,
        parkingCode: r.parkingCode,
        entryDateTime: r.entryDateTime,
        durationFormatted: formatDuration(durationMs),
        hoursParked: durationHours,
        estimatedAmount: durationHours * r.parking.feePerHour,
      };
    });

    res.json({ total: result.length, records: result });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function deleteCarEntry(req, res) {
  const id = parseInt(req.params.id);

  try {
    const entry = await prisma.carEntry.findUnique({
      where: { id },
      include: { parking: true },
    });
    if (!entry) return res.status(404).json({ message: "Car entry not found" });
    if (entry.exitDateTime) {
      return res.status(400).json({ message: "Cannot void a completed entry (car already exited)" });
    }

    await prisma.$transaction([
      prisma.carEntry.delete({ where: { id } }),
      prisma.parking.update({
        where: { code: entry.parkingCode },
        data: { availableSpaces: { increment: 1 } },
      }),
    ]);

    res.json({ message: "Car entry voided successfully" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "Car entry not found" });
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = { carEntry, carExit, getActiveCars, deleteCarEntry };
