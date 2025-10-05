'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ZPCard } from '@/components/ZPCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ZPTextArea } from '@/components/ui/ZPTextArea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Droplets, Plus, Waves } from 'lucide-react';

export default function WaterLogEntry() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    waterType: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    photo: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, waterType: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    // Reset form or show success message
    router.push('/trackers/water');
  };

  const waterTypes = [
    { value: 'shower', label: 'Shower/Bath' },
    { value: 'drinking', label: 'Drinking Water' },
    { value: 'cooking', label: 'Cooking/Cleaning' },
    { value: 'gardening', label: 'Gardening/Watering' },
    { value: 'other', label: 'Other Usage' },
  ];

  return (
    <div className="min-h-screen tracker-bg-water py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="tracker-header">
          <div className="flex items-center justify-center mb-4">
            <div className="tracker-header-icon-container bg-gradient-to-r from-cyan-500 to-blue-600">
              <Droplets className="text-white" size={24} />
            </div>
            <div>
              <h1 className="tracker-header-title">Log Water Entry</h1>
              <p className="tracker-header-subtitle">Record your water usage and conservation</p>
            </div>
          </div>
        </div>

        <ZPCard className="tracker-card">
          <form onSubmit={handleSubmit} className="tracker-form">
            <div>
              <Label className="tracker-form-label">
                Water Usage Type *
              </Label>
              <Select onValueChange={handleSelectChange} value={formData.waterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select water usage type" />
                </SelectTrigger>
                <SelectContent>
                  {waterTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="tracker-form-label">
                Description
              </Label>
              <ZPTextArea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your water usage activity..."
                rows={3}
              />
            </div>
            
            <div className="tracker-grid-form">
              <div>
                <Label className="tracker-form-label">
                  Amount (L) *
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.0"
                    step="0.1"
                    min="0"
                    required
                    className="tracker-form-input tracker-form-input-with-icon"
                  />
                  <Waves className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>
              
              <div>
                <Label className="tracker-form-label">
                  Date *
                </Label>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="tracker-form-input"
                />
              </div>
            </div>
            
            <div className="tracker-action-buttons">
              <Button variant="outline" onClick={() => router.push('/trackers/water')}>
                Cancel
              </Button>
              <Button type="submit" className="tracker-button-primary">
                <Plus className="mr-2" size={16} />
                Log Entry
              </Button>
            </div>
          </form>
        </ZPCard>
      </div>
    </div>
  );
}