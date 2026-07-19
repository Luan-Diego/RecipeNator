export type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string };
  mine: boolean;
};

export type ReviewSummary = { avg: number; count: number };

async function readError(res: Response): Promise<Error> {
  const data = (await res.json().catch(() => ({}))) as { message?: string; errors?: Record<string, string[]> };
  const first = data.errors ? Object.values(data.errors).flat()[0] : undefined;
  return new Error(first ?? data.message ?? 'Algo deu errado. Tente novamente.');
}

const base = (slug: string) => `/api/recipes/${encodeURIComponent(slug)}/reviews`;

export const reviewsApi = {
  async list(slug: string): Promise<{ items: Review[]; summary: ReviewSummary }> {
    const res = await fetch(base(slug));
    if (!res.ok) throw await readError(res);
    return (await res.json()) as { items: Review[]; summary: ReviewSummary };
  },
  async save(slug: string, rating: number, comment: string): Promise<void> {
    const res = await fetch(base(slug), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment }),
    });
    if (!res.ok) throw await readError(res);
  },
  async remove(slug: string): Promise<void> {
    const res = await fetch(base(slug), { method: 'DELETE' });
    if (!res.ok) throw await readError(res);
  },
};
