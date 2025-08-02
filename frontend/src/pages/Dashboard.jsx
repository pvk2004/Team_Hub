import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Plus, MessageSquare } from 'lucide-react';
import { mockAnnouncementAPI } from '../mock';
import AnnouncementCard from '../components/AnnouncementCard';
import CreateEditDialog from '../components/CreateEditDialog';
import { useToast } from '../hooks/use-toast';

const Dashboard = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setIsLoading(true);
      const data = await mockAnnouncementAPI.getAll();
      setAnnouncements(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAnnouncement = () => {
    setEditingAnnouncement(null);
    setIsDialogOpen(true);
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setIsDialogOpen(true);
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      await mockAnnouncementAPI.delete(id);
      toast({
        title: "Announcement deleted",
        description: "The announcement has been removed successfully.",
      });
      loadAnnouncements();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };

  const handleSaveAnnouncement = async (title, content) => {
    try {
      if (editingAnnouncement) {
        await mockAnnouncementAPI.update(editingAnnouncement.id, title, content);
        toast({
          title: "Announcement updated",
          description: "Your changes have been saved successfully.",
        });
      } else {
        await mockAnnouncementAPI.create(title, content);
        toast({
          title: "Announcement created",
          description: "Your announcement has been published successfully.",
        });
      }
      setIsDialogOpen(false);
      setEditingAnnouncement(null);
      loadAnnouncements();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save announcement",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Announcements
          </h1>
          <p className="text-slate-600">
            Stay updated with the latest team news and updates
          </p>
        </div>
        <Button 
          onClick={handleCreateAnnouncement}
          className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-900 hover:to-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Announcement
        </Button>
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No announcements yet
          </h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Be the first to share important news with your team. Create your first announcement now.
          </p>
          <Button 
            onClick={handleCreateAnnouncement}
            className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-900 hover:to-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Announcement
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {announcements.map((announcement, index) => (
            <div 
              key={announcement.id} 
              className="animate-in fade-in slide-in-from-bottom duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <AnnouncementCard
                announcement={announcement}
                onEdit={handleEditAnnouncement}
                onDelete={handleDeleteAnnouncement}
              />
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <CreateEditDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingAnnouncement(null);
        }}
        onSave={handleSaveAnnouncement}
        announcement={editingAnnouncement}
      />
    </div>
  );
};

export default Dashboard;