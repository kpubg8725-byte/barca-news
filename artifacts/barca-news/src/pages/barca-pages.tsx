import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowDownLeft, ArrowUpLeft, Bell, Bookmark, Check, Clock3, Filter, Search as SearchIcon, UserRound } from 'lucide-react';
import { Link, useParams } from 'wouter';
import {
  AppShell,
  CategoryBadge,
  EmptyState,
  FeaturedStory,
  MatchCard,
  NewsCard,
  PageHeader,
  SaveButton,
  SectionHeading,
  ShareButton,
  StatusIcon,
  TransferRow,
} from '@/components/barca-ui';
import {
  categories,
  getNewsById,
  initialNotifications,
  matches,
  news,
  players,
  transfers,
  type NewsCategory,
  type NotificationItem,
  type TransferStatus,
} from '@/data/models';

function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('barca-news-favorites');
      if (stored) setFavoriteIds(JSON.parse(stored) as string[]);
    } catch {
      setFavoriteIds([]);
    }
  }, []);

  const toggleFavorite = (id: string) => {
    setFavoriteIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      window.localStorage.setItem('barca-news-favorites', JSON.stringify(next));
      return next;
    });
  };

  return { favoriteIds, toggleFavorite };
}

function PageFrame({ children }: { children: ReactNode }) {
  return <main className="main-frame"><div className="content-wrap">{children}</div></main>;
}

function SideStory({ article }: { article: (typeof news)[number] }) {
  return (
    <Link href={`/news/${article.id}`} className="side-story surface surface-hover animate-rise text-inherit no-underline" data-testid={`card-side-story-${article.id}`}>
      <img src={article.image} alt={`صورة ${article.title}`} loading="lazy" />
      <div className="side-story-copy">
        <CategoryBadge category={article.category} />
        <h3>{article.title}</h3>
        <div className="hero-meta mt-2"><Clock3 size={11} /> {article.date}</div>
      </div>
    </Link>
  );
}

