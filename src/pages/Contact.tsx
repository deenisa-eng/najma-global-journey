import { Phone, Mail, MapPin, Instagram, MessageCircle, Facebook, Twitter, Music2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(5).max(1000),
});

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      const f: Record<string, string> = {};
      r.error.issues.forEach((i) => { f[i.path[0] as string] = i.message; });
      setErrors(f);
      return;
    }
    setErrors({});
    const { error } = await supabase.from("contact_inquiries").insert({
      name: form.name,
      email: form.email,
      message: form.message,
      source: "website",
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Message sent", { description: "We'll respond within one business day." });
    setForm({ name: "", email: "", message: "" });
  };

  const channels = [
    { icon: Phone, label: "Phone", value: "0816 776 7271", href: "tel:+2348167767271" },
    { icon: Mail, label: "Email", value: "info@najmaglobaltours.com", href: "mailto:info@najmaglobaltours.com" },
    { icon: MapPin, label: "Office", value: "Tafawa Balewa Road, CBD Abuja", href: "#" },
    { icon: Instagram, label: "Instagram", value: "@najmaglobaltours", href: "https://instagram.com/najmaglobaltours" },
    { icon: Twitter, label: "X (Twitter)", value: "@Najmaglobaltour", href: "https://x.com/Najmaglobaltour" },
    { icon: Facebook, label: "Facebook", value: "Najma Global Tours", href: "https://www.facebook.com/najmaglobaltoursconsult?mibextid=ZbWKwL" },
    { icon: Music2, label: "TikTok", value: "@najmaglobaltour", href: "https://vm.tiktok.com/ZS92xRGqGX9Hw-iCIO0/" },
  ];

  return (
    <Layout>
      <section className="pt-32 pb-12">
        <div className="container-luxe max-w-3xl">
          <div className="eyebrow mb-5">Contact</div>
          <h1 className="font-display text-5xl sm:text-6xl mb-5 leading-tight">
            Let's plan something <span className="text-gold italic">unforgettable.</span>
          </h1>
          <p className="text-muted-foreground text-lg">Reach out via your preferred channel. Our team responds quickly and personally.</p>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-luxe grid lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {channels.map((c) => (
                <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
                  className="glass-card rounded-sm p-5 flex items-start gap-4 hover:border-gold/50 transition-all group">
                  <div className="w-10 h-10 rounded-sm bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0 group-hover:bg-gold/25 transition-colors">
                    <c.icon className="w-4 h-4 text-gold" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-1">{c.label}</div>
                    <div className="font-display text-sm truncate">{c.value}</div>
                  </div>
                </a>
              ))}
            </div>

            <a
              href="https://wa.me/2348167767271"
              target="_blank" rel="noreferrer"
              className="rounded-sm p-6 flex items-center justify-between bg-gradient-gold text-gold-foreground hover:-translate-y-0.5 transition-transform shadow-gold"
            >
              <div className="flex items-center gap-4">
                <MessageCircle className="w-6 h-6" />
                <div>
                  <div className="font-display text-xl">Chat on WhatsApp</div>
                  <div className="text-xs opacity-80">Fastest response</div>
                </div>
              </div>
              <span className="text-sm font-medium">→</span>
            </a>
          </div>

          <form onSubmit={submit} className="glass-card rounded-sm p-8 space-y-5 h-fit">
            <div>
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2" />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-2" />
              {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
            </div>
            <Button type="submit" variant="gold" size="lg" className="w-full">Send Message</Button>
          </form>
        </div>
      </section>
    </Layout>
  );
}
