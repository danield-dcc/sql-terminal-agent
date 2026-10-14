import { createInterface } from "node:readline"
import { styleText } from 'node:util'
import { generateSqlObject, generateTextAnswer } from "./ai.ts"
import { createDb } from "./db.ts"
import { DB_NAME } from "./constants.ts"

const db = createDb(DB_NAME)
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
})

function prompt(text: string){
  return new Promise(resolve => rl.question(text, resolve))
}

rl.on("close", () => {
  db.close()
  console.log(styleText("gray", "Encerrando o agente, até a próxima!"))
  process.exit(0)
})

console.log(styleText(["bold", "cyan"], "\nBem vindo ao SQL terminal Agent! Precione Ctrl + C para sair."))
while(true){
  const question = await prompt(styleText(["bold","magenta"], "Pergunta: ")) as string
  if(!question.trim()){
    continue
  }

  try {
    const sqlObject = await generateSqlObject(question)
    const { sql, explanation } = sqlObject

    console.log(styleText("cyan", "\nSQL sugerido: "))
    console.log(styleText("red", sql))
    console.log(styleText("cyan", "\nExplicação: "))
    console.log(styleText("yellow", explanation))

    

    const confirm = await prompt(styleText(["bold", "green"], "\nDeseja executar essa SQL? (s/n)")) as string
    if(confirm.toLowerCase() ===  "s"){
     const rows = db.prepare(sql).all()
  
    
     const answer = await generateTextAnswer({ question, sql, rows })

     console.log(styleText("green", '\nResposta: '))
     console.log(answer)

    }else{
      console.log(styleText('yellow', "SQL não executado"))
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.log(styleText("red", "Erro ao processar a solicitação: "), message)
  }
}