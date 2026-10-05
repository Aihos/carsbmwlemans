import type { IncomingMessage, ServerResponse } from "node:http";
import { Resend } from "resend";

/* Fonction serverless (Vercel : /api/reservation, dev : middleware Vite).
   Envoie la demande de rendez-vous par mail via Resend :
     1. la notification interne, vers MAIL_TO (optionnel : à défaut, l'adresse
        portée par MAIL_FROM, donc la boîte du domaine vérifié) ;
     2. l'accusé de réception au visiteur, à l'adresse qu'il a saisie.
   MAIL_TO n'est donc jamais obligatoire : RESEND_API_KEY + un MAIL_FROM du
   domaine vérifié suffisent, et le visiteur reçoit sa confirmation.
   Clés lues dans l'environnement : RESEND_API_KEY, MAIL_FROM, MAIL_TO. */

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
const LIEU = "Ventes privées BMW Ampère Autopassion, Le Mans · 13 & 14 novembre 2026";

/* Journalisation. En développement, on trace tout (y compris le contenu du
   formulaire) pour pouvoir diagnostiquer. En production, on ne trace que le
   déroulé et les erreurs : aucune donnée personnelle ne part dans les logs
   Vercel. Forcer le détail en production : DEBUG_RESERVATION=1. */
const verbose =
  process.env.NODE_ENV !== "production" || process.env.DEBUG_RESERVATION === "1";

const log = (...parts: unknown[]) => console.log("[reservation]", ...parts);
const logErr = (...parts: unknown[]) => console.error("[reservation]", ...parts);

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

/** Liste d'adresses séparées par des virgules, les entrées invalides sont écartées. */
const destinataires = (v: string | undefined) =>
  (v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => isEmail(s));

