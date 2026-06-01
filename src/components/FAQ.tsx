import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  { q: "What is included in your Umrah and Hajj packages?", a: "Every package includes return airfare, visa processing, premium accommodation in Makkah and Madinah, daily ground transport, an experienced scholar-guide, and full meals during the trip." },
  { q: "Do you arrange visas for study-abroad students?", a: "Yes. Our consultants handle the entire admission and visa pipeline — from university shortlisting and SOP review to embassy interview prep and pre-departure briefings." },
  { q: "Can I pay in instalments?", a: "Absolutely. We offer flexible deposit plans for both pilgrimage and study packages. Speak with our consultants to design a schedule that works for you." },
  { q: "Which airports do you fly from?", a: "Pilgrimage groups depart from Kano (KAN) to Madinah/Jeddah. Study and medical travellers can depart from Abuja, Lagos, or Kano depending on the route." },
  { q: "How do I confirm my booking?", a: "Submit a booking request through the website or WhatsApp. A consultant will contact you within 24 hours with a payment slip and document checklist." },
];

export default function FAQ() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container-luxe max-w-4xl">
        <div className="text-center mb-12">
          <div className="eyebrow mb-4 justify-center">Frequently Asked</div>
          <h2 className="font-display text-4xl sm:text-5xl">Answers, before you ask.</h2>
        </div>
        <Accordion type="single" collapsible className="glass-card rounded-sm divide-y divide-border/60">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="px-6 border-0">
              <AccordionTrigger className="py-5 text-left font-display text-lg hover:text-gold hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-6">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
