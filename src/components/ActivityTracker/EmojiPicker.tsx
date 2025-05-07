
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

// Updated with more emojis across categories
const categoryEmojis: Record<string, string[]> = {
  "Common": ["📝", "⭐", "🎯", "📊", "🧩", "🔔", "💪", "⏰", "📅", "🚀", "🎵", "💼", "🏆"],
  "Activities": ["🧘", "🏃", "🚶", "🛒", "🧹", "🛌", "📚", "📱", "💻", "🎮", "🎬", "🎨", "🚴", "🧠"],
  "Health": ["💧", "😴", "💊", "🥗", "🍎", "🥑", "🥦", "🥤", "☕", "💉", "🧠", "🤒", "💪", "🏋️"],
  "Emotions": ["😀", "🙂", "😊", "😍", "🤔", "😴", "🥳", "😎", "🤓", "😢", "😡", "😌", "😬", "🥰"],
  "Food": ["🍕", "🍔", "🍟", "🌮", "🥗", "🍎", "🍌", "🥑", "🥦", "🍗", "🍞", "🥛", "🍩", "🍦"],
  "Travel": ["✈️", "🚗", "🚆", "🚌", "🏝️", "🏔️", "🏙️", "🗺️", "🧳", "⛱️", "🚢", "🚶", "🧭", "🏕️"],
  "Home": ["🏠", "🛋️", "🛏️", "🪑", "🚿", "🧹", "🧼", "🧺", "🪴", "📺", "💡", "🔑", "🚪", "🧰"],
  "Other": ["🎁", "💰", "📦", "🔒", "🔓", "💌", "📱", "📞", "💬", "📷", "🔍", "⚙️", "🧩", "🎲"]
};

const categories = Object.keys(categoryEmojis);

interface EmojiPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("Common");
  const [searchQuery, setSearchQuery] = useState("");

  // Flatten all emojis for search
  const allEmojis = Object.values(categoryEmojis).flat();
  
  // Filter emojis based on search query
  const filteredEmojis = searchQuery 
    ? allEmojis.filter(emoji => emoji.includes(searchQuery))
    : categoryEmojis[currentCategory];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-16 h-16 text-4xl">
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" sideOffset={5}>
        <div className="p-3 border-b">
          <div className="text-sm font-medium mb-2">Select Emoji</div>
          <Input
            placeholder="Search emoji..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-2"
          />
          <div className="flex gap-1 overflow-x-auto py-2" style={{ scrollbarWidth: 'thin' }}>
            {categories.map((category) => (
              <Button 
                key={category}
                size="sm"
                variant={currentCategory === category && !searchQuery ? "default" : "outline"}
                onClick={() => {
                  setCurrentCategory(category);
                  setSearchQuery("");
                }}
                className="whitespace-nowrap text-xs flex-shrink-0"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        <div className="p-2 grid grid-cols-8 gap-1 max-h-60 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {filteredEmojis.map((emoji) => (
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
