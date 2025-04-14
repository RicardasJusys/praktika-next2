import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import bcrypt from "bcrypt"

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Trūksta duomenų" })
    }

    await dbConnect()


    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "Vartotojas jau egzistuoja" })
    }


    const hashedPassword = await bcrypt.hash(password, 10)


    const newUser = new User({ name, email, password: hashedPassword })
    await newUser.save()
    return res.status(201).json({ message: "Vartotojas sukurtas" })
  } else {
    res.status(405).json({ message: "Method Not Allowed" })
  }
}
