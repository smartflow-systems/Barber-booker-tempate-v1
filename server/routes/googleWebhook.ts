import { calendar_v3 } from "googleapis";
import { log } from "../vite";
import { db } from "../db";        // <-- change path if your prisma client lives elsewhere

export async function upsertSyncTokenAndHandleEvents(
  calendar: calendar_v3.Calendar,
  barber: { id: number; googleCalendarId: string; syncToken: string | null }
) {
  // Pull incremental changes
  const listRes = await calendar.events.list({
    calendarId:  barber.googleCalendarId,
    showDeleted: true,
    singleEvents:true,
    maxResults:  250,
    syncToken:   barber.syncToken ?? undefined
  });

  for (const ev of listRes.data.items ?? []) {
    const googleEventId = ev.id!;           // Google always returns id
    if (ev.status === "cancelled") {
      // Remove cancelled events
      await db.booking.deleteMany({ where: { googleEventId } });
      continue;
    }

    // Lookup existing booking
    const existing = await db.booking.findFirst({ where: { googleEventId } });

    if (!existing) {
      // CREATE
      await db.booking.create({
        data: {
          googleEventId,
          barberId:      barber.id,
          customerName:  ev.summary ?? "Walk-in",
          start:         ev.start?.dateTime ?? ev.start?.date!,
          end:           ev.end?.dateTime   ?? ev.end?.date!,
          status:        ev.status
        }
      });
    } else {
      // UPDATE
      await db.booking.update({
        where: { id: existing.id },
        data:  {
          start:  ev.start?.dateTime ?? ev.start?.date!,
          end:    ev.end?.dateTime   ?? ev.end?.date!,
          status: ev.status
        }
      });
    }
  }

  // Save nextSyncToken for the next webhook ping
  if (listRes.data.nextSyncToken) {
    await db.barber.update({
      where: { id: barber.id },
      data:  { syncToken: listRes.data.nextSyncToken }
    });
  }

  log(`✅ Synced ${listRes.data.items?.length ?? 0} events for barber ${barber.id}`);
}