/** Adresse nue d'un champ « Nom <adresse@domaine> » (valeur de MAIL_FROM). */
const adresseNue = (v: string) => {
  const m = v.match(/<([^>]+)>/);
  return (m ? m[1] : v).trim().replace(/^["']|["']$/g, "");
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  log("--- requête reçue :", req.method ?? "?", "---");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "POST") {
    log("✗ méthode refusée :", req.method ?? "?");
    send(res, 405, { error: "Méthode non autorisée." });
    return;
  }

  let payload: Payload;
  try {
    payload = await readJson(req);
  } catch {
    logErr("✗ corps de requête illisible (JSON invalide ou trop volumineux)");
    send(res, 400, { error: "Requête illisible." });
    return;
  }

  log("corps reçu :", verbose ? JSON.stringify(payload) : "reçu (détail masqué en production)");

  /* Robot : on répond « ok » sans rien envoyer, pour ne pas l'informer. */
  if (clean(payload.site)) {
    log("✗ champ piège « site » rempli → considéré comme robot, rien n'est envoyé");
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

  log("champs exploitables :", {
    nom: nom || "(VIDE)",
    email: email || "(VIDE)",
    telephone: telephone || "(VIDE)",
    vehicule: vehicule || "(VIDE)",
    date: date || "(VIDE)",
    creneau: creneau || "(VIDE)",
    message: message ? `(${message.length} caractères)` : "(VIDE)",
  });

  if (!nom) {
    logErr("✗ validation : le nom est vide → 422");
    send(res, 422, { error: "Le nom est obligatoire." });
    return;
  }
  if (!isEmail(email)) {
    logErr(`✗ validation : adresse email invalide (reçu : ${verbose ? JSON.stringify(email) : "masqué"}) → 422`);
    send(res, 422, { error: "Adresse email invalide." });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logErr("✗ RESEND_API_KEY absente de l'environnement → 500");
    send(res, 500, { error: "RESEND_API_KEY absente : renseignez le fichier .env." });
    return;
  }

  const from =
    process.env.MAIL_FROM?.trim().replace(/^["']|["']$/g, "") ||
    "Ventes privées BMW Le Mans <onboarding@resend.dev>";

  /* Boîte interne : MAIL_TO si renseignée, sinon l'adresse du domaine portée
     par MAIL_FROM. Aucune configuration bloquante, la demande n'est jamais
     perdue même sans MAIL_TO. */
  const interne = destinataires(process.env.MAIL_TO);
  const adresseDomaine = adresseNue(from);
  const boiteInterne = interne.length
    ? interne
    : isEmail(adresseDomaine)
      ? [adresseDomaine]
      : [];

  log("configuration :", {
    MAIL_FROM: from,
    MAIL_TO: process.env.MAIL_TO ? interne : "(absente → repli sur l'adresse de MAIL_FROM)",
    notificationInterne: boiteInterne.length ? boiteInterne : "(AUCUNE)",
    accuseDeReception: email,
  });

  const rows: [string, string][] = [
    ["Nom", nom],
    ["Email", email],
    ["Téléphone", telephone],
    ["Véhicule", vehicule],
    ["Date souhaitée", date],
    ["Créneau", creneau],
    ["Configuration", configuration],
  ];

  const remplies = rows.filter(([, v]) => v !== "");

  const details = remplies.map(([k, v]) => `${k} : ${v}`).join("\n");

  const tableHtml = `
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px">
        ${remplies
          .map(
            ([k, v]) =>
              `<tr>
                 <td style="padding:6px 18px 6px 0;color:#5a6b80;vertical-align:top;white-space:nowrap">${esc(k)}</td>
                 <td style="padding:6px 0;font-weight:600">${esc(v)}</td>
               </tr>`,
          )
          .join("")}
      </table>`;

  const piedHtml = `
      <p style="margin:24px 0 0;font-size:12px;color:#00559d">${esc(LIEU)}</p>`;

  /* 1. Notification interne : c'est elle qui porte la demande. */
  const sujetInterne = `Créneau ventes privées — ${vehicule || "véhicule à préciser"} · ${nom}`;
  const textInterne = [
    "Nouvelle demande de créneau — Ventes privées BMW Ampère Autopassion (Le Mans)",
    "",
    details,
    "",
    message ? `Message :\n${message}` : "Message : —",
    "",
    `— ${LIEU}`,
  ].join("\n");
  const htmlInterne = `
    <div style="font-family:Helvetica,Arial,sans-serif;color:#06213f;line-height:1.6">
      <h2 style="margin:0 0 4px;font-size:18px">Nouvelle demande de créneau — ventes privées</h2>
      <p style="margin:0 0 18px;font-size:13px;color:#5a6b80">${esc(LIEU)}</p>
      ${tableHtml}
      ${
        message
          ? `<p style="margin:18px 0 0;font-size:14px"><strong>Message</strong><br>${esc(message).replace(/\n/g, "<br>")}</p>`
          : ""
      }
      ${piedHtml}
      <p style="margin:24px 0 0;font-size:12px;color:#5a6b80">
        Répondre à ce mail écrit directement au client (${esc(email)}).
      </p>
    </div>`;

  /* 2. Accusé de réception : le visiteur sait tout de suite que sa demande est
     enregistrée. Envoyé après la notification interne, et sans la faire
     échouer s'il est refusé (l'essentiel, la demande, est déjà arrivée). */
  const sujetClient = "Votre demande de créneau — ventes privées BMW Le Mans";
  const textClient = [
    `${nom},`,
    "",
    "Nous avons reçu votre demande de créneau pour les ventes privées BMW Ampère Autopassion (Le Mans).",
    "Un conseiller vous confirme votre horaire par email et par téléphone.",
    "",
    details,
    "",
    message ? `Votre message :\n${message}` : "",
    "",
    "Vous pouvez télécharger le récapitulatif de votre demande depuis la page de confirmation du site.",
    "",
    `— ${LIEU}`,
  ]
    .filter((l) => l !== "")
    .join("\n");
  const htmlClient = `
    <div style="font-family:Helvetica,Arial,sans-serif;color:#06213f;line-height:1.6">
      <h2 style="margin:0 0 4px;font-size:18px">Votre demande de créneau est enregistrée</h2>
      <p style="margin:0 0 18px;font-size:13px;color:#5a6b80">
        ${esc(nom)}, nous avons bien reçu votre demande pour les ventes privées BMW Ampère Autopassion.
        Un conseiller vous confirme votre horaire par email et par téléphone.
      </p>
      ${tableHtml}
      ${
        message
          ? `<p style="margin:18px 0 0;font-size:14px"><strong>Votre message</strong><br>${esc(message).replace(/\n/g, "<br>")}</p>`
          : ""
      }
      <p style="margin:18px 0 0;font-size:13px;color:#5a6b80">
        Le récapitulatif de votre demande reste téléchargeable depuis la page de confirmation du site.
      </p>
      ${piedHtml}
    </div>`;

  const resend = new Resend(apiKey);
  const replyToInterne = email;
  const replyToClient = boiteInterne[0] ?? adresseDomaine;

  try {
    /* Notification interne. Si aucune adresse interne n'est exploitable, on
       enchaîne directement sur l'accusé au visiteur. */
    let ref: string | null = null;
    if (boiteInterne.length) {
      log("envoi 1/2 — notification interne →", boiteInterne.join(", "));
      const { data, error } = await resend.emails.send({
        from,
        to: boiteInterne,
        replyTo: replyToInterne,
        subject: sujetInterne,
        text: textInterne,
        html: htmlInterne,
      });
      if (error) {
        logErr("✗ envoi 1/2 refusé :", error.message);
        send(res, 502, { error: error.message });
        return;
      }
      /* L'identifiant d'envoi Resend devient la référence de suivi affichée au
         visiteur (page de confirmation) : elle permet de retrouver la demande
         dans la console d'envoi. */
      ref = data?.id ?? null;
      log("✓ envoi 1/2 accepté — id Resend :", ref);
    } else {
      log("envoi 1/2 — aucune boîte interne configurée, notification ignorée");
    }

    let accuse = false;
    log("envoi 2/2 — accusé de réception →", email);
    const client = await resend.emails.send({
      from,
      to: [email],
      replyTo: isEmail(replyToClient) ? replyToClient : undefined,
      subject: sujetClient,
      text: textClient,
      html: htmlClient,
    });
    if (client.error) {
      logErr("✗ envoi 2/2 (accusé) refusé :", client.error.message);
      logErr("  → vérifier que le domaine de MAIL_FROM est vérifié chez Resend");
    } else {
      accuse = true;
      log("✓ envoi 2/2 (accusé) accepté — id Resend :", client.data?.id ?? null);
    }

    log("réponse : 200", { ok: true, ref: ref ?? client.data?.id ?? null, accuse });
    send(res, 200, { ok: true, ref: ref ?? client.data?.id ?? null, accuse });
  } catch (e) {
    logErr("✗ exception pendant l'envoi :", e instanceof Error ? e.message : e);
    send(res, 502, { error: e instanceof Error ? e.message : "Envoi impossible." });
  }
}
