import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Archive, ArrowLeft, ArrowUpRight, CalendarDays, Check, Edit3, FileText, FolderKanban, FolderPlus, ImagePlus, LayoutDashboard, Plus, Radio, RefreshCw, Save, Search, Send, ShieldAlert, Target, Trash2, Trophy, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useParams } from 'wouter';
import { z } from 'zod';
import {
  AdminTransferRequestStatus,
  getGetAdminDashboardQueryKey,
  getGetAdminNewsQueryKey,
  getListAdminCategoriesQueryKey,
  getListAdminMatchesQueryKey,
  getListAdminNewsQueryKey,
  getListAdminTransfersQueryKey,
  useArchiveAdminNews,
  useCreateAdminCategory,
  useCreateAdminMatch,
  useCreateAdminNews,
  useCreateAdminTransfer,
  useDeleteAdminCategory,
  useDeleteAdminNews,
  useDeleteAdminMatch,
  useDeleteAdminTransfer,
  useGetAdminDashboard,
  useGetAdminNews,
  useListAdminCategories,
  useListAdminMatches,
  useListAdminNews,
  useListAdminTransfers,
  useListPlayers,
  usePublishAdminNews,
  useUpdateAdminCategory,
  useUpdateAdminMatch,
  useUpdateAdminNews,
  useUpdateAdminTransfer,
} from '@workspace/api-client-react';
import type { AdminCategoryCreateRequest, AdminMatchRequest, AdminNewsCreateRequest, AdminTransferRequest, Category, Match, News, Transfer } from '@workspace/api-client-react';
import { AdminEmpty, AdminError, AdminHeading, AdminIconButton, AdminLoading, AdminShell, ADMIN_HEADERS, formatDate, formatDateTime, getInitials, StatusPill } from '@/components/admin-ui';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const request = { headers: ADMIN_HEADERS };

