
import { useEffect, useState } from 'react'
import './App.css'

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [tarefas, setTarefas] = useState([])
  const [novaTarefa, setNovaTarefa] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function carregarTarefas() {
    try {
      setErro('')

      const resposta = await fetch(`${API_URL}/tasks`)

      if (!resposta.ok) {
        throw new Error('Não foi possível carregar as tarefas.')
      }

      const dados = await resposta.json()
      const lista = Array.isArray(dados) ? dados : dados.tasks ?? []

      setTarefas(lista)
    } catch (error) {
      setErro(
        `${error.message} Verifique se o backend está funcionando.`
      )
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarTarefas()
  }, [])

  async function adicionarTarefa(event) {
    event.preventDefault()

    const titulo = novaTarefa.trim()

    if (!titulo || salvando) return

    try {
      setSalvando(true)
      setErro('')

      const resposta = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: titulo }),
      })

      if (!resposta.ok) {
        throw new Error('Não foi possível cadastrar a tarefa.')
      }

      setNovaTarefa('')
      await carregarTarefas()
    } catch (error) {
      setErro(
        `${error.message} Confira a rota POST /tasks do backend.`
      )
    } finally {
      setSalvando(false)
    }
  }

  function alternarConclusao(id) {
    setTarefas((lista) =>
      lista.map((tarefa) =>
        tarefa.id === id
          ? { ...tarefa, completed: !tarefa.completed }
          : tarefa
      )
    )
  }

  function tituloDaTarefa(tarefa) {
    return tarefa.title ?? tarefa.titulo ?? tarefa.nome ?? tarefa.description ?? 'Tarefa'
  }

  function tarefaConcluida(tarefa) {
    return Boolean(tarefa.completed ?? tarefa.concluida)
  }

  const concluidas = tarefas.filter(tarefaConcluida).length

  return (
    <main className="pagina">
      <section className="painel">
        <header className="cabecalho">
          <span className="etiqueta">ORGANIZAÇÃO PESSOAL</span>
          <h1>Lista de tarefas<span>.</span></h1>
          <p>Organize seu dia, uma tarefa de cada vez.</p>
        </header>

        <div className="resumo">
          <div>
            <span className="resumo-numero">{tarefas.length}</span>
            <span className="resumo-label">Tarefas cadastradas</span>
          </div>

          <div>
            <span className="resumo-numero">{concluidas}</span>
            <span className="resumo-label">Concluídas nesta sessão</span>
          </div>
        </div>

        <form className="formulario" onSubmit={adicionarTarefa}>
          <label htmlFor="nova-tarefa">O que você precisa fazer?</label>

          <div className="campo">
            <input
              id="nova-tarefa"
              type="text"
              placeholder="Ex.: Estudar Docker"
              value={novaTarefa}
              onChange={(event) => setNovaTarefa(event.target.value)}
              required
            />

            <button type="submit" disabled={salvando}>
              {salvando ? 'Salvando...' : '+ Adicionar'}
            </button>
          </div>
        </form>

        {erro && (
          <div className="mensagem-erro" role="alert">
            {erro}
          </div>
        )}

        <section className="lista">
          <div className="lista-cabecalho">
            <h2>Minhas tarefas</h2>
            <button
              className="botao-atualizar"
              type="button"
              onClick={carregarTarefas}
            >
              Atualizar
            </button>
          </div>

          {carregando ? (
            <p className="estado">Carregando tarefas...</p>
          ) : tarefas.length === 0 ? (
            <div className="vazio">
              <span className="vazio-icone">✓</span>
              <h3>Nenhuma tarefa por enquanto</h3>
              <p>Adicione sua primeira tarefa acima.</p>
            </div>
          ) : (
            <ul>
              {tarefas.map((tarefa, indice) => (
                <li
                  className={`tarefa ${tarefaConcluida(tarefa) ? 'concluida' : ''}`}
                  key={tarefa.id ?? indice}
                >
                  <input
                    type="checkbox"
                    checked={tarefaConcluida(tarefa)}
                    onChange={() => alternarConclusao(tarefa.id)}
                    aria-label={`Concluir ${tituloDaTarefa(tarefa)}`}
                  />

                  <span>{tituloDaTarefa(tarefa)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer>
          <span className="indicador" />
          Frontend React · API Docker
        </footer>
      </section>
    </main>
  )
}

export default App
