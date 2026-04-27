import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Método não permitido." });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Acesso Negado." });
    }
    const token = authHeader.split(" ")[1];

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: "Token inválido" });
    }

    const { data: profile, error: dbError } = await supabaseAdmin
      .from("profiles")
      .select("first_name, last_name, nickname, force_password_change, theme, view_mode, usage_type, tasks_retention_days, onboarding_version")
      .eq("id", user.id)
      .single();

    if (dbError && dbError.code !== "PGRST116") {
      console.error(dbError);
      return res.status(500).json({ error: "Erro consultando DB." });
    }

    return res.status(200).json({ data: profile || null });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro interno fatal" });
  }
}