function Notice({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return <div className="admin-toast" role="status" data-testid="status-admin-success"><Check size={16} color="hsl(var(--accent))" /><span>{children}</span><button type="button" onClick={onClose} className="mini-icon" data-testid="button-close-notice"><X size={14} /></button></div>;
}

function useNotice() {
  const [notice, setNotice] = useState('');
  return { notice, showNotice: setNotice, clearNotice: () => setNotice('') };
}

function AdminPage({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}

function StatCard({ label, value, caption, icon: Icon }: { label: string; value: number; caption: string; icon: typeof FileText }) {
  return <div className="admin-stat animate-rise" data-testid={`stat-${label}`}><div className="admin-stat-label"><Icon size={14} />{label}</div><strong className="admin-stat-value" data-testid={`value-${label}`}>{value}</strong><span className="admin-stat-caption">{caption}</span></div>;
}

export function AdminOverviewPage() {
  const dashboard = useGetAdminDashboard({ request });
  const { notice, showNotice, clearNotice } = useNotice();
  const latest = dashboard.data?.latestUpdated ?? [];
  return <AdminPage><AdminHeading eyebrow="Editorial desk / 02" title="المشهد العام" description="كل ما يحتاجه فريق التحرير قبل صافرة النشر.">
    <Link href="/admin/news/new" className="admin-btn admin-btn-primary" data-testid="link-create-news"><Plus size={16} /> خبر جديد</Link>
  </AdminHeading>
    <div className="admin-stat-grid">
      <StatCard label="منشور" value={dashboard.data?.publishedCount ?? 0} caption="جاهز للواجهة" icon={Check} />
      <StatCard label="مسودات" value={dashboard.data?.draftCount ?? 0} caption="بانتظار اللمسة الأخيرة" icon={FileText} />
      <StatCard label="عاجل" value={dashboard.data?.breakingCount ?? 0} caption="يحتاج عيناً إضافية" icon={Radio} />
      <StatCard label="مميز" value={dashboard.data?.featuredCount ?? 0} caption="على واجهة الموقع" icon={Target} />
    </div>
    <div className="admin-grid two section-gap">
      <section className="admin-panel animate-rise delay-1">
        <div className="admin-panel-header"><div><h2 className="admin-panel-title">آخر حركة في المكتب</h2><p className="admin-panel-subtitle">أحدث القصص التي تم تعديلها</p></div><Link href="/admin/news" className="admin-btn admin-btn-sm admin-btn-quiet" data-testid="link-overview-news">كل الأخبار <ArrowLeft size={14} /></Link></div>
        <div className="admin-panel-body">{dashboard.isLoading ? <AdminLoading rows={3} /> : dashboard.isError ? <AdminError onRetry={() => dashboard.refetch()} /> : latest.length === 0 ? <AdminEmpty title="المكتب هادئ الآن" description="أنشئ أول قصة وابدأ دورة النشر." action={<Link href="/admin/news/new" className="admin-btn admin-btn-primary" data-testid="link-empty-create-news">إنشاء قصة</Link>} /> : <div className="admin-list">{latest.map((item) => <NewsRow key={item.id} news={item} compact />)}</div>}</div>
      </section>
      <section className="admin-panel animate-rise delay-2">
        <div className="admin-panel-header"><div><h2 className="admin-panel-title">فحص ما قبل النشر</h2><p className="admin-panel-subtitle">ثلاث إشارات سريعة قبل أن تخرج القصة</p></div><ShieldAlert size={17} color="hsl(var(--accent))" /></div>
        <div className="admin-panel-body admin-list">
          <Signal icon={FileText} title="المسودات" detail={`${dashboard.data?.draftCount ?? 0} قصص تنتظر قراراً`} />
          <Signal icon={Radio} title="نبض عاجل" detail={`${dashboard.data?.breakingCount ?? 0} أخبار تحمل وسم عاجل`} />
          <Signal icon={Trophy} title="المباراة القادمة" detail="حدّث الموعد والملعب من مركز المباريات" />
        </div>
      </section>
    </div>
    <section className="admin-panel section-gap animate-rise delay-3">
      <div className="admin-panel-header"><div><h2 className="admin-panel-title">إيقاع اليوم</h2><p className="admin-panel-subtitle">الوصول التطويري المؤقت مفعّل — كل تغيير يذهب مباشرة إلى API المحلي.</p></div><ActivityMark /></div>
      <div className="admin-panel-body"><div className="admin-kpi-line"><span>جاهزية غرفة الأخبار</span><span style={{ marginInlineStart: 'auto', color: 'hsl(var(--accent))' }}>{dashboard.data ? 'مستقرة' : 'جار الفحص'}</span></div><div className="admin-meter"><span style={{ width: dashboard.data ? '78%' : '34%' }} /></div></div>
    </section>
    {notice && <Notice onClose={clearNotice}>{notice}</Notice>}
  </AdminPage>;
}

function Signal({ icon: Icon, title, detail }: { icon: typeof FileText; title: string; detail: string }) {
  return <div className="signal-card" data-testid={`signal-${title}`}><div className="signal-icon"><Icon size={17} /></div><div><strong>{title}</strong><span>{detail}</span></div></div>;
}
function ActivityMark() { return <div className="signal-icon"><RefreshCw size={16} /></div>; }

function NewsRow({ news, compact = false, onPublish, onArchive, onDelete }: { news: News; compact?: boolean; onPublish?: () => void; onArchive?: () => void; onDelete?: () => void }) {
  const [location] = useLocation();
  return <div className="admin-row" data-testid={`row-news-${news.id}`}>
    <div className="signal-icon" style={{ width: compact ? 34 : 38, height: compact ? 34 : 38 }}><FileText size={15} /></div>
    <div className="admin-row-main"><Link href={`/admin/news/${news.id}/edit`} className="admin-row-title" data-testid={`link-edit-news-${news.id}`}>{news.titleAr}</Link><div className="admin-row-meta"><span>{news.categoryNameAr}</span><span>{formatDate(news.updatedAt)}</span>{news.isBreaking && <span style={{ color: 'hsl(var(--primary))' }}>عاجل</span>}</div></div>
    <StatusPill status={news.status} label={news.status === 'published' ? 'منشور' : news.status === 'draft' ? 'مسودة' : 'مؤرشف'} />
    {!compact && <div className="admin-row-actions">{news.status === 'draft' && onPublish && <AdminIconButton label={`نشر-${news.id}`} onClick={onPublish}><ArrowUpRight size={14} /></AdminIconButton>}{news.status !== 'archived' && onArchive && <AdminIconButton label={`أرشفة-${news.id}`} onClick={onArchive}><Archive size={14} /></AdminIconButton>}{onDelete && <AdminIconButton label={`حذف-${news.id}`} onClick={onDelete} danger><Trash2 size={14} /></AdminIconButton>}</div>}
  </div>;
}

export function AdminNewsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState('');
  const queryClient = useQueryClient();
  const params = useMemo(() => ({ search: search || undefined, status: status === 'all' ? undefined : status, page, pageSize: 8 }), [search, status, page]);
  const news = useListAdminNews(params, { request });
  const publish = usePublishAdminNews({ request });
  const archive = useArchiveAdminNews({ request });
  const remove = useDeleteAdminNews({ request });
  const invalidate = () => { queryClient.invalidateQueries({ queryKey: getListAdminNewsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() }); };
  const act = (kind: 'publish' | 'archive' | 'delete', id: number) => {
    if (kind === 'delete' && !window.confirm('حذف هذه القصة نهائياً؟')) return;
    const options = { onSuccess: () => { invalidate(); setNotice(kind === 'publish' ? 'تم نشر القصة.' : kind === 'archive' ? 'تمت أرشفة القصة.' : 'تم حذف القصة.'); }, onError: () => setNotice('لم يكتمل الإجراء. تحقق من الاتصال ثم حاول مجدداً.') };
    if (kind === 'publish') publish.mutate({ id }, options);
    if (kind === 'archive') archive.mutate({ id }, options);
    if (kind === 'delete') remove.mutate({ id }, options);
  };
  const items = news.data?.items ?? [];
  return <AdminPage><AdminHeading eyebrow="Editorial desk / news" title="غرفة الأخبار" description="حرّر، راجع، ثم ادفع القصة إلى الواجهة دون مغادرة المكتب."><Link href="/admin/news/new" className="admin-btn admin-btn-primary" data-testid="link-news-create"><Plus size={16} /> قصة جديدة</Link></AdminHeading>
    <div className="admin-toolbar"><div className="admin-search"><Search size={16} /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="ابحث في العناوين..." aria-label="بحث الأخبار" data-testid="input-search-news" /></div><select className="admin-select" style={{ width: 'auto', minWidth: 142 }} value={status} onChange={(e) => { setStatus(e.target.value as typeof status); setPage(1); }} aria-label="فلترة الحالة" data-testid="select-news-status"><option value="all">كل الحالات</option><option value="draft">مسودات</option><option value="published">منشورة</option><option value="archived">مؤرشفة</option></select></div>
    <section className="admin-panel"><div className="admin-panel-header"><div><h2 className="admin-panel-title">سجل القصص</h2><p className="admin-panel-subtitle" data-testid="text-news-total">{news.data?.total ?? 0} قصة في الأرشيف التحريري</p></div><span className="admin-eyebrow">LIVE DESK</span></div><div className="admin-panel-body">{news.isLoading ? <AdminLoading /> : news.isError ? <AdminError onRetry={() => news.refetch()} /> : items.length === 0 ? <AdminEmpty title="لا توجد قصص مطابقة" description="جرّب تغيير البحث أو الفلتر، أو ابدأ قصة جديدة." action={<Link href="/admin/news/new" className="admin-btn admin-btn-primary" data-testid="link-news-empty-create"><Plus size={14} /> قصة جديدة</Link>} /> : <div className="admin-list">{items.map((item) => <NewsRow key={item.id} news={item} onPublish={() => act('publish', item.id)} onArchive={() => act('archive', item.id)} onDelete={() => act('delete', item.id)} />)}</div>}</div></section>
    <div className="admin-pagination"><span>صفحة {news.data?.page ?? page} من {Math.max(1, Math.ceil((news.data?.total ?? 0) / 8))}</span><div className="admin-heading-actions"><button type="button" className="admin-btn admin-btn-sm admin-btn-quiet" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} data-testid="button-news-previous">السابق</button><button type="button" className="admin-btn admin-btn-sm admin-btn-quiet" disabled={page >= Math.ceil((news.data?.total ?? 0) / 8)} onClick={() => setPage((value) => value + 1)} data-testid="button-news-next">التالي</button></div></div>
    {notice && <Notice onClose={() => setNotice('')}>{notice}</Notice>}
  </AdminPage>;
}

