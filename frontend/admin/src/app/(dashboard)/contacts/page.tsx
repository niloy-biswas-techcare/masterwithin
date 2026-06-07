import { redirect } from "next/navigation";
import { listContacts, getSiteConfig, ForbiddenError } from "@mw/backend";
import { verifyOperator } from "@/lib/auth";
import { ContactsTable } from "@/features/admin/ContactsTable";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  try {
    await verifyOperator("editor");
  } catch (e) {
    if (e instanceof ForbiddenError) redirect("/");
    redirect("/login");
  }

  const [contacts, siteConfig] = await Promise.allSettled([
    listContacts(),
    getSiteConfig(),
  ]);

  const allContacts = contacts.status === "fulfilled" ? contacts.value : [];
  const waNumber =
    siteConfig.status === "fulfilled" ? (siteConfig.value?.whatsappNumber ?? "") : "";

  const unreadCount = allContacts.filter((c) => c.status === "unread").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-display font-semibold text-text">Messages</h1>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center h-6 min-w-6 rounded-full bg-primary text-surface text-xs font-bold px-1.5">
              {unreadCount}
            </span>
          )}
        </div>
        <p className="text-sm text-muted">{allContacts.length} total</p>
      </div>

      <ContactsTable contacts={allContacts} adminWaNumber={waNumber} />
    </div>
  );
}
