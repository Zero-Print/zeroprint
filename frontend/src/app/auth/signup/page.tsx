'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/modules/auth';
import { UserRole } from '@/types';
import { 
  User, 
  Building, 
  Factory, 
  Landmark, 
  Shield, 
  Users, 
  Leaf, 
  Briefcase,
  School,
  Building2,
  Globe,
  Lock
} from 'lucide-react';

interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

export default function EnhancedSignUpPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    role: 'citizen' as UserRole,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const roleOptions: RoleOption[] = [
    {
      value: 'citizen',
      label: 'Citizen',
      description: 'Individual users tracking personal sustainability metrics',
      icon: User,
      color: 'from-green-500 to-blue-500'
    },
    {
      value: 'school',
      label: 'School',
      description: 'Educational institutions promoting student engagement',
      icon: School,
      color: 'from-orange-500 to-red-500'
    },
    {
      value: 'msme',
      label: 'MSME/Business',
      description: 'Small and medium enterprises tracking business sustainability',
      icon: Building2,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      value: 'government',
      label: 'Government',
      description: 'Government bodies managing city/ward level sustainability',
      icon: Landmark,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      value: 'admin',
      label: 'Admin',
      description: 'System administrators managing the platform',
      icon: Shield,
      color: 'from-purple-500 to-indigo-500'
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRoleSelect = (role: UserRole) => {
    setFormData(prev => ({
      ...prev,
      role,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.displayName, formData.role);
      
      // Redirect to appropriate dashboard based on role
      switch (formData.role) {
        case 'citizen':
          router.push('/dashboard/citizen');
          break;
        case 'school':
        case 'msme':
          router.push('/dashboard/entity');
          break;
        case 'govt':
          router.push('/dashboard/govt');
          break;
        case 'admin':
          router.push('/admin');
          break;
        default:
          router.push('/dashboard/citizen');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      // After Google sign-in, we'll need to determine the user's role
      // For now, redirect to main dashboard which will handle routing
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = roleOptions.find(option => option.value === formData.role) || roleOptions[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* ZeroPrint Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">Z</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">ZeroPrint</span>
          </Link>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join ZeroPrint</h1>
          <p className="text-gray-600">Create your account to start your sustainability journey</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Role Selection Card */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Select Your Role</CardTitle>
              <CardDescription>
                Choose the account type that best fits your needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {roleOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleRoleSelect(option.value)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        formData.role === option.value
                          ? 'border-green-500 bg-green-50 ring-2 ring-green-100'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{option.label}</h3>
                          <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Role Preview */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Selected Role</h4>
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-md bg-gradient-to-r ${selectedRole.color} flex items-center justify-center`}>
                    {React.createElement(selectedRole.icon, { className: "w-4 h-4 text-white" })}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedRole.label}</p>
                    <p className="text-xs text-gray-600">{selectedRole.description}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signup Form Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Create Account</CardTitle>
              <CardDescription>
                Fill in your details to create your {selectedRole.label} account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="displayName">Full Name</Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    type="text"
                    value={formData.displayName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#2E7D32] hover:bg-[#1B5E20]"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : `Create ${selectedRole.label} Account`}
                </Button>
              </form>

              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-4"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </div>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <a href="/auth/login" className="text-[#2E7D32] hover:underline">
                  Sign in
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}