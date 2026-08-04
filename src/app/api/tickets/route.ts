import type { NextRequest } from "next/server";
import { assertSameOrigin, handleError, limited, ok, parseJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { id, read, write } from "@/lib/db";
import { ticketSchema } from "@/lib/validation";
import type { Ticket } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);
    const blocked = limited(req, "tickets", 5, 10 * 60_000);
    if (blocked) return blocked;

    const body = ticketSchema.parse(await parseJson(req));
    const ticket: Ticket = {
      id: id("tkt"),
      createdAt: new Date().toISOString(),
      name: body.name,
      email: body.email,
      subject: body.subject,
      message: body.message,
      status: "OPEN",
      replies: [],
    };

    await write((db) => {
      db.tickets.unshift(ticket);
      db.audit.unshift({
        id: id("log"),
        at: ticket.createdAt,
        actor: ticket.email,
        action: "TICKET_CREATED",
        target: ticket.id,
      });
    });

    return ok({ ticketId: ticket.id });
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const db = await read();
    if (session) return ok({ tickets: db.tickets });

    const blocked = limited(req, "tickets-lookup", 20, 60_000);
    if (blocked) return blocked;

    const email = req.nextUrl.searchParams.get("email")?.toLowerCase().trim();
    if (!email) return ok({ tickets: [] });
    return ok({ tickets: db.tickets.filter((t) => t.email.toLowerCase() === email) });
  } catch (error) {
    return handleError(error);
  }
}
