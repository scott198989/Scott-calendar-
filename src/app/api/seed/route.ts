import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAllScheduleEvents } from "@/lib/schedule";
import { setHours, setMinutes } from "date-fns";

export async function POST() {
  try {
    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || "scott@calendar.app";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const hashedPassword = await hash(adminPassword, 12);

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        name: "Scott",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    // Create default categories
    const categories = [
      { name: "Work", color: "blue", icon: "briefcase" },
      { name: "School", color: "purple", icon: "book" },
      { name: "Gunner", color: "orange", icon: "dog" },
      { name: "Pay Day", color: "green", icon: "dollar" },
      { name: "Personal", color: "teal", icon: "user" },
      { name: "Health", color: "red", icon: "heart" },
      { name: "Social", color: "pink", icon: "users" },
      { name: "Bills", color: "yellow", icon: "receipt" },
    ];

    const categoryMap: Record<string, string> = {};

    for (const cat of categories) {
      const created = await prisma.category.upsert({
        where: {
          name_createdById: { name: cat.name, createdById: admin.id },
        },
        update: { color: cat.color, icon: cat.icon },
        create: {
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
          createdById: admin.id,
        },
      });
      categoryMap[cat.name] = created.id;
    }

    // Generate schedule events for 6 months ahead
    const now = new Date();
    const eventsToCreate = [];

    for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
      const targetMonth = now.getMonth() + monthOffset;
      const targetYear = now.getFullYear() + Math.floor(targetMonth / 12);
      const normalizedMonth = targetMonth % 12;

      const schedule = getAllScheduleEvents(targetYear, normalizedMonth);

      // Work shifts
      for (const shift of schedule.workShifts) {
        eventsToCreate.push({
          title: shift.title,
          description: "Night shift at ISOFlex",
          startDate: shift.start,
          endDate: shift.end,
          categoryId: categoryMap["Work"],
          createdById: admin.id,
          isSystemEvent: true,
          recurring: true,
        });
      }

      // School days
      for (const school of schedule.schoolDays) {
        eventsToCreate.push({
          title: school.title,
          description: "Classes - Monday & Wednesday",
          startDate: school.start,
          endDate: school.end,
          categoryId: categoryMap["School"],
          createdById: admin.id,
          isSystemEvent: true,
          recurring: true,
        });
      }

      // Gunner reminders
      for (const reminder of schedule.gunnerReminders) {
        eventsToCreate.push({
          title: reminder.title,
          description: "Don't forget to let Gunner out!",
          startDate: reminder.start,
          endDate: reminder.end,
          categoryId: categoryMap["Gunner"],
          createdById: admin.id,
          isSystemEvent: true,
          recurring: true,
        });
      }

      // Pay days
      for (const payday of schedule.payDays) {
        eventsToCreate.push({
          title: payday.title,
          description: payday.description,
          startDate: setHours(setMinutes(payday.date, 0), 0),
          endDate: setHours(setMinutes(payday.date, 59), 23),
          allDay: true,
          categoryId: categoryMap["Pay Day"],
          createdById: admin.id,
          isSystemEvent: true,
          recurring: true,
        });
      }
    }

    // Clear existing system events and recreate
    await prisma.event.deleteMany({ where: { isSystemEvent: true } });

    // Batch create events
    await prisma.event.createMany({
      data: eventsToCreate,
    });

    return NextResponse.json({
      success: true,
      admin: { email: admin.email, role: admin.role },
      categoriesCreated: categories.length,
      eventsCreated: eventsToCreate.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: String(error) },
      { status: 500 }
    );
  }
}
