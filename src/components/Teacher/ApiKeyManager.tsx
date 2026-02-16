"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, Eye, EyeOff, Save } from "lucide-react";
import { toast } from "sonner";

export function ApiKeyManager({ onKeyUpdate }: { onKeyUpdate: (key: string) => void }) {
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Try to load from localStorage on mount
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setKey(savedKey);
      setIsSaved(true);
      onKeyUpdate(savedKey);
    }
  }, [onKeyUpdate]);

  const handleSave = () => {
    if (!key.trim()) return;
    localStorage.setItem("gemini_api_key", key);
    setIsSaved(true);
    onKeyUpdate(key);
    toast.success("API Key saved locally");
  };

  const handleClear = () => {
    localStorage.removeItem("gemini_api_key");
    setKey("");
    setIsSaved(false);
    onKeyUpdate("");
    toast.info("API Key removed");
  };

  if (isSaved) {
    return (
      <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-medium border border-emerald-100">
        <KeyRound className="w-4 h-4" />
        <span className="flex-1">API Key Configured</span>
        <button onClick={handleClear} className="text-emerald-600 hover:text-emerald-800 underline">
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span className="flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" />
            Gemini API Key
        </span>
        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-purple-600 hover:underline">
          Get Key
        </a>
      </div>
      <div className="relative">
        <Input
          type={showKey ? "text" : "password"}
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Paste key here..."
          className="pr-10 h-9 text-xs bg-white"
        />
        <button
          type="button"
          onClick={() => setShowKey(!showKey)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
      <Button size="sm" onClick={handleSave} className="w-full h-8 text-xs bg-slate-900 text-white hover:bg-slate-800">
        <Save className="w-3.5 h-3.5 mr-1.5" />
        Save Key
      </Button>
    </div>
  );
}
