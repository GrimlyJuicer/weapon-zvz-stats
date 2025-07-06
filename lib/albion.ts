import crypto from "crypto";

export type WeaponStat = {
  weapon: string;
  appearances: number;
  wins: number;
  winRate: number;
};

const BASE = "https://gameinfo.albiononline.com/api/gameinfo";
const HEADERS = { "User-Agent": "AO-Weapon-ZvZ-Stats/0.1 (+github.com)" } as const;

async function fetchJson<T>(url: string, tries = 3): Promise<T> {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, { headers: HEADERS, next: { revalidate: 3600 } });
    if (res.ok) return res.json();
    await new Promise(r => setTimeout(r, 1000 * (i + 1)));
  }
  throw new Error(`Failed to fetch ${url}`);
}

export async function getWeaponStats(pages = 10, pageSize = 50): Promise<WeaponStat[]> {
  const stats: Record<string, { apps: number; wins: number }> = {};

  for (let page = 0; page < pages; page++) {
    const offset = page * pageSize;
    const list: { id: number }[] = await fetchJson(`${BASE}/battles?limit=${pageSize}&offset=${offset}`);
    if (!list.length) break;

    const batches = Array.from({ length: Math.ceil(list.length / 10) }, (_, i) =>
      list.slice(i * 10, (i + 1) * 10)
    );

    for (const batch of batches) {
      const results = await Promise.allSettled(batch.map(b => fetchJson(`${BASE}/battles/${b.id}`)));
      for (const r of results) {
        if (r.status !== "fulfilled") continue;
        const battle: any = r.value;

        const alliances: Record<string, { players: Set<number>; kills: number; deaths: number }> = {};
        for (const p of battle.players as any[]) {
          const aid = p.allianceId || p.guildId || crypto.randomUUID();
          alliances[aid] ??= { players: new Set(), kills: 0, deaths: 0 };
          alliances[aid].players.add(p.id);
          if (p.killFame) alliances[aid].kills += 1;
          if (p.deathFame) alliances[aid].deaths += 1;
        }

        const winners = new Set<string>();
        for (const [aid, rec] of Object.entries(alliances)) {
          if (rec.players.size >= 20 && rec.kills > rec.deaths) winners.add(aid);
        }

        for (const p of battle.players as any[]) {
          const aid = p.allianceId || p.guildId;
          if (!aid || alliances[aid]?.players.size < 20) continue;
          const weapon = p.equipment?.MainHand?.Type || "None";
          stats[weapon] ??= { apps: 0, wins: 0 };
          stats[weapon].apps += 1;
          if (winners.has(aid)) stats[weapon].wins += 1;
        }
      }
    }
  }

  return Object.entries(stats).map(([weapon, { apps, wins }]) => ({
    weapon,
    appearances: apps,
    wins,
    winRate: apps ? wins / apps : 0
  }));
}