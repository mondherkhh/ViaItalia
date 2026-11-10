const prisma = require("../config/prisma");

exports.getSummary = async (req, res) => {
  try {
    const overdue = await prisma.calendarEvent.count({
      where: {
        kind: "DEADLINE",
        done: false,
        startsAt: { lt: new Date() },
      },
    });
    const upcoming = await prisma.calendarEvent.count({
      where: {
        startsAt: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
    });
    res.json({ overdueDeadlines: overdue, upcoming7: upcoming });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.listEvents = async (req, res) => {
  try {
    const from = req.query.from ? new Date(req.query.from) : new Date();
    const to = req.query.to ? new Date(req.query.to) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const events = await prisma.calendarEvent.findMany({
      where: {
        startsAt: { gte: from, lte: to },
      },
      include: {
        // No relations defined yet for user; include minimal
      },
      orderBy: { startsAt: "asc" },
    });
    res.json(events);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, notes, kind, allDay, startsAt, endsAt, location, studentId, ownerId, remindMinutes, repeatRule, done } = req.body;
    const data = { title, notes: notes||null, kind: kind||"EVENT", allDay: !!allDay, startsAt: startsAt ? new Date(startsAt) : new Date(), endsAt: endsAt ? new Date(endsAt) : null, location: location||null, studentId: studentId ? parseInt(studentId) : null, ownerId: ownerId ? parseInt(ownerId) : null, remindMinutes: remindMinutes ? parseInt(remindMinutes) : null, repeatRule: repeatRule||null, done: !!done };
    const event = await prisma.calendarEvent.create({ data });
    res.status(201).json(event);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await prisma.calendarEvent.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(event);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    await prisma.calendarEvent.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ deleted: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
