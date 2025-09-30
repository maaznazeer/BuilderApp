import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSuppliers } from '@/hooks/useSupplyChain';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { Star, ChevronRight } from 'lucide-react';

const RatingStars = ({ rating }) => {
    const totalStars = 5;
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = totalStars - fullStars - (halfStar ? 1 : 0);
    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
            {halfStar && <Star key="half" className="w-4 h-4 text-yellow-400 fill-yellow-200" />}
            {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />)}
            <span className="ml-2 text-xs font-medium text-muted-foreground">({rating?.toFixed(1)})</span>
        </div>
    );
};

const SuppliersTable = () => {
    const navigate = useNavigate();
    const { data: suppliers, isLoading, error } = useSuppliers();

    const handleRowClick = (id) => {
        navigate(`/dashboard/suppliers/${id}`);
    };
    
    if (error) {
        return <div className="p-4 text-red-500">Error: {error.message}</div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Last Order</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-6 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : suppliers?.length > 0 ? (
                            suppliers.map((supplier) => (
                                <TableRow key={supplier.id} onClick={() => handleRowClick(supplier.id)} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell className="font-medium">{supplier.name}</TableCell>
                                    <TableCell>{supplier.contact}</TableCell>
                                    <TableCell>
                                        <RatingStars rating={supplier.rating} />
                                    </TableCell>
                                    <TableCell>
                                        {supplier.last_order_at 
                                            ? <span title={format(new Date(supplier.last_order_at), 'PPP')}>{formatDistanceToNow(new Date(supplier.last_order_at), { addSuffix: true })}</span>
                                            : <Badge variant="secondary">No orders</Badge>
                                        }
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ChevronRight className="w-4 h-4 text-muted-foreground"/>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan="5" className="text-center h-24">
                                    No suppliers found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </motion.div>
    );
};

export default SuppliersTable;