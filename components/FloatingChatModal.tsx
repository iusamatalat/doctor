"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, X, Bot, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface FloatingChatModalProps {
  onClose: () => void;
}

export default function FloatingChatModal({ onClose }: FloatingChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! 👋 I'm the Smart Doctor AI Assistant. How can I help you today? Tell me about your symptoms or concerns.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDataCollected, setIsDataCollected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Call Groq API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages
            .filter((m) => m.id !== "welcome")
            .map((m) => ({
              role: m.role,
              content: m.content,
            }))
            .concat([{ role: "user", content: inputValue }]),
          doctorName: "Virtual Assistant",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsDataCollected(data.isDataCollected);

      // Show success message if data is collected
      if (data.isDataCollected) {
        setTimeout(() => {
          const successMessage: Message = {
            id: `success-${Date.now()}`,
            role: "assistant",
            content:
              "✅ Perfect! I've collected all your information. A doctor will contact you shortly at the number you provided. Thank you for using Smart Doctor Connect!",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, successMessage]);
        }, 1000);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          "Sorry, I'm having trouble connecting right now. Please try again in a moment, or call our clinic directly.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Chat Modal */}
      <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-24px)] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900">Smart Doctor AI</p>
              <p className="text-xs text-slate-600">Always here to help</p>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
          {messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2",
                  isUser ? "justify-end" : "justify-start"
                )}
              >
                {!isUser && (
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="h-3 w-3 text-blue-600" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-xs px-3 py-2 rounded-lg text-sm",
                    isUser
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white border border-slate-200 text-slate-900 rounded-bl-none"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      isUser ? "text-blue-100" : "text-slate-500"
                    )}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex gap-2">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                <Loader className="h-3 w-3 text-blue-600 animate-spin" />
              </div>
              <div className="bg-white border border-slate-200 text-slate-900 px-3 py-2 rounded-lg rounded-bl-none">
                <p className="text-sm">AI is thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-slate-200 bg-white">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading || isDataCollected}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim() || isDataCollected}
              size="icon"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {isDataCollected && (
            <p className="text-xs text-emerald-600 mt-2 font-medium">✓ Your information has been submitted</p>
          )}
        </div>
      </div>
    </>
  );
}
