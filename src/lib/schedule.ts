import {
  addDays,
  startOfDay,
  setHours,
  setMinutes,
  isBefore,
  isAfter,
  getDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";

// The anchor date: Feb 18, 2026 (Wednesday) is a SHORT week
const SCHEDULE_ANCHOR = new Date(2026, 1, 18); // Feb 18, 2026

export type WeekType = "short" | "long";

/**
 * Determine if a given week (identified by its Wednesday) is a short or long week.
 * Feb 18, 2026 = short week (week 0).
 * Alternates: short, long, short, long...
 */
export function getWeekType(date: Date): WeekType {
  // Find the Wednesday of the week containing `date`
  const dayOfWeek = getDay(date); // 0=Sun, 3=Wed
  const daysToWed = ((3 - dayOfWeek) + 7) % 7;
  const wednesday = startOfDay(addDays(date, dayOfWeek <= 3 ? daysToWed : daysToWed - 7));

  // Calculate weeks difference from anchor
  const diffMs = wednesday.getTime() - startOfDay(SCHEDULE_ANCHOR).getTime();
  const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));

  // Even weeks from anchor = short, odd = long
  return Math.abs(diffWeeks) % 2 === 0 ? "short" : "long";
}

export interface WorkShift {
  start: Date;
  end: Date;
  title: string;
}

/**
 * Generate work shifts for a given month.
 * Short week: Wed night, Thu night, Fri night (8:30 PM - 10:00 AM next day)
 * Long week: Same + Sat night (8:30 PM - 10:00 AM next day)
 */
export function getWorkShifts(year: number, month: number): WorkShift[] {
  const shifts: WorkShift[] = [];
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(new Date(year, month));

  // Extend range to catch shifts that start before month or end after
  const rangeStart = addDays(monthStart, -1);
  const rangeEnd = addDays(monthEnd, 1);

  const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });

  for (const day of days) {
    const dayOfWeek = getDay(day); // 0=Sun, 1=Mon, ..., 6=Sat
    const weekType = getWeekType(day);

    // Work nights: Wed(3), Thu(4), Fri(5) for both. Sat(6) for long weeks only.
    const isWorkNight =
      dayOfWeek === 3 || dayOfWeek === 4 || dayOfWeek === 5 ||
      (dayOfWeek === 6 && weekType === "long");

    if (isWorkNight) {
      const shiftStart = setMinutes(setHours(new Date(day), 20), 30); // 8:30 PM
      const nextDay = addDays(day, 1);
      const shiftEnd = setMinutes(setHours(new Date(nextDay), 10), 0); // 10:00 AM next day

      // Only include if shift overlaps with the target month
      if (isBefore(shiftStart, addDays(monthEnd, 1)) && isAfter(shiftEnd, monthStart)) {
        shifts.push({
          start: shiftStart,
          end: shiftEnd,
          title: `Work - ISOFlex (${weekType === "short" ? "Short" : "Long"} Week)`,
        });
      }
    }
  }

  return shifts;
}

export interface SchoolDay {
  start: Date;
  end: Date;
  title: string;
}

/**
 * Generate school schedule for a given month.
 * Every Monday and Wednesday: 10:30 AM - 5:00 PM
 */
export function getSchoolDays(year: number, month: number): SchoolDay[] {
  const days: SchoolDay[] = [];
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(new Date(year, month));

  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  for (const day of allDays) {
    const dayOfWeek = getDay(day);
    if (dayOfWeek === 1 || dayOfWeek === 3) { // Monday or Wednesday
      days.push({
        start: setMinutes(setHours(new Date(day), 10), 30), // 10:30 AM
        end: setMinutes(setHours(new Date(day), 17), 0),    // 5:00 PM
        title: "School",
      });
    }
  }

  return days;
}

export interface GunnerReminder {
  start: Date;
  end: Date;
  title: string;
}

/**
 * Generate Gunner bathroom reminders for work days.
 * Before leaving for work and reminder for when getting home.
 */
export function getGunnerReminders(year: number, month: number): GunnerReminder[] {
  const reminders: GunnerReminder[] = [];
  const shifts = getWorkShifts(year, month);

  for (const shift of shifts) {
    // Reminder before leaving for work (7:30 PM, 1 hour before shift)
    const reminderTime = setMinutes(setHours(new Date(shift.start), 19), 30);
    reminders.push({
      start: reminderTime,
      end: setMinutes(setHours(new Date(shift.start), 20), 0),
      title: "Let Gunner out before work",
    });

    // Reminder when getting home (10:00 AM)
    reminders.push({
      start: shift.end,
      end: setMinutes(setHours(new Date(shift.end), 10), 30),
      title: "Let Gunner out - home from work",
    });
  }

  return reminders;
}

export interface PayDay {
  date: Date;
  title: string;
  description: string;
}

/**
 * Get pay dates for a given month.
 * - ISOFlex: Every Wednesday on short weeks
 * - VA Disability: Every 1st of the month
 */
export function getPayDays(year: number, month: number): PayDay[] {
  const payDays: PayDay[] = [];
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(new Date(year, month));

  // VA Disability - 1st of month
  payDays.push({
    date: monthStart,
    title: "VA Disability Pay",
    description: "Monthly VA disability payment",
  });

  // ISOFlex - every Wednesday on short weeks
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  for (const day of allDays) {
    if (getDay(day) === 3) { // Wednesday
      const weekType = getWeekType(day);
      if (weekType === "short") {
        payDays.push({
          date: day,
          title: "ISOFlex Payday",
          description: "ISOFlex paycheck (short week)",
        });
      }
    }
  }

  return payDays;
}

/**
 * Generate all recurring schedule events for a given month.
 */
export function getAllScheduleEvents(year: number, month: number) {
  return {
    workShifts: getWorkShifts(year, month),
    schoolDays: getSchoolDays(year, month),
    gunnerReminders: getGunnerReminders(year, month),
    payDays: getPayDays(year, month),
  };
}
