import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const RequirementsForm = ({ onGenerate, project }) => {
    const [formData, setFormData] = useState({
        plot_size: '500',
        bedrooms: '3',
        baths: '2',
        floors: '1',
        budget: '150000',
        climate_zone: 'temperate'
    });
    const { toast } = useToast();

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!project) {
            toast({
                title: "No Project Selected",
                description: "Please select a project before generating designs.",
                variant: "destructive",
            });
            return;
        }
        if (!formData.plot_size || !formData.budget) {
            toast({
                title: "Missing Information",
                description: "Please fill out Plot Size and Budget.",
                variant: "destructive",
            });
            return;
        }
        onGenerate(formData);
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5" />
                    Design Requirements
                </CardTitle>
                <CardDescription>
                    Tell the AI what you need for your new design.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="plot_size">Plot Size (sq. m)</Label>
                            <Input id="plot_size" type="number" placeholder="e.g., 500" value={formData.plot_size} onChange={handleChange} required />
                        </div>
                        <div>
                            <Label htmlFor="budget">Budget (USD)</Label>
                            <Input id="budget" type="number" placeholder="e.g., 150000" value={formData.budget} onChange={handleChange} required />
                        </div>
                    </div>
                     <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="bedrooms">Bedrooms</Label>
                            <Select value={formData.bedrooms} onValueChange={(value) => handleSelectChange('bedrooms', value)}>
                                <SelectTrigger id="bedrooms"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5, 6].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="baths">Baths</Label>
                            <Select value={formData.baths} onValueChange={(value) => handleSelectChange('baths', value)}>
                                <SelectTrigger id="baths"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {[1, 1.5, 2, 2.5, 3, 4].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div>
                            <Label htmlFor="floors">Floors</Label>
                            <Select value={formData.floors} onValueChange={(value) => handleSelectChange('floors', value)}>
                                <SelectTrigger id="floors"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="climate_zone">Climate Zone</Label>
                        <Select value={formData.climate_zone} onValueChange={(value) => handleSelectChange('climate_zone', value)}>
                            <SelectTrigger id="climate_zone"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tropical">Tropical</SelectItem>
                                <SelectItem value="arid">Arid</SelectItem>
                                <SelectItem value="temperate">Temperate</SelectItem>
                                <SelectItem value="continental">Continental</SelectItem>
                                <SelectItem value="polar">Polar</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Layouts
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default RequirementsForm;