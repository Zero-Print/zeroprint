'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ZPCard } from '@/components/ZPCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ZPTextArea } from '@/components/ui/ZPTextArea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TreePine, Plus, Leaf } from 'lucide-react';

export default function GreenLogEntry() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        greenType: '',
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
        setFormData(prev => ({ ...prev, greenType: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log('Form submitted:', formData);
        // Reset form or show success message
        router.push('/trackers/green');
    };

    const greenTypes = [
        { value: 'tree', label: 'Tree Planting' },
        { value: 'garden', label: 'Gardening' },
        { value: 'compost', label: 'Composting' },
        { value: 'recycling', label: 'Recycling Initiative' },
        { value: 'cleanup', label: 'Community Cleanup' },
        { value: 'other', label: 'Other Green Activity' },
    ];

    return (
        <div className="min-h-screen tracker-bg-green py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                {/* Header */}
                <div className="tracker-header">
                    <div className="flex items-center justify-center mb-4">
                        <div className="tracker-header-icon-container bg-gradient-to-r from-green-500 to-emerald-600">
                            <TreePine className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="tracker-header-title">Log Green Entry</h1>
                            <p className="tracker-header-subtitle">Record your green initiatives and environmental activities</p>
                        </div>
                    </div>
                </div>

                <ZPCard className="tracker-card">
                    <form onSubmit={handleSubmit} className="tracker-form">
                        <div>
                            <Label className="tracker-form-label">
                                Green Activity Type *
                            </Label>
                            <Select onValueChange={handleSelectChange} value={formData.greenType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select green activity type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {greenTypes.map(type => (
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
                                placeholder="Describe your green activity..."
                                rows={3}
                            />
                        </div>

                        <div className="tracker-grid-form">
                            <div>
                                <Label className="tracker-form-label">
                                    Amount/Count *
                                </Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        step="1"
                                        min="0"
                                        required
                                        className="tracker-form-input tracker-form-input-with-icon"
                                    />
                                    <Leaf className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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
                            <Button variant="outline" onClick={() => router.push('/trackers/green')}>
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