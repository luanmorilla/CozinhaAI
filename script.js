const el = (sel) => document.querySelector(sel);
const els = (sel) => document.querySelectorAll(sel);

const ingredientsInput = el('#ingredients');
const timeSelect = el('#time');
const servingsSelect = el('#servings');
const cuisineSelect = el('#cuisine');
const dietsCheckboxes = els('.diet');
const btnGenerate = el('#generate');
const statusEl = el('#status');

const resultCard = el('#result');
const titleEl = el('#title');
const timeBadge = el('#timeBadge');
const servingsBadge = el('#servingsBadge');
const cuisineBadge = el('#cuisineBadge');
const tagsWrap = el('#dietTags');
const ingList = el('#ingredientsList');
const stepsList = el('#stepsList');
const tipsBox = el('#tipsBox');
const tipsList = el('#tipsList');

function showStatus(msg) {
  statusEl.textContent = msg;
  statusEl.hidden = !msg;
}
function clearResult() {
  resultCard.hidden = true;
  titleEl.textContent = '';
  timeBadge.textContent = '';
  servingsBadge.textContent = '';
  cuisineBadge.textContent = '';
  cuisineBadge.hidden = true;
  tagsWrap.innerHTML = '';
  ingList.innerHTML = '';
  stepsList.innerHTML = '';
  tipsList.innerHTML = '';
  tipsBox.hidden = true;
}
function renderRecipe(r) {
  titleEl.textContent = r.title || 'Receita';
  timeBadge.textContent = `⏱️ ${r.time_total_minutes || '?'} min`;
  servingsBadge.textContent = `🍽️ ${r.servings || '?'} porções`;
  if (r.cuisine) { cuisineBadge.textContent = r.cuisine; cuisineBadge.hidden = false; }

  tagsWrap.innerHTML = '';
  (r.diet_tags || []).forEach(t => {
    const span = document.createElement('span');
    span.className = 'badge';
    span.textContent = t;
    tagsWrap.appendChild(span);
  });

  ingList.innerHTML = '';
  (r.ingredients || []).forEach(i => {
    const li = document.createElement('li');
    li.textContent = i;
    ingList.appendChild(li);
  });

  stepsList.innerHTML = '';
  (r.steps || []).forEach((s, idx) => {
    const li = document.createElement('li');
    li.textContent = s;
    stepsList.appendChild(li);
  });

  if (r.tips && r.tips.length) {
    tipsBox.hidden = false;
    r.tips.forEach(t => {
      const li = document.createElement('li');
      li.textContent = t;
      tipsList.appendChild(li);
    });
  } else {
    tipsBox.hidden = true;
  }

  resultCard.hidden = false;
}

async function callAI(payload) {
  const res = await fetch('/api/recipe', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const txt = await res.text().catch(()=> '');
    throw new Error(`API erro (${res.status}): ${txt}`);
  }
  return await res.json();
}

function fallbackRecipe(ings, servings, time, cuisine, diets) {
  // Bem simples, só pra não deixar o usuário na mão se a IA cair
  const hasEgg = /ovo/i.test(ings);
  const hasPasta = /macarr|espaguete|massa/i.test(ings);
  const hasRice = /arroz/i.test(ings);
  const hasChicken = /frango/i.test(ings);

  if (hasPasta) {
    return {
      title: 'Macarrão de panela rápida',
      servings: servings || 4,
      time_total_minutes: time || 20,
      cuisine: cuisine || 'italiana',
      diet_tags: diets,
      ingredients: ['macarrão (250g)', 'alho', 'azeite', 'tomate picado', 'sal', 'pimenta', 'queijo ralado'],
      steps: [
        'Cozinhe o macarrão conforme a embalagem.',
        'Refogue alho no azeite, junte tomate e acerte sal/pimenta.',
        'Misture o macarrão ao molho e finalize com queijo.'
      ],
      tips: ['Adicione manjericão para mais aroma.', 'Coloque atum ou frango desfiado se tiver.']
    };
  }
  if (hasRice && hasChicken) {
    return {
      title: 'Arroz de frango cremoso',
      servings: servings || 4,
      time_total_minutes: time || 30,
      cuisine: cuisine || 'brasileira',
      diet_tags: diets,
      ingredients: ['arroz (2 xícaras)', 'frango cozido/desfiado', 'cebola', 'alho', 'creme de leite', 'sal', 'pimenta'],
      steps: [
        'Refogue cebola e alho, junte o frango e tempere.',
        'Some o arroz e água (proporção 1:2), cozinhe.',
        'Finalize com creme de leite para cremosidade.'
      ],
      tips: ['Ervilha e milho combinam muito bem.', 'Sirva com queijo por cima.']
    };
  }
  if (hasEgg) {
    return {
      title: 'Omelete reforçado',
      servings: servings || 2,
      time_total_minutes: time || 10,
      cuisine: cuisine || 'rápida',
      diet_tags: diets,
      ingredients: ['ovos (3)', 'sal', 'pimenta', 'queijo', 'tomate picado', 'cebolinha'],
      steps: [
        'Bata os ovos com sal e pimenta.',
        'Despeje na frigideira quente e adicione recheios.',
        'Dobre e sirva quando firmar.'
      ],
      tips: ['Pode assar no forno para versão “frittata”.']
    };
  }
  return {
    title: 'Refogado criativo de panela',
    servings: servings || 3,
    time_total_minutes: time || 25,
    cuisine: cuisine || 'caseira',
    diet_tags: diets,
    ingredients: ['óleo/azeite', 'o que tiver: legume, proteína, grãos', 'sal', 'pimenta', 'temperos'],
    steps: [
      'Pique tudo em pedaços médios.',
      'Refogue ingredientes duros primeiro, depois os demais.',
      'Acerte tempero e finalize com ervas.'
    ],
    tips: ['Um toque de limão no final realça os sabores.']
  };
}

btnGenerate.addEventListener('click', async () => {
  clearResult();

  const ingredients = (ingredientsInput.value || '').trim();
  if (!ingredients) {
    showStatus('Digite pelo menos 2–3 ingredientes.');
    return;
  }

  const time = timeSelect.value ? parseInt(timeSelect.value,10) : undefined;
  const servings = servingsSelect.value ? parseInt(servingsSelect.value,10) : 4;
  const cuisine = cuisineSelect.value || undefined;
  const diets = Array.from(dietsCheckboxes).filter(i=>i.checked).map(i=>i.value);

  showStatus('Gerando sua receita… 🍳');
  try {
    const payload = { ingredients, time, servings, cuisine, diets };
    const data = await callAI(payload);

    // Espera JSON no formato { recipe: {...} }
    const recipe = data?.recipe;
    if (!recipe || !recipe.title) throw new Error('Resposta inválida da IA.');

    renderRecipe(recipe);
    showStatus('');
  } catch (e) {
    console.warn('IA indisponível, usando fallback:', e.message);
    const r = fallbackRecipe(ingredients, servings, time, cuisine, diets);
    renderRecipe(r);
    showStatus('Modo offline: receita criada sem IA.');
  }
});

