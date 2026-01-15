import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Download,
  Search,
  MessageSquare,
  Users,
  AlertTriangle,
  Calendar,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface Session {
  id: string;
  created_at: string;
  ip_address: string;
  user_agent: string | null;
  last_seen_at: string;
  message_count?: number;
  has_urgency?: boolean;
}

interface Message {
  id: string;
  session_id: string;
  created_at: string;
  role: 'user' | 'assistant' | 'system';
  content_text: string;
  attachments_json?: unknown;
  flags_json?: { urgency?: boolean; specialty?: string; exam?: string };
}

export default function Admin() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sessionMessages, setSessionMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [stats, setStats] = useState({
    totalSessions: 0,
    urgentSessions: 0,
    todaySessions: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('comercia_admin_token');
    if (!token) {
      navigate('/');
      return;
    }
    loadSessions();
  }, [navigate]);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .order('last_seen_at', { ascending: false })
        .limit(100);

      if (sessionsError) throw sessionsError;

      // Get message counts for each session
      const sessionsWithCounts = await Promise.all(
        (sessionsData || []).map(async (session) => {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id);

          // Check for urgency flags
          const { data: urgentMessages } = await supabase
            .from('messages')
            .select('flags_json')
            .eq('session_id', session.id)
            .not('flags_json', 'is', null);

          const hasUrgency = urgentMessages?.some(
            (m) => (m.flags_json as any)?.urgency
          );

          return {
            ...session,
            message_count: count || 0,
            has_urgency: hasUrgency
          };
        })
      );

      setSessions(sessionsWithCounts);

      // Calculate stats
      const today = new Date().toDateString();
      const todaySessions = sessionsWithCounts.filter(
        (s) => new Date(s.created_at).toDateString() === today
      ).length;
      const urgentSessions = sessionsWithCounts.filter((s) => s.has_urgency).length;

      setStats({
        totalSessions: sessionsWithCounts.length,
        urgentSessions,
        todaySessions
      });
    } catch (e) {
      console.error('Failed to load sessions:', e);
      toast.error('Erro ao carregar sessões');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSessionMessages = async (session: Session) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setSessionMessages((data || []) as Message[]);
      setSelectedSession(session);
    } catch (e) {
      console.error('Failed to load messages:', e);
      toast.error('Erro ao carregar mensagens');
    }
  };

  const exportData = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      sessions: sessions.map((s) => ({
        ...s,
        messages: sessionMessages.filter((m) => m.session_id === s.id)
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comercia-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Dados exportados com sucesso');
  };

  const handleLogout = () => {
    localStorage.removeItem('comercia_admin_token');
    navigate('/');
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.ip_address.includes(searchTerm) ||
      session.id.includes(searchTerm);
    const matchesDate =
      !dateFilter ||
      new Date(session.created_at).toISOString().split('T')[0] === dateFilter;
    return matchesSearch && matchesDate;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-white/10 bg-card/80 px-6 py-4 backdrop-blur-lg shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={handleLogout}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">comercIA Admin</h1>
          </div>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar JSON
          </Button>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Conversas
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Conversas Urgentes
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-urgent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-urgent">
                {stats.urgentSessions}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Hoje
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todaySessions}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por IP ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-auto"
          />
        </div>

        {/* Sessions table */}
        <Card>
          <CardHeader>
            <CardTitle>Sessões</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">
                Carregando...
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Última atividade</TableHead>
                    <TableHead>Mensagens</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhuma sessão encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-mono text-sm">
                          {session.ip_address}
                        </TableCell>
                        <TableCell>
                          {new Date(session.created_at).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          {new Date(session.last_seen_at).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>{session.message_count}</TableCell>
                        <TableCell>
                          {session.has_urgency ? (
                            <span className="status-urgent">Urgente</span>
                          ) : (
                            <span className="status-normal">Normal</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadSessionMessages(session)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Session detail dialog */}
      <Dialog
        open={!!selectedSession}
        onOpenChange={(open) => !open && setSelectedSession(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversa - {selectedSession?.ip_address}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {sessionMessages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary/10 ml-8'
                    : 'bg-muted mr-8'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-medium">
                    {message.role === 'user' ? 'Usuário' : 'comercIA'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.created_at).toLocaleTimeString('pt-BR')}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.content_text}</p>
                {message.flags_json && (
                  <div className="mt-2 flex gap-2">
                    {(message.flags_json as any).urgency && (
                      <span className="status-urgent text-[10px]">Urgente</span>
                    )}
                    {(message.flags_json as any).specialty && (
                      <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded">
                        {(message.flags_json as any).specialty}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
