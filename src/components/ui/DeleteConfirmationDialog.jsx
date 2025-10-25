import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export const DeleteConfirmationDialog = ({ 
  open, 
  onOpenChange, 
  onConfirm, 
  title = "Confirm Delete",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName,
  itemType = "item",
  isLoading = false,
  loadingText = "Deleting...",
  confirmText = "Delete",
  cancelText = "Cancel"
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                {title}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          {itemName && (
            <div className="bg-muted/50 rounded-lg p-3 border">
              <p className="text-sm font-medium text-foreground">
                {itemType.charAt(0).toUpperCase() + itemType.slice(1)}: 
                <span className="ml-2 font-semibold text-destructive">{itemName}</span>
              </p>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-medium">
              ⚠️ This action cannot be undone. All associated data will be permanently removed.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {loadingText}
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
