
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const emojis = [
  "📝", "⭐", "🎯", "📊", "🧩", "🎨", "🎬", "📚", "📱",  
  "💼", "🔔", "🏆", "🔍", "📌", "🔑", "💡", "📋", "📎", 
  "⏰", "📅", "🧠", "💪", "🎵", "💵", "🏡", "🚶", "🛒",
  "😀", "🙂", "😊", "😍", "🤔", "😴", "🥳", "😎", "🤓",
  "🚀", "🏃", "🚴", "🧘", "💧", "💊", "🧹", "🛌", "💰",
  "🥗", "🍎", "🥑", "🥦", "🥤", "☕", "🍵", "🍽️", "🥛",
  "🐶", "🐱", "🐦", "🌈", "🌞", "⛅", "🌧️", "❄️", "🔥",
  "💻", "📲", "🔋", "🔌", "📦", "🔒", "🔓", "🧮", "🎮"
];

const categoryEmojis: Record<string, string[]> = {
  "Common": ["📝", "⭐", "🎯", "📊", "🧩", "🔔", "💪", "⏰", "📅", "🚀"],
  "Activities": ["🧘", "🏃", "🚶", "🛒", "🧹", "🛌", "📚", "📱", "💻"],
  "Health": ["💧", "😴", "💊", "🥗", "🍎", "🥑", "🥦", "🥤", "☕"],
  "Emotions": ["😀", "🙂", "😊", "😍", "🤔", "😴", "🥳", "😎", "🤓"],
  "Other": ["🎨", "💼", "🏆", "🔍", "💡", "📦", "🔒", "🔓", "🎮"]
};

const categories = Object.keys(categoryEmojis);

interface EmojiPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("Common");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-16 h-16 text-4xl">
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-3 border-b">
          <div className="text-sm font-medium mb-2">Select Emoji</div>
          <div className="flex gap-1 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button 
                key={category}
                size="sm"
                variant={currentCategory === category ? "default" : "outline"}
                onClick={() => setCurrentCategory(category)}
                className="whitespace-nowrap text-xs"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        <div className="p-2 grid grid-cols-8 gap-1 max-h-60 overflow-y-auto">
          {categoryEmojis[currentCategory].map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              className="h-8 w-8 p-0 text-xl hover:bg-muted"
              onClick={() => {
                onChange(emoji);
                setOpen(false);
              }}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
