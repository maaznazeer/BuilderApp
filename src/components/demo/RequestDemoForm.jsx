import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Send } from 'lucide-react';

const RequestDemoForm = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    email: '',
    phone: '',
    team_size: '',
    role: '',
    message: '',
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeToTerms) {
      toast({
        title: "Terms and Conditions",
        description: "You must agree to the privacy policy to proceed.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from('demo_requests').insert([formData]);

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Error Submitting Request",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Demo Request Submitted!",
        description: "Thank you! Our team will be in touch shortly to schedule your demo.",
      });
      setFormData({
        full_name: '',
        company_name: '',
        email: '',
        phone: '',
        team_size: '',
        role: '',
        message: '',
      });
      setAgreeToTerms(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule Your Demo</h2>
      <p className="text-gray-600 mb-8">Fill out the form and we'll contact you to set up a time that works for you.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="full_name">Full Name *</Label>
            <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleInputChange} required placeholder="e.g., Jane Doe" />
          </div>
          <div>
            <Label htmlFor="company_name">Company Name *</Label>
            <Input id="company_name" name="company_name" value={formData.company_name} onChange={handleInputChange} required placeholder="e.g., BuildRight Inc." />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="email">Work Email *</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="you@company.com" />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="+1 (555) 123-4567" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="team_size">Team Size</Label>
            <Select name="team_size" onValueChange={(value) => handleSelectChange('team_size', value)} value={formData.team_size}>
              <SelectTrigger id="team_size">
                <SelectValue placeholder="Select team size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10 employees</SelectItem>
                <SelectItem value="11-50">11-50 employees</SelectItem>
                <SelectItem value="51-200">51-200 employees</SelectItem>
                <SelectItem value="201-1000">201-1000 employees</SelectItem>
                <SelectItem value="1000+">1000+ employees</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="role">Your Role</Label>
            <Select name="role" onValueChange={(value) => handleSelectChange('role', value)} value={formData.role}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Project Manager">Project Manager</SelectItem>
                <SelectItem value="Owner/Executive">Owner / Executive</SelectItem>
                <SelectItem value="Estimator">Estimator</SelectItem>
                <SelectItem value="Superintendent">Superintendent</SelectItem>
                <SelectItem value="Architect/Designer">Architect / Designer</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="message">What are you hoping to achieve with DomusBuilder?</Label>
          <Textarea id="message" name="message" value={formData.message} onChange={handleInputChange} placeholder="e.g., Better project tracking, improved team collaboration..." rows={4} />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" checked={agreeToTerms} onCheckedChange={setAgreeToTerms} />
          <Label htmlFor="terms" className="text-sm text-gray-600 font-normal">
            I agree to the <a href="#" className="underline text-blue-600 hover:text-blue-800">Privacy Policy</a>.
          </Label>
        </div>
        <Button type="submit" className="w-full btn-primary text-white py-3 text-lg font-semibold rounded-lg" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Request My Demo'}
          {!isSubmitting && <Send className="ml-2 w-5 h-5" />}
        </Button>
      </form>
    </div>
  );
};

export default RequestDemoForm;