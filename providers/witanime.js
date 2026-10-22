
const BASE = "https://witanime.site";
const UA =
  "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/124.0.0.0 Mobile Safari/537.36";

async function getText(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      "Referer": BASE + "/"
    }
  });

  if (!res.ok) return "";
  return await res.text();
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

function findVideoLinks(html) {
  const results = [];
  const seen = new Set();

  const patterns = [
    /<source\b[^>]*\bsrc=["']([^"']+)["']/gi,
    /<video\b[^>]*\bsrc=["']([^"']+)["']/gi,
    /<iframe\b[^>]*\bsrc=["']([^"']+)["']/gi,
    /href=["'](https?:\/\/mega\.nz\/file\/[^"']+)["']/gi
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const url = decode(match[1]);

      if (!/^https?:\/\//i.test(url) || seen.has(url)) continue;
      seen.add(url);

      const direct = /\.(mp4|m3u8)(?:[?#]|$)/i.test(url);

      if (
        direct ||
        /mega\.nz\/file\//i.test(url) ||
        /youtube|videa|yonaplay|hgcloud|4shared/i.test(url)
      ) {
        results.push({
          name: direct ? "Witanime Direct" : "Witanime Host",
          title: "Witanime",
          url,
          quality: "Unknown",
          size: "Unknown",
          headers: {
            "User-Agent": UA,
            "Referer": BASE + "/"
          },
          provider: "witanime"
        });
      }
    }
  }

  return results.filter(x =>
    /\.(mp4|m3u8)(?:[?#]|$)/i.test(x.url)
  );
}

async function getStreams(
  tmdbId,
  mediaType = "movie",
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

    // نحتاج إكمال البحث عن الأنمي ومطابقة الحلقة
    // بعد التأكد من بنية صفحات الموقع الفعلية.
    return [];
  } catch (err) {
    console.log("[Witanime] Error:", err.message);
    return [];
  }
}

module.exports = { getStreams };
