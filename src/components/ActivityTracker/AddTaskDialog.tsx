
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Activity } from '@/types/activity';
import { toast } from 'sonner';
import { createActivity } from '@/services/activityService';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { EmojiPicker } from './EmojiPicker';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  emoji: z.string().min(1, 'Emoji is required'),
  valueType: z.enum(['click', 'number', 'text', 'duration']),
  description: z.string().optional(),
});

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskAdded: (task?: Activity) => void;
}

const defaultEmojis = ["📝", "⭐", "🎯", "📊", "🧩", "🔔", "🎨", "🎬", "📚", "💼"];

export function AddTaskDialog({ open, onOpenChange, onTaskAdded }: AddTaskDialogProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [randomEmoji] = useState(() => {
    return defaultEmojis[Math.floor(Math.random() * defaultEmojis.length)];
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      emoji: randomEmoji,
      valueType: 'click',
      description: '',
    },
  });

  useEffect(() => {
    // If dialog is opened but user is not logged in
    if (open && !user) {
      toast.error("You need to log in to create custom activities");
      onOpenChange(false);
      navigate("/auth");
    }
  }, [open, user, navigate, onOpenChange]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You need to log in to create custom activities");
      onOpenChange(false);
      navigate("/auth");
      return;
    }

    try {
      const newActivity: Activity = {
        id: crypto.randomUUID(),
        name: values.name,
        emoji: values.emoji,
        description: values.description,
        valueType: values.valueType,
      };
      
      // Add to localStorage
      const storedActivities = JSON.parse(localStorage.getItem('customActivities') || '[]');
      localStorage.setItem('customActivities', JSON.stringify([...storedActivities, newActivity]));
      
      // Save to Supabase if user is logged in
      if (user) {
        try {
          const { error } = await supabase
            .from('activities')
            .insert({
              user_id: user.id,
              activity_type: newActivity.name,
              emoji: newActivity.emoji,
              value: newActivity.valueType || null,
              id: newActivity.id
            });
            
          if (error) throw error;
        } catch (error: any) {
          console.error("Error saving to Supabase:", error);
          // Continue with the flow even if Supabase save fails
        }
      }
      
      // Create first activity instance
      await createActivity(values.name, values.emoji);
      
      toast.success(`New task "${values.name}" created`);
      onTaskAdded(newActivity);
      onOpenChange(false);
      form.reset({
        name: '',
        emoji: defaultEmojis[Math.floor(Math.random() * defaultEmojis.length)],
        valueType: 'click',
        description: '',
      });
    } catch (error) {
      toast.error('Failed to create task');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to track in your activities.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="emoji"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emoji</FormLabel>
                  <FormControl>
                    <EmojiPicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter task name" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="valueType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Value Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="click" id="click" />
                        <Label htmlFor="click">Click (just record occurrence)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="number" id="number" />
                        <Label htmlFor="number">Number (amount or quantity)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="duration" id="duration" />
                        <Label htmlFor="duration">Duration (time)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="text" id="text" />
                        <Label htmlFor="text">Text (notes)</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter description" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
