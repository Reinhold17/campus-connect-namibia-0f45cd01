import { Badge } from '@/components/ui/badge';

type StatusType = 'pending' | 'confirmed' | 'completed' | 'approved' | 'suspended' | 'reserved';

const statusStyles: Record<StatusType, string> = {
  pending: 'bg-warning/15 text-warning border-warning/30',
  confirmed: 'bg-success/15 text-success border-success/30',
  completed: 'bg-primary/15 text-primary border-primary/30',
  approved: 'bg-success/15 text-success border-success/30',
  suspended: 'bg-destructive/15 text-destructive border-destructive/30',
  reserved: 'bg-accent/15 text-accent border-accent/30',
};

export function StatusBadge({ status }: { status: StatusType }) {
  return (
    <Badge variant="outline" className={`${statusStyles[status]} text-xs font-medium capitalize`}>
      {status}
    </Badge>
  );
}
