import type { IncomingMessage, ServerResponse } from "node:http";
import { Resend } from "resend";

/* Fonction serverless (Vercel : /api/reservation, dev : middleware Vite).
   Envoie la demande de rendez-vous par mail via Resend.
   Clés lues dans l'environnement : RESEND_API_KEY, MAIL_TO, MAIL_FROM. */

type Payload = {
  nom?: string;
  email?: string;
  telephone?: string;
  vehicule?: string;
  date?: string;
  creneau?: string;
  message?: string;
  configuration?: string;
  /** champ piège anti-spam : doit rester vide (invisible pour un humain) */
  site?: string;
};

const LIMIT = 16_000;

function send(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

/** Vercel parse déjà le corps JSON ; en dev on lit le flux à la main. */
async function readJson(req: IncomingMessage): Promise<Payload> {
  const body = (req as IncomingMessage & { body?: unknown }).body;
  if (body && typeof body === "object") return body as Payload;
  if (typeof body === "string" && body.trim()) return JSON.parse(body) as Payload;

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = chunk as Buffer;
    size += buf.length;
    if (size > LIMIT) throw new Error("Corps de requête trop volumineux.");
    chunks.push(buf);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  return text.trim() ? (JSON.parse(text) as Payload) : {};
}

const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const clean = (v: unknown, max = 900) => String(v ?? "").trim().slice(0, max);

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "POST") {
    send(res, 405, { error: "Méthode non autorisée." });
    return;
  }

  let payload: Payload;
  try {
    payload = await readJson(req);
  } catch {
    send(res, 400, { error: "Requête illisible." });
    return;
  }

  /* Robot : on répond « ok » sans rien envoyer, pour ne pas l'informer. */
  if (clean(payload.site)) {
    send(res, 200, { ok: true });
    return;
  }

  const nom = clean(payload.nom, 120);
  const email = clean(payload.email, 160);
  const telephone = clean(payload.telephone, 40);
  const vehicule = clean(payload.vehicule, 160);
  const date = clean(payload.date, 40);
  const creneau = clean(payload.creneau, 80);
  const message = clean(payload.message, 4000);
  const configuration = clean(payload.configuration, 500);

  if (!nom) {
    send(res, 422, { error: "Le nom est obligatoire." });
    return;
  }
  if (!isEmail(email)) {
    send(res, 422, { error: "Adresse email invalide." });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    send(res, 500, { error: "RESEND_API_KEY absente : renseignez le fichier .env." });
    return;
  }
  const to = (process.env.MAIL_TO ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  if (!to.length) {
    send(res, 500, { error: "MAIL_TO absente : renseignez le fichier .env." });
    return;
  }
  const from = process.env.MAIL_FROM?.trim() || "Reservation <onboarding@resend.dev>";

  const rows: [string, string][] = [
    ["Nom", nom],
    ["Email", email],
    ["Téléphone", telephone],
    ["Véhicule", vehicule],
    ["Date souhaitée", date],
    ["Créneau", creneau],
    ["Configuration", configuration],
  ];

  const details = rows
    .filter(([, v]) => v !== "")
    .map(([k, v]) => `${k} : ${v}`)
    .join("\n");

  const text = [
    "Nouvelle demande de créneau — Ventes privées BMW Ampère Autopassion (Le Mans)",
    "",
    details,
    "",
    message ? `Message :\n${message}` : "Message : —",
    "",
    "— Ventes privées BMW Ampère Autopassion, Le Mans · 13 & 14 novembre 2026",
  ].join("\n");

  const html = `
    <div style="font-family:Helvetica,Arial,sans-serif;color:#06213f;line-height:1.6">
      <h2 style="margin:0 0 4px;font-size:18px">Nouvelle demande de créneau — ventes privées</h2>
      <p style="margin:0 0 18px;font-size:13px;color:#5a6b80">
        Ventes privées BMW · Ampère Autopassion, Le Mans · 13 &amp; 14 novembre 2026
      </p>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px">
        ${rows
          .filter(([, v]) => v !== "")
          .map(
            ([k, v]) =>
              `<tr>
                 <td style="padding:6px 18px 6px 0;color:#5a6b80;vertical-align:top;white-space:nowrap">${esc(k)}</td>
                 <td style="padding:6px 0;font-weight:600">${esc(v)}</td>
               </tr>`,
          )
          .join("")}
      </table>
      ${
        message
          ? `<p style="margin:18px 0 0;font-size:14px"><strong>Message</strong><br>${esc(message).replace(/\n/g, "<br>")}</p>`
          : ""
      }
      <p style="margin:24px 0 0;font-size:12px;color:#00559d">
        Ventes privées BMW Ampère Autopassion — Le Mans · 13 &amp; 14 novembre 2026
      </p>
      <p style="margin:24px 0 0;font-size:12px;color:#5a6b80">
        Répondre à ce mail écrit directement au client (${esc(email)}).
      </p>
    </div>`;

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to,
      replyTo: email,
      subject: `Créneau ventes privées — ${vehicule || "véhicule à préciser"} · ${nom}`,
      text,
      html,
    });
    if (error) {
      send(res, 502, { error: error.message });
      return;
    }
    send(res, 200, { ok: true });
  } catch (e) {
    send(res, 502, { error: e instanceof Error ? e.message : "Envoi impossible." });
  }
}
