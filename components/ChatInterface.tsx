"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Send, Bot, User, Paperclip, Phone, Video, MoreVertical, Wifi, WifiOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ChatMessage, Doctor } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  doctor: Doctor;
}

export default function ChatInterface({ messages: initialMessages, doctor }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDataCollected, setIsDataCollected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Clear any previous errors
    setError(null);

    // Add user message
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "patient",
      senderName: "You",
      message: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Convert messages to API format
      const conversationMessages = messages
        .filter((m) => m.sender === "patient" || m.sender === "ai" || m.sender === "doctor")
        .map((m) => ({
          role: m.sender === "patient" ? "user" : "assistant",
          content: m.message,
        }))
        .concat([{ role: "user", content: inputValue }]);

      // Call Groq API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationMessages,
          doctorName: doctor.name,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.reply) {
        throw new Error("No response from AI");
      }

      // Add AI response
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        senderName: "AI Assistant",
        message: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Check if data collection is complete
      if (data.isDataCollected) {
        setIsDataCollected(true);
      }
    } catch (err) {
      console.error("Chat API Error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get response from AI. Please try again.";
      setError(errorMessage);

      // Add error message to chat
      const errorChatMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: "ai",
        senderName: "AI Assistant",
        message: `⚠️ ${errorMessage}. Please try again or contact us directly.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[560px] rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100 shrink-0">
        <div className="relative">
          <div className="h-10 w-10 rounded-full overflow-hidden">
            <Image src={doctor.avatar} alt={doctor.name} width={40} height={40} className="h-full w-full object-cover" />
          </div>
          <span
            className={cn(
              "absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white",
              doctor.isAvailableNow ? "bg-emerald-500" : "bg-slate-300"
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{doctor.name}</p>
          <div className="flex items-center gap-1.5">
            {doctor.aiAssistantMode ? (
              <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 gap-1">
                <Bot className="h-2.5 w-2.5" />
                AI Mode
              </Badge>
            ) : (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                {doctor.isAvailableNow ? (
                  <><Wifi className="h-3 w-3 text-emerald-500" /> Online</>
                ) : (
                  <><WifiOff className="h-3 w-3 text-slate-400" /> Away</>
                )}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-600">
            <Phone className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-600">
            <Video className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-600">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* AI Mode Banner */}
      {doctor.aiAssistantMode && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-b border-blue-100 shrink-0">
          <Bot className="h-3.5 w-3.5 text-blue-600 shrink-0" />
          <p className="text-xs text-blue-700">
            Dr. {doctor.name.split(" ")[1]} is currently unavailable. Our AI assistant will collect your details and schedule your appointment.
          </p>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50">
        {/* Date separator */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium">Today</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {messages.map((msg) => {
          const isPatient = msg.sender === "patient";
          const isAI = msg.sender === "ai";

          return (
            <div key={msg.id} className={cn("flex items-end gap-2", isPatient ? "flex-row-reverse" : "flex-row")}>
              {/* Avatar */}
              {!isPatient && (
                <div className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center shrink-0 mb-1",
                  isAI ? "bg-blue-600" : "bg-slate-200"
                )}>
                  {isAI ? (
                    <Bot className="h-4 w-4 text-white" />
                  ) : (
                    <Image src={doctor.avatar} alt={doctor.name} width={28} height={28} className="h-full w-full rounded-full object-cover" />
                  )}
                </div>
              )}

              {isPatient && (
                <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mb-1">
                  <User className="h-3.5 w-3.5 text-white" />
                </div>
              )}

              {/* Bubble */}
              <div className={cn("max-w-[75%] space-y-1", isPatient ? "items-end" : "items-start", "flex flex-col")}>
                {!isPatient && (
                  <p className="text-[10px] font-medium text-slate-500 px-1">{msg.senderName}</p>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                    isPatient
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : isAI
                      ? "bg-white text-slate-800 border border-blue-100 rounded-bl-sm"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm"
                  )}
                >
                  {msg.message}
                </div>
                <p className="text-[10px] text-slate-400 px-1">{msg.timestamp}</p>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex items-end gap-2">
            <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 bg-blue-600">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Data Collection Complete */}
        {isDataCollected && (
          <div className="flex items-start gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <Bot className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-700">✓ Information collected!</p>
              <p className="text-xs text-emerald-600 mt-1">A doctor will contact you shortly at the number provided.</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white border-t border-slate-100 shrink-0">
        <Button 
          size="icon" 
          variant="ghost" 
          disabled={isLoading || isDataCollected}
          className="h-9 w-9 text-slate-400 hover:text-slate-600 shrink-0 disabled:opacity-40"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          placeholder={isDataCollected ? "Information submitted ✓" : "Type a message..."}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || isDataCollected}
          className="flex-1 h-9 border-slate-200 bg-slate-50 focus:bg-white disabled:opacity-60"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading || isDataCollected}
          className="h-9 w-9 shrink-0 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
