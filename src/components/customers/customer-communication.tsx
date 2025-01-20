import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Customer } from "@/types";

interface CustomerCommunicationProps {
  customer: Customer;
  onSendMessage: (message: string, method: "email" | "phone") => void;
}

export function CustomerCommunication({
  customer,
  onSendMessage,
}: CustomerCommunicationProps) {
  const [message, setMessage] = useState("");
  const [method, setMethod] = useState<"email" | "phone">(
    customer.contact.preferredContact
  );

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message, method);
      setMessage("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">Communication</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Select
              value={method}
              onValueChange={(value: "email" | "phone") => setMethod(value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select contact method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone/SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[100px]"
          />

          <div className="flex justify-end">
            <Button onClick={handleSend}>Send Message</Button>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Communication History</h3>
            <div className="space-y-2">
              {/* Add communication history items here */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="text-sm font-medium">Email Sent</div>
                  <div className="text-xs text-gray-500">2 days ago</div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Installation confirmation and schedule details...
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
