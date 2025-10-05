// Use dynamic require to avoid type issues in TS without @types
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch: any = require("node-fetch");

type Channel = "email"|"sms"|"push";

export interface NotificationPayload {
  userId: string;
  channel: Channel;
  templateId: string;
  variables?: Record<string, any>;
  to?: { email?: string; phone?: string; fcmToken?: string };
}

export class NotificationService {
  constructor(private primary: ChannelProvider, private fallback?: ChannelProvider) {}

  async send(payload: NotificationPayload): Promise<{ status: "sent"|"failed"; providerId?: string; error?: string }> {
    try {
      const res = await this.primary.send(payload);
      if (res.status === "sent") return res;
      if (this.fallback) return await this.fallback.send(payload);
      return res;
    } catch (e: any) {
      if (this.fallback) return await this.fallback.send(payload);
      return {status: "failed", error: e?.message || "unknown"};
    }
  }
}

export interface ChannelProvider {
  send(payload: NotificationPayload): Promise<{ status: "sent"|"failed"; providerId?: string; error?: string }>;
}

export class SendGridProvider implements ChannelProvider {
  constructor(private apiKey: string) {}
  async send(payload: NotificationPayload): Promise<{ status: "sent"|"failed"; providerId?: string; error?: string }> {
    if (payload.channel !== "email") return {status: "failed", error: "invalid channel"};
    // In production, resolve template from Firestore and render with variables
    const resp = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {"Authorization": `Bearer ${this.apiKey}`, "Content-Type": "application/json"},
      body: JSON.stringify({personalizations: [{to: [{email: payload.to?.email}], dynamic_template_data: payload.variables}], from: {email: "noreply@zeroprint.in"}, subject: "ZeroPrint Notification", content: [{type: "text/html", value: "..."}]}),
    });
    if (!resp.ok) return {status: "failed", error: `sendgrid ${resp.status}`};
    return {status: "sent", providerId: resp.headers.get("x-message-id") || undefined};
  }
}

export class TwilioProvider implements ChannelProvider {
  constructor(private accountSid: string, private authToken: string, private fromPhone: string) {}
  async send(payload: NotificationPayload): Promise<{ status: "sent"|"failed"; providerId?: string; error?: string }> {
    if (payload.channel !== "sms") return {status: "failed", error: "invalid channel"};
    // Simplified; in production use Twilio SDK
    const creds = Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64");
    const params = new URLSearchParams({From: this.fromPhone, To: payload.to?.phone || "", Body: (payload.variables?.text || "ZeroPrint")});
    const resp = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`, {method: "POST", headers: {"Authorization": `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded"}, body: params as any});
    const data: any = await resp.json().catch(() => ({}));
    return resp.ok ? {status: "sent", providerId: data?.sid} : {status: "failed", error: data?.message || `twilio ${resp.status}`};
  }
}

export class FCMProvider implements ChannelProvider {
  constructor(private serverKey: string) {}
  async send(payload: NotificationPayload): Promise<{ status: "sent"|"failed"; providerId?: string; error?: string }> {
    if (payload.channel !== "push") return {status: "failed", error: "invalid channel"};
    const resp = await fetch("https://fcm.googleapis.com/fcm/send", {method: "POST", headers: {"Authorization": `key=${this.serverKey}`, "Content-Type": "application/json"}, body: JSON.stringify({to: payload.to?.fcmToken, notification: {title: "ZeroPrint", body: payload.variables?.text || ""}})});
    const data: any = await resp.json().catch(() => ({}));
    return resp.ok ? {status: "sent", providerId: data?.message_id} : {status: "failed", error: `fcm ${resp.status}`};
  }
}


