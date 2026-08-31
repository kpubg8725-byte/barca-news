import { Bell, Bookmark, CalendarDays, ChevronLeft, Clock3, ExternalLink, Home, Radio, Search, Send, Shield, Sparkles, Trophy, UsersRound } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import type { Match, NewsArticle, NewsCategory, Transfer } from '@/data/models';

export const navItems = [
  { href: '/', label: 'الرئيسية', icon: Home },
  { href: '/transfers', label: 'الانتقالات', icon: Send },
  { href: '/matches', label: 'المباريات', icon: CalendarDays },
  { href: '/search', label: 'استكشف', icon: Search },
  { href: '/favorites', label: 'المحفوظات', icon: Bookmark },
];

export function BrandMark() {
  return (
    <div className="brand-mark" aria-label="شعار برشلونة" data-testid="brand-mark">
      B
    </div>
  );
}

export function BrandLockup() {
  return (
    <div className="flex items-center gap-3" data-testid="brand-lockup">
      <BrandMark />
      <div className="brand-copy">
        <strong>بارسا نيوز</strong>
        <span>روح برشلونة بالعربية</span>
      </div>
    </div>
  );
}

function isActive(href: string, location: string) {
  if (href === '/') return location === '/';
  return location.startsWith(href);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  return (
    <div className="app-shell" dir="rtl">
      <div className="grain" />
      <aside className="desktop-nav" aria-label="التنقل الرئيسي">
        <div className="brand-block"><BrandLockup /></div>
        <div className="desktop-nav-links">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={isActive(href, location) ? 'active' : ''} data-testid={`link-desktop-${label}`}>
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </Link>
          ))}
          <Link href="/notifications" className={isActive('/notifications', location) ? 'active' : ''} data-testid="link-desktop-notifications">
            <Bell size={18} strokeWidth={1.8} />
            <span>التنبيهات</span>
          </Link>
        </div>
        <div className="mt-auto rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.65)] p-3">
          <div className="section-kicker mb-2">يوم المباراة</div>
          <p className="m-0 text-[.72rem] leading-6 text-[hsl(var(--muted-foreground))]">كل ما يهمك عن البلوغرانا، في مكان واحد.</p>
        </div>
      </aside>
      <header className="topbar">
        <div className="content-wrap topbar-inner">
          <div className="md:hidden"><BrandLockup /></div>
          <div className="hidden md:block">
            <div className="text-[.7rem] text-[hsl(var(--muted-foreground))]" data-testid="text-date-label">متابعة مباشرة من قلب الحدث</div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/search" className="icon-button" aria-label="البحث" data-testid="link-top-search"><Search size={18} /></Link>
            <Link href="/notifications" className="icon-button relative" aria-label="التنبيهات" data-testid="link-top-notifications">
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]" />
            </Link>
          </div>
        </div>
      </header>
      {children}
      <nav className="bottom-nav" aria-label="تنقل الهاتف">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={isActive(href, location) ? 'active' : ''} data-testid={`link-mobile-${label}`}>
            <Icon strokeWidth={isActive(href, location) ? 2.4 : 1.8} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="page-heading animate-rise">
      <div className="section-kicker">{eyebrow}</div>
      <h1 data-testid={`heading-${title}`}>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}

export function SaveButton({ saved, onClick, label = 'حفظ الخبر' }: { saved: boolean; onClick: () => void; label?: string }) {
  return (
    <button type="button" className={`icon-button ${saved ? 'saved' : ''}`} onClick={onClick} aria-label={saved ? 'إزالة من المحفوظات' : label} title={saved ? 'إزالة من المحفوظات' : label} data-testid={`button-save-${saved ? 'active' : 'inactive'}`}>
      <Bookmark size={17} fill={saved ? 'currentColor' : 'none'} />
    </button>
  );
}

export function CategoryBadge({ category }: { category: NewsCategory }) {
  return <span className="badge">{category}</span>;
}

export function NewsCard({ article, saved, onSave, compact = false }: { article: NewsArticle; saved: boolean; onSave: () => void; compact?: boolean }) {
  return (
    <article className={`news-card surface surface-hover ${compact ? 'p-2' : ''} animate-rise`} data-testid={`card-news-${article.id}`}>
      <Link href={`/news/${article.id}`} className="news-card-image" data-testid={`link-news-image-${article.id}`}>
        <img src={article.image} alt={`صورة عن ${article.title}`} loading="lazy" />
      </Link>
      <div className="flex min-w-0 flex-col">
        <div className="flex items-center justify-between gap-2">
          <CategoryBadge category={article.category} />
          <span className="hero-meta"><Clock3 size={11} />{article.date}</span>
        </div>
        <Link href={`/news/${article.id}`} className="block text-inherit no-underline" data-testid={`link-news-title-${article.id}`}>
          <h3>{article.title}</h3>
        </Link>
        <div className="card-actions">
          <span className="text-[.64rem] text-[hsl(var(--muted-foreground))]">{article.readTime} قراءة</span>
          <span className="flex-1" />
          <button type="button" className={`mini-icon ${saved ? 'saved' : ''}`} onClick={onSave} aria-label={saved ? 'إزالة الخبر' : 'حفظ الخبر'} data-testid={`button-card-save-${article.id}`}>
            <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
          </button>
          <Link href={`/news/${article.id}`} className="mini-icon" aria-label="فتح الخبر" data-testid={`link-card-open-${article.id}`}><ChevronLeft size={15} /></Link>
        </div>
      </div>
    </article>
  );
}

