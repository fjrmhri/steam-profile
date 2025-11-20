import Image from "next/image";

const steamConfigured = Boolean(process.env.STEAM_API_KEY && process.env.STEAM_ID);

const fallbackProfile = {
  personaname: "fjr",
  profileurl: "https://steamcommunity.com/",
  avatarfull:
    "https://avatars.steamstatic.com/d1f7c6ed1d11bff81412f6e06e485e0306a911a6_full.jpg",
  realname: "Steam Enthusiast",
  loccountrycode: "ID",
};

const fallbackGames = [
  {
    appid: "620",
    name: "Portal 2",
    playtime_forever: 540,
    achievements: [
      {
        apiname: "WAKE_UP",
        name: "Wake Up Call",
        description: "Survive the manual override.",
        icon: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/620/7339bd017864751537a31e4775d38aeda9cf7c71.jpg",
      },
      {
        apiname: "SHARED_SCIENCE",
        name: "High Five",
        description: "Celebrate your cooperative success with a high five.",
        icon: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/620/4038b64e3416024dad5b6ef1228784845e665ca3.jpg",
      },
    ],
  },
  {
    appid: "550",
    name: "Left 4 Dead 2",
    playtime_forever: 1320,
    achievements: [
      {
        apiname: "BRIDGE_OVER",
        name: "Bridge Over Trebled Slaughter",
        description: "Cross the bridge finale in Swamp Fever.",
        icon: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/550/82d21afcd14a47e1f4c7b1b073f6ec1349d9f5b2.jpg",
      },
      {
        apiname: "TORCH_BEARER",
        name: "Torch Bearer",
        description: "Survive The Passing Campaign.",
        icon: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/550/3a0ef12640add3521dc1a50637e2b2fc90d92c1b.jpg",
      },
    ],
  },
  {
    appid: "730",
    name: "Counter-Strike 2",
    playtime_forever: 2740,
    achievements: [
      {
        apiname: "P250_MASTER",
        name: "Point and Click",
        description: "Win rounds with the P250.",
        icon: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/730/44739b5d3565ed2f984a6672798fa6045ec20f0e.jpg",
      },
      {
        apiname: "KILL_ENEMY_TEAM",
        name: "Clean Sweep",
        description: "Kill the entire opposing team without dying.",
        icon: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/730/a080d47efcec73eaeb5c1f4ab6835a07415c8b8d.jpg",
      },
    ],
  },
];

async function fetchJson(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Steam API error: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getOwnedGames() {
  if (!steamConfigured) return [];
  const data = await fetchJson(
    `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${process.env.STEAM_API_KEY}&steamid=${process.env.STEAM_ID}&include_appinfo=true&include_played_free_games=true&format=json`
  );
  return data?.response?.games ?? [];
}

async function getPlayerAchievements(appid) {
  if (!steamConfigured) return [];
  const data = await fetchJson(
    `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appid}&key=${process.env.STEAM_API_KEY}&steamid=${process.env.STEAM_ID}`
  );
  return data?.playerstats?.achievements?.filter((ach) => ach.achieved === 1) ?? [];
}

async function getAchievementSchema(appid) {
  if (!steamConfigured) return [];
  const data = await fetchJson(
    `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${process.env.STEAM_API_KEY}&appid=${appid}`
  );
  return data?.game?.availableGameStats?.achievements ?? [];
}

async function getSteamProfile() {
  if (!steamConfigured) return null;
  const data = await fetchJson(
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${process.env.STEAM_ID}`
  );
  return data?.response?.players?.[0] ?? null;
}

function buildFallbackAchievements() {
  return fallbackGames.map((game) => ({
    gameName: game.name,
    playtime: game.playtime_forever,
    achievements: game.achievements,
  }));
}

function formatPlaytime(playtimeForever) {
  if (!playtimeForever) return "0 jam";
  const hours = Math.round((playtimeForever / 60) * 10) / 10;
  return `${hours.toLocaleString("id-ID")} jam`;
}

export default async function Home() {
  const [steamProfile, ownedGames] = await Promise.all([
    getSteamProfile(),
    getOwnedGames(),
  ]);

  const gamesToShow = (ownedGames ?? [])
    .sort((a, b) => (b.playtime_forever ?? 0) - (a.playtime_forever ?? 0))
    .slice(0, 6);

  let achievementsPerGame = buildFallbackAchievements();
  let totalPlaytime = fallbackGames.reduce(
    (total, game) => total + (game.playtime_forever ?? 0),
    0
  );

  if (steamConfigured && gamesToShow.length > 0) {
    achievementsPerGame = await Promise.all(
      gamesToShow.map(async (game) => {
        const [achievements, schema] = await Promise.all([
          getPlayerAchievements(game.appid),
          getAchievementSchema(game.appid),
        ]);
        const achievementsWithIcon = achievements.map((ach) => {
          const detail = schema.find((s) => s.name === ach.apiname);
          return {
            ...ach,
            icon: detail?.icon,
            name: detail?.displayName || ach.apiname,
            description: detail?.description || "Achievement telah diraih.",
          };
        });
        return {
          gameName: game.name,
          playtime: game.playtime_forever,
          achievements: achievementsWithIcon,
        };
      })
    );
    totalPlaytime = gamesToShow.reduce(
      (total, game) => total + (game.playtime_forever ?? 0),
      0
    );
  }

  const profileCard = steamProfile || fallbackProfile;
  const totalAchievements = achievementsPerGame.reduce(
    (total, game) => total + game.achievements.length,
    0
  );
  const gamesCount = achievementsPerGame.length;
  const configurationNotice = steamConfigured && ownedGames.length === 0;

  return (
    <div className="min-h-screen pb-12">
      <header className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-800 to-sky-600 text-white shadow-lg">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,#ffffff,transparent_25%)]" />
        <div className="max-w-6xl mx-auto px-6 py-14 relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
          <div className="flex items-start gap-6">
            <div className="relative h-24 w-24 shrink-0 rounded-3xl bg-white/10 p-1 shadow-lg ring-2 ring-white/30">
              <Image
                src={profileCard.avatarfull}
                alt="Steam Avatar"
                fill
                className="rounded-2xl object-cover"
                sizes="96px"
                priority
              />
            </div>
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">
                Steam Profile
              </p>
              <h1 className="text-4xl font-black leading-tight sm:text-5xl">
                Halo, saya {profileCard.personaname}
              </h1>
              <p className="text-lg text-slate-100/90 max-w-2xl">
                Pemrogram dan gamer yang senang bereksperimen dengan API, membangun tampilan
                yang rapi, serta mengajak teman-teman untuk berbagi pencapaian.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-slate-100">
                <a
                  href={profileCard.profileurl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white text-slate-900 px-4 py-2 font-semibold shadow transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Lihat Profil Steam
                  <span aria-hidden>↗</span>
                </a>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                  Siap diajak mabar
                </span>
              </div>
            </div>
          </div>
          <div className="grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 px-4 py-5 shadow-lg backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-200">Total Game</p>
              <p className="text-3xl font-extrabold mt-2">{gamesCount}</p>
              <p className="text-sm text-slate-100/80">Yang sedang dipantau</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-5 shadow-lg backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-200">Achievement</p>
              <p className="text-3xl font-extrabold mt-2">{totalAchievements}</p>
              <p className="text-sm text-slate-100/80">Yang berhasil dikunci</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-5 shadow-lg backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-200">Jam Main</p>
              <p className="text-3xl font-extrabold mt-2">{formatPlaytime(totalPlaytime)}</p>
              <p className="text-sm text-slate-100/80">Estimasi total</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 space-y-12 -mt-8">
        {configurationNotice && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-amber-900 shadow">
            Tidak ada data Steam yang bisa diambil. Pastikan API key dan Steam ID sudah diisi
            di environment variable, lalu jalankan ulang server.
          </div>
        )}

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-slate-500">Game Favorit</p>
                <h2 className="text-3xl font-black text-slate-900">Statistik Teratas</h2>
              </div>
              <span className="rounded-full bg-slate-900 text-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em]">
                Live Sync
              </span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {achievementsPerGame.map((game) => (
                <article
                  key={game.gameName}
                  className="group rounded-2xl border border-slate-100 bg-slate-50/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{game.gameName}</h3>
                      <p className="text-sm text-slate-500">
                        {formatPlaytime(game.playtime)} dimainkan
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow">
                      {game.achievements.length} pencapaian
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {game.achievements.slice(0, 3).map((ach) => (
                      <div
                        key={ach.apiname}
                        className="flex items-start gap-3 rounded-xl bg-white p-3 shadow-inner ring-1 ring-slate-100"
                      >
                        {ach.icon ? (
                          <Image
                            src={ach.icon}
                            alt={ach.name}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-slate-200" aria-hidden />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{ach.name}</p>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {ach.description || "Achievement berhasil dibuka."}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
              <h2 className="text-2xl font-black text-slate-900">Bio Singkat</h2>
              <p className="mt-3 text-slate-600 leading-relaxed">
                "Saya suka membangun hal baru sambil mempelajari API publik. Ketika tidak sedang menulis kode,
                saya biasanya menyelesaikan misi-misi kecil dan berburu achievement untuk melengkapi koleksi."
              </p>
              <dl className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <dt className="font-semibold text-slate-900">Nama</dt>
                  <dd>{profileCard.realname || profileCard.personaname}</dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <dt className="font-semibold text-slate-900">Lokasi</dt>
                  <dd>{profileCard.loccountrycode || "Unknown"}</dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <dt className="font-semibold text-slate-900">Koneksi</dt>
                  <dd className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                    Online siap mabar
                  </dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <dt className="font-semibold text-slate-900">Bahasa</dt>
                  <dd>Indonesia, Inggris</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-sky-800 p-6 text-white shadow-xl">
              <h3 className="text-xl font-bold">Tambah Teman</h3>
              <p className="mt-2 text-sm text-slate-100/90">
                Klik tombol di bawah untuk membuka profil Steam dan kirim undangan pertemanan.
              </p>
              <a
                href={profileCard.profileurl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-slate-900 font-semibold shadow-lg transition hover:-translate-y-0.5 hover:shadow-2xl"
              >
                Buka Steam <span aria-hidden>↗</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-16 border-t border-slate-200 bg-white/80 py-6 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} Steam Profile Showcase · Dibuat dengan Next.js & Steam API
      </footer>
    </div>
  );
}
