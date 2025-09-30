import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/customSupabaseClient';
import { Boxes } from 'lucide-react';

const BrandSpecPicker = ({ onSpecSelect }) => {
    const [catalog, setCatalog] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCatalog = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('materials_catalog')
                .select('*');

            if (error) {
                console.error('Error fetching material catalog:', error);
            } else {
                setCatalog(data);
            }
            setLoading(false);
        };
        fetchCatalog();
    }, []);

    const handleSelect = (specId) => {
        const selected = catalog.find(item => item.id === specId);
        onSpecSelect(selected);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Boxes className="h-5 w-5"/>2. Select Material Specification</CardTitle>
                <CardDescription>Choose the brand and model to compare against the uploaded media.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-10 w-full" />
                ) : (
                    <Select onValueChange={handleSelect}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a material from your catalog..." />
                        </SelectTrigger>
                        <SelectContent>
                            {catalog.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                    {item.brand} - {item.model}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </CardContent>
        </Card>
    );
};

export default BrandSpecPicker;