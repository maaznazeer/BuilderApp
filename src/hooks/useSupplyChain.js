import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';

const fetchSuppliers = async () => {
    const { data, error } = await supabase.from('v_suppliers_list').select('*').order('name', { ascending: true });
    if (error) throw new Error(error.message);
    return data;
};

export const useSuppliers = () => {
    return useQuery('suppliers', fetchSuppliers);
};

const fetchInventory = async () => {
    const { data, error } = await supabase.from('v_inventory_list').select('*').order('name', { ascending: true });
    if (error) throw new Error(error.message);
    return data;
};

export const useInventory = () => {
    return useQuery('inventory', fetchInventory);
};

const fetchPurchases = async () => {
    const { data, error } = await supabase.from('v_material_purchases_list').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

export const usePurchases = () => {
    return useQuery('purchases', fetchPurchases);
};

const fetchGrn = async () => {
    const { data, error } = await supabase.from('v_grn_list').select('*').order('received_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

export const useGrn = () => {
    return useQuery('grn', fetchGrn);
};

const fetchGin = async () => {
    const { data, error } = await supabase.from('v_gin_list').select('*').order('issued_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

export const useGin = () => {
    return useQuery('gin', fetchGin);
};

const fetchMovements = async () => {
    const { data, error } = await supabase.from('v_stock_movements_list').select('*').order('date', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

export const useMovements = () => {
    return useQuery('movements', fetchMovements);
};

const fetchProjectMaterials = async () => {
    const { data, error } = await supabase.from('v_project_materials_list').select('*');
    if (error) throw new Error(error.message);
    return data;
};

export const useProjectMaterials = () => {
    return useQuery('projectMaterialsList', fetchProjectMaterials);
};