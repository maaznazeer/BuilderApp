import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from "@/components/ui/use-toast";

const resourceTypes = ['Person', 'Equipment', 'Facility', 'Material', 'Budget'];

const AddResourceDialog = ({ isOpen, onClose, onSave, resource, calendars }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [rate, setRate] = useState('');
    const [cost, setCost] = useState('');
    const [calendarId, setCalendarId] = useState(null);
    const [isActive, setIsActive] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (resource) {
            setName(resource.resource_name || '');
            setType(resource.type || '');
            setRate(resource.hourly_rate || '');
            setCost(resource.unit_cost || '');
            setCalendarId(resource.calendar_id || null);
            setIsActive(resource.active !== undefined ? resource.active : true);
        } else {
            // Reset form for new resource
            setName('');
            setType('');
            setRate('');
            setCost('');
            setCalendarId(null);
            setIsActive(true);
        }
    }, [resource, isOpen]);

    const handleSave = () => {
        if (!name || !type) {
            toast({ variant: 'destructive', title: 'Validation Error', description: 'Resource Name and Type are required.' });
            return;
        }

        const resourceData = {
            resource_name: name,
            type: type,
            hourly_rate: type === 'Person' ? parseFloat(rate) || null : null,
            unit_cost: type !== 'Person' ? parseFloat(cost) || null : null,
            calendar_id: calendarId,
            active: isActive,
        };

        onSave(resourceData, resource?.resource_id);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{resource ? 'Edit Resource' : 'Add New Resource'}</DialogTitle>
                    <DialogDescription>Fill in the details for the resource below.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="resourceName">Resource Name</Label>
                        <Input id="resourceName" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger>
                            <SelectContent>
                                {resourceTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    {type === 'Person' && (
                        <div className="space-y-2">
                            <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                            <Input id="hourlyRate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
                        </div>
                    )}
                    {type && type !== 'Person' && (
                         <div className="space-y-2">
                            <Label htmlFor="unitCost">Unit Cost ($)</Label>
                            <Input id="unitCost" type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label>Calendar</Label>
                         <Select value={calendarId || 'default'} onValueChange={(val) => setCalendarId(val === 'default' ? null : val)}>
                            <SelectTrigger><SelectValue placeholder="Default Calendar" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default">Default Calendar</SelectItem>
                                {calendars.map(c => <SelectItem key={c.calendar_id} value={c.calendar_id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="isActive">Active</Label>
                        <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save Resource</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddResourceDialog;