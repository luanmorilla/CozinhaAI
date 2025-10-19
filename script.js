const gerarBtn = document.getElementById('gerar-receita');
const surpresaBtn = document.getElementById('surpreenda-me');
const input = document.getElementById('ingredientes-input');
const resultados = document.getElementById('resultados');
const loader = document.getElementById('loader');

async function gerarReceita(ingredientes) {
  try {
    loader.style.display = 'block';
    resultados.innerHTML = '';

    const res = await fetch('/api/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredientes })
    });

    const data = await res.json();
    loader.style.display = 'none';

    if (data.error) {
      resultados.innerHTML = `<p>Erro: ${data.error}</p>`;
      return;
    }

    const receitas = data.result.split(/\d\.\s/).filter(r => r.trim() !== '');
    receitas.forEach(r => {
      const card = document.createElement('div');
      card.classList.add('card');
      card.innerHTML = `<p>${r}</p>`;
      resultados.appendChild(card);
    });

  } catch (err) {
    loader.style.display = 'none';
    resultados.innerHTML = `<p>❌ Erro ao gerar receita.</p>`;
  }
}

gerarBtn.addEventListener('click', () => {
  const ingredientes = input.value.trim();
  if (!ingredientes) {
    alert('Digite pelo menos um ingrediente!');
    return;
  }
  gerarReceita(ingredientes);
});

surpresaBtn.addEventListener('click', () => {
  const exemplos = ["frango e batata", "arroz e feijão", "ovos e queijo", "macarrão e tomate"];
  const aleatorio = exemplos[Math.floor(Math.random() * exemplos.length)];
  input.value = aleatorio;
  gerarReceita(aleatorio);
});