const articleSchema = z.object({ titleAr: z.string().min(1, 'العنوان مطلوب'), summaryAr: z.string().min(1, 'الملخص مطلوب'), bodyAr: z.string().min(1, 'نص الخبر مطلوب'), categoryId: z.coerce.number().min(1, 'اختر تصنيفاً'), coverImagePath: z.string().nullable(), imageAltAr: z.string().nullable(), tagsText: z.string(), isFeatured: z.boolean(), isBreaking: z.boolean(), readingMinutes: z.coerce.number().nullable() });
type ArticleValues = z.infer<typeof articleSchema>;

const blankArticle: ArticleValues = { titleAr: '', summaryAr: '', bodyAr: '', categoryId: 0, coverImagePath: null, imageAltAr: null, tagsText: '', isFeatured: false, isBreaking: false, readingMinutes: 3 };

export function AdminNewsEditorPage() {
  const params = useParams<{ id?: string }>();
  const isNew = !params.id || params.id === 'new';
  const id = isNew ? 0 : Number(params.id);
  const article = useGetAdminNews(id, { request, query: { enabled: !isNew, queryKey: getGetAdminNewsQueryKey(id) } });
  const categories = useListAdminCategories({ request });
  const create = useCreateAdminNews({ request });
  const update = useUpdateAdminNews({ request });
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [notice, setNotice] = useState('');
  const form = useForm<ArticleValues>({ resolver: zodResolver(articleSchema), defaultValues: blankArticle });
  useEffect(() => {
    if (article.data) form.reset({ ...article.data, tagsText: article.data.tags.join(', '), coverImagePath: article.data.coverImagePath, imageAltAr: article.data.imageAltAr, readingMinutes: article.data.readingMinutes ?? 3 });
  }, [article.data, form]);
  const onSubmit = (values: ArticleValues) => {
    const payload: AdminNewsCreateRequest = { titleAr: values.titleAr, summaryAr: values.summaryAr, bodyAr: values.bodyAr, categoryId: Number(values.categoryId), coverImagePath: values.coverImagePath || null, imageAltAr: values.imageAltAr || null, tags: values.tagsText.split(',').map((tag) => tag.trim()).filter(Boolean), isFeatured: values.isFeatured, isBreaking: values.isBreaking, readingMinutes: values.readingMinutes ? Number(values.readingMinutes) : null };
    const onSuccess = (saved: News) => { queryClient.invalidateQueries({ queryKey: getListAdminNewsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() }); setNotice('تم حفظ القصة بنجاح.'); if (isNew) setLocation(`/admin/news/${saved.id}/edit`); };
    if (isNew) create.mutate({ data: payload }, { onSuccess, onError: () => setNotice('تعذر حفظ القصة. راجع الحقول ثم حاول مجدداً.') }); else update.mutate({ id, data: payload }, { onSuccess, onError: () => setNotice('تعذر تحديث القصة. حاول مجدداً.') });
  };
  const saving = create.isPending || update.isPending;
  return <AdminPage><AdminHeading eyebrow={isNew ? 'Editorial desk / new story' : 'Editorial desk / edit story'} title={isNew ? 'قصة جديدة' : 'تحرير القصة'} description={isNew ? 'من الفكرة إلى مسودة واضحة، كل الحقول هنا تخدم سرعة النشر.' : `آخر تعديل ${formatDateTime(article.data?.updatedAt)}`}><Link href="/admin/news" className="admin-btn admin-btn-quiet" data-testid="link-back-news"><ArrowLeft size={15} /> العودة للأخبار</Link></AdminHeading>
    {!isNew && article.isLoading ? <AdminLoading rows={5} /> : !isNew && article.isError ? <AdminError onRetry={() => article.refetch()} /> : <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="editor-layout" data-testid="form-news-editor">
      <section className="admin-panel"><div className="admin-panel-header"><div><h2 className="admin-panel-title">محرر القصة</h2><p className="admin-panel-subtitle">اكتب بالعربية؛ الحقول المطلوبة بعلامة واضحة.</p></div><StatusPill status={isNew ? 'draft' : article.data?.status ?? 'draft'} label={isNew ? 'مسودة جديدة' : article.data?.status === 'published' ? 'منشور' : article.data?.status === 'archived' ? 'مؤرشف' : 'مسودة'} /></div><div className="admin-panel-body admin-form-grid">
        <FormField control={form.control} name="titleAr" render={({ field }) => <FormItem className="admin-field"><FormLabel>العنوان <span>*</span></FormLabel><FormControl><input {...field} className="admin-input" placeholder="مثال: برشلونة يحسم ليلة مونتجويك..." data-testid="input-news-title" /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="summaryAr" render={({ field }) => <FormItem className="admin-field"><FormLabel>الملخص <span>*</span></FormLabel><FormControl><textarea {...field} className="admin-textarea" style={{ minHeight: 84 }} placeholder="سطران يلتقطان جوهر الخبر..." data-testid="textarea-news-summary" /></FormControl><FormMessage /></FormItem>} />
        <FormField control={form.control} name="bodyAr" render={({ field }) => <FormItem className="admin-field"><FormLabel>نص الخبر <span>*</span></FormLabel><FormControl><textarea {...field} className="admin-textarea" style={{ minHeight: 250 }} placeholder="اكتب التفاصيل، السياق، وما يجب أن يعرفه القارئ..." data-testid="textarea-news-body" /></FormControl><FormMessage /></FormItem>} />
        <div className="admin-form-footer"><button type="submit" className="admin-btn admin-btn-primary" disabled={saving} data-testid="button-save-news"><Save size={15} />{saving ? 'جار الحفظ...' : 'حفظ القصة'}</button><Link href="/admin/news" className="admin-btn admin-btn-quiet" data-testid="link-cancel-news">إلغاء</Link></div>
      </div></section>
      <aside className="editor-aside">
        <section className="admin-panel"><div className="admin-panel-header"><h2 className="admin-panel-title">بطاقة النشر</h2><SettingsLabel /></div><div className="admin-panel-body admin-form-grid">
          <FormField control={form.control} name="categoryId" render={({ field }) => <FormItem className="admin-field"><FormLabel>التصنيف <span>*</span></FormLabel><FormControl><select className="admin-select" value={String(field.value)} onChange={(e) => field.onChange(Number(e.target.value))} data-testid="select-news-category"><option value="0">اختر التصنيف</option>{(categories.data ?? []).map((cat) => <option key={cat.id} value={cat.id}>{cat.nameAr}</option>)}</select></FormControl><FormMessage /></FormItem>} />
          <FormField control={form.control} name="readingMinutes" render={({ field }) => <FormItem className="admin-field"><FormLabel>دقائق القراءة</FormLabel><FormControl><input {...field} value={field.value ?? ''} type="number" min="1" max="60" className="admin-input" data-testid="input-news-reading-minutes" /></FormControl></FormItem>} />
          <FormField control={form.control} name="tagsText" render={({ field }) => <FormItem className="admin-field"><FormLabel>الوسوم</FormLabel><FormControl><input {...field} className="admin-input" placeholder="برشلونة، لاليغا، تشافي" data-testid="input-news-tags" /></FormControl></FormItem>} />
          <FormField control={form.control} name="isFeatured" render={({ field }) => <label className="admin-check"><input type="checkbox" checked={field.value} onChange={field.onChange} data-testid="checkbox-news-featured" /> قصة مميزة على الواجهة</label>} />
          <FormField control={form.control} name="isBreaking" render={({ field }) => <label className="admin-check"><input type="checkbox" checked={field.value} onChange={field.onChange} data-testid="checkbox-news-breaking" /> خبر عاجل</label>} />
        </div></section>
        <section className="admin-panel"><div className="admin-panel-header"><h2 className="admin-panel-title">الغلاف</h2><ImagePlus size={16} color="hsl(var(--accent))" /></div><div className="admin-panel-body admin-form-grid"><FormField control={form.control} name="coverImagePath" render={({ field }) => <FormItem className="admin-field"><FormLabel>مسار الصورة</FormLabel><FormControl><input {...field} value={field.value ?? ''} className="admin-input" placeholder="/uploads/story.jpg" data-testid="input-news-cover" /></FormControl></FormItem>} /><FormField control={form.control} name="imageAltAr" render={({ field }) => <FormItem className="admin-field"><FormLabel>وصف الصورة</FormLabel><FormControl><input {...field} value={field.value ?? ''} className="admin-input" placeholder="وصف عربي للصورة" data-testid="input-news-image-alt" /></FormControl></FormItem>} /><div className="cover-preview" data-testid="preview-news-cover">{form.watch('coverImagePath') ? <img src={form.watch('coverImagePath') ?? ''} alt={form.watch('imageAltAr') ?? 'معاينة الغلاف'} /> : <><ImagePlus size={18} /><span>أضف مسار الغلاف لمعاينته</span></>}</div></div></section>
      </aside>
    </form></Form>}
    {notice && <Notice onClose={() => setNotice('')}>{notice}</Notice>}
  </AdminPage>;
}

function SettingsLabel() { return <span className="admin-eyebrow">SETUP</span>; }

const categorySchema = z.object({ slug: z.string().min(1, 'المعرّف مطلوب'), nameAr: z.string().min(1, 'الاسم العربي مطلوب'), nameEn: z.string(), sortOrder: z.coerce.number().min(0), isActive: z.boolean() });
type CategoryValues = z.infer<typeof categorySchema>;

export function AdminCategoriesPage() {
  const categories = useListAdminCategories({ request });
  const create = useCreateAdminCategory({ request });
  const update = useUpdateAdminCategory({ request });
  const remove = useDeleteAdminCategory({ request });
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Category | null>(null);
  const [notice, setNotice] = useState('');
  const form = useForm<CategoryValues>({ resolver: zodResolver(categorySchema), defaultValues: { slug: '', nameAr: '', nameEn: '', sortOrder: 0, isActive: true } });
  useEffect(() => { if (editing) form.reset({ slug: editing.slug, nameAr: editing.nameAr, nameEn: editing.nameEn ?? '', sortOrder: editing.sortOrder, isActive: editing.isActive }); else form.reset({ slug: '', nameAr: '', nameEn: '', sortOrder: 0, isActive: true }); }, [editing, form]);
  const submit = (values: CategoryValues) => { const data: AdminCategoryCreateRequest = { ...values, nameEn: values.nameEn || null, sortOrder: Number(values.sortOrder) }; const success = () => { queryClient.invalidateQueries({ queryKey: getListAdminCategoriesQueryKey() }); setEditing(null); setNotice('تم حفظ التصنيف.'); }; if (editing) update.mutate({ id: editing.id, data }, { onSuccess: success, onError: () => setNotice('تعذر حفظ التصنيف.') }); else create.mutate({ data }, { onSuccess: success, onError: () => setNotice('تعذر إنشاء التصنيف.') }); };
  return <AdminPage><AdminHeading eyebrow="Editorial desk / taxonomy" title="التصنيفات" description="رتّب الواجهة التحريرية بلغة واضحة ومتسقة."><button type="button" className="admin-btn admin-btn-primary" onClick={() => setEditing(null)} data-testid="button-new-category"><FolderPlus size={15} /> تصنيف جديد</button></AdminHeading>
     <div className="admin-grid two"><section className="admin-panel"><div className="admin-panel-header"><div><h2 className="admin-panel-title">دليل التصنيفات</h2><p className="admin-panel-subtitle">{categories.data?.length ?? 0} تصنيفات معرفة</p></div><LayoutDashboard size={16} color="hsl(var(--accent))" /></div><div className="admin-panel-body">{categories.isLoading ? <AdminLoading rows={3} /> : categories.isError ? <AdminError onRetry={() => categories.refetch()} /> : (categories.data ?? []).length === 0 ? <AdminEmpty icon={FolderPlus} title="لا تصنيفات بعد" description="أضف تصنيفاً ليسهل على المحررين توجيه القصة." /> : <div className="admin-list">{(categories.data ?? []).map((cat) => <div className="admin-row" key={cat.id} data-testid={`row-category-${cat.id}`}><div className="signal-icon"><FolderKanban size={15} /></div><div className="admin-row-main"><strong className="admin-row-title">{cat.nameAr}</strong><div className="admin-row-meta"><span>{cat.nameEn || cat.slug}</span><span>ترتيب {cat.sortOrder}</span></div></div><StatusPill status={cat.isActive ? 'published' : 'archived'} label={cat.isActive ? 'نشط' : 'متوقف'} /><AdminIconButton label={`تعديل-تصنيف-${cat.id}`} onClick={() => setEditing(cat)}><Edit3 size={14} /></AdminIconButton><AdminIconButton label={`حذف-تصنيف-${cat.id}`} danger onClick={() => { if (window.confirm('حذف هذا التصنيف؟ سيُرفض الحذف إذا كانت له أخبار مرتبطة.')) remove.mutate({ id: cat.id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListAdminCategoriesQueryKey() }); setNotice('تم حذف التصنيف.'); }, onError: () => setNotice('تعذر حذف التصنيف؛ عطّله إذا كان مرتبطاً بأخبار.') }); }}><Trash2 size={14} /></AdminIconButton></div>)}</div>}</div></section>
      <section className="admin-panel"><div className="admin-panel-header"><div><h2 className="admin-panel-title">{editing ? 'تعديل التصنيف' : 'إضافة تصنيف'}</h2><p className="admin-panel-subtitle">المعرّف يظهر في روابط المحتوى.</p></div>{editing && <button type="button" className="mini-icon" onClick={() => setEditing(null)} data-testid="button-close-category-form"><X size={16} /></button>}</div><div className="admin-panel-body"><Form {...form}><form onSubmit={form.handleSubmit(submit)} className="admin-form-grid"><FormField control={form.control} name="nameAr" render={({ field }) => <FormItem className="admin-field"><FormLabel>الاسم بالعربية <span>*</span></FormLabel><FormControl><input {...field} className="admin-input" data-testid="input-category-name-ar" /></FormControl><FormMessage /></FormItem>} /><FormField control={form.control} name="nameEn" render={({ field }) => <FormItem className="admin-field"><FormLabel>الاسم بالإنجليزية</FormLabel><FormControl><input {...field} className="admin-input" data-testid="input-category-name-en" /></FormControl></FormItem>} /><FormField control={form.control} name="slug" render={({ field }) => <FormItem className="admin-field"><FormLabel>المعرّف <span>*</span></FormLabel><FormControl><input {...field} dir="ltr" className="admin-input" data-testid="input-category-slug" /></FormControl><FormMessage /></FormItem>} /><div className="admin-form-grid two"><FormField control={form.control} name="sortOrder" render={({ field }) => <FormItem className="admin-field"><FormLabel>الترتيب</FormLabel><FormControl><input {...field} type="number" className="admin-input" data-testid="input-category-order" /></FormControl></FormItem>} /><FormField control={form.control} name="isActive" render={({ field }) => <label className="admin-check"><input type="checkbox" checked={field.value} onChange={field.onChange} data-testid="checkbox-category-active" /> تصنيف نشط</label>} /></div><button type="submit" className="admin-btn admin-btn-primary" disabled={create.isPending || update.isPending} data-testid="button-save-category"><Save size={15} /> حفظ التصنيف</button></form></Form></div></section></div>
    {notice && <Notice onClose={() => setNotice('')}>{notice}</Notice>}
  </AdminPage>;
}

