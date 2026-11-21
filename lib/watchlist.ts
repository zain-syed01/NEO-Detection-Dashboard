import type { NeoObject } from "@/lib/types";

export type WatchlistRow = {
  id: string;
  user_id: string;
  neo_id: string;
  neo_name: string;
  nasa_jpl_url: string | null;
  is_potentially_hazardous: boolean;
  created_at: string;
};

export function watchlistPayloadFromNeo(neo: NeoObject) {
  return {
    neo_id: neo.id,
    neo_name: neo.name,
    nasa_jpl_url: neo.nasaJplUrl,
    is_potentially_hazardous: neo.isPotentiallyHazardous,
  };
}
