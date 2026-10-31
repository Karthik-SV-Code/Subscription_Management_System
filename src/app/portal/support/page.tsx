"use client";

import * as React from "react";
import {
  HelpCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  FileQuestion,
  Headphones,
  Plus,
} from "lucide-react";
import { PortalHeader } from "@/components/portal/portal-header";
import {
  PORTAL_FAQ_ITEMS,
  PORTAL_SUPPORT_TICKETS,
  PORTAL_CUSTOMER,
} from "@/features/portal/mock-data";
import { SupportTicket, FAQItem } from "@/features/portal/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function PortalSupportPage() {
  const [faqs] = React.useState<FAQItem[]>(PORTAL_FAQ_ITEMS);
  const [faqCategory, setFaqCategory] = React.useState<string>("all");
  const [expandedFaqId, setExpandedFaqId] = React.useState<string | null>("faq_01");

  // Tickets State
  const [tickets, setTickets] = React.useState<SupportTicket[]>(
    PORTAL_SUPPORT_TICKETS
  );
  const [selectedTicket, setSelectedTicket] = React.useState<SupportTicket | null>(null);
  const [showTicketDialog, setShowTicketDialog] = React.useState(false);
  const [newReplyMessage, setNewReplyMessage] = React.useState("");

  // New Ticket Form State
  const [ticketSubject, setTicketSubject] = React.useState("");
  const [ticketPriority, setTicketPriority] = React.useState<"low" | "medium" | "high">("medium");
  const [ticketMessage, setTicketMessage] = React.useState("");
  const [submitFeedback, setSubmitFeedback] = React.useState<string | null>(null);

  // Filter FAQs
  const filteredFaqs = faqs.filter(
    (f) => faqCategory === "all" || f.category === faqCategory
  );

  const toggleFaq = (id: string) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    const newTicket: SupportTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: ticketSubject.trim(),
      message: ticketMessage.trim(),
      status: "open",
      priority: ticketPriority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [],
    };

    setTickets([newTicket, ...tickets]);
    setTicketSubject("");
    setTicketMessage("");
    setTicketPriority("medium");
    setSubmitFeedback(
      `Support Ticket #${newTicket.id} submitted successfully. A specialist will respond shortly.`
    );
    setTimeout(() => setSubmitFeedback(null), 6000);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newReplyMessage.trim()) return;

    const reply = {
      id: `rep_${Date.now()}`,
      sender: "customer" as const,
      message: newReplyMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    const updated = {
      ...selectedTicket,
      updatedAt: new Date().toISOString(),
      replies: [...(selectedTicket.replies || []), reply],
    };

    setSelectedTicket(updated);
    setTickets((prev) =>
      prev.map((t) => (t.id === selectedTicket.id ? updated : t))
    );
    setNewReplyMessage("");
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <PortalHeader
        title="Help & Support"
        subtitle="Frequently asked questions, ticket communications, and technical assistance"
      />

      <main className="flex-1 px-4 sm:px-8 pt-6 max-w-7xl w-full mx-auto space-y-8">
        {/* Banner Alert for Ticket Creation */}
        {submitFeedback && (
          <div className="p-4 rounded-[16px] bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{submitFeedback}</span>
            </div>
            <button
              onClick={() => setSubmitFeedback(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {/* 2-Column Grid: FAQ Section & New Ticket Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* FAQ Accordion (7 cols) */}
          <section className="lg:col-span-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#171717]">
                  Frequently Asked Questions
                </h3>
                <p className="text-xs text-[#737373]">
                  Find instant guidance regarding billing cycles, proration, and policies
                </p>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: "all", label: "All" },
                  { id: "billing", label: "Billing" },
                  { id: "subscriptions", label: "Plans" },
                  { id: "support", label: "Support" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setFaqCategory(c.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                      faqCategory === c.id
                        ? "bg-[#171717] text-white"
                        : "bg-white text-[#737373] hover:text-[#171717] border border-[#EAECEF]"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Accordion list */}
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isOpen = expandedFaqId === faq.id;

                return (
                  <div
                    key={faq.id}
                    className="rounded-[16px] bg-white border border-[#EAECEF] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all"
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full p-4.5 text-left flex items-center justify-between gap-3 hover:bg-[#F5F6F8]/50 transition-colors"
                    >
                      <span className="text-xs font-bold text-[#171717]">
                        {faq.question}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-4.5 pb-4.5 pt-1 text-xs text-[#737373] leading-relaxed border-t border-[#EAECEF]/60 animate-in fade-in duration-150">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* New Ticket Form (5 cols) */}
          <section className="lg:col-span-5">
            <div className="rounded-[20px] bg-white border border-[#EAECEF] p-6 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#171717]">
                    Contact Support Team
                  </h3>
                  <p className="text-xs text-[#737373]">
                    Enterprise SLA: Response within 2 hours
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4 text-xs pt-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#737373] block mb-1">
                    Ticket Subject
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Question regarding ACH payment mandate"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="rounded-xl h-9 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#737373] block mb-1">
                    Priority Urgency
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["low", "medium", "high"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setTicketPriority(p)}
                        className={`py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                          ticketPriority === p
                            ? "bg-[#171717] text-white border-[#171717] shadow-xs"
                            : "bg-white text-[#737373] border-[#EAECEF] hover:text-[#171717]"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#737373] block mb-1">
                    Describe your request or issue
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide relevant details or transaction references..."
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-[#EAECEF] bg-[#F5F6F8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#171717] hover:bg-black text-white rounded-xl text-xs font-semibold h-10 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Submit Support Ticket
                </Button>
              </form>
            </div>
          </section>
        </div>

        {/* Existing Tickets Table */}
        <section className="rounded-[20px] bg-white border border-[#EAECEF] p-6 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#171717]">
                My Support Communications
              </h3>
              <p className="text-xs text-[#737373]">
                Track conversation history and active inquiry resolutions
              </p>
            </div>
            <span className="text-xs text-[#737373] font-semibold">
              {tickets.length} Total Tickets
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EAECEF] text-[11px] font-bold uppercase tracking-wider text-[#737373]">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECEF] text-xs">
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-[#F5F6F8]/60 transition-colors group"
                  >
                    <td className="py-4 px-4 font-mono font-bold text-[#171717]">
                      {t.id}
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#171717] max-w-sm truncate">
                      {t.subject}
                    </td>
                    <td className="py-4 px-4">
                      {t.priority === "high" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700">
                          HIGH
                        </span>
                      )}
                      {t.priority === "medium" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">
                          MEDIUM
                        </span>
                      )}
                      {t.priority === "low" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          LOW
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {t.status === "resolved" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                          Resolved
                        </span>
                      )}
                      {t.status === "in_progress" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                          In Progress
                        </span>
                      )}
                      {t.status === "open" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">
                          Open
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-[#737373]">
                      {formatDate(t.updatedAt)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTicket(t);
                          setShowTicketDialog(true);
                        }}
                        className="h-8 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3"
                      >
                        View Thread
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Ticket Thread Dialog */}
      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent className="max-w-xl bg-white rounded-[24px] p-6 border-[#EAECEF] max-h-[85vh] flex flex-col">
          <DialogHeader className="pb-3 border-b border-[#EAECEF]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-indigo-600">
                {selectedTicket?.id}
              </span>
              <span className="capitalize text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-[#171717]">
                {selectedTicket?.status.replace("_", " ")}
              </span>
            </div>
            <DialogTitle className="text-base font-extrabold text-[#171717] mt-1">
              {selectedTicket?.subject}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#737373]">
              Opened {selectedTicket && formatDate(selectedTicket.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {/* Conversation Thread */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
            {/* Original message */}
            <div className="p-3.5 rounded-2xl bg-[#F5F6F8] space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-[#171717]">
                <span>{PORTAL_CUSTOMER.name} (You)</span>
                <span className="text-[#737373] font-normal">
                  {selectedTicket && formatDate(selectedTicket.createdAt)}
                </span>
              </div>
              <p className="text-[#737373] leading-relaxed">
                {selectedTicket?.message}
              </p>
            </div>

            {/* Replies */}
            {selectedTicket?.replies?.map((rep) => (
              <div
                key={rep.id}
                className={`p-3.5 rounded-2xl space-y-1 ${
                  rep.sender === "support"
                    ? "bg-indigo-50/70 border border-indigo-100/60 ml-4"
                    : "bg-[#F5F6F8] mr-4"
                }`}
              >
                <div className="flex justify-between text-[11px] font-bold">
                  <span className={rep.sender === "support" ? "text-indigo-900" : "text-[#171717]"}>
                    {rep.sender === "support" ? "SubscriptIQ Support Specialist" : "You"}
                  </span>
                  <span className="text-[#737373] font-normal">
                    {formatDate(rep.timestamp)}
                  </span>
                </div>
                <p className="text-[#171717] leading-relaxed">
                  {rep.message}
                </p>
              </div>
            ))}
          </div>

          {/* Reply Input Form */}
          <form onSubmit={handleSendReply} className="pt-3 border-t border-[#EAECEF] flex items-center gap-2">
            <Input
              type="text"
              placeholder="Write a reply..."
              value={newReplyMessage}
              onChange={(e) => setNewReplyMessage(e.target.value)}
              className="rounded-xl h-9 text-xs flex-1 bg-[#F5F6F8] border-[#EAECEF] focus:bg-white"
            />
            <Button
              type="submit"
              disabled={!newReplyMessage.trim()}
              className="bg-[#171717] hover:bg-black text-white rounded-xl text-xs font-semibold h-9 px-4 shrink-0"
            >
              Reply
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
