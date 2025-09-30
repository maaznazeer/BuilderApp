import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, isFuture } from 'date-fns';
import { CalendarPlus as CalendarIcon, User, Shield, Key, Sparkles, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const AdminDashboardPage = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Mock data for users and features
  useEffect(() => {
    const storedUsers = localStorage.getItem('adminUsers');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      const initialUsers = [
        {
          id: 'user1',
          name: 'Alice Smith',
          email: 'alice@example.com',
          role: 'homebuilder',
          active_status: true,
          subscription: 'Basic',
          promo_expiry: null,
          feature_flags: {
            budget_tracker: { enabled: true, start_date: '2024-01-01', expiry_date: null },
            site_monitoring: { enabled: false, start_date: null, expiry_date: null },
            milestone_planner: { enabled: true, start_date: '2024-01-01', expiry_date: null },
          },
          activation_history: [
            { feature: 'budget_tracker', activated_on: '2024-01-01', action: 'enabled', by: 'Admin' }
          ]
        },
        {
          id: 'user2',
          name: 'Bob Johnson',
          email: 'bob@example.com',
          role: 'homeowner',
          active_status: true,
          subscription: 'Premium',
          promo_expiry: '2025-12-31',
          feature_flags: {
            budget_tracker: { enabled: true, start_date: '2024-01-01', expiry_date: null },
            site_monitoring: { enabled: true, start_date: '2024-03-01', expiry_date: null },
            milestone_planner: { enabled: true, start_date: '2024-01-01', expiry_date: null },
          },
          activation_history: [
            { feature: 'budget_tracker', activated_on: '2024-01-01', action: 'enabled', by: 'Admin' },
            { feature: 'site_monitoring', activated_on: '2024-03-01', action: 'enabled', by: 'Admin' }
          ]
        },
        {
          id: 'user3',
          name: 'Charlie Brown',
          email: 'charlie@example.com',
          role: 'admin',
          active_status: true,
          subscription: 'Lifetime',
          promo_expiry: null,
          feature_flags: {
            budget_tracker: { enabled: true, start_date: '2024-01-01', expiry_date: null },
            site_monitoring: { enabled: true, start_date: '2024-01-01', expiry_date: null },
            milestone_planner: { enabled: true, start_date: '2024-01-01', expiry_date: null },
          },
          activation_history: []
        }
      ];
      setUsers(initialUsers);
      localStorage.setItem('adminUsers', JSON.stringify(initialUsers));
    }
  }, []);

  const updateLocalStorage = (updatedUsers) => {
    setUsers(updatedUsers);
    localStorage.setItem('adminUsers', JSON.stringify(updatedUsers));
  };

  const handleToggleActiveStatus = (userId) => {
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, active_status: !user.active_status } : user
    );
    updateLocalStorage(updatedUsers);
    toast({ title: "User status updated!", description: "Account activation status changed." });
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user, promo_expiry: user.promo_expiry ? new Date(user.promo_expiry) : null });
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = () => {
    const updatedUsers = users.map(user =>
      user.id === editingUser.id ? { ...editingUser, promo_expiry: editingUser.promo_expiry ? format(editingUser.promo_expiry, 'yyyy-MM-dd') : null } : user
    );
    updateLocalStorage(updatedUsers);
    toast({ title: "User updated!", description: `${editingUser.name}'s profile has been saved.` });
    setIsEditDialogOpen(false);
    setEditingUser(null);
  };

  const handleFeatureToggle = (userId, featureName) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        const isEnabled = !user.feature_flags[featureName]?.enabled;
        const newFeatureFlags = {
          ...user.feature_flags,
          [featureName]: {
            ...user.feature_flags[featureName],
            enabled: isEnabled,
            start_date: isEnabled ? format(new Date(), 'yyyy-MM-dd') : user.feature_flags[featureName]?.start_date,
            expiry_date: isEnabled ? user.feature_flags[featureName]?.expiry_date : null, // Clear expiry if disabled
          },
        };
        const newActivationHistory = [
          ...(user.activation_history || []),
          {
            feature: featureName,
            activated_on: format(new Date(), 'yyyy-MM-dd'),
            action: isEnabled ? 'enabled' : 'disabled',
            by: 'Admin', // In a real app, this would be the logged-in admin's name
          },
        ];
        return { ...user, feature_flags: newFeatureFlags, activation_history: newActivationHistory };
      }
      return user;
    });
    updateLocalStorage(updatedUsers);
    toast({ title: "Feature toggle updated!", description: "User's feature access has been modified." });
  };

  const handleSetPromoExpiry = (userId, date) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, promo_expiry: date ? format(date, 'yyyy-MM-dd') : null };
      }
      return user;
    });
    updateLocalStorage(updatedUsers);
    toast({ title: "Promotional access updated!", description: "User's promo expiry date set." });
  };

  const allFeatures = ['budget_tracker', 'site_monitoring', 'milestone_planner']; // Define all possible features

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - DomusBuilder Hub</title>
        <meta name="description" content="Manage users and features in the DomusBuilder application." />
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto py-8 px-4"
      >
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center"><Shield className="mr-3 h-8 w-8 text-blue-600"/>Admin Dashboard</h1>
          <p className="text-gray-600">Centralized control for user management and feature access.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Management Panel */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><User className="mr-2 h-5 w-5 text-purple-600"/>User Management</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Switch
                        checked={user.active_status}
                        onCheckedChange={() => handleToggleActiveStatus(user.id)}
                        aria-label={`Toggle active status for ${user.name}`}
                      />
                    </TableCell>
                    <TableCell>{user.subscription}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Feature Toggle Panel */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><Key className="mr-2 h-5 w-5 text-indigo-600"/>Feature Toggles</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  {allFeatures.map(feature => (
                    <TableHead key={feature} className="capitalize">{feature.replace(/_/g, ' ')}</TableHead>
                  ))}
                  <TableHead>Promo Expiry</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    {allFeatures.map(feature => (
                      <TableCell key={feature}>
                        <Switch
                          checked={user.feature_flags[feature]?.enabled || false}
                          onCheckedChange={() => handleFeatureToggle(user.id, feature)}
                          disabled={user.role === 'admin'} // Admins always have all features
                          aria-label={`Toggle ${feature} for ${user.name}`}
                        />
                      </TableCell>
                    ))}
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[140px] justify-start text-left font-normal",
                              !user.promo_expiry && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {user.promo_expiry ? format(new Date(user.promo_expiry), "PPP") : "Set date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={user.promo_expiry ? new Date(user.promo_expiry) : null}
                            onSelect={(date) => handleSetPromoExpiry(user.id, date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {user.promo_expiry && isFuture(new Date(user.promo_expiry)) && (
                        <Button variant="ghost" size="icon" onClick={() => handleSetPromoExpiry(user.id, null)} className="ml-1 h-6 w-6"><XCircle className="h-4 w-4 text-red-500"/></Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Edit User Dialog */}
        {editingUser && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit User: {editingUser.name}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input id="name" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input id="email" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Select value={editingUser.role} onValueChange={(value) => setEditingUser({ ...editingUser, role: value })} className="col-span-3">
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homebuilder">Home Builder</SelectItem>
                      <SelectItem value="homeowner">Home Owner</SelectItem>
                      <SelectItem value="subcontractor">Subcontractor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subscription" className="text-right">
                    Subscription
                  </Label>
                  <Select value={editingUser.subscription} onValueChange={(value) => setEditingUser({ ...editingUser, subscription: value })} className="col-span-3">
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select subscription" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Lifetime">Lifetime</SelectItem>
                      <SelectItem value="Trial">Trial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="active_status" className="text-right">
                    Active
                  </Label>
                  <Switch
                    id="active_status"
                    checked={editingUser.active_status}
                    onCheckedChange={(checked) => setEditingUser({ ...editingUser, active_status: checked })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSaveUser}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>
    </>
  );
};

export default AdminDashboardPage;