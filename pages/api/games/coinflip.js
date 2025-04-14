import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Leidžiamas tik POST metodas." });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user || !session.user.email) {
    return res.status(401).json({ error: "Nepavyko autentifikuoti naudotojo." });
  }

  const { bet, choice } = req.body;
  const validBet = parseInt(bet);

  if (!["herbas", "skaicius"].includes(choice)) {
    return res.status(400).json({ error: "Blogas pasirinkimas." });
  }

  if (!validBet || validBet <= 0) {
    return res.status(400).json({ error: "Netinkama kreditų suma." });
  }

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return res.status(404).json({ error: "Naudotojas nerastas." });
  }

  if (user.credits < validBet) {
    return res.status(400).json({ error: "Nepakanka kreditų." });
  }

  // Coin flip: "skaicius" (heads) or "herbas" (tails)
  // Based on your comment: "skaicius is heads", so we update the logic:
  const flip = Math.random() < 0.5 ? "skaicius" : "herbas";
  const win = flip === choice;
  const updatedCredits = win
    ? user.credits + validBet  // win: gain bet amount
    : user.credits - validBet; // lose: lose bet amount

  user.credits = updatedCredits;
  await user.save();

  return res.status(200).json({
    flip,
    win,
    updatedCredits,
  });
}
