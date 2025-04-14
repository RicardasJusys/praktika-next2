import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user || !session.user.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { bet } = req.body;
  const validBet = parseInt(bet);
  if (!validBet || validBet <= 0) {
    return res.status(400).json({ error: "Invalid bet amount." });
  }

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  if (user.credits < validBet) {
    return res.status(400).json({ error: "Insufficient credits." });
  }

  // Define available symbols with image paths.
  const symbols = [
    "/slots/cherry.png",
    "/slots/lemon.png",
    "/slots/watermelon.png",
    "/slots/bell.png",
    "/slots/seven.png",
  ];

  // Helper function to randomly select a symbol
  const getRandomSymbol = () => symbols[Math.floor(Math.random() * symbols.length)];

  // Helper to extract the base symbol name from an image path.
  const extractSymbolName = (imgPath) => {
    const parts = imgPath.split('/');
    const filename = parts[parts.length - 1]; // e.g., "cherry.png"
    return filename.split('.png')[0].toLowerCase(); // returns "cherry"
  };

  const reel1 = getRandomSymbol();
  const reel2 = getRandomSymbol();
  const reel3 = getRandomSymbol();
  const reels = [reel1, reel2, reel3];

  let win = false;
  let updatedCredits = user.credits;

  // New payout logic:
  const sym1 = extractSymbolName(reel1);
  const sym2 = extractSymbolName(reel2);
  const sym3 = extractSymbolName(reel3);

  // Check if all three reels are identical.
  if (reel1 === reel2 && reel2 === reel3) {
    win = true;
    // Determine multiplier based on symbol.
    if (sym1 === "bell") {
      updatedCredits = user.credits + validBet * 25;
    } else if (sym1 === "seven") {
      updatedCredits = user.credits + validBet * 100;
    } else if (["cherry", "lemon", "watermelon"].includes(sym1)) {
      updatedCredits = user.credits + validBet * 10;
    } else {
      updatedCredits = user.credits; // Fallback if somehow none matched.
    }
  }
  // Else if all three are fruits (but not identical)
  else if (
    ["cherry", "lemon", "watermelon"].includes(sym1) &&
    ["cherry", "lemon", "watermelon"].includes(sym2) &&
    ["cherry", "lemon", "watermelon"].includes(sym3)
  ) {
    win = true;
    updatedCredits = user.credits + validBet * 2;
  }
  // Otherwise, no win (loss)
  else {
    win = false;
    updatedCredits = user.credits - validBet;
  }

  // Update user's credits in the database
  user.credits = updatedCredits;
  await user.save();

  return res.status(200).json({
    reels,         // array of image paths
    win,           // whether the user won
    updatedCredits // new credit balance after bet
  });
}
