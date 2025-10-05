/**
 * Admin Subscriptions Table Component
 * Displays all subscriptions with filtering and CSV export
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Loader2,
  DollarSign,
  Users
} from 'lucide-react';
import api from '@/lib/apiClient';
import { Subscription } from '@/types';

interface AdminSubscriptionsTableProps {
  onRefresh?: () => void;
}

export function AdminSubscriptionsTable({ onRefresh }: AdminSubscriptionsTableProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [filters, setFilters] = useState({
    status: '',
    userId: '',
    planId: '',
    dateFrom: '',
    dateTo: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [analytics, setAnalytics] = useState<any>(null);

  // Load subscriptions
  const loadSubscriptions = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.admin.subscriptions.getAllSubscriptions(page, pagination.limit, {
        ...filters,
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
      });

      if (response.success && response.data) {
        setSubscriptions(response.data.subscriptions);
        setPagination(response.data.pagination);
      } else {
        setError(response.error || 'Failed to load subscriptions');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  // Load analytics
  const loadAnalytics = async () => {
    try {
      const response = await api.admin.subscriptions.getAnalytics();
      if (response.success && response.data) {
        setAnalytics(response.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  // Export to CSV
  const exportToCSV = async () => {
    try {
      const response = await api.admin.subscriptions.exportSubscriptions('csv', filters);
      if (response.success) {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        setError(response.error || 'Failed to export data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to export data');
    }
  };

  // Apply filters
  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    loadSubscriptions(1);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      status: '',
      userId: '',
      planId: '',
      dateFrom: '',
      dateTo: '',
    });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
    loadSubscriptions(1);
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'trialing':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Trialing</Badge>;
      case 'past_due':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Past Due</Badge>;
      case 'cancelled':
        return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter subscriptions by search term
  const filteredSubscriptions = subscriptions.filter(subscription =>
    subscription.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscription.planId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscription.metadata?.planName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    loadSubscriptions();
    loadAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{analytics.totalSubscriptions}</div>
                  <div className="text-sm text-muted-foreground">Total Subscriptions</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{analytics.activeSubscriptions}</div>
                  <div className="text-sm text-muted-foreground">Active Subscriptions</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">₹{analytics.totalRevenue.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">{analytics.churnRate.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Churn Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>
                Manage and track all user subscriptions
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => loadSubscriptions(pagination.page)} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trialing">Trialing</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="User ID"
              value={filters.userId}
              onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
            />

            <Input
              placeholder="Plan ID"
              value={filters.planId}
              onChange={(e) => setFilters(prev => ({ ...prev, planId: e.target.value }))}
            />

            <Input
              type="date"
              placeholder="From Date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
            />

            <Input
              type="date"
              placeholder="To Date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={applyFilters} size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
            <Button onClick={clearFilters} variant="outline" size="sm">
              Clear
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading subscriptions...</span>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Payment ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell className="font-mono text-sm">
                        {subscription.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {subscription.userId.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{subscription.metadata?.planName || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">{subscription.planId}</div>
                        </div>
                      </TableCell>
                      <TableCell>₹{subscription.amount}</TableCell>
                      <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                      <TableCell>
                        {new Date(subscription.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {subscription.razorpayPaymentId ? subscription.razorpayPaymentId.substring(0, 8) + '...' : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} subscriptions
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadSubscriptions(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadSubscriptions(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
