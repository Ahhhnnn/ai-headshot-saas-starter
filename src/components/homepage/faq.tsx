import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What photos do I need to upload?",
    answer:
      "Upload 4-8 high-quality selfies or photos of yourself. Make sure your face is clearly visible, well-lit, and taken from different angles. Avoid photos with sunglasses, heavy filters, or multiple people.",
  },
  {
    question: "How does the AI generate my headshots?",
    answer:
      "Our AI analyzes your facial features from the photos you upload and creates a personalized model. It then generates new headshots with professional lighting, backgrounds, and poses while maintaining your authentic appearance.",
  },
  {
    question: "Are my photos private and secure?",
    answer:
      "Absolutely. Your photos are encrypted and stored securely. We never share your photos with third parties. You can request deletion of all your data at any time, and we automatically delete all uploaded photos after 30 days.",
  },
  {
    question: "How long does it take to get my headshots?",
    answer:
      "Depending on your plan, headshots are delivered within 30 minutes to 48 hours. Pro plan users receive their headshots in about 1 hour, while Starter plan users receive theirs within 48 hours.",
  },
  {
    question: "Can I get a refund if I'm not satisfied?",
    answer:
      "Yes! We offer a 100% satisfaction guarantee. If you're not happy with your headshots, contact our support team within 7 days of delivery for a full refund or free regeneration.",
  },
  {
    question: "Can I use these headshots for LinkedIn and professional profiles?",
    answer:
      "Absolutely! Our headshots are optimized for LinkedIn and all professional platforms. They're high-resolution (1024x1024) and formatted perfectly for profile photos, resumes, and business cards.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about HeadshotPro AI.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-foreground hover:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
