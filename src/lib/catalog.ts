import { unstable_cache } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';

export interface CatalogPackVersion {
  cover_image_url: string | null;
  display_order: number | null;
}

export interface CatalogPack {
  id: string;
  name: string;
  version: string | null;
  cover_image_url: string | null;
  buy_link: string | null;
  release_date: string | null;
  language: string | null;
  created_at: string | null;
  pack_versions: CatalogPackVersion[];
}

/**
 * Fetches the public packs catalog cached with Next.js Data Cache.
 * Invalidated on-demand via revalidateTag('packs-catalog').
 */
export async function getCachedPacksCatalog(): Promise<CatalogPack[]> {
  const getCached = unstable_cache(
    async (): Promise<CatalogPack[]> => {
      const { data, error } = await supabaseAdmin
        .from('packs')
        .select('id, name, version, cover_image_url, buy_link, release_date, language, created_at, pack_versions(cover_image_url, display_order)')
        .is('parent_pack_id', null)
        .order('release_date', { ascending: false });

      if (error) {
        console.error('Error fetching cached packs catalog:', error);
        return [];
      }

      return (data as CatalogPack[]) || [];
    },
    ['packs-catalog-list'],
    {
      revalidate: 3600, // 1 hour background revalidation
      tags: ['packs-catalog'],
    }
  );

  return getCached();
}