export function FeaturedStory({ article, saved, onSave }: { article: NewsArticle; saved: boolean; onSave: () => void }) {
  return (
    <article className="hero-story animate-rise" data-testid={`featured-story-${article.id}`}>
      <Link href={`/news/${article.id}`} className="absolute inset-0 z-0" data-testid={`link-featured-${article.id}`}>
        <img src={article.image} alt={`الصورة الرئيسية: ${article.title}`} />
      </Link>
      <div className="hero-story-content">
        <div className="flex items-center justify-between gap-3">
          <CategoryBadge category={article.category} />
          <SaveButton saved={saved} onClick={onSave} />
        </div>
        <Link href={`/news/${article.id}`} className="block text-inherit no-underline" data-testid={`link-featured-title-${article.id}`}>
          <h2>{article.title}</h2>
        </Link>
        <div className="hero-meta"><Clock3 size={12} /> {article.date} <span className="mx-1 opacity-40">•</span> {article.readTime} قراءة</div>
      </div>
    </article>
  );
}

export function TeamBadge({ text }: { text: string }) {
  return <span className="team-badge" aria-label={`شعار ${text}`} data-testid={`team-badge-${text}`}>{text}</span>;
}

export function MatchCard({ match, featured = false }: { match: Match; featured?: boolean }) {
  if (featured) {
    return (
      <div className="match-card animate-rise" data-testid={`match-featured-${match.id}`}>
        <div className="match-card-header"><span>{match.competition}</span><span>{match.date}</span></div>
        <div className="match-teams">
          <div><TeamBadge text={match.homeShort} /><span className="team-name">{match.home}</span></div>
          <div className="versus">VS</div>
          <div><TeamBadge text={match.awayShort} /><span className="team-name">{match.away}</span></div>
        </div>
        <div className="relative z-[1] text-center text-[.7rem] text-[hsl(var(--muted-foreground))]">{match.time} · {match.venue}</div>
      </div>
    );
  }
  return (
    <div className="full-match surface surface-hover animate-rise" data-testid={`match-card-${match.id}`}>
      <div className="full-match-top"><span>{match.competition}</span><span>{match.date} · {match.time}</span></div>
      <div className="full-match-main">
        <div><TeamBadge text={match.homeShort} /><strong>{match.home}</strong><span>{match.venue}</span></div>
        <div className="score-box">{match.score ?? 'VS'}</div>
        <div><TeamBadge text={match.awayShort} /><strong>{match.away}</strong><span>{match.status === 'previous' ? 'النتيجة النهائية' : 'الموعد القادم'}</span></div>
      </div>
    </div>
  );
}

export function TransferRow({ transfer }: { transfer: Transfer }) {
  return (
    <div className="transfer-card surface surface-hover animate-rise" data-testid={`transfer-card-${transfer.id}`}>
      <div className="player-token">{transfer.initials}</div>
      <div className="min-w-0">
        <h3>{transfer.player}</h3>
        <p>{transfer.position} · {transfer.from} ← {transfer.to}</p>
      </div>
      <div className="transfer-status">{transfer.status}<small>{transfer.fee}</small></div>
    </div>
  );
}

export function EmptyState({ icon: Icon = Bookmark, title, description, action }: { icon?: typeof Bookmark; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="empty-state animate-rise" data-testid="empty-state">
      <div className="empty-state-icon"><Icon size={26} strokeWidth={1.5} /></div>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function SectionHeading({ title, link, href }: { title: string; link?: string; href?: string }) {
  return (
    <div className="section-row">
      <h2 className="section-title m-0">{title}</h2>
      {link && href && <Link href={href} className="text-link" data-testid={`link-section-${title}`}><span>{link}</span><ChevronLeft size={14} /></Link>}
    </div>
  );
}

export function StatusIcon({ kind }: { kind: 'breaking' | 'match' | 'transfer' | 'news' }) {
  if (kind === 'breaking') return <Radio size={18} />;
  if (kind === 'match') return <Trophy size={18} />;
  if (kind === 'transfer') return <Send size={18} />;
  if (kind === 'news') return <Sparkles size={18} />;
  return <Shield size={18} />;
}

export function ShareButton({ onShare }: { onShare: () => void }) {
  return <button type="button" className="icon-button" aria-label="مشاركة الخبر" title="مشاركة الخبر" onClick={onShare} data-testid="button-share-news"><ExternalLink size={17} /></button>;
}

export function LoadingRows() {
  return (
    <div className="grid gap-2" aria-label="جار التحميل" data-testid="loading-state">
      {[1, 2, 3].map((item) => <div key={item} className="h-[94px] animate-pulse rounded-[15px] bg-[hsl(var(--card))]" />)}
    </div>
  );
}

export function PlayerIcon() {
  return <UsersRound size={18} />;
}