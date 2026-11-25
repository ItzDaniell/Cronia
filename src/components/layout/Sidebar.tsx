import type { ModuleName, ModuleNavItem } from '../../types';
import { Icon } from '../ui/Icon';

interface SidebarProps {
  modules: ModuleNavItem[];
  active: ModuleName;
  menuOpen: boolean;
  onSelect: (name: ModuleName) => void;
  onCloseMenu: () => void;
  completedCount: number;
  totalCount: number;
  activeRemindersCount: number;
  userName: string;
}

export function Sidebar({
  modules,
  active,
  menuOpen,
  onSelect,
  onCloseMenu,
  completedCount,
  totalCount,
  activeRemindersCount,
  userName,
}: SidebarProps) {
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'CR';

  return (
    <>
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="logo">
            <span />
            <span />
          </div>
          <strong>Cronia</strong>
          <small>PRODUCTIVIDAD</small>
          <button type="button" onClick={onCloseMenu} aria-label="Cerrar menú">
            <Icon name="close" />
          </button>
        </div>

        <nav>
          {modules.map((item) => {
            const badge = item.name === 'Recordatorios' ? activeRemindersCount : item.badge;
            return (
              <div key={item.name}>
                {item.group && <p>{item.group}</p>}
                <button
                  type="button"
                  className={active === item.name ? 'active' : ''}
                  onClick={() => onSelect(item.name)}
                >
                  <Icon name={item.icon} />
                  <span>{item.name}</span>
                  {badge ? <b>{badge}</b> : null}
                </button>
              </div>
            );
          })}
        </nav>

        <div className="sidebar-foot">
          <div className="storage">
            <div>
              <span>Progreso semanal</span>
              <strong>{progress}%</strong>
            </div>
            <i>
              <em style={{ width: `${progress}%` }} />
            </i>
            <small>
              {completedCount} de {totalCount} tareas completadas
            </small>
          </div>
          <button type="button" className="user" onClick={() => onSelect('Configuración')}>
            <span>{initials}</span>
            <div>
              <strong>{userName}</strong>
              <small>Cuenta local</small>
            </div>
            <Icon name="more" />
          </button>
        </div>
      </aside>
      {menuOpen && <button type="button" className="scrim" onClick={onCloseMenu} aria-label="Cerrar menú" />}
    </>
  );
}
