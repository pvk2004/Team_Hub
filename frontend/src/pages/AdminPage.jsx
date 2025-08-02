import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Users, Shield, UserCheck, Save, CheckCircle2 } from 'lucide-react';
import { mockUserAPI } from '../mock';
import { useToast } from '../hooks/use-toast';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await mockUserAPI.getAll();
      setUsers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (userId, newRole) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, role: newRole, hasUnsavedChanges: user.role !== newRole }
        : user
    ));
  };

  const handleSaveRole = async (userId, newRole) => {
    try {
      setSavingUserId(userId);
      await mockUserAPI.updateRole(userId, newRole);
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: newRole, hasUnsavedChanges: false }
          : user
      ));

      toast({
        title: "Role updated successfully",
        description: "User role has been changed and saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setSavingUserId(null);
    }
  };

  const getRoleBadgeVariant = (role) => {
    return role === 'admin' ? 'default' : 'secondary';
  };

  const getRoleIcon = (role) => {
    return role === 'admin' ? Shield : UserCheck;
  };

  const adminCount = users.filter(user => user.role === 'admin').length;
  const userCount = users.filter(user => user.role === 'user').length;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-slate-800 to-slate-600 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              User Role Management
            </h1>
            <p className="text-slate-600">
              Manage team member roles and permissions
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-0 bg-gradient-to-br from-slate-50 to-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Users</p>
                  <p className="text-3xl font-bold text-slate-900">{users.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-slate-50 to-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Administrators</p>
                  <p className="text-3xl font-bold text-slate-900">{adminCount}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-slate-50 to-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Regular Users</p>
                  <p className="text-3xl font-bold text-slate-900">{userCount}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-slate-300 to-slate-400 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Users Table */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Team Members</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/6"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-slate-50">
                  <TableHead className="font-semibold text-slate-700">User Email</TableHead>
                  <TableHead className="font-semibold text-slate-700">Current Role</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => {
                  const RoleIcon = getRoleIcon(user.role);
                  return (
                    <TableRow 
                      key={user.id} 
                      className="hover:bg-slate-50/50 transition-colors animate-in fade-in slide-in-from-bottom duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-medium text-slate-900 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-slate-600 to-slate-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              {user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span>{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge 
                          variant={getRoleBadgeVariant(user.role)} 
                          className="flex items-center space-x-1 w-fit"
                        >
                          <RoleIcon className="w-3 h-3" />
                          <span className="capitalize">{user.role}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center justify-end space-x-3">
                          <Select
                            value={user.role}
                            onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                          >
                            <SelectTrigger className="w-28 h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">
                                <div className="flex items-center space-x-2">
                                  <UserCheck className="w-3 h-3" />
                                  <span>User</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="admin">
                                <div className="flex items-center space-x-2">
                                  <Shield className="w-3 h-3" />
                                  <span>Admin</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            onClick={() => handleSaveRole(user.id, user.role)}
                            disabled={!user.hasUnsavedChanges || savingUserId === user.id}
                            className={`transition-all ${
                              user.hasUnsavedChanges 
                                ? 'bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-900 hover:to-slate-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
                                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            {savingUserId === user.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : user.hasUnsavedChanges ? (
                              <>
                                <Save className="w-3 h-3 mr-1" />
                                Save
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Saved
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {users.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No users found
          </h3>
          <p className="text-slate-600">
            Users will appear here once they sign up for the platform.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminPage;