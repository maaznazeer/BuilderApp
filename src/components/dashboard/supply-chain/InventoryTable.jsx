import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInventory } from '@/hooks/useSupplyChain';
import { useDebounce } from '@/hooks/useDebounce';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Search } from 'lucide-react';

const InventoryTable = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const { data: items, isLoading, error } = useInventory(debouncedSearchTerm);

    const filteredItems = React.useMemo(() => {
        if (!items) return [];
        if (!debouncedSearchTerm) return items;
        return items.filter(item => 
            item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
    }, [items, debouncedSearchTerm]);

    if (error) {
        return <div className="p-4 text-red-500">Error: {error.message}</div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full md:w-1/3"
                    />
                </div>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>On Hand</TableHead>
                        <TableHead>Reserved</TableHead>
                        <TableHead>UoM</TableHead>
                        <TableHead>Last Movement</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            </TableRow>
                        ))
                    ) : filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                            <TableRow key={item.id} className="hover:bg-muted/50">
                                <TableCell><Badge variant="secondary">{item.sku}</Badge></TableCell>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.on_hand}</TableCell>
                                <TableCell>{item.reserved}</TableCell>
                                <TableCell>{item.uom}</TableCell>
                                <TableCell>
                                    {item.last_movement_at
                                        ? formatDistanceToNow(new Date(item.last_movement_at), { addSuffix: true })
                                        : 'No movements'}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan="6" className="text-center h-24">
                                No inventory items found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </motion.div>
    );
};

export default InventoryTable;