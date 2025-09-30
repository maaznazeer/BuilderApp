import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

export const AddPriceQuoteDialog = ({ isOpen, onOpenChange, selectedMaterial }) => {
    const { toast } = useToast();
    const [newPrice, setNewPrice] = useState({
        supplier_id: '',
        unit_price: '',
        currency: 'USD',
        quote_date: ''
    });

    const handleAddPriceSubmit = (e) => {
        e.preventDefault();
        if (!newPrice.supplier_id || !newPrice.unit_price || !newPrice.quote_date) {
            toast({ title: "Missing Information", description: "Please fill out all required fields.", variant: "destructive" });
            return;
        }
        toast({
            title: "Price Quote Added!",
            description: `New quote for "${selectedMaterial?.name}" has been saved. (Demo)`,
        });
        console.log("New Price Quote:", { ...newPrice, material_id: selectedMaterial?.material_id });
        onOpenChange(false);
        setNewPrice({ supplier_id: '', unit_price: '', currency: 'USD', quote_date: '' });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Price Comparison for: {selectedMaterial?.name}</DialogTitle>
                    <DialogDescription>
                        View and add supplier price quotes for this material.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                    <div>
                        <h4 className="text-md font-semibold mb-2">Existing Quotes</h4>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quote Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {selectedMaterial?.material_prices?.map(price => {
                                        const supplier = selectedMaterial.suppliers.find(s => s.supplier_id === price.supplier_id);
                                        return (
                                            <tr key={price.price_id}>
                                                <td className="px-4 py-2 text-sm">{supplier?.name}</td>
                                                <td className="px-4 py-2 text-sm">${price.unit_price.toFixed(2)} {price.currency}</td>
                                                <td className="px-4 py-2 text-sm">{price.quote_date}</td>
                                            </tr>
                                        );
                                    })}
                                    {(!selectedMaterial?.material_prices || selectedMaterial?.material_prices.length === 0) && (
                                        <tr><td colSpan="3" className="text-center py-4 text-sm text-gray-500">No quotes yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-md font-semibold mb-2">Add New Quote</h4>
                        <form onSubmit={handleAddPriceSubmit} className="p-4 border rounded-lg bg-gray-50 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="supplier">Supplier</Label>
                                    <Select onValueChange={(value) => setNewPrice(p => ({ ...p, supplier_id: value }))} value={newPrice.supplier_id}>
                                        <SelectTrigger id="supplier"><SelectValue placeholder="Select a supplier" /></SelectTrigger>
                                        <SelectContent>
                                            {selectedMaterial?.suppliers?.map(s => <SelectItem key={s.supplier_id} value={s.supplier_id.toString()}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="quote-date">Quote Date</Label>
                                    <Input id="quote-date" type="date" value={newPrice.quote_date} onChange={e => setNewPrice(p => ({ ...p, quote_date: e.target.value }))} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="unit-price">Unit Price</Label>
                                    <Input id="unit-price" type="number" placeholder="e.g., 15.50" value={newPrice.unit_price} onChange={e => setNewPrice(p => ({ ...p, unit_price: e.target.value }))} />
                                </div>
                                <div>
                                    <Label htmlFor="currency">Currency</Label>
                                    <Input id="currency" placeholder="e.g., USD, FCFA" value={newPrice.currency} onChange={e => setNewPrice(p => ({ ...p, currency: e.target.value }))} />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" size="sm">Add Quote</Button>
                            </div>
                        </form>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};