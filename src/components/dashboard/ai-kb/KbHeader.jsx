import React from 'react';
import { Button } from '@/components/ui/button';
import { BookPlus } from 'lucide-react';

const KbHeader = ({ onEmbedClick }) => {
    return (
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
                <p className="text-muted-foreground">Manage the documents and data your AI assistant learns from.</p>
            </div>
            <Button onClick={onEmbedClick}>
                <BookPlus className="mr-2 h-4 w-4" />
                Embed Knowledge
            </Button>
        </div>
    );
};

export default KbHeader;