export function HomePage() {
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [activeCategory, setActiveCategory] = useState<NewsCategory | 'الكل'>('الكل');
  const displayedNews = useMemo(() => activeCategory === 'الكل' ? news.slice(1) : news.filter((item) => item.category === activeCategory), [activeCategory]);

  return (
    <PageFrame>
      <div className="flex items-end justify-between gap-4 pt-7 animate-rise">
        <div>
          <div className="section-kicker">السبت · يوم المباراة</div>
          <h1 className="mt-2 font-display text-[1.55rem] font-bold leading-[1.55] tracking-[-.06em] md:text-[2.35rem]" data-testid="heading-home">مساء الخير، كوليز</h1>
          <p className="m-0 text-[.78rem] text-[hsl(var(--muted-foreground))]">هنا تبدأ الحكاية قبل صافرة البداية.</p>
        </div>
        <div className="hidden rounded-xl border border-[hsl(var(--accent)/.25)] bg-[hsl(var(--accent)/.07)] px-3 py-2 text-center sm:block">
          <div className="text-[.6rem] text-[hsl(var(--muted-foreground))]">النبض الآن</div>
          <div className="mt-1 flex items-center gap-2 text-[.75rem] font-bold text-[hsl(var(--accent))]"><span className="live-dot" /> حي</div>
        </div>
      </div>
      <div className="breaking-strip animate-rise delay-1" data-testid="breaking-news-banner">
        <span className="badge badge-red"><span className="live-dot" /> عاجل</span>
        <span>فليك يرفع سقف التحدي: «نريد أن نلعب بجرأة برشلونة»</span>
      </div>

      <section className="hero-grid" aria-label="الأخبار البارزة">
        <FeaturedStory article={news[0]} saved={favoriteIds.includes(news[0].id)} onSave={() => toggleFavorite(news[0].id)} />
        <div className="side-stories"><SideStory article={news[1]} /><SideStory article={news[2]} /></div>
      </section>

      <section className="section-gap animate-rise delay-2">
        <SectionHeading title="تصفح حسب المزاج" />
        <div className="category-scroll no-scrollbar" role="tablist" aria-label="تصنيفات الأخبار">
          {(['الكل', ...categories] as const).map((category) => (
            <button type="button" key={category} className={`category-chip ${activeCategory === category ? 'active' : ''}`} onClick={() => setActiveCategory(category)} data-testid={`button-category-${category}`}>
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="section-gap">
        <SectionHeading title="آخر الأخبار" link="كل الأخبار" href="/search" />
        {displayedNews.length > 0 ? (
          <div className="news-list">
            {displayedNews.map((article, index) => <div key={article.id} style={{ animationDelay: `${index * 50}ms` }}><NewsCard article={article} saved={favoriteIds.includes(article.id)} onSave={() => toggleFavorite(article.id)} /></div>)}
          </div>
        ) : (
          <EmptyState icon={Filter} title="لا أخبار في هذا التصنيف بعد" description="جرّب تصنيفاً آخر لتعود إلى نبض برشلونة." />
        )}
      </section>

      <section className="section-gap">
        <SectionHeading title="نبض الانتقالات" link="سوق كامل" href="/transfers" />
        <div className="pulse-grid">
          {transfers.slice(2, 4).map((transfer) => (
            <Link href="/transfers" key={transfer.id} className="transfer-pulse surface surface-hover text-inherit no-underline" data-testid={`link-pulse-${transfer.id}`}>
              <div className="player-token">{transfer.initials}</div>
              <div className="min-w-0"><strong>{transfer.player}</strong><span>{transfer.status} · ثقة {transfer.confidence}%</span></div>
              <ArrowUpLeft size={16} className="mr-auto text-[hsl(var(--accent))]" />
            </Link>
          ))}
        </div>
      </section>

      <section className="section-gap">
        <SectionHeading title="الموعد القادم" link="كل المباريات" href="/matches" />
        <MatchCard match={matches[0]} featured />
      </section>
      <div className="footer-space" />
    </PageFrame>
  );
}

export function TransfersPage() {
  const [tab, setTab] = useState<TransferStatus>('مكتملة');
  const visibleTransfers = transfers.filter((transfer) => transfer.status === tab);
  const tabs: TransferStatus[] = ['مكتملة', 'مفاوضات', 'شائعات'];
  return (
    <PageFrame>
      <PageHeader eyebrow="السوق تحت المجهر" title="الانتقالات" description="أسماء مؤكدة، اتصالات جارية، وشائعات نراقبها دون ضجيج." />
      <div className="filter-tabs" role="tablist" aria-label="حالة الانتقالات">
        {tabs.map((item) => <button type="button" key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)} data-testid={`button-transfer-tab-${item}`}>{item}</button>)}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[.72rem] text-[hsl(var(--muted-foreground))]" data-testid="text-transfer-count">{visibleTransfers.length} ملفات في الرادار</span>
        <span className="flex items-center gap-1 text-[.68rem] text-[hsl(var(--accent))]"><span className="live-dot" /> يتجدد باستمرار</span>
      </div>
      <div className="mt-3 grid gap-2">
        {visibleTransfers.map((transfer) => <TransferRow transfer={transfer} key={transfer.id} />)}
      </div>
      <section className="section-gap surface rounded-2xl p-4">
        <div className="flex items-center gap-2 text-[hsl(var(--accent))]"><Filter size={17} /><span className="font-display text-[.82rem] font-bold">كيف نقرأ مؤشر الثقة؟</span></div>
        <p className="m-0 mt-2 text-[.73rem] leading-7 text-[hsl(var(--muted-foreground))]">نقيّم الأخبار بحسب تعدد المصادر ووضوح المفاوضات. المؤشر إرشادي، والخبر الرسمي يبقى الحاسم.</p>
      </section>
    </PageFrame>
  );
}

export function MatchesPage() {
  const [tab, setTab] = useState<'upcoming' | 'previous'>('upcoming');
  const visibleMatches = matches.filter((match) => match.status === tab);
  return (
    <PageFrame>
      <PageHeader eyebrow="الروزنامة الكتالونية" title="المباريات" description="كل موعد للبلوغرانا، من أول صافرة إلى آخر هجمة." />
      <div className="filter-tabs" role="tablist" aria-label="فلترة المباريات">
        <button type="button" className={tab === 'upcoming' ? 'active' : ''} onClick={() => setTab('upcoming')} data-testid="button-matches-upcoming"><ArrowUpLeft size={14} className="inline" /> القادمة</button>
        <button type="button" className={tab === 'previous' ? 'active' : ''} onClick={() => setTab('previous')} data-testid="button-matches-previous"><ArrowDownLeft size={14} className="inline" /> السابقة</button>
      </div>
      <div className="matches-list">
        {visibleMatches.map((match) => <MatchCard match={match} key={match.id} />)}
      </div>
    </PageFrame>
  );
}

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'all' | 'news' | 'players'>('all');
  const { favoriteIds, toggleFavorite } = useFavorites();
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    const articleResults = news.filter((article) => !term || `${article.title} ${article.summary} ${article.category}`.toLowerCase().includes(term));
    const playerResults = players.filter((player) => !term || `${player.name} ${player.position} ${player.nameLatin}`.toLowerCase().includes(term));
    return { articleResults, playerResults };
  }, [query]);
  const hasResults = (mode !== 'players' && results.articleResults.length > 0) || (mode !== 'news' && results.playerResults.length > 0);
  return (
    <PageFrame>
      <PageHeader eyebrow="من المدرج إلى غرفة الأخبار" title="استكشف" description="ابحث عن خبر، لاعب، أو اللحظة التي تريد أن تعيشها من جديد." />
      <label className="search-box animate-rise delay-1">
        <SearchIcon size={18} className="text-[hsl(var(--accent))]" />
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="اكتب اسم لاعب أو كلمة مفتاحية..." aria-label="البحث في الأخبار واللاعبين" data-testid="input-search" />
      </label>
      <div className="filter-tabs" role="tablist" aria-label="نوع نتائج البحث">
        <button type="button" className={mode === 'all' ? 'active' : ''} onClick={() => setMode('all')} data-testid="button-search-all">الكل</button>
        <button type="button" className={mode === 'news' ? 'active' : ''} onClick={() => setMode('news')} data-testid="button-search-news">الأخبار</button>
        <button type="button" className={mode === 'players' ? 'active' : ''} onClick={() => setMode('players')} data-testid="button-search-players">اللاعبون</button>
      </div>
      {hasResults ? (
        <div className="search-results">
          {mode !== 'players' && results.articleResults.map((article) => <NewsCard article={article} saved={favoriteIds.includes(article.id)} onSave={() => toggleFavorite(article.id)} key={article.id} />)}
          {mode !== 'news' && results.playerResults.map((player) => (
            <div className="player-result surface surface-hover animate-rise" key={player.id} data-testid={`search-player-${player.id}`}>
              <div className="player-token">{player.initials}</div>
              <div><strong className="font-display text-[.8rem]">{player.name}</strong><p className="m-0 mt-1 text-[.69rem] text-[hsl(var(--muted-foreground))]">{player.position} · {player.note}</p></div>
              <UserRound size={16} className="mr-auto text-[hsl(var(--muted-foreground))]" />
            </div>
          ))}
        </div>
      ) : <div className="mt-5"><EmptyState icon={SearchIcon} title="لم نجد ما تبحث عنه" description="جرّب اسماً أقصر أو كلمة مختلفة، وستعود المدرجات للغناء." /></div>}
    </PageFrame>
  );
}

