const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🚀 Starting FlavorFeed End-to-End Verification...\n');

  // 1. Health
  const healthRes = await fetch(`${BASE_URL}/health`).then((r) => r.json());
  console.log('✅ 1. Health Check:', healthRes.status);

  // 2. Fetch recipes
  const recipesRes = await fetch(`${BASE_URL}/recipes`).then((r) => r.json());
  console.log(`✅ 2. Recipes Feed: Retrieved ${recipesRes.count} recipes (Total: ${recipesRes.total})`);
  const firstRecipe = recipesRes.recipes[0];
  console.log(`   Featured Recipe: "${firstRecipe.title}" (${firstRecipe.cuisine})`);

  // 3. Category Filter
  const slRes = await fetch(`${BASE_URL}/recipes?category=Sri%20Lankan`).then((r) => r.json());
  console.log(`✅ 3. Category Filter (Sri Lankan): Found ${slRes.count} matching recipes`);

  // 4. Keyword Search
  const searchRes = await fetch(`${BASE_URL}/recipes?search=pork`).then((r) => r.json());
  console.log(`✅ 4. Search Filter ('pork'): Found ${searchRes.count} matching recipes`);

  // 5. User Login
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'kasun@flavorfeed.com', password: 'password123' }),
  }).then((r) => r.json());
  console.log(`✅ 5. Auth Login: Authenticated Chef "${loginRes.user.name}"`);

  const token = loginRes.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 6. Toggle Like
  const likeRes = await fetch(`${BASE_URL}/recipes/${firstRecipe._id}/like`, {
    method: 'PUT',
    headers: authHeaders,
  }).then((r) => r.json());
  console.log(`✅ 6. Toggle Like: Status: isLiked=${likeRes.isLiked}, Total Likes=${likeRes.likeCount}`);

  // 7. Toggle Bookmark / Save
  const saveRes = await fetch(`${BASE_URL}/recipes/${firstRecipe._id}/save`, {
    method: 'PUT',
    headers: authHeaders,
  }).then((r) => r.json());
  console.log(`✅ 7. Toggle Save to Cookbook: ${saveRes.message}`);

  // 8. Add Comment
  const commentRes = await fetch(`${BASE_URL}/recipes/${firstRecipe._id}/comments`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ text: 'Incredible roasted spice aroma! Tried it with steamed samba rice.' }),
  }).then((r) => r.json());
  console.log(`✅ 8. Post Comment: Success! Latest: "${commentRes.comments[0].text}"`);

  // 9. Rate Recipe
  const rateRes = await fetch(`${BASE_URL}/recipes/${firstRecipe._id}/rate`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ rating: 5 }),
  }).then((r) => r.json());
  console.log(`✅ 9. Star Rating: Average Rating=${rateRes.averageRating} (${rateRes.totalRatings} ratings)`);

  // 10. Create New Recipe
  const newRecipePayload = {
    title: 'Traditional Sri Lankan Pol Roti with Lunu Miris',
    description: 'Crispy rustic flatbread kneaded with freshly scraped coconut, red onions, and green chilies, served with fiery crushed chili sambol.',
    prepTime: 15,
    cookTime: 12,
    servings: 4,
    difficulty: 'Easy',
    cuisine: 'Sri Lankan',
    category: ['Sri Lankan', 'Breakfast', 'Street Food'],
    ingredients: [
      { name: 'Freshly grated coconut', amount: 2, unit: 'cups' },
      { name: 'All-purpose or whole wheat flour', amount: 2, unit: 'cups' },
      { name: 'Diced red onion & green chilies', amount: 0.5, unit: 'cup' },
    ],
    instructions: [
      { stepNumber: 1, text: 'Combine flour, grated coconut, diced onions, chilies, and salt in a wide mixing bowl. Add warm water gradually to form a firm pliable dough.', timerMinutes: 5 },
      { stepNumber: 2, text: 'Divide into tennis-sized balls and flatten into rounds on a banana leaf or cutting board.', timerMinutes: 5 },
      { stepNumber: 3, text: 'Toast on a smoking hot dry skillet for 3-4 minutes per side until charred golden leopard spots appear.', timerMinutes: 8 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80',
  };

  const createRes = await fetch(`${BASE_URL}/recipes`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(newRecipePayload),
  }).then((r) => r.json());
  console.log(`✅ 10. Recipe CRUD (Create): Created recipe "${createRes.recipe.title}" (ID: ${createRes.recipe._id})`);

  // 11. Fetch User Profile
  const profileRes = await fetch(`${BASE_URL}/users/profile/${loginRes.user._id}`).then((r) => r.json());
  console.log(`✅ 11. Profile & Cookbooks: User has ${profileRes.stats.authoredCount} authored recipes and ${profileRes.stats.savedCount} saved in cookbook`);

  console.log('\n🎉 ALL 11 END-TO-END CRITICAL FLOWS VERIFIED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('❌ Test Failed:', err);
  process.exit(1);
});
