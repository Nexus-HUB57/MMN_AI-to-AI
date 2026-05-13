import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../database/schemas/schema-final";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

async function migrate() {
  console.log("🚀 Iniciando migração de dados legados...");

  // Configuração do banco de dados (ajustar conforme ambiente)
  const databaseUrl = process.env.DATABASE_URL || "mysql://root:password@localhost:3306/mmn_db";
  const connection = await mysql.createConnection(databaseUrl);
  const db = drizzle(connection, { schema, mode: "default" });

  // 1. Ler dados do Legado_PHP (Simulado a partir do arquivo de banco de dados ou dump)
  // Como não temos um banco MySQL legado rodando, vamos simular a extração
  // No mundo real, faríamos um SELECT no banco legado
  
  console.log("📦 Extraindo dados da tabela area123_clientes...");
  
  // Simulação de dados extraídos do legado
  const legacyUsers = [
    {
      id: 1,
      email: "admin@demo.com",
      senha: "21232f297a57a5a743894a0e4a801fc3", // md5('admin')
      name: "Administrador Sistema",
      cpf: "123.456.789-00",
      status: "Ativo",
      patrocinador: "0"
    },
    {
      id: 100,
      email: "afiliado1@demo.com",
      senha: "c4ca4238a0b923820dcc509a6f75849b", // md5('1')
      name: "João Silva",
      cpf: "987.654.321-11",
      status: "Ativo",
      patrocinador: "1"
    }
  ];

  for (const legacyUser of legacyUsers) {
    console.log(`👤 Migrando usuário: ${legacyUser.email}`);

    // Inserir no novo esquema de usuários
    const [newUser] = await db.insert(schema.users).values({
      openId: `legacy_${legacyUser.id}`, // Gerar um openId temporário para usuários legados
      name: legacyUser.name,
      email: legacyUser.email,
      role: legacyUser.id === 1 ? "admin" : "user",
      loginMethod: "legacy",
      legacyId: legacyUser.id,
      legacyPassword: legacyUser.senha,
      cpf: legacyUser.cpf,
    }).onDuplicateKeyUpdate({
      set: {
        name: legacyUser.name,
        legacyPassword: legacyUser.senha,
      }
    });

    // Se for um afiliado, criar entrada na tabela de afiliados
    if (legacyUser.id !== 1) {
      console.log(`🔗 Criando perfil de afiliado para: ${legacyUser.name}`);
      
      // Buscar o ID do usuário recém inserido/atualizado
      const userRecord = await db.query.users.findFirst({
        where: eq(schema.users.email, legacyUser.email)
      });

      if (userRecord) {
        await db.insert(schema.affiliates).values({
          userId: userRecord.id,
          affiliateCode: `AFF${legacyUser.id.toString().padStart(5, '0')}`,
          sponsorId: legacyUser.patrocinador === "0" ? null : parseInt(legacyUser.patrocinador),
          status: legacyUser.status === "Ativo" ? "active" : "inactive",
          legacyStatus: legacyUser.status,
        }).onDuplicateKeyUpdate({
          set: {
            status: legacyUser.status === "Ativo" ? "active" : "inactive",
          }
        });
      }
    }
  }

  console.log("✅ Migração concluída com sucesso!");
  await connection.end();
}

migrate().catch((err) => {
  console.error("❌ Erro na migração:", err);
  process.exit(1);
});
