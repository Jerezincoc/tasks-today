import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const updateProfileSchema = z.object({
  firstName: z.string().min(2, "O Nome deve ter pelo menos 2 caracteres").max(50),
  lastName: z.string().min(2, "O Sobrenome deve ter pelo menos 2 caracteres").max(50),
  nickname: z.string().max(20).optional().nullable(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Acesso Negado. JWT Token ausente." });
    }
    const token = authHeader.split(" ")[1];

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: "Token inválido ou expirado." });
    }

    const validatedData = updateProfileSchema.parse(req.body);

    const { error: dbError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: user.id,
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        nickname: validatedData.nickname,
        updated_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error(dbError);
      return res.status(500).json({ error: "Erro ao gravar os dados no banco usando Server Role." });
    }

    return res.status(200).json({ message: "Perfil atualizado com sucesso!", data: validatedData });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }
    console.error(error);
    return res.status(500).json({ error: "Erro interno fatal do servidor Proxy" });
  }
}
