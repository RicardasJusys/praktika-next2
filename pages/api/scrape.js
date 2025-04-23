// pages/api/scrape.js
import { getServerSession } from "next-auth/next";
import { authOptions }    from "./auth/[...nextauth]";
import dbConnect           from "@/lib/dbConnect";
import User                from "@/models/User";
import { load }            from "cheerio";       // ← pull in only `load`

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { url } = req.body;
  if (!url || !/^https?:\/\//.test(url)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  const COST = 25;

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  if (!user || user.credits < COST) {
    return res.status(403).json({ error: "Insufficient credits" });
  }

  try {
    // Use the built-in fetch
    const resp = await fetch(url);
    const html = await resp.text();
    const $    = load(html);                   // ← use load()

    const title  = $("head > title").first().text().trim() || null;
    const imgSrc = $("img").first().attr("src") || null;

    let image = null;
    if (imgSrc) {
      // Resolve relative URLs
      const u = new URL(imgSrc, url);
      image = u.href;
    }

    // Deduct credits
    user.credits -= COST;
    await user.save();

    return res.status(200).json({
      title,
      image,
      remainingCredits: user.credits
    });
  } catch (err) {
    console.error("Scrape error:", err);
    return res.status(500).json({ error: "Failed to scrape the page" });
  }
}
