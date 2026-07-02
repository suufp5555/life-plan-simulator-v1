import { forwardRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { ChevronDown, ChevronRight, TriangleAlert } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('rounded-lg border border-gray-200 bg-white shadow-sm', className)} {...props} />
  ),
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center justify-between px-4 py-3 border-b border-gray-100', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm font-semibold text-gray-800', className)} {...props} />
  ),
);
CardTitle.displayName = 'CardTitle';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-4 py-3', className)} {...props} />
  ),
);
CardContent.displayName = 'CardContent';

interface CollapsibleCardProps {
  title: string;
  /** タイトル横に「（n）」として常時表示する件数。省略時は非表示 */
  count?: number;
  /** true かつ閉鎖時のみ、タイトル横に警告アイコンを表示 */
  warning?: boolean;
  /** ヘッダー右側の操作ボタン。閉鎖中もクリック可能で、押すとカードが開く */
  action?: ReactNode;
  contentClassName?: string;
  children: ReactNode;
}

export function CollapsibleCard({ title, count, warning = false, action, contentClassName, children }: CollapsibleCardProps) {
  const [open, setOpen] = useState(true);
  const Chevron = open ? ChevronDown : ChevronRight;
  return (
    <Card>
      <CardHeader className={cn('p-0', !open && 'border-b-0')}>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
          className="flex flex-1 items-center gap-1.5 px-4 py-3 text-left rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Chevron className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm font-semibold text-gray-800">
            {title}
            {count !== undefined && (
              <span className="font-normal text-gray-400">（{count}）</span>
            )}
          </span>
          {warning && !open && (
            <TriangleAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
          )}
        </button>
        {action && (
          <div className="pr-4 flex-shrink-0" onClick={() => setOpen(true)}>
            {action}
          </div>
        )}
      </CardHeader>
      {open && <CardContent className={contentClassName}>{children}</CardContent>}
    </Card>
  );
}
