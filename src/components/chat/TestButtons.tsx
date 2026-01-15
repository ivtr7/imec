import { Button } from '@/components/ui/button';

interface TestButtonsProps {
  onTest: (message: string) => void;
}

const testMessages = [
  { label: '📅 Marcar cardio', message: 'Quero marcar cardiologista amanhã de manhã' },
  { label: '🚨 Urgência', message: 'Estou com dor no peito e falta de ar' },
  { label: '🖼️ Ecocardiograma', message: 'Vou mandar um pedido de ecocardiograma' },
  { label: '👩‍⚕️ Dermato quinta', message: 'Quero dermatologista quinta à tarde' },
];

export function TestButtons({ onTest }: TestButtonsProps) {
  return (
    <div className="glass-panel flex flex-wrap gap-2 p-3 border border-white/10">
      <span className="text-xs text-muted-foreground w-full mb-1">Testes rápidos:</span>
      {testMessages.map((test, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onTest(test.message)}
          className="text-xs h-8 rounded-lg"
        >
          {test.label}
        </Button>
      ))}
    </div>
  );
}
