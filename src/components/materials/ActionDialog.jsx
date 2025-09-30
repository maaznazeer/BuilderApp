import React from 'react';
import AddEditMaterialDialog from '@/components/materials/dialogs/AddEditMaterialDialog.jsx';
import AddToPODialog from '@/components/materials/dialogs/AddToPODialog.jsx';
import UseMaterialDialog from '@/components/materials/dialogs/UseMaterialDialog.jsx';

const ActionDialog = ({ dialogState, onClose, onSuccess }) => {
  const { type, data } = dialogState;
  if (!type) return null;

  if (type === 'add' || type === 'edit') {
    return <AddEditMaterialDialog open={true} setOpen={onClose} material={data} onUpdate={onSuccess} />;
  }
  if (type === 'po') {
    return <AddToPODialog open={true} setOpen={onClose} material={data} onUpdate={onSuccess} />;
  }
  if (type === 'use') {
    return <UseMaterialDialog open={true} setOpen={onClose} material={data} onUpdate={onSuccess} />;
  }
  return null;
};

export default ActionDialog;