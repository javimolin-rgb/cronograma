// Edge Function "send-push": envía la notificación al celular cuando se crea
// una fila en la tabla `notifications` (se conecta con un Database Webhook).
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const sb = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT") || "mailto:admin@example.com",
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!,
);

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    if (body.type !== "INSERT" || body.table !== "notifications") return new Response("ignored");
    const n = body.record?.data;
    if (!n || !n.push || !n.to) return new Response("no push");

    const { data: subs, error } = await sb.from("push_subs").select("id,data").eq("data->>person", n.to);
    if (error) throw error;

    const payload = JSON.stringify({
      title: n.title || "Cronograma",
      body: n.body || n.text || "",
      url: n.url || "./",
      postId: n.postId || null,
      tag: n.postId ? `post-${n.postId}` : undefined,
    });

    let sent = 0;
    await Promise.all((subs || []).map(async (s) => {
      try {
        await webpush.sendNotification(s.data.sub, payload);
        sent++;
      } catch (e) {
        // Suscripción vencida o desinstalada: se elimina
        if (e?.statusCode === 404 || e?.statusCode === 410) await sb.from("push_subs").delete().eq("id", s.id);
        else console.error("push error", e?.statusCode, e?.body);
      }
    }));
    return new Response(JSON.stringify({ sent }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(String(e), { status: 500 });
  }
});
