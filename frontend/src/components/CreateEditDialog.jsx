import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Save, X, FileText, MessageSquare } from 'lucide-react';

const CreateEditDialog = ({ isOpen, onClose, onSave, announcement }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title);
      setContent(announcement.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [announcement, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setIsLoading(true);
      await onSave(title.trim(), content.trim());
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2 text-xl font-bold text-slate-900">
            <div className="w-8 h-8 bg-gradient-to-r from-slate-800 to-slate-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span>
              {announcement ? 'Edit Announcement' : 'Create New Announcement'}
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 space-y-6 py-4 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-700 font-medium flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Title</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter announcement title..."
                className="h-12 text-lg transition-all focus:ring-2 focus:ring-slate-500/20"
                required
                autoFocus
              />
              <p className="text-xs text-slate-500">
                Choose a clear, descriptive title for your announcement
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-slate-700 font-medium flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Content</span>
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your announcement content here..."
                className="min-h-[200px] resize-none transition-all focus:ring-2 focus:ring-slate-500/20"
                required
              />
              <p className="text-xs text-slate-500">
                Provide detailed information about your announcement
              </p>
            </div>

            {/* Character count */}
            <div className="flex justify-between text-xs text-slate-500">
              <span>Title: {title.length} characters</span>
              <span>Content: {content.length} characters</span>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="transition-all hover:bg-slate-50 hover:shadow-md"
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !content.trim() || isLoading}
              className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-900 hover:to-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isLoading 
                ? (announcement ? 'Updating...' : 'Creating...') 
                : (announcement ? 'Update Announcement' : 'Create Announcement')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEditDialog;