import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  ArchiveAdminNewsParams,
  ArchiveAdminNewsResponse,
  CreateAdminCategoryBody,
  CreateAdminCategoryResponse,
  CreateAdminMatchBody,
  CreateAdminMatchResponse,
  CreateAdminNewsBody,
  CreateAdminNewsResponse,
  CreateAdminTransferBody,
  CreateAdminTransferResponse,
  DeleteAdminCategoryParams,
  DeleteAdminCategoryResponse,
  DeleteAdminNewsParams,
  DeleteAdminTransferParams,
  DeleteAdminMatchParams,
  DeleteAdminMatchResponse,
  GetAdminNewsParams,
  GetAdminNewsResponse,
  GetAdminDashboardResponse,
  ListAdminCategoriesResponse,
  ListAdminMatchesResponse,
  ListAdminNewsQueryParams,
  ListAdminNewsResponse,
  ListAdminTransfersResponse,
  PublishAdminNewsParams,
  PublishAdminNewsResponse,
  UpdateAdminCategoryBody,
  UpdateAdminCategoryParams,
  UpdateAdminCategoryResponse,
  UpdateAdminMatchBody,
  UpdateAdminMatchParams,
  UpdateAdminMatchResponse,
  UpdateAdminNewsBody,
  UpdateAdminNewsParams,
  UpdateAdminNewsResponse,
  UpdateAdminTransferBody,
  UpdateAdminTransferParams,
  UpdateAdminTransferResponse,
} from "@workspace/api-zod";
import { db } from "@workspace/db";
import {
  categoriesTable,
  matchesTable,
  newsTable,
  transfersTable,
} from "@workspace/db/schema";
import { requireDevelopmentAdmin } from "./admin-guard";
import { serializeDate, serializeNews } from "./public";

const router: IRouter = Router();
router.use(requireDevelopmentAdmin);

function parseId(params: unknown) {
  const parsed = GetAdminNewsParams.safeParse(params);
  return parsed.success ? parsed.data.id : null;
}

function parseNewsRow(row: {
  news: typeof newsTable.$inferSelect;
  categoryNameAr: string;
}) {
  return serializeNews(row);
}

function serializeMatch(row: typeof matchesTable.$inferSelect) {
  return {
    id: row.id,
    competition: row.competition,
    homeTeam: row.homeTeam,
    awayTeam: row.awayTeam,
    homeShort: row.homeShort,
    awayShort: row.awayShort,
    kickoffAt: row.kickoffAt.toISOString(),
    venue: row.venue,
    status: row.status,
    homeScore: row.homeScore,
    awayScore: row.awayScore,
  };
}

function serializeTransfer(row: typeof transfersTable.$inferSelect) {
  return {
    id: row.id,
    playerId: row.playerId,
    playerNameAr: row.playerNameAr,
    position: row.position,
    fromClub: row.fromClub,
    toClub: row.toClub,
    feeAmount: row.feeAmount === null ? null : Number(row.feeAmount),
    feeCurrency: row.feeCurrency,
    feeLabelAr: row.feeLabelAr,
    status: row.status,
    confidence: row.confidence,
    notesAr: row.notesAr,
    announcedAt: serializeDate(row.announcedAt),
  };
}

async function getAdminNewsById(id: number) {
  const [row] = await db
    .select({ news: newsTable, categoryNameAr: categoriesTable.nameAr })
    .from(newsTable)
    .innerJoin(categoriesTable, eq(newsTable.categoryId, categoriesTable.id))
    .where(eq(newsTable.id, id))
    .limit(1);
  return row;
}

router.get("/dashboard", async (_req, res) => {
  const [published, drafts, breaking, featured, latest] = await Promise.all([
    db
      .select({ total: sql<number>`count(*)` })
      .from(newsTable)
      .where(eq(newsTable.status, "published")),
    db
      .select({ total: sql<number>`count(*)` })
      .from(newsTable)
      .where(eq(newsTable.status, "draft")),
    db
      .select({ total: sql<number>`count(*)` })
      .from(newsTable)
      .where(eq(newsTable.isBreaking, true)),
    db
      .select({ total: sql<number>`count(*)` })
      .from(newsTable)
      .where(eq(newsTable.isFeatured, true)),
    db
      .select({ news: newsTable, categoryNameAr: categoriesTable.nameAr })
      .from(newsTable)
      .innerJoin(categoriesTable, eq(newsTable.categoryId, categoriesTable.id))
      .orderBy(desc(newsTable.updatedAt))
      .limit(5),
  ]);

  return res.json(
    GetAdminDashboardResponse.parse({
      publishedCount: Number(published[0]?.total ?? 0),
      draftCount: Number(drafts[0]?.total ?? 0),
      breakingCount: Number(breaking[0]?.total ?? 0),
      featuredCount: Number(featured[0]?.total ?? 0),
      latestUpdated: latest.map(parseNewsRow),
    }),
  );
});

router.get("/news", async (req, res) => {
  const parsed = ListAdminNewsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "فلاتر الأخبار غير صالحة" });
  }

  const { search, category, status, featured, breaking, page, pageSize } =
    parsed.data;
  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(newsTable.titleAr, `%${search}%`),
        ilike(newsTable.summaryAr, `%${search}%`),
        ilike(newsTable.bodyAr, `%${search}%`),
      )!,
    );
  }
  if (category) conditions.push(eq(categoriesTable.slug, category));
  if (status) conditions.push(eq(newsTable.status, status));
  if (featured !== undefined) conditions.push(eq(newsTable.isFeatured, featured));
  if (breaking !== undefined) conditions.push(eq(newsTable.isBreaking, breaking));
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, totalRows] = await Promise.all([
    db
      .select({ news: newsTable, categoryNameAr: categoriesTable.nameAr })
      .from(newsTable)
      .innerJoin(categoriesTable, eq(newsTable.categoryId, categoriesTable.id))
      .where(where)
      .orderBy(desc(newsTable.updatedAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ total: sql<number>`count(*)` })
      .from(newsTable)
      .innerJoin(categoriesTable, eq(newsTable.categoryId, categoriesTable.id))
      .where(where),
  ]);

  return res.json(
    ListAdminNewsResponse.parse({
      items: rows.map(parseNewsRow),
      page,
      pageSize,
      total: Number(totalRows[0]?.total ?? 0),
    }),
  );
});

router.post("/news", async (req, res) => {
  const parsed = CreateAdminNewsBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "بيانات الخبر غير صالحة" });
  }
  const body = parsed.data;
  const category = await db
    .select({ id: categoriesTable.id })
    .from(categoriesTable)
    .where(eq(categoriesTable.id, body.categoryId))
    .limit(1);
  if (!category[0]) return res.status(400).json({ error: "التصنيف غير موجود" });

  const [created] = await db
    .insert(newsTable)
    .values({
      slug: `news-${randomUUID()}`,
      titleAr: body.titleAr,
      summaryAr: body.summaryAr,
      bodyAr: body.bodyAr,
      categoryId: body.categoryId,
      coverImagePath: body.coverImagePath,
      imageAltAr: body.imageAltAr,
      tags: body.tags,
      isFeatured: body.isFeatured,
      isBreaking: body.isBreaking,
      readingMinutes: body.readingMinutes,
      status: "draft",
    })
    .returning({ id: newsTable.id });
  const row = await getAdminNewsById(created.id);
  return res.status(201).json(CreateAdminNewsResponse.parse(parseNewsRow(row!)));
});

router.get("/news/:id", async (req, res) => {
  const id = parseId(req.params);
  if (!id) return res.status(400).json({ error: "معرّف الخبر غير صالح" });
  const row = await getAdminNewsById(id);
  if (!row) return res.status(404).json({ error: "الخبر غير موجود" });
  return res.json(GetAdminNewsResponse.parse(parseNewsRow(row)));
});

router.patch("/news/:id", async (req, res) => {
  const id = UpdateAdminNewsParams.safeParse(req.params);
  const body = UpdateAdminNewsBody.safeParse(req.body);
  if (!id.success || !body.success) {
    return res.status(400).json({ error: "بيانات تعديل الخبر غير صالحة" });
  }
  const category = await db
    .select({ id: categoriesTable.id })
    .from(categoriesTable)
    .where(eq(categoriesTable.id, body.data.categoryId))
    .limit(1);
  if (!category[0]) return res.status(400).json({ error: "التصنيف غير موجود" });
  const [updated] = await db
    .update(newsTable)
    .set({
      titleAr: body.data.titleAr,
      summaryAr: body.data.summaryAr,
      bodyAr: body.data.bodyAr,
      categoryId: body.data.categoryId,
      coverImagePath: body.data.coverImagePath,
      imageAltAr: body.data.imageAltAr,
      tags: body.data.tags,
      isFeatured: body.data.isFeatured,
      isBreaking: body.data.isBreaking,
      readingMinutes: body.data.readingMinutes,
    })
    .where(eq(newsTable.id, id.data.id))
    .returning({ id: newsTable.id });
  if (!updated) return res.status(404).json({ error: "الخبر غير موجود" });
  const row = await getAdminNewsById(updated.id);
  return res.json(UpdateAdminNewsResponse.parse(parseNewsRow(row!)));
});

router.post("/news/:id/publish", async (req, res) => {
  const id = PublishAdminNewsParams.safeParse(req.params);
  if (!id.success) return res.status(400).json({ error: "معرّف الخبر غير صالح" });
  const [updated] = await db
    .update(newsTable)
    .set({ status: "published", publishedAt: new Date() })
    .where(eq(newsTable.id, id.data.id))
    .returning({ id: newsTable.id });
  if (!updated) return res.status(404).json({ error: "الخبر غير موجود" });
  const row = await getAdminNewsById(updated.id);
  return res.json(PublishAdminNewsResponse.parse(parseNewsRow(row!)));
});

router.post("/news/:id/archive", async (req, res) => {
  const id = ArchiveAdminNewsParams.safeParse(req.params);
  if (!id.success) return res.status(400).json({ error: "معرّف الخبر غير صالح" });
  const [updated] = await db
    .update(newsTable)
    .set({ status: "archived" })
    .where(eq(newsTable.id, id.data.id))
    .returning({ id: newsTable.id });
  if (!updated) return res.status(404).json({ error: "الخبر غير موجود" });
  const row = await getAdminNewsById(updated.id);
  return res.json(ArchiveAdminNewsResponse.parse(parseNewsRow(row!)));
});

router.delete("/news/:id", async (req, res) => {
  const id = DeleteAdminNewsParams.safeParse(req.params);
  if (!id.success) return res.status(400).json({ error: "معرّف الخبر غير صالح" });
  const deleted = await db
    .delete(newsTable)
    .where(eq(newsTable.id, id.data.id))
    .returning({ id: newsTable.id });
  if (!deleted[0]) return res.status(404).json({ error: "الخبر غير موجود" });
  return res.status(204).send();
});

router.get("/categories", async (_req, res) => {
  const rows = await db
    .select({
      id: categoriesTable.id,
      slug: categoriesTable.slug,
      nameAr: categoriesTable.nameAr,
      nameEn: categoriesTable.nameEn,
      sortOrder: categoriesTable.sortOrder,
      isActive: categoriesTable.isActive,
    })
    .from(categoriesTable)
    .orderBy(asc(categoriesTable.sortOrder), asc(categoriesTable.nameAr));
  return res.json(ListAdminCategoriesResponse.parse(rows));
});

router.post("/categories", async (req, res) => {
  const parsed = CreateAdminCategoryBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات التصنيف غير صالحة" });
  const existing = await db
    .select({ id: categoriesTable.id })
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, parsed.data.slug))
    .limit(1);
  if (existing[0]) return res.status(400).json({ error: "معرّف التصنيف مستخدم" });
  const [created] = await db
    .insert(categoriesTable)
    .values(parsed.data)
    .returning({
      id: categoriesTable.id,
      slug: categoriesTable.slug,
      nameAr: categoriesTable.nameAr,
      nameEn: categoriesTable.nameEn,
      sortOrder: categoriesTable.sortOrder,
      isActive: categoriesTable.isActive,
    });
  return res.status(201).json(CreateAdminCategoryResponse.parse(created));
});

router.patch("/categories/:id", async (req, res) => {
  const id = UpdateAdminCategoryParams.safeParse(req.params);
  const body = UpdateAdminCategoryBody.safeParse(req.body);
  if (!id.success || !body.success) return res.status(400).json({ error: "بيانات التصنيف غير صالحة" });
  const [updated] = await db
    .update(categoriesTable)
    .set(body.data)
    .where(eq(categoriesTable.id, id.data.id))
    .returning({
      id: categoriesTable.id,
      slug: categoriesTable.slug,
      nameAr: categoriesTable.nameAr,
      nameEn: categoriesTable.nameEn,
      sortOrder: categoriesTable.sortOrder,
      isActive: categoriesTable.isActive,
    });
  if (!updated) return res.status(404).json({ error: "التصنيف غير موجود" });
  return res.json(UpdateAdminCategoryResponse.parse(updated));
});

router.delete("/categories/:id", async (req, res) => {
  const id = DeleteAdminCategoryParams.safeParse(req.params);
  if (!id.success) return res.status(400).json({ error: "معرّف التصنيف غير صالح" });
  const [usage] = await db
    .select({ total: sql<number>`count(*)` })
    .from(newsTable)
    .where(eq(newsTable.categoryId, id.data.id));
  if (Number(usage?.total ?? 0) > 0) {
    return res.status(400).json({
      error: "لا يمكن حذف تصنيف مرتبط بأخبار. عطّله بدلاً من ذلك.",
    });
  }
  const deleted = await db
    .delete(categoriesTable)
    .where(eq(categoriesTable.id, id.data.id))
    .returning({ id: categoriesTable.id });
  if (!deleted[0]) return res.status(404).json({ error: "التصنيف غير موجود" });
  return res.status(204).send();
});

router.get("/transfers", async (_req, res) => {
  const rows = await db
    .select()
    .from(transfersTable)
    .orderBy(desc(transfersTable.updatedAt));
  return res.json(ListAdminTransfersResponse.parse(rows.map(serializeTransfer)));
});

router.post("/transfers", async (req, res) => {
  const parsed = CreateAdminTransferBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات الانتقال غير صالحة" });
  const [created] = await db
    .insert(transfersTable)
    .values({
      ...parsed.data,
      feeAmount: parsed.data.feeAmount === null ? null : String(parsed.data.feeAmount),
    })
    .returning();
  return res.status(201).json(CreateAdminTransferResponse.parse(serializeTransfer(created)));
});

router.patch("/transfers/:id", async (req, res) => {
  const id = UpdateAdminTransferParams.safeParse(req.params);
  const body = UpdateAdminTransferBody.safeParse(req.body);
  if (!id.success || !body.success) return res.status(400).json({ error: "بيانات الانتقال غير صالحة" });
  const [updated] = await db
    .update(transfersTable)
    .set({
      ...body.data,
      feeAmount: body.data.feeAmount === null ? null : String(body.data.feeAmount),
    })
    .where(eq(transfersTable.id, id.data.id))
    .returning();
  if (!updated) return res.status(404).json({ error: "الانتقال غير موجود" });
  return res.json(UpdateAdminTransferResponse.parse(serializeTransfer(updated)));
});

router.delete("/transfers/:id", async (req, res) => {
  const id = DeleteAdminTransferParams.safeParse(req.params);
  if (!id.success) return res.status(400).json({ error: "معرّف الانتقال غير صالح" });
  const deleted = await db
    .delete(transfersTable)
    .where(eq(transfersTable.id, id.data.id))
    .returning({ id: transfersTable.id });
  if (!deleted[0]) return res.status(404).json({ error: "الانتقال غير موجود" });
  return res.status(204).send();
});

router.get("/matches", async (_req, res) => {
  const rows = await db
    .select()
    .from(matchesTable)
    .orderBy(asc(matchesTable.kickoffAt));
  return res.json(ListAdminMatchesResponse.parse(rows.map(serializeMatch)));
});

router.post("/matches", async (req, res) => {
  const parsed = CreateAdminMatchBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات المباراة غير صالحة" });
  const [created] = await db
    .insert(matchesTable)
    .values(parsed.data)
    .returning();
  return res.status(201).json(CreateAdminMatchResponse.parse(serializeMatch(created)));
});

router.patch("/matches/:id", async (req, res) => {
  const id = UpdateAdminMatchParams.safeParse(req.params);
  const body = UpdateAdminMatchBody.safeParse(req.body);
  if (!id.success || !body.success) return res.status(400).json({ error: "بيانات المباراة غير صالحة" });
  const [updated] = await db
    .update(matchesTable)
    .set(body.data)
    .where(eq(matchesTable.id, id.data.id))
    .returning();
  if (!updated) return res.status(404).json({ error: "المباراة غير موجودة" });
  return res.json(UpdateAdminMatchResponse.parse(serializeMatch(updated)));
});

router.delete("/matches/:id", async (req, res) => {
  const id = DeleteAdminMatchParams.safeParse(req.params);
  if (!id.success) return res.status(400).json({ error: "معرّف المباراة غير صالح" });
  const deleted = await db
    .delete(matchesTable)
    .where(eq(matchesTable.id, id.data.id))
    .returning({ id: matchesTable.id });
  if (!deleted[0]) return res.status(404).json({ error: "المباراة غير موجودة" });
  return res.status(204).send();
});

export default router;