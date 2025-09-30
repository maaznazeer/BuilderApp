import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const GlobalSearch = () => {
    const { toast } = useToast();

    const handleSearchClick = () => {
        toast({
            title: "🚧 Feature Not Implemented",
            description: "The global search feature is coming soon! You can request it in your next prompt. 🚀",
        });
    };

    return (
        <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search projects, tasks, files..."
                className="pl-9 w-full"
                onClick={handleSearchClick}
                readOnly
            />
        </div>
    );
};

export default GlobalSearch;