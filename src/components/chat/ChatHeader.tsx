import { Lock, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import imecLogo from '@/imec-logo.png';
import comerLogo from '@/logocomercia.png';

interface ChatHeaderProps {
  onAdminClick: () => void;
}

export function ChatHeader({ onAdminClick }: ChatHeaderProps) {
  return (
    <header className="glass-panel flex items-center justify-between gap-4 px-5 py-4 border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={onAdminClick}
          className="h-10 w-10 text-muted-foreground hover:text-foreground"
          title="Acesso Admin"
        >
          <Lock className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-white/12 bg-white/5 px-2.5 py-1.5 backdrop-blur-sm">
              <img
                src={comerLogo}
                alt="comercIA"
                className="h-8 w-auto drop-shadow-[0_6px_16px_rgba(34,211,238,0.25)]"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] text-muted-foreground">Desenvolvido por</span>
                <span className="text-xs font-semibold text-foreground">comercIA</span>
              </div>
            </div>

            <span className="h-10 w-px bg-white/10" />

            <div className="flex items-center gap-2 rounded-lg border border-white/12 bg-white/5 px-2.5 py-1.5 backdrop-blur-sm">
              <img
                src={imecLogo}
                alt="Clínica IMEC"
                className="h-8 w-auto drop-shadow-[0_6px_16px_rgba(134,239,172,0.25)]"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] text-muted-foreground">Para</span>
                <span className="text-xs font-semibold text-foreground">Clínica IMEC</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold text-foreground">Assistente de Atendimento</h1>
            <p className="text-xs text-muted-foreground">Operado pela IMEC · Tecnologia comercIA</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-[#86efac] shadow-[0_10px_28px_rgba(34,211,238,0.25)]">
          <Bot className="h-5 w-5 text-slate-900" />
        </div>
      </div>
    </header>
  );
}
