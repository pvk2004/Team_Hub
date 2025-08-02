import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { MoreVertical, Edit, Trash2, User, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AnnouncementCard = ({ announcement, onEdit, onDelete }) => {
  const { currentUser } = useAuth();
  const canModify = currentUser?.email === announcement.author_email || currentUser?.role === 'admin';

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = () => {
    onEdit(announcement);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      onDelete(announcement.id);
    }
  };

  return (
    <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50/50 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-slate-700 transition-colors leading-tight">
            {announcement.title}
          </CardTitle>
          {canModify && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-slate-100"
                >
                  <MoreVertical className="w-4 h-4 text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={handleEdit}
                  className="cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <p className="text-slate-600 leading-relaxed line-clamp-4">
          {announcement.content}
        </p>
      </CardContent>
      
      <CardFooter className="pt-4 border-t border-slate-100 bg-slate-50/30">
        <div className="flex items-center justify-between w-full text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span className="font-medium">{announcement.author_email}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <time dateTime={announcement.created_at} className="font-medium">
              {formatDate(announcement.created_at)}
            </time>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AnnouncementCard;