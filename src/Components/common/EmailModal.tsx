import React, { useState } from "react";
import api from "@/utils/axios";


const EmailModal = () => {
    const [emailModalOpen, setEmailModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

    const [emailData, setEmailData] = useState({
        to: "",
        subject: "",
        body: "",
    });

    const handleSendEmail = async () => {
        try {
            await api.post("/api/invoices/send-email", {
                invoiceId: selectedInvoice.salesInvoiceID,
                to: emailData.to,
                subject: emailData.subject,
                body: emailData.body,
            });

            setEmailModalOpen(false);
        } catch (err) {
            console.error(err);
        }
    };


    return (
        <div>
            {emailModalOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white w-[500px] rounded shadow-lg p-4">

                        <h2 className="text-sm font-semibold mb-3">Send Invoice Email</h2>

                        <div className="space-y-3">

                            <input
                                type="email"
                                value={emailData.to}
                                onChange={(e) =>
                                    setEmailData({ ...emailData, to: e.target.value })
                                }
                                className="w-full border p-2 text-sm"
                                placeholder="To"
                            />

                            <input
                                type="text"
                                value={emailData.subject}
                                onChange={(e) =>
                                    setEmailData({ ...emailData, subject: e.target.value })
                                }
                                className="w-full border p-2 text-sm"
                                placeholder="Subject"
                            />

                            <textarea
                                value={emailData.body}
                                onChange={(e) =>
                                    setEmailData({ ...emailData, body: e.target.value })
                                }
                                className="w-full border p-2 text-sm h-32"
                            />

                            {/* Attachment Info */}
                            <div className="text-xs text-gray-500">
                                📎 Invoice PDF will be attached automatically
                            </div>

                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setEmailModalOpen(false)}
                                className="px-3 py-1 text-sm border rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSendEmail}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
                            >
                                Send
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    )
}

export default EmailModal