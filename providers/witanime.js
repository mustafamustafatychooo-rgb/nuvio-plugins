
const BASE = "https://witanime.site";
const UA =
  "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/124.0.0.0 Mobile Safari/537.36";

async function getText(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        "Referer": BASE + "/"
      }
    });
    if (!res.ok) return "";
    return await res.text();
  } catch (_) {
    return "";
  }
}

function decode(s) {
  return String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) =>
      String.fromCharCode(Number(n))
    );
}

function getQuality(text) {
  const s = String(text || "").toUpperCase();
  if (/\b(FHD|1080P|1080)\b/.test(s)) return "1080p";
  if (/\b(HD|720P|720)\b/.test(s)) return "720p";
  if (/\b(SD|480P|480|360P|360)\b/.test(s)) return "480p";
  if (/\b(4K|2160P)\b/.test(s)) return "4K";
  return "Unknown";
}

function findServers(html) {
  const results = [];
  const seen = new Set();

  const patterns = [
    /<iframe\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi,
    /<source\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi,
    /<video\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi,
    /href=["'](https?:\/\/[^"']+)["']/gi
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const url = decode(match[1]);
      if (!/^https?:\/\//i.test(url) || seen.has(url)) continue;

      if (!/mega\.nz|hgcloud|videa|yonaplay|4shared|\.mp4(?:[?#]|$)|\.m3u8(?:[?#]|$)/i.test(url)) {
        continue;
      }

      seen.add(url);

      const direct = /\.(mp4|m3u8)(?:[?#]|$)/i.test(url);
      const host = url.match(/^https?:\/\/([^/]+)/i);
      const serverName = host
        ? host[1].replace(/^www\./, "")
        : "Witanime";
      const quality = getQuality(url);

      results.push({
        name: direct ? "Witanime Direct" : serverName,
        title: "Witanime - " + quality,
        url: url,
        quality: quality,
        headers: {
          "User-Agent": UA,
          "Referer": BASE + "/"
        },
        provider: "witanime"
      });
    }
  }

  return results;
}

async function getStreams(
  tmdbId,
  mediaType = "tv",
  seasonNum = null,
  episodeNum = null
) {
  try {
    console.log(
      "[Witanime] Request:",
      tmdbId,
      mediaType,
      seasonNum,
      episodeNum
    );

    // اختبار أولي على الحلقة التي زودني بها المستخدم.
    // البحث التلقائي باستخدام TMDB لم يُنفذ بعد.
    const html = await getText(
      BASE + "/watch/black-clover-2nd-season/1"
    );

    if (!html) {
      console.log("[Witanime] Could not fetch episode page");
      return [];
    }

    return findServers(html);
  } catch (err) {
    console.log("[Witanime] Error:", err.message);
    return [];
  }
}

module.exports = { getStreams };
