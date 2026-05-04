const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function outgoingCars(req, res) {
  const { startDate, endDate } = req.query;

  const dateFilter = startDate && endDate
    ? { gte: new Date(startDate), lte: new Date(endDate + "T23:59:59") }
    : { not: null };

  try {
    const records = await prisma.carEntry.findMany({
      where: { exitDateTime: dateFilter },
      include: { parking: { select: { name: true, feePerHour: true } } },
      orderBy: { exitDateTime: "desc" },
    });

    const result = records.map((r) => ({
      plateNumber: r.plateNumber,
      parkingName: r.parking.name,
      entryDateTime: r.entryDateTime,
      exitDateTime: r.exitDateTime,
      durationHours: Math.ceil((r.exitDateTime - r.entryDateTime) / (1000 * 60 * 60)),
      chargedAmount: r.chargedAmount,
    }));

    res.json({ total: result.length, records: result });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function enteredCars(req, res) {
  const { startDate, endDate } = req.query;

  const dateFilter = startDate && endDate
    ? { gte: new Date(startDate), lte: new Date(endDate + "T23:59:59") }
    : undefined;

  try {
    const records = await prisma.carEntry.findMany({
      where: dateFilter ? { entryDateTime: dateFilter } : {},
      include: { parking: { select: { name: true } } },
      orderBy: { entryDateTime: "desc" },
    });

    const result = records.map((r) => ({
      plateNumber: r.plateNumber,
      parkingName: r.parking.name,
      entryDateTime: r.entryDateTime,
      exitDateTime: r.exitDateTime,
      status: r.exitDateTime ? "exited" : "still parked",
      chargedAmount: r.chargedAmount,
    }));

    res.json({ total: result.length, records: result });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = { outgoingCars, enteredCars };