export function FavoritesPage() {
  const { favoriteIds, toggleFavorite } = useFavorites();
  const savedNews = news.filter((article) => favoriteIds.includes(article.id));
  return (
    <PageFrame>
      <PageHeader eyebrow="ركنك الخاص" title="المحفوظات" description="القصص التي اخترت الاحتفاظ بها للعودة إليها عندما يهدأ الملعب." />
      {savedNews.length > 0 ? (
        <div className="news-list mt-5">
          {savedNews.map((article) => <NewsCard article={article} saved onSave={() => toggleFavorite(article.id)} key={article.id} />)}
        </div>
      ) : (
        <div className="mt-5">
          <EmptyState icon={Bookmark} title="مدرجك ما زال هادئاً" description="احفظ أول خبر يعجبك، وسيظهر هنا دائماً حتى بعد إغلاق التطبيق." action={<Link href="/" data-testid="link-empty-favorites">اكتشف الأخبار</Link>} />
        </div>
      )}
    </PageFrame>
  );
}

function getStoredNotifications() {
  try {
    const stored = window.localStorage.getItem('barca-news-notifications');
    if (stored) return JSON.parse(stored) as NotificationItem[];
  } catch {
    return initialNotifications;
  }
  return initialNotifications;
}

export function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  useEffect(() => setItems(getStoredNotifications()), []);
  const unreadCount = items.filter((item) => item.unread).length;
  const markAllRead = () => {
    const next = items.map((item) => ({ ...item, unread: false }));
    setItems(next);
    window.localStorage.setItem('barca-news-notifications', JSON.stringify(next));
  };
  const markRead = (id: string) => {
    const next = items.map((item) => item.id === id ? { ...item, unread: false } : item);
    setItems(next);
    window.localStorage.setItem('barca-news-notifications', JSON.stringify(next));
  };
  return (
    <PageFrame>
      <div className="flex items-end justify-between gap-4">
        <PageHeader eyebrow="ابقَ قريباً" title="التنبيهات" description="الخبر المهم يصل إليك في اللحظة المناسبة." />
        {unreadCount > 0 && <button type="button" className="mb-1 flex shrink-0 items-center gap-1 rounded-lg border border-[hsl(var(--border))] px-3 py-2 text-[.67rem] text-[hsl(var(--accent))]" onClick={markAllRead} data-testid="button-mark-all-read"><Check size={14} /> قراءة الكل</button>}
      </div>
      <div className="mt-5 grid gap-2">
        {items.map((item) => (
          <button type="button" className={`notification-item surface text-right ${item.unread ? 'unread' : ''}`} onClick={() => markRead(item.id)} key={item.id} data-testid={`notification-${item.id}`}>
            <span className="notification-icon"><StatusIcon kind={item.kind} /></span>
            <span><strong className="block font-display text-[.76rem]">{item.title}</strong><span className="mt-1 block text-[.7rem] leading-6 text-[hsl(var(--muted-foreground))]">{item.description}</span><time>{item.time}</time></span>
            {item.unread && <span className="mt-2 h-2 w-2 rounded-full bg-[hsl(var(--primary))]" aria-label="غير مقروء" />}
          </button>
        ))}
      </div>
      {items.length === 0 && <div className="mt-5"><EmptyState icon={Bell} title="لا توجد تنبيهات" description="عندما يحدث شيء مهم في عالم برشلونة، ستجده هنا." /></div>}
    </PageFrame>
  );
}

