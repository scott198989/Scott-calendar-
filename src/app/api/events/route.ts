import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const categoryId = searchParams.get("categoryId");

    const where: Record<string, unknown> = {};

    if (start && end) {
      where.OR = [
        {
          startDate: { gte: new Date(start), lte: new Date(end) },
        },
        {
          endDate: { gte: new Date(start), lte: new Date(end) },
        },
        {
          AND: [
            { startDate: { lte: new Date(start) } },
            { endDate: { gte: new Date(end) } },
          ],
        },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        category: true,
        createdBy: {
          select: { id: true, name: true, email: true, role: true, image: true },
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true, image: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, startDate, endDate, allDay, categoryId, location, recurring, recurrenceRule } = body;

    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Title, start date, and end date are required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        allDay: allDay || false,
        categoryId: categoryId || null,
        location,
        recurring: recurring || false,
        recurrenceRule,
        createdById: session.user.id,
      },
      include: {
        category: true,
        createdBy: {
          select: { id: true, name: true, email: true, role: true, image: true },
        },
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
