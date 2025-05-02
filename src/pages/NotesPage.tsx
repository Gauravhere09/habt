
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  getUserNotes, 
  createNote, 
  updateNote, 
  deleteNote, 
  searchNotes, 
  Note 
} from '@/services/notesService';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [search, setSearch] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to auth if not logged in
    if (!user) {
      toast.error('You must be logged in to access notes');
      navigate('/auth');
      return;
    }

    loadNotes();
  }, [user, navigate]);

  const loadNotes = async () => {
    const fetchedNotes = await getUserNotes();
    setNotes(fetchedNotes);
  };

  const handleSearch = async () => {
    if (search.trim()) {
      const results = await searchNotes(search);
      setNotes(results);
    } else {
      loadNotes();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      if (editingNote) {
        await updateNote(editingNote.id, title, content);
        toast.success('Note updated successfully');
      } else {
        await createNote(title, content);
        toast.success('Note created successfully');
      }
      
      setTitle('');
      setContent('');
      setEditingNote(null);
      loadNotes();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content || '');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      const success = await deleteNote(id);
      if (success) {
        toast.success('Note deleted successfully');
        loadNotes();
      }
    }
  };

  const handleCancel = () => {
    setTitle('');
    setContent('');
    setEditingNote(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">Notes</h2>
      
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>{editingNote ? 'Edit Note' : 'Create Note'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit">{editingNote ? 'Update' : 'Save'}</Button>
              {editingNote && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="flex space-x-2">
        <Input
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>
      
      <div className="space-y-4">
        {notes.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No notes found.</p>
            </CardContent>
          </Card>
        ) : (
          notes.map((note) => (
            <Card key={note.id} className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>{note.title}</span>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEdit(note)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(note.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{note.content}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Last updated: {new Date(note.updated_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
