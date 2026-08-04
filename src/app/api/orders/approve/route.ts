import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { read, write, id } from "@/lib/db";
import { sendEmail, emailTemplates } from "@/lib/email";
import { createPterodactylUser, createServer } from "@/lib/pterodactyl";
import { handleError, ok, fail } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "OWNER")) {
      return fail("Unauthorized", 401);
    }

    const { orderId } = await req.json();
    const db = await read();

    const orderIndex = db.orders.findIndex((o: any) => o.id === orderId);
    if (orderIndex === -1) return fail("Order not found", 404);

    const order = db.orders[orderIndex];
    order.status = "ACTIVE";

    // Create Pterodactyl user & server
    let pterodactylUser = null;
    if (process.env.PTERODACTYL_URL) {
      pterodactylUser = await createPterodactylUser(
        order.customer.email,
        order.customer.name.toLowerCase().replace(/\s+/g, ""),
        "TempPass123!" // Should be generated securely
      );

      if (pterodactylUser) {
        await createServer(pterodactylUser.attributes.id, order.config);
      }
    }

    await write((d) => {
      d.orders[orderIndex] = order;
    });

    // Send invoice email to customer
    await sendEmail(emailTemplates.orderApprovedCustomer(order));

    // Send notification to admin (optional)
    if (process.env.ADMIN_EMAIL) {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `Order #${orderId} Approved`,
        html: `<p>Order ${orderId} has been approved and server is being provisioned.</p>`,
      });
    }

    return ok({ message: "Order approved", pterodactylUser });
  } catch (error) {
    return handleError(error);
  }
}