const transferSchema = z.object({ playerId: z.string(), playerNameAr: z.string().min(1, 'اسم اللاعب مطلوب'), position: z.string(), fromClub: z.string(), toClub: z.string().min(1, 'النادي الوجهة مطلوب'), feeAmount: z.string(), feeCurrency: z.string(), feeLabelAr: z.string(), status: z.string(), confidence: z.coerce.number().min(0).max(100), notesAr: z.string(), announcedAt: z.string() });
type TransferValues = z.infer<typeof transferSchema>;
const emptyTransfer: TransferValues = { playerId: '', playerNameAr: '', position: '', fromClub: '', toClub: 'برشلونة', feeAmount: '', feeCurrency: 'EUR', feeLabelAr: '', status: 'rumor', confidence: 50, notesAr: '', announcedAt: '' };

export function AdminTransfersPage() {
  const transfers = useListAdminTransfers({ request });
  const players = useListPlayers({ pageSize: 50 }, { request });
  const create = useCreateAdminTransfer({ request });
  const update = useUpdateAdminTransfer({ request });
  const remove = useDeleteAdminTransfer({ request });
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Transfer | null>(null);
  const [notice, setNotice] = useState('');
  const form = useForm<TransferValues>({ resolver: zodResolver(transferSchema), defaultValues: emptyTransfer });
  useEffect(() => { form.reset(editing ? { playerId: String(editing.playerId ?? ''), playerNameAr: editing.playerNameAr, position: editing.position ?? '', fromClub: editing.fromClub ?? '', toClub: editing.toClub, feeAmount: editing.feeAmount == null ? '' : String(editing.feeAmount), feeCurrency: editing.feeCurrency ?? 'EUR', feeLabelAr: editing.feeLabelAr ?? '', status: editing.status, confidence: editing.confidence, notesAr: editing.notesAr ?? '', announcedAt: editing.announcedAt?.slice(0, 10) ?? '' } : emptyTransfer); }, [editing, form]);
  const submit = (values: TransferValues) => { const data: AdminTransferRequest = { playerId: values.playerId ? Number(values.playerId) : null, playerNameAr: values.playerNameAr, position: values.position || null, fromClub: values.fromClub || null, toClub: values.toClub, feeAmount: values.feeAmount ? Number(values.feeAmount) : null, feeCurrency: values.feeCurrency || null, feeLabelAr: values.feeLabelAr || null, status: values.status as AdminTransferRequestStatus, confidence: Number(values.confidence), notesAr: values.notesAr || null, announcedAt: values.announcedAt ? new Date(values.announcedAt).toISOString() : null }; const success = () => { queryClient.invalidateQueries({ queryKey: getListAdminTransfersQueryKey() }); setEditing(null); setNotice('تم تحديث نبض الانتقال.'); }; if (editing) update.mutate({ id: editing.id, data }, { onSuccess: success, onError: () => setNotice('تعذر تحديث الانتقال.') }); else create.mutate({ data }, { onSuccess: success, onError: () => setNotice('تعذر إضافة الانتقال.') }); };
  const list = transfers.data ?? [];
  return <AdminPage><AdminHeading eyebrow="Editorial desk / market" title="سوق الانتقالات" description="سجّل الخبر، درجة الثقة، ومسار الصفقة قبل أن تتحول الشائعة إلى عنوان."><button type="button" className="admin-btn admin-btn-primary" onClick={() => setEditing(null)} data-testid="button-new-transfer"><Plus size={15} /> إضافة انتقال</button></AdminHeading>
    <div className="admin-grid two"><section className="admin-panel"><div className="admin-panel-header"><div><h2 className="admin-panel-title">نبض السوق</h2><p className="admin-panel-subtitle">{list.length} تحديثات مسجلة</p></div><Send size={16} color="hsl(var(--accent))" /></div><div className="admin-panel-body">{transfers.isLoading ? <AdminLoading /> : transfers.isError ? <AdminError onRetry={() => transfers.refetch()} /> : list.length === 0 ? <AdminEmpty icon={Send} title="لا تحديثات في السوق" description="أضف أول ملف انتقال لتغذية الواجهة." /> : <div className="admin-list">{list.map((item) => <div className="admin-row" key={item.id} data-testid={`row-transfer-${item.id}`}><div className="player-token">{getInitials(item.playerNameAr)}</div><div className="admin-row-main"><strong className="admin-row-title">{item.playerNameAr}</strong><div className="admin-row-meta"><span>{item.fromClub || 'غير معروف'} ← {item.toClub}</span><span>ثقة {item.confidence}%</span></div></div><StatusPill status={item.status} label={item.status === 'completed' ? 'تمت' : item.status === 'negotiation' ? 'مفاوضات' : 'شائعة'} /><AdminIconButton label={`تعديل-انتقال-${item.id}`} onClick={() => setEditing(item)}><Edit3 size={14} /></AdminIconButton><AdminIconButton label={`حذف-انتقال-${item.id}`} danger onClick={() => { if (window.confirm('حذف هذا التحديث؟')) remove.mutate({ id: item.id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListAdminTransfersQueryKey() }); setNotice('تم حذف التحديث.'); } }); }}><Trash2 size={14} /></AdminIconButton></div>)}</div>}</div></section>
      <section className="admin-panel"><div className="admin-panel-header"><div><h2 className="admin-panel-title">{editing ? 'تحرير الانتقال' : 'إضافة انتقال'}</h2><p className="admin-panel-subtitle">اللاعبون النشطون متاحون للاختيار.</p></div>{editing && <button type="button" className="mini-icon" onClick={() => setEditing(null)} data-testid="button-close-transfer-form"><X size={16} /></button>}</div><div className="admin-panel-body"><Form {...form}><form onSubmit={form.handleSubmit(submit)} className="admin-form-grid two"><FormField control={form.control} name="playerId" render={({ field }) => <FormItem className="admin-field"><FormLabel>اللاعب</FormLabel><FormControl><select className="admin-select" value={field.value} onChange={(e) => { field.onChange(e.target.value); const player = (players.data ?? []).find((p) => String(p.id) === e.target.value); if (player) { form.setValue('playerNameAr', player.nameAr); form.setValue('position', player.position); } }} data-testid="select-transfer-player"><option value="">اختر لاعباً</option>{(players.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.nameAr}</option>)}</select></FormControl></FormItem>} /><FormField control={form.control} name="playerNameAr" render={({ field }) => <FormItem className="admin-field"><FormLabel>اسم اللاعب <span>*</span></FormLabel><FormControl><input {...field} className="admin-input" data-testid="input-transfer-player-name" /></FormControl><FormMessage /></FormItem>} /><FormField control={form.control} name="fromClub" render={({ field }) => <FormItem className="admin-field"><FormLabel>من نادي</FormLabel><FormControl><input {...field} className="admin-input" data-testid="input-transfer-from" /></FormControl></FormItem>} /><FormField control={form.control} name="toClub" render={({ field }) => <FormItem className="admin-field"><FormLabel>إلى نادي <span>*</span></FormLabel><FormControl><input {...field} className="admin-input" data-testid="input-transfer-to" /></FormControl><FormMessage /></FormItem>} /><FormField control={form.control} name="status" render={({ field }) => <FormItem className="admin-field"><FormLabel>الحالة</FormLabel><FormControl><select {...field} className="admin-select" data-testid="select-transfer-status"><option value="rumor">شائعة</option><option value="negotiation">مفاوضات</option><option value="completed">تمت</option></select></FormControl></FormItem>} /><FormField control={form.control} name="confidence" render={({ field }) => <FormItem className="admin-field"><FormLabel>الثقة: {field.value}%</FormLabel><FormControl><input {...field} type="range" min="0" max="100" className="w-full accent-[hsl(var(--accent))]" data-testid="input-transfer-confidence" /></FormControl></FormItem>} /><FormField control={form.control} name="feeLabelAr" render={({ field }) => <FormItem className="admin-field"><FormLabel>وصف الصفقة</FormLabel><FormControl><input {...field} className="admin-input" placeholder="إعارة مع أحقية الشراء" data-testid="input-transfer-fee-label" /></FormControl></FormItem>} /><FormField control={form.control} name="notesAr" render={({ field }) => <FormItem className="admin-field" style={{ gridColumn: '1 / -1' }}><FormLabel>ملاحظات</FormLabel><FormControl><textarea {...field} className="admin-textarea" data-testid="textarea-transfer-notes" /></FormControl></FormItem>} /><button type="submit" className="admin-btn admin-btn-primary" disabled={create.isPending || update.isPending} data-testid="button-save-transfer"><Save size={15} /> حفظ التحديث</button></form></Form></div></section></div>
    {notice && <Notice onClose={() => setNotice('')}>{notice}</Notice>}
  </AdminPage>;
}

const matchSchema = z.object({ competition: z.string().min(1, 'المسابقة مطلوبة'), homeTeam: z.string().min(1, 'الفريق المضيف مطلوب'), awayTeam: z.string().min(1, 'الفريق الضيف مطلوب'), homeShort: z.string(), awayShort: z.string(), kickoffAt: z.string().min(1, 'الموعد مطلوب'), venue: z.string(), status: z.string(), homeScore: z.string(), awayScore: z.string() });
type MatchValues = z.infer<typeof matchSchema>;
const emptyMatch: MatchValues = { competition: '', homeTeam: 'برشلونة', awayTeam: '', homeShort: 'BAR', awayShort: '', kickoffAt: '', venue: 'ملعب لويس كومبانيس الأولمبي', status: 'scheduled', homeScore: '', awayScore: '' };

export function AdminMatchesPage() {
  const matches = useListAdminMatches({ request });
  const create = useCreateAdminMatch({ request });
  const update = useUpdateAdminMatch({ request });
  const remove = useDeleteAdminMatch({ request });
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Match | null>(null);
  const [notice, setNotice] = useState('');
  const form = useForm<MatchValues>({ resolver: zodResolver(matchSchema), defaultValues: emptyMatch });
  useEffect(() => { form.reset(editing ? { competition: editing.competition, homeTeam: editing.homeTeam, awayTeam: editing.awayTeam, homeShort: editing.homeShort ?? '', awayShort: editing.awayShort ?? '', kickoffAt: editing.kickoffAt.slice(0, 16), venue: editing.venue ?? '', status: editing.status, homeScore: editing.homeScore == null ? '' : String(editing.homeScore), awayScore: editing.awayScore == null ? '' : String(editing.awayScore) } : emptyMatch); }, [editing, form]);
  const submit = (values: MatchValues) => { const data: AdminMatchRequest = { ...values, homeShort: values.homeShort || null, awayShort: values.awayShort || null, venue: values.venue || null, kickoffAt: new Date(values.kickoffAt).toISOString(), status: values.status as AdminMatchRequest['status'], homeScore: values.homeScore === '' ? null : Number(values.homeScore), awayScore: values.awayScore === '' ? null : Number(values.awayScore) }; const success = () => { queryClient.invalidateQueries({ queryKey: getListAdminMatchesQueryKey() }); setEditing(null); setNotice('تم حفظ المباراة.'); }; if (editing) update.mutate({ id: editing.id, data }, { onSuccess: success, onError: () => setNotice('تعذر تحديث المباراة.') }); else create.mutate({ data }, { onSuccess: success, onError: () => setNotice('تعذر إضافة المباراة.') }); };
  const list = matches.data ?? [];
  return <AdminPage><AdminHeading eyebrow="Editorial desk / fixtures" title="المباريات" description="ثبّت الموعد والنتيجة والحالة كي يبقى شريط المباريات دقيقاً."><button type="button" className="admin-btn admin-btn-primary" onClick={() => setEditing(null)} data-testid="button-new-match"><Plus size={15} /> مباراة جديدة</button></AdminHeading>
     <div className="admin-grid two"><section className="admin-panel"><div className="admin-panel-header"><div><h2 className="admin-panel-title">روزنامة الفريق</h2><p className="admin-panel-subtitle">{list.length} مباريات في السجل</p></div><CalendarDays size={16} color="hsl(var(--accent))" /></div><div className="admin-panel-body">{matches.isLoading ? <AdminLoading /> : matches.isError ? <AdminError onRetry={() => matches.refetch()} /> : list.length === 0 ? <AdminEmpty icon={CalendarDays} title="لا مباريات مسجلة" description="أضف المواجهة القادمة لتظهر في الواجهة." /> : <div className="admin-list">{list.map((item) => <div className="admin-row" key={item.id} data-testid={`row-match-${item.id}`}><div className="team-badge" style={{ width: 38, height: 38, fontSize: '.65rem' }}>{item.homeShort || 'H'}</div><div className="admin-row-main"><strong className="admin-row-title">{item.homeTeam} <span style={{ color: 'hsl(var(--accent))' }}>×</span> {item.awayTeam}</strong><div className="admin-row-meta"><span>{item.competition}</span><span>{formatDateTime(item.kickoffAt)}</span></div></div><StatusPill status={item.status} label={item.status === 'live' ? 'مباشر' : item.status === 'finished' ? 'منتهية' : item.status === 'scheduled' ? 'قادمة' : item.status === 'postponed' ? 'مؤجلة' : 'ملغاة'} />{item.status === 'finished' && <strong style={{ color: 'hsl(var(--accent))' }}>{item.homeScore} — {item.awayScore}</strong>}<AdminIconButton label={`تعديل-مباراة-${item.id}`} onClick={() => setEditing(item)}><Edit3 size={14} /></AdminIconButton><AdminIconButton label={`حذف-مباراة-${item.id}`} danger onClick={() => { if (window.confirm('حذف هذه المباراة؟')) remove.mutate({ id: item.id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListAdminMatchesQueryKey() }); setNotice('تم حذف المباراة.'); }, onError: () => setNotice('تعذر حذف المباراة.') }); }}><Trash2 size={14} /></AdminIconButton></div>)}</div>}</div></section>
      <section className="admin-panel"><div className="admin-panel-header"><div><h2 className="admin-panel-title">{editing ? 'تعديل المباراة' : 'إضافة مباراة'}</h2><p className="admin-panel-subtitle">الموعد محفوظ بتوقيت الخادم.</p></div>{editing && <button type="button" className="mini-icon" onClick={() => setEditing(null)} data-testid="button-close-match-form"><X size={16} /></button>}</div><div className="admin-panel-body"><Form {...form}><form onSubmit={form.handleSubmit(submit)} className="admin-form-grid two"><FormField control={form.control} name="competition" render={({ field }) => <FormItem className="admin-field"><FormLabel>المسابقة <span>*</span></FormLabel><FormControl><input {...field} className="admin-input" placeholder="الدوري الإسباني" data-testid="input-match-competition" /></FormControl><FormMessage /></FormItem>} /><FormField control={form.control} name="kickoffAt" render={({ field }) => <FormItem className="admin-field"><FormLabel>موعد البداية <span>*</span></FormLabel><FormControl><input {...field} type="datetime-local" dir="ltr" className="admin-input" data-testid="input-match-kickoff" /></FormControl><FormMessage /></FormItem>} /><FormField control={form.control} name="homeTeam" render={({ field }) => <FormItem className="admin-field"><FormLabel>المضيف <span>*</span></FormLabel><FormControl><input {...field} className="admin-input" data-testid="input-match-home" /></FormControl><FormMessage /></FormItem>} /><FormField control={form.control} name="awayTeam" render={({ field }) => <FormItem className="admin-field"><FormLabel>الضيف <span>*</span></FormLabel><FormControl><input {...field} className="admin-input" data-testid="input-match-away" /></FormControl><FormMessage /></FormItem>} /><FormField control={form.control} name="homeShort" render={({ field }) => <FormItem className="admin-field"><FormLabel>اختصار المضيف</FormLabel><FormControl><input {...field} dir="ltr" className="admin-input" data-testid="input-match-home-short" /></FormControl></FormItem>} /><FormField control={form.control} name="awayShort" render={({ field }) => <FormItem className="admin-field"><FormLabel>اختصار الضيف</FormLabel><FormControl><input {...field} dir="ltr" className="admin-input" data-testid="input-match-away-short" /></FormControl></FormItem>} /><FormField control={form.control} name="status" render={({ field }) => <FormItem className="admin-field"><FormLabel>الحالة</FormLabel><FormControl><select {...field} className="admin-select" data-testid="select-match-status"><option value="scheduled">قادمة</option><option value="live">مباشر</option><option value="finished">منتهية</option><option value="postponed">مؤجلة</option><option value="cancelled">ملغاة</option></select></FormControl></FormItem>} /><FormField control={form.control} name="venue" render={({ field }) => <FormItem className="admin-field"><FormLabel>الملعب</FormLabel><FormControl><input {...field} className="admin-input" data-testid="input-match-venue" /></FormControl></FormItem>} /><FormField control={form.control} name="homeScore" render={({ field }) => <FormItem className="admin-field"><FormLabel>أهداف المضيف</FormLabel><FormControl><input {...field} type="number" min="0" className="admin-input" data-testid="input-match-home-score" /></FormControl></FormItem>} /><FormField control={form.control} name="awayScore" render={({ field }) => <FormItem className="admin-field"><FormLabel>أهداف الضيف</FormLabel><FormControl><input {...field} type="number" min="0" className="admin-input" data-testid="input-match-away-score" /></FormControl></FormItem>} /><button type="submit" className="admin-btn admin-btn-primary" disabled={create.isPending || update.isPending} data-testid="button-save-match"><Save size={15} /> حفظ المباراة</button></form></Form></div></section></div>
    {notice && <Notice onClose={() => setNotice('')}>{notice}</Notice>}
  </AdminPage>;
}