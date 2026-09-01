import { Activity, Archive, BarChart3, CalendarDays, FileText, FolderKanban, LayoutDashboard, LockKeyhole, Radio, Send, Settings2, ShieldCheck, Trophy, UsersRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';

const navItems = [
  { href: '/admin', label: 'المشهد العام', icon: LayoutDashboard },
  { href: '/admin/news', label: 'غرفة الأخبار', icon: FileText },
  { href: '/admin/categories', label: 'التصنيفات', icon: FolderKanban },
  { href: '/admin/transfers', label: 'سوق الانتقالات', icon: Send },
  { href: '/admin/matches', label: 'المباريات', icon: Trophy },
];

export const ADMIN_HEADERS = { 'x-dev-admin': 'barca-news-local-admin' };

export function isAdminPathActive(href: string, location: string) {
  return href === '/admin' ? location === href : location.startsWith(href);
}

function Brand() {
  return (
    <div className="admin-brand" data-testid="admin-brand">
      <div className="admin-brand-mark">B</div>
      <div><strong>بارسا نيوز</strong><small>EDITORIAL CONTROL ROOM</small></div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return (
    <div className="admin-page" dir="rtl">
      <div className="grain" />
      <div className="admin-shell">
        <aside className="admin-rail" aria-label="تنقل غرفة التحرير">
          <Brand />
          <nav className="admin-rail-nav">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={isAdminPathActive(href, location) ? 'active' : ''} data-testid={`link-admin-nav-${href.slice(7) || 'overview'}`}>
                <Icon size={17} strokeWidth={1.8} /><span>{label}</span>
              </Link>
            ))}
          </nav>
          <div className="admin-rail-footer">
            <div className="dev-access" data-testid="status-development-access">
              <ShieldCheck size={16} />
              <div><strong>وصول تطويري مؤقت</strong>مفعّل لهذا الجهاز فقط. ليس نظام مصادقة إنتاجياً.</div>
            </div>
          </div>
        </aside>
        <main className="admin-content">
          <header className="admin-mobile-header">
            <Brand />
            <div className="dev-access" style={{ padding: '8px 10px' }} data-testid="status-mobile-development-access">
              <LockKeyhole size={14} /><span>وصول مؤقت</span>
            </div>
          </header>
          <nav className="admin-mobile-nav no-scrollbar" aria-label="تنقل غرفة التحرير">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={isAdminPathActive(href, location) ? 'active' : ''} data-testid={`link-admin-mobile-${href.slice(7) || 'overview'}`}>
                <Icon size={15} /><span>{label}</span>
              </Link>
            ))}
          </nav>
          {children}
        </main>
      </div>
    </div>
  );
}

export function AdminHeading({ eyebrow, title, description, children }: { eyebrow: string; title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="admin-heading animate-rise">
      <div><div className="admin-eyebrow">{eyebrow}</div><h1 data-testid={`heading-admin-${title}`}>{title}</h1>{description && <p>{description}</p>}</div>
      {children && <div className="admin-heading-actions">{children}</div>}
    </div>
  );
}

export function AdminIconButton({ label, onClick, children, danger = false }: { label: string; onClick: () => void; children: ReactNode; danger?: boolean }) {
  return <button type="button" className={`admin-btn admin-btn-sm ${danger ? 'admin-btn-danger' : 'admin-btn-quiet'}`} onClick={onClick} aria-label={label} title={label} data-testid={`button-${label}`}>{children}<span className="sr-only">{label}</span></button>;
}

export function StatusPill({ status, label }: { status: string; label?: string }) {
  return <span className={`status-pill status-${status}`} data-testid={`status-${status}`}>{label ?? status}</span>;
}

export function AdminLoading({ rows = 4 }: { rows?: number }) {
  return <div className="admin-list" aria-label="جار التحميل" data-testid="loading-admin">{Array.from({ length: rows }, (_, i) => <div key={i} className="admin-skeleton" />)}</div>;
}

export function AdminError({ onRetry }: { onRetry: () => void }) {
  return <div className="admin-error" role="alert" data-testid="error-admin"><span>تعذر تحميل بيانات غرفة التحرير. جرّب مرة أخرى.</span><button type="button" className="admin-btn admin-btn-sm admin-btn-quiet" onClick={onRetry} data-testid="button-retry-admin">إعادة المحاولة</button></div>;
}

export function AdminEmpty({ icon: Icon = FileText, title, description, action }: { icon?: typeof FileText; title: string; description: string; action?: React.ReactNode }) {
  return <div className="empty-admin" data-testid="empty-admin"><Icon size={25} strokeWidth={1.5} /><strong>{title}</strong><p>{description}</p>{action}</div>;
}

export function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

export function formatDateTime(value?: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

export function getInitials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase() || 'B';
}

export const actionIcons = { activity: Activity, archive: Archive, chart: BarChart3, calendar: CalendarDays, settings: Settings2, users: UsersRound, radio: Radio };