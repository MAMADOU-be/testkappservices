import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Users, FileText, Briefcase, MessageSquare, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MonthlyData {
  month: string;
  count: number;
}

interface StatusData {
  name: string;
  value: number;
  color: string;
}

interface ServiceTypeData {
  name: string;
  value: number;
  color: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'hsl(45, 93%, 47%)',
  contacted: 'hsl(210, 79%, 56%)',
  confirmed: 'hsl(142, 71%, 45%)',
  in_progress: 'hsl(271, 91%, 65%)',
  completed: 'hsl(160, 84%, 39%)',
  cancelled: 'hsl(0, 84%, 60%)',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  contacted: 'Contacté',
  confirmed: 'Confirmé',
  in_progress: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

const SERVICE_COLORS = [
  'hsl(var(--primary))',
  'hsl(210, 79%, 56%)',
  'hsl(142, 71%, 45%)',
  'hsl(271, 91%, 65%)',
  'hsl(45, 93%, 47%)',
  'hsl(0, 84%, 60%)',
];

export function StatsDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [jobApplications, setJobApplications] = useState<any[]>([]);
  const [contactMessages, setContactMessages] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [reqRes, jobRes, msgRes] = await Promise.all([
      supabase.from('service_requests').select('id, status, service_type, created_at'),
      supabase.from('job_applications').select('id, status, created_at'),
      supabase.from('contact_messages').select('id, is_read, created_at'),
    ]);
    setServiceRequests(reqRes.data || []);
    setJobApplications(jobRes.data || []);
    setContactMessages(msgRes.data || []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // KPI cards
  const totalRequests = serviceRequests.length;
  const completedRequests = serviceRequests.filter(r => r.status === 'completed').length;
  const conversionRate = totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0;
  const pendingRequests = serviceRequests.filter(r => r.status === 'pending').length;
  const totalJobs = jobApplications.length;
  const totalMessages = contactMessages.length;
  const unreadMessages = contactMessages.filter(m => !m.is_read).length;

  // Monthly data (last 6 months)
  const monthlyData: MonthlyData[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const count = serviceRequests.filter(r => {
      const d = new Date(r.created_at);
      return d >= start && d <= end;
    }).length;
    monthlyData.push({
      month: format(date, 'MMM yyyy', { locale: fr }),
      count,
    });
  }

  // Status distribution
  const statusCounts: Record<string, number> = {};
  serviceRequests.forEach(r => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  });
  const statusData: StatusData[] = Object.entries(statusCounts).map(([status, value]) => ({
    name: STATUS_LABELS[status] || status,
    value,
    color: STATUS_COLORS[status] || 'hsl(var(--muted))',
  }));

  // Service type distribution
  const typeCounts: Record<string, number> = {};
  serviceRequests.forEach(r => {
    const type = r.service_type || 'Autre';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });
  const typeData: ServiceTypeData[] = Object.entries(typeCounts).map(([name, value], i) => ({
    name,
    value,
    color: SERVICE_COLORS[i % SERVICE_COLORS.length],
  }));

  // Monthly jobs data
  const monthlyJobsData: MonthlyData[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const count = jobApplications.filter(r => {
      const d = new Date(r.created_at);
      return d >= start && d <= end;
    }).length;
    monthlyJobsData.push({
      month: format(date, 'MMM yyyy', { locale: fr }),
      count,
    });
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalRequests}</p>
                <p className="text-xs text-muted-foreground">Demandes totales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{conversionRate}%</p>
                <p className="text-xs text-muted-foreground">Taux de conversion</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Briefcase className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalJobs}</p>
                <p className="text-xs text-muted-foreground">Candidatures</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {totalMessages}
                  {unreadMessages > 0 && (
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      ({unreadMessages} non lus)
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Requests per month */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Demandes par mois</CardTitle>
            <CardDescription>Évolution sur les 6 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="count" name="Demandes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Répartition par statut</CardTitle>
            <CardDescription>{totalRequests} demandes au total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={{ strokeWidth: 1 }}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Aucune donnée
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Service type distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Types de service</CardTitle>
            <CardDescription>Répartition des demandes par type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {typeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={{ strokeWidth: 1 }}
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Aucune donnée
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Jobs per month */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Candidatures par mois</CardTitle>
            <CardDescription>Évolution sur les 6 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyJobsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Candidatures"
                    stroke="hsl(45, 93%, 47%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(45, 93%, 47%)', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick stats summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Résumé rapide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-muted-foreground">En attente :</span>
              <span className="font-semibold">{pendingRequests}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Terminées :</span>
              <span className="font-semibold">{completedRequests}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">Messages non lus :</span>
              <span className="font-semibold">{unreadMessages}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-muted-foreground">Conversion :</span>
              <span className="font-semibold">{conversionRate}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
