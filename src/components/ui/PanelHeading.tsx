import { Icon } from './Icon';

interface PanelHeadingProps {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
}

export function PanelHeading({ title, subtitle, action, onAction }: PanelHeadingProps) {
  return (
    <div className="panel-heading">
      <div>
        <h2>{title}</h2>
        {subtitle && <span>{subtitle}</span>}
      </div>
      {action && (
        <button type="button" onClick={onAction}>
          {action}
          <Icon name="arrow" size={14} />
        </button>
      )}
    </div>
  );
}
