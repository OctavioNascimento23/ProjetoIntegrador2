import oracle from 'oracledb';

try {
  oracle.initOracleClient({ configDir: 'SEU_DIRETORIO_DO_ORACLE_CLIENT' });
} catch (err) {
  console.error('Erro ao inicializar o Oracle Client:', err);
  process.exit(1);
}

export async function queryOracle(sql, params = {}) {
  let con;
  try {
    con = await oracle.getConnection({
      user: 'SEU_USUARIO',
      password: 'SUA_SENHA',
      connectString: 'SEU_CONNECT_STRING'
    });
    const result = await con.execute(sql, params, { autoCommit: true });
    return result;
  } catch (err) {
    console.error('Erro ao executar a consulta', err);
    throw err;
  } finally {
    if (con) {
      try {
        await con.close();
      } catch (err2) {
        console.error('Erro ao fechar a conexão', err2);
      }
    }
  }
}
