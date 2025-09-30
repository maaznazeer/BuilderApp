import React, { useState, useMemo } from 'react';
    import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
    import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
    import { Input } from '@/components/ui/input';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Separator } from '@/components/ui/separator';
    import { ScrollArea } from '@/components/ui/scroll-area';
    import { faqItems as allFaqItems, filterFaq } from '@/lib/faq-helpers.js';

    const FaqDrawer = ({ open, onOpenChange }) => {
      const [searchQuery, setSearchQuery] = useState('');
      const [language, setLanguage] = useState('en');

      const items = useMemo(() => allFaqItems(language), [language]);
      const filteredItems = useMemo(() => filterFaq(items, searchQuery), [items, searchQuery]);

      return (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent id="faq-drawer" className="w-full sm:max-w-md flex flex-col p-0">
            <SheetHeader className="p-6 border-b">
              <SheetTitle className="text-2xl font-bold">Dashboard FAQ</SheetTitle>
            </SheetHeader>
            
            <div className="p-4 flex flex-col sm:flex-row gap-2 items-center">
                <Input
                  id="faq-search"
                  placeholder="Search FAQ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow"
                />
                <Select id="faq-lang" value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full sm:w-[80px]">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">EN</SelectItem>
                    <SelectItem value="fr">FR</SelectItem>
                  </SelectContent>
                </Select>
            </div>

            <Separator />
            
            <ScrollArea className="flex-grow">
              <div className="p-4">
                <Accordion id="faq-accordion" type="multiple" className="w-full space-y-2">
                  {filteredItems.map((item, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                {filteredItems.length === 0 && (
                    <div className="text-center text-muted-foreground py-10">
                        <p>No results found for your search.</p>
                        <p className="text-sm">Try using different keywords.</p>
                    </div>
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      );
    };

    export default FaqDrawer;