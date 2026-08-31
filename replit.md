# Barça News

تطبيق أخبار برشلونة باللغة العربية، مصمم للهواتف أولاً مع أخبار وانتقالات ومباريات وبحث ومفضلة وتنبيهات.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/barca-news/src/data/models.ts` — النماذج والبيانات التجريبية المحلية ومصدر المحتوى الأولي.
- `artifacts/barca-news/src/components/barca-ui.tsx` — غلاف التطبيق والمكوّنات القابلة لإعادة الاستخدام.
- `artifacts/barca-news/src/pages/barca-pages.tsx` — صفحات التطبيق ومساراتها وتفاعلاتها المحلية.
- `artifacts/barca-news/src/index.css` — نظام الألوان والخطوط والتجاوب والأنيميشن.
- `artifacts/barca-news/src/App.tsx` — إعداد المسارات ومزوّدات التطبيق.

## Architecture decisions

- النسخة الأولى تعمل بمحتوى محلي typed data حتى تبقى قابلة للعرض دون خدمة خارجية.
- المفضلة وحالة قراءة التنبيهات محفوظتان في localStorage لتجربة نموذج أولي حقيقية.
- فصل النماذج عن العرض يسهّل استبدال مصدر البيانات لاحقاً بواجهة API وقاعدة بيانات ولوحة تحكم.
- wouter مستخدم لمسارات الصفحات مع غلاف مشترك وتنقّل سفلي على الهاتف وشريط جانبي على الشاشات الكبيرة.

## Product

Barça News هو مركز عربي سريع لمتابعة أخبار نادي برشلونة: الأخبار العاجلة والمميزة، سوق الانتقالات، الروزنامة والنتائج، البحث عن الأخبار واللاعبين، حفظ القصص والتنبيهات.

## User preferences

- واجهة عربية RTL، داكنة وحديثة، وموجهة أساساً للهواتف.

## Gotchas

- الصور الحالية روابط عامة للعرض التجريبي؛ عند ربط API حقيقي يجب نقل الصور إلى مصدر موثوق أو تخزين كائنات.
- التطبيق الأمامي مستقل حالياً عن API server المشترك؛ أي ربط حقيقي لاحقاً يبدأ من عقد API واضحة ثم يُستبدل مصدر `models.ts`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
