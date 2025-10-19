const generateButton = document.getElementById('generate-button');
const randomButton = document.getElementById('random-button');
const ingredientsInput = document.getElementById('ingredients-input');
const resultsContainer = document.getElementById('results');

// 🔸 Gera receitas com IA
async function gerarReceitas(ingredientes) {
  const prompt = `
Você é um chef profissional. 
Crie 3 receitas diferentes usando APENAS os seguintes ingredientes:
${ingredientes}

Para cada receita, responda assim:
- Nome da receita
- Ingredientes utilizados
- Modo de preparo passo a passo (em tópicos)
- Sugestão de apresentação
Não adicione ingredientes não listados.
  `;

  const response = await fetch('/api/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });

  const data = await response.json();
  mostrarReceitas(data.result);
}

// 🪄 Exibe as receitas
function mostrarReceitas(texto) {
  resultsContainer.innerHTML = '';

  const receitasSeparadas = texto.split('=====');
  receitasSeparadas.forEach(receita => {
    if (receita.trim()) {
      const card = document.createElement('div');
      card.classList.add('card');
      card.innerHTML = `<p>${receita.replace(/\n/g, '<br>')}</p>`;
      resultsContainer.appendChild(card);
    }
  });
}

// 📥 Botão principal
generateButton.addEventListener('click', () => {
  const ingredientes = ingredientsInput.value.trim();
  if (ingredientes === '') return alert('Digite ao menos um ingrediente!');
  gerarReceitas(ingredientes);
});

// 🎲 Surpreenda-me
randomButton.addEventListener('click', () => {
  const exemplos = ["frango, arroz, alho", "batata, ovo, queijo", "macarrão, tomate, manjericão"];
  const random = exemplos[Math.floor(Math.random() * exemplos.length)];
  ingredientsInput.value = random;
  gerarReceitas(random);
});