export function NewsDetailPage() {
  const params = useParams<{ id: string }>();
  const article = getNewsById(params.id);
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [feedback, setFeedback] = useState('');
  if (!article) {
    return <PageFrame><EmptyState title="الخبر غير موجود" description="ربما غادر هذا الخبر غرفة الأخبار، لكن هناك الكثير من القصص الأخرى." action={<Link href="/" data-testid="link-missing-news-home">العودة للرئيسية</Link>} /></PageFrame>;
  }
  const handleShare = () => {
    const shareUrl = window.location.href;
    if (navigator.clipboard) void navigator.clipboard.writeText(shareUrl);
    setFeedback('تم نسخ رابط الخبر');
    window.setTimeout(() => setFeedback(''), 2200);
  };
  return (
    <PageFrame>
      <div className="flex items-center gap-2 pt-5 text-[.68rem] text-[hsl(var(--muted-foreground))] animate-rise">
        <Link href="/" className="text-link" data-testid="link-detail-home">الرئيسية</Link><span>/</span><span>{article.category}</span>
      </div>
      <article>
        <div className="detail-hero animate-rise delay-1">
          <img src={article.image} alt={`صورة الخبر: ${article.title}`} />
          <div className="detail-heading">
            <CategoryBadge category={article.category} />
            <h1 data-testid={`heading-news-${article.id}`}>{article.title}</h1>
            <div className="hero-meta"><Clock3 size={12} /> {article.date} <span className="mx-1 opacity-40">•</span> {article.readTime} قراءة</div>
          </div>
        </div>
        <div className="detail-toolbar">
          <SaveButton saved={favoriteIds.includes(article.id)} onClick={() => toggleFavorite(article.id)} />
          <ShareButton onShare={handleShare} />
          {feedback && <span className="feedback flex items-center gap-1"><Check size={14} />{feedback}</span>}
        </div>
        <div className="article-body" data-testid={`article-body-${article.id}`}>
          <p className="font-display text-[1rem] font-semibold leading-[2] text-[hsl(var(--foreground))]">{article.summary}</p>
          {article.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </article>
      <section className="section-gap">
        <SectionHeading title="قد يعجبك أيضاً" />
        <div className="news-list">
          {news.filter((item) => item.id !== article.id).slice(0, 2).map((item) => <NewsCard article={item} saved={favoriteIds.includes(item.id)} onSave={() => toggleFavorite(item.id)} key={item.id} compact />)}
        </div>
      </section>
    </PageFrame>
  );
}