import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Building, PlusCircle, MapPin, Phone, Mail, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';

const VendorCard = ({ vendor }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col"
    >
      <div className="flex-grow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900">{vendor.name}</h3>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-bold">{vendor.rating.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-sm text-blue-600 font-medium mb-4">{vendor.specialty}</p>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{vendor.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <a href={`mailto:${vendor.contact}`} className="hover:underline">{vendor.contact}</a>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>{vendor.phone || 'N/A'}</span>
          </div>
        </div>
      </div>
      <div className="mt-6 pt-4 border-t">
        <p className="text-xs text-gray-500">Associated with: {vendor.projects.join(', ')}</p>
      </div>
    </motion.div>
  );
};

const VendorsTab = ({ projects, updateProjects }) => {
  const { toast } = useToast();
  const { t } = useTranslation('custom');
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [newVendorData, setNewVendorData] = useState({
    name: '',
    specialty: '',
    location: '',
    contact: '',
    phone: '',
  });

  const allVendors = useMemo(() => {
    const vendorMap = new Map();
    projects.forEach(project => {
      (project.suppliers || []).forEach(supplier => {
        if (!vendorMap.has(supplier.supplier_id)) {
          vendorMap.set(supplier.supplier_id, {
            ...supplier,
            rating: 4.5, // Mock rating
            projects: [project.name],
          });
        } else {
          vendorMap.get(supplier.supplier_id).projects.push(project.name);
        }
      });
    });
    return Array.from(vendorMap.values());
  }, [projects]);

  const handleAddVendor = (e) => {
    e.preventDefault();
    if (!newVendorData.name || !newVendorData.specialty || !newVendorData.location || !newVendorData.contact) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    const newVendor = {
      supplier_id: Date.now(),
      ...newVendorData,
    };

    // For demo, we add the new vendor to the first project.
    // In a real app, you'd have a global vendor list or better assignment logic.
    const updatedProjects = [...projects];
    if (updatedProjects.length > 0) {
      updatedProjects[0].suppliers = [...(updatedProjects[0].suppliers || []), newVendor];
      updateProjects(updatedProjects);
      toast({ title: "Vendor Added!", description: `${newVendor.name} has been added to the directory.` });
      setIsAddVendorOpen(false);
      setNewVendorData({ name: '', specialty: '', location: '', contact: '', phone: '' });
    } else {
      toast({ title: "No Projects", description: "Cannot add a vendor without an active project.", variant: "destructive" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t('vendors.title')}</h2>
          <p className="text-gray-500">{t('vendors.description')}</p>
        </div>
        <Dialog open={isAddVendorOpen} onOpenChange={setIsAddVendorOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              {t('vendors.add_new')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('vendors.add_dialog.title')}</DialogTitle>
              <DialogDescription>{t('vendors.add_dialog.description')}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddVendor} className="space-y-4 pt-4">
              <Input placeholder={t('vendors.add_dialog.name_placeholder')} value={newVendorData.name} onChange={e => setNewVendorData(d => ({ ...d, name: e.target.value }))} />
              <Input placeholder={t('vendors.add_dialog.specialty_placeholder')} value={newVendorData.specialty} onChange={e => setNewVendorData(d => ({ ...d, specialty: e.target.value }))} />
              <Input placeholder={t('vendors.add_dialog.location_placeholder')} value={newVendorData.location} onChange={e => setNewVendorData(d => ({ ...d, location: e.target.value }))} />
              <Input type="email" placeholder={t('vendors.add_dialog.contact_email_placeholder')} value={newVendorData.contact} onChange={e => setNewVendorData(d => ({ ...d, contact: e.target.value }))} />
              <Input type="tel" placeholder={t('vendors.add_dialog.contact_phone_placeholder')} value={newVendorData.phone} onChange={e => setNewVendorData(d => ({ ...d, phone: e.target.value }))} />
              <DialogFooter>
                <Button type="submit">{t('vendors.add_dialog.add_button')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allVendors.map(vendor => (
          <VendorCard key={vendor.supplier_id} vendor={vendor} />
        ))}
      </div>

      {allVendors.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('vendors.no_vendors_found.title')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('vendors.no_vendors_found.description')}</p>
        </div>
      )}
    </motion.div>
  );
};

export default VendorsTab;