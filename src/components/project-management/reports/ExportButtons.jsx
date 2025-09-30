import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { usePlan } from '@/hooks/usePlan';
import { useNavigate } from 'react-router-dom';

const ExportButtons = ({ reportId, reportName }) => {
    const { toast } = useToast();
    const { hasFeature } = usePlan();
    const navigate = useNavigate();
    const canExport = hasFeature('exports');

    const handleExport = (format) => {
        if (!canExport) {
            navigate('/pricing');
            return;
        }

        const input = document.getElementById(reportId);
        if (!input) {
            toast({ title: 'Error', description: 'Could not find report element to export.', variant: 'destructive' });
            return;
        }

        toast({ title: 'Exporting...', description: `Generating ${format.toUpperCase()} for ${reportName}.` });

        if (format === 'pdf') {
            html2canvas(input, { scale: 2, useCORS: true }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;
                const width = pdfWidth - 20; // with margin
                const height = width / ratio;
                
                pdf.addImage(imgData, 'PNG', 10, 10, width, height);
                pdf.save(`${reportName}.pdf`);
            });
        } else if (format === 'csv') {
            toast({
                title: '🚧 Feature Not Implemented',
                description: `CSV export is not yet available. You can request it in the next prompt!`,
            });
        }
    };

    return (
        <TooltipProvider>
            <div className="flex gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                            {!canExport && <Zap className="mr-2 h-4 w-4 text-yellow-500" />}
                            <FileDown className="mr-2 h-4 w-4" /> Export PDF
                        </Button>
                    </TooltipTrigger>
                    {!canExport && <TooltipContent><p>Upgrade to enable PDF export.</p></TooltipContent>}
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                            {!canExport && <Zap className="mr-2 h-4 w-4 text-yellow-500" />}
                            <FileDown className="mr-2 h-4 w-4" /> Export CSV
                        </Button>
                    </TooltipTrigger>
                    {!canExport && <TooltipContent><p>Upgrade to enable CSV export.</p></TooltipContent>}
                </Tooltip>
            </div>
        </TooltipProvider>
    );
};

export default ExportButtons;