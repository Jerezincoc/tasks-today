import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Carrega as variáveis do .env do frontend se estiver rodando local no diretório raíz
dotenv.config({ path: '../.env' }); 

const app = express();
app.use(cors());
app.use(express.json());

// Verifica Serviço do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("ERRO: Variáveis SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontradas no .env");
  process.exit(1);
}

// Cria cliente Supabase com a Chave Admin (Bypassa RLS para as verificações duras do nosso Node)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Schemas do Zod para regras rigorosas
const updateProfileSchema = z.object({
  firstName: z.string().min(2, "O Nome deve ter pelo menos 2 caracteres").max(50),
  lastName: z.string().min(2, "O Sobrenome deve ter pelo menos 2 caracteres").max(50),
  nickname: z.string().max(20).optional().nullable(),
});

// Nossa Rota do Proxy
app.post('/api/profiles/update', async (req, res) => {
  try {
    // 1. Validar autenticação do Express verificando quem está pedindo (Header Authorization)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Acesso Negado. JWT Token ausente.' });
    }
    const token = authHeader.split(' ')[1];

    // Verificar se o Token é válido lá no Auth do Supabase
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }

    // 2. Validação pesada do payload usando Zod
    const validatedData = updateProfileSchema.parse(req.body);

    // 3. Persistência de negócio: Fazer "Upsert" na tabela `profiles`
    const { error: dbError } = await supabaseAdmin
      .from('profiles')
      .upsert({ 
         id: user.id, // Tem que ser PK que referencie o auth.users via SQL Migration depois
         first_name: validatedData.firstName,
         last_name: validatedData.lastName,
         nickname: validatedData.nickname,
         updated_at: new Date().toISOString()
      });

    if (dbError) {
      console.error(dbError);
      return res.status(500).json({ error: 'Erro ao gravar os dados no banco usando Server Role.' });
    }

    return res.status(200).json({ message: 'Perfil atualizado com sucesso!', data: validatedData });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    console.error(error);
    return res.status(500).json({ error: 'Erro interno fatal do servidor Proxy' });
  }
});

// Busca o Profile do usuário (com a flag force_password_change)
app.get('/api/profiles/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Acesso Negado.' });
    }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) return res.status(401).json({ error: 'Token inválido' });

    const { data: profile, error: dbError } = await supabaseAdmin
       .from('profiles')
       .select('first_name, last_name, nickname, force_password_change')
       .eq('id', user.id)
       .single();

    if (dbError && dbError.code !== 'PGRST116') { // Ignora row not found
       console.error(dbError);
       return res.status(500).json({ error: 'Erro consultando DB.' });
    }

    return res.status(200).json({ data: profile || null });
  } catch(e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro interno fatal' });
  }
});

// Desliga o bloqueio de troca de senha no DB
app.post('/api/profiles/reset-force-password', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Acesso Negado.' });
    }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) return res.status(401).json({ error: 'Token inválido' });

    const { error: dbError } = await supabaseAdmin
       .from('profiles')
       .update({ force_password_change: false })
       .eq('id', user.id);

    if (dbError) {
       console.error(dbError);
       return res.status(500).json({ error: 'Erro resetando a flag.' });
    }

    return res.status(200).json({ message: 'Flag removida com sucesso' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro interno fatal' });
  }
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu muito errado no Servidor!' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`☁️ Cloud-Native Proxy rodando na porta ${PORT}`);
});
