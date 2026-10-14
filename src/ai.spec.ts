import { describe, it} from 'node:test'
import { equal} from "node:assert"


describe("Testes para a integração com modelo de linguagem", () =>{
  it("Deve gerar uma query pergunta simples", async (ctx) => {

    ctx.mock.module("ai", {
      namedExports:{
        generateText: async({system, prompt}) => {
          //simulação de resposta do modelo para a pergunta "Quantos acessos "
          return {
            experimental_output:{
              sql: "SELECT date, COUNT(*) as access_count FROM access_logs GROUP BY date",
              explanation: "Esta query conta a número de acessos por dia "
            }
          };
        },
        Output:{object: ({schema}) => ({schema})}
      }
    })

    const { generateSqlObject } = await import('./ai.ts') 

    const question = "Quantos acessos tivemos por dia? "
    const {explanation, sql} = await generateSqlObject(question)

    //verificar se a sql gerada pe uma string não vazia
    equal(typeof sql, 'string')
    equal(sql.trim().length > 0, true)

    //Verificar se a SQL gerada começa com SELECT
    equal(sql.trim().toUpperCase().startsWith('SELECT'), true)
  })
})