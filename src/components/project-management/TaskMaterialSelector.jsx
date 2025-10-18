import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Plus, Package, AlertTriangle } from 'lucide-react';

const TaskMaterialSelector = ({ taskId, onMaterialsChange, initialMaterials = [] }) => {
    const [materials, setMaterials] = useState([]);
    const [selectedMaterials, setSelectedMaterials] = useState(initialMaterials);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    const fetchMaterials = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('materials')
                .select('*')
                .order('name');

            if (error) throw error;
            setMaterials(data || []);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error fetching materials',
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    const filteredMaterials = materials.filter(material =>
        material.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addMaterial = (material) => {
        const existingIndex = selectedMaterials.findIndex(sm => sm.material_id === material.id);
        
        if (existingIndex >= 0) {
            toast({
                title: 'Material already added',
                description: 'This material is already selected for this task.'
            });
            return;
        }

        const newMaterial = {
            material_id: material.id,
            material_name: material.name,
            category: material.category,
            unit_cost: material.unit_cost,
            current_stock: material.quantity,
            unit: material.unit,
            quantity_planned: 1,
            quantity_used: 0,
            notes: ''
        };

        const updatedMaterials = [...selectedMaterials, newMaterial];
        setSelectedMaterials(updatedMaterials);
        onMaterialsChange(updatedMaterials);
    };

    const removeMaterial = (materialId) => {
        const updatedMaterials = selectedMaterials.filter(sm => sm.material_id !== materialId);
        setSelectedMaterials(updatedMaterials);
        onMaterialsChange(updatedMaterials);
    };

    const updateMaterial = (materialId, field, value) => {
        const updatedMaterials = selectedMaterials.map(sm => 
            sm.material_id === materialId 
                ? { ...sm, [field]: value }
                : sm
        );
        setSelectedMaterials(updatedMaterials);
        onMaterialsChange(updatedMaterials);
    };

    const getStockStatus = (material) => {
        const stock = material.quantity || 0;
        const planned = material.quantity_planned || 0;
        
        if (stock < planned) {
            return { status: 'insufficient', color: 'destructive' };
        } else if (stock < planned * 1.2) {
            return { status: 'low', color: 'warning' };
        } else {
            return { status: 'sufficient', color: 'success' };
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <Label className="text-sm font-medium">Required Materials</Label>
                <p className="text-xs text-muted-foreground">
                    Select materials needed for this task and specify quantities.
                </p>
            </div>

            {/* Search and Add Materials */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Add Materials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Search materials..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1"
                        />
                    </div>
                    
                    <ScrollArea className="h-48">
                        <div className="space-y-2">
                            {filteredMaterials.map(material => (
                                <div
                                    key={material.id}
                                    className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{material.name}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {material.category}
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Stock: {material.quantity} {material.unit} | 
                                            Price: ${material.unit_cost || 0}
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => addMaterial(material)}
                                        disabled={selectedMaterials.some(sm => sm.material_id === material.id)}
                                    >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Selected Materials */}
            {selectedMaterials.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Selected Materials ({selectedMaterials.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {selectedMaterials.map((material, index) => {
                            const stockStatus = getStockStatus(material);
                            return (
                                <div key={material.material_id} className="p-3 border rounded-md">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{material.name}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {material.category}
                                                </Badge>
                                                {stockStatus.status === 'insufficient' && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                        Low Stock
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Stock: {material.quantity} {material.unit} | 
                                                Price: ${material.unit_cost || 0}
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => removeMaterial(material.material_id)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label htmlFor={`quantity-${index}`} className="text-xs">
                                                Quantity Planned
                                            </Label>
                                            <Input
                                                id={`quantity-${index}`}
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={material.quantity_planned}
                                                onChange={(e) => updateMaterial(
                                                    material.material_id, 
                                                    'quantity_planned', 
                                                    parseFloat(e.target.value) || 0
                                                )}
                                                className="text-xs"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor={`unit-${index}`} className="text-xs">
                                                Unit
                                            </Label>
                                            <Select
                                                value={material.unit}
                                                onValueChange={(value) => updateMaterial(
                                                    material.material_id, 
                                                    'unit', 
                                                    value
                                                )}
                                            >
                                                <SelectTrigger className="text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="each">Each</SelectItem>
                                                    <SelectItem value="kg">Kilogram</SelectItem>
                                                    <SelectItem value="m">Meter</SelectItem>
                                                    <SelectItem value="m2">Square Meter</SelectItem>
                                                    <SelectItem value="m3">Cubic Meter</SelectItem>
                                                    <SelectItem value="liter">Liter</SelectItem>
                                                    <SelectItem value="box">Box</SelectItem>
                                                    <SelectItem value="roll">Roll</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-2">
                                        <Label htmlFor={`notes-${index}`} className="text-xs">
                                            Notes (Optional)
                                        </Label>
                                        <Input
                                            id={`notes-${index}`}
                                            placeholder="Additional notes..."
                                            value={material.notes}
                                            onChange={(e) => updateMaterial(
                                                material.material_id, 
                                                'notes', 
                                                e.target.value
                                            )}
                                            className="text-xs"
                                        />
                                    </div>
                                    
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        Estimated Cost: ${((material.quantity_planned || 0) * (material.unit_cost || 0)).toFixed(2)}
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default TaskMaterialSelector;
