import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Users, Globe, Monitor, Smartphone, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, subDays, subMonths, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

type Period = '7d' | '30d' | '90d';

const PERIOD_LABELS: Record<Period, string> = {
  '7d': '7 derniers jours',
  '30d': '30 derniers jours',
  '90d': '90 derniers jours',
};

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(210, 79%, 56%)',
  'hsl(142, 71%, 45%)',
  'hsl(271, 91%, 65%)',
  'hsl(45, 93%, 47%)',
  'hsl(0, 84%, 60%)',
  'hsl(180, 60%, 45%)',
  'hsl(320, 70%, 55%)',
];

interface PageView {
  page_path: string;
  referrer: string | null;
  screen_width: number | null;
  session_id: string | null;
  language: string | null;
  created_at: string;
}

export function AnalyticsDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('30d');
  const [pageViews, setPageViews] = useState<PageView[]>([]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const since = subDays(new Date(), daysBack).toISOString();

    const { data, error } = await supabase
      .from('page_views')
      .select('page_path, referrer, screen_width, session_id, language, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (!error) setPageViews((data as PageView[]) || []);
    setIsLoading(false);
  }, [period]);

  useEffect(() => { loadData(); }, [loadData]);

  const stats = useMemo(() => {
    const totalViews = pageViews.length;
    const uniqueSessions = new Set(pageViews.map(v => v.session_id).filter(Boolean)).size;

    // Views per day
    const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const dailyMap = new Map<string, number>();
    for (let i = daysBack - 1; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'dd/MM');
      dailyMap.set(d, 0);
    }
    pageViews.forEach(v => {
      const d = format(new Date(v.created_at), 'dd/MM');
      dailyMap.set(d, (dailyMap.get(d) || 0) + 1);
    });
    const dailyData = Array.from(dailyMap.entries()).map(([day, views]) => ({ day, views }));

    // Top pages
    const pageMap = new Map<string, number>();
    pageViews.forEach(v => pageMap.set(v.page_path, (pageMap.get(v.page_path) || 0) + 1));
    const topPages = Array.from(pageMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value], i) => ({ name: name || '/', value, color: CHART_COLORS[i % CHART_COLORS.length] }));

    // Device types
    const mobile = pageViews.filter(v => v.screen_width && v.screen_width < 768).length;
    const tablet = pageViews.filter(v => v.screen_width && v.screen_width >= 768 && v.screen_width < 1024).length;
    const desktop = pageViews.filter(v => v.screen_width && v.screen_width >= 1024).length;
    const devices = [
      { name: 'Mobile', value: mobile, color: 'hsl(var(--primary))' },
      { name: 'Tablette', value: tablet, color: 'hsl(210, 79%, 56%)' },
      { name: 'Desktop', value: desktop, color: 'hsl(142, 71%, 45%)' },
    ].filter(d => d.value > 0);

    // Top referrers
    const refMap = new Map<string, number>();
    pageViews.forEach(v => {
      if (v.referrer) {
        try {
          const host = new URL(v.referrer).hostname || 'Direct';
          refMap.set(host, (refMap.get(host) || 0) + 1);
        } catch { refMap.set(v.referrer, (refMap.get(v.referrer) || 0) + 1); }
      }
    });
    const topReferrers = Array.from(refMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { totalViews, uniqueSessions, dailyData, topPages, devices, topReferrers };
  }, [pageViews, period]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '12px',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Analytics du site
        </h2>
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PERIOD_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalViews}</p>
                <p className="text-xs text-muted-foreground">Pages vues</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.uniqueSessions}</p>
                <p className="text-xs text-muted-foreground">Sessions uniques</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Globe className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.totalViews > 0 ? (stats.totalViews / stats.uniqueSessions).toFixed(1) : '0'}
                </p>
                <p className="text-xs text-muted-foreground">Pages / session</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily views chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Visites par jour</CardTitle>
          <CardDescription>{PERIOD_LABELS[period]}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} className="fill-muted-foreground" interval={period === '7d' ? 0 : period === '30d' ? 2 : 6} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} className="fill-muted-foreground" />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'hsl(var(--foreground))' }} />
                <Bar dataKey="views" name="Visites" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top pages + devices */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pages les plus visitées</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topPages.length > 0 ? (
              <div className="space-y-3">
                {stats.topPages.map((page, i) => (
                  <div key={page.name} className="flex items-center justify-between">
                    <span className="text-sm truncate max-w-[200px]">{page.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full" style={{ width: `${Math.max(20, (page.value / stats.totalViews) * 200)}px`, backgroundColor: page.color }} />
                      <span className="text-sm font-medium w-10 text-right">{page.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune donnée</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Appareils</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              {stats.devices.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.devices} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                      {stats.devices.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                    <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Aucune donnée</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referrers */}
      {stats.topReferrers.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sources de trafic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topReferrers.map(([host, count], i) => (
                <div key={host} className="flex items-center justify-between">
                  <span className="text-sm truncate max-w-[250px]">{host}</span>
                  <span className="text-sm font-medium">{count} visite{count > 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
