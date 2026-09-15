import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import Recipe from '../models/Recipe.js';

dotenv.config();

const seed = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Recipe.deleteMany({});

    console.log('[Seed] Creating demo users...');
    const kasun = await User.create({
      name: 'Chef Kasun Silva',
      email: 'kasun@flavorfeed.com',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&auto=format&fit=crop&q=80',
      bio: 'Executive Chef celebrating the bold, aromatic heritage of Sri Lankan coastal and hill-country cuisine.',
    });

    const sofia = await User.create({
      name: 'Chef Sofia Rossi',
      email: 'sofia@flavorfeed.com',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&auto=format&fit=crop&q=80',
      bio: 'Naples-trained baker & pasta artisan. Simplicity, fresh ingredients, and pure passion.',
    });

    const maya = await User.create({
      name: 'Maya Lin',
      email: 'maya@flavorfeed.com',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      bio: 'Culinary explorer & holistic nutritionist crafting colorful plant-based dishes from around the world.',
    });

    console.log('[Seed] Creating culinary masterpieces...');
    const recipesData = [
      {
        title: 'Authentic Sri Lankan Black Pork Curry',
        description:
          'A deeply aromatic, slow-simmered dark pork curry infused with dark roasted Sri Lankan curry powder, tart goraka (garcinia cambogia), lemongrass, and crushed black pepper. Unmatched depth of flavor.',
        prepTime: 20,
        cookTime: 45,
        servings: 4,
        difficulty: 'Medium',
        cuisine: 'Sri Lankan',
        category: ['Curry', 'Sri Lankan', 'Meat', 'Dinner'],
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=900&auto=format&fit=crop&q=80',
        author: kasun._id,
        ingredients: [
          { name: 'Pork belly or shoulder (cubed)', amount: 800, unit: 'g' },
          { name: 'Dark roasted Sri Lankan curry powder', amount: 3, unit: 'tbsp' },
          { name: 'Goraka (garcinia paste)', amount: 2, unit: 'pieces' },
          { name: 'Crushed black peppercorns', amount: 1.5, unit: 'tbsp' },
          { name: 'Red onions (finely sliced)', amount: 2, unit: 'medium' },
          { name: 'Garlic cloves (minced)', amount: 6, unit: 'cloves' },
          { name: 'Fresh ginger (grated)', amount: 1, unit: 'tbsp' },
          { name: 'Curry leaves & pandan leaf', amount: 2, unit: 'sprigs' },
          { name: 'Coconut oil', amount: 2, unit: 'tbsp' },
          { name: 'Sea salt', amount: 1, unit: 'tsp' },
        ],
        instructions: [
          {
            stepNumber: 1,
            text: 'Soak the goraka in 3 tablespoons of warm water for 10 minutes, then grind into a smooth dark paste.',
            timerMinutes: 10,
          },
          {
            stepNumber: 2,
            text: 'In a clay pot or heavy-bottomed pan, marinate the pork cubes with roasted curry powder, goraka paste, black pepper, and half the minced garlic and ginger for 20 minutes.',
            timerMinutes: 20,
          },
          {
            stepNumber: 3,
            text: 'Heat coconut oil over medium-high heat. Sauté sliced onions, remaining garlic, ginger, pandan leaf, and curry leaves until golden and intensely fragrant.',
            timerMinutes: 5,
          },
          {
            stepNumber: 4,
            text: 'Add the marinated pork to the pot. Sear over high heat for 6-8 minutes until the edges are caramelized and spices release their oils.',
            timerMinutes: 7,
          },
          {
            stepNumber: 5,
            text: 'Pour in 1 cup of warm water, cover with a tight lid, and simmer on low heat for 35 minutes until the pork is melt-in-the-mouth tender and the gravy is thick and dark.',
            timerMinutes: 35,
          },
        ],
        likes: [sofia._id, maya._id],
        ratings: [
          { user: sofia._id, rating: 5, createdAt: new Date() },
          { user: maya._id, rating: 5, createdAt: new Date() },
        ],
        comments: [
          {
            user: { _id: sofia._id, name: sofia.name, avatar: sofia.avatar },
            text: 'The depth of flavor from the dark roasted spices is magnificent! Pairs exquisitely with steamed basmati rice.',
            createdAt: new Date(Date.now() - 3600000 * 24),
          },
        ],
      },
      {
        title: 'Artisanal Sourdough Pizza Margherita',
        description:
          'Classic Neapolitan perfection featuring a 48-hour cold fermented sourdough crust, San Marzano tomato coulis, fresh fior di latte mozzarella, fragrant sweet basil, and extra virgin olive oil.',
        prepTime: 30,
        cookTime: 12,
        servings: 2,
        difficulty: 'Medium',
        cuisine: 'Italian',
        category: ['Italian', 'Pizza', 'Baking', 'Dinner'],
        imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=900&auto=format&fit=crop&q=80',
        author: sofia._id,
        ingredients: [
          { name: 'Sourdough pizza dough ball', amount: 2, unit: 'balls' },
          { name: 'San Marzano canned tomatoes (crushed)', amount: 250, unit: 'g' },
          { name: 'Fresh mozzarella (drained and sliced)', amount: 200, unit: 'g' },
          { name: 'Fresh basil leaves', amount: 10, unit: 'leaves' },
          { name: 'Extra virgin olive oil', amount: 2, unit: 'tbsp' },
          { name: 'Flaky sea salt', amount: 0.5, unit: 'tsp' },
          { name: 'Semolina flour for dusting', amount: 3, unit: 'tbsp' },
        ],
        instructions: [
          {
            stepNumber: 1,
            text: 'Preheat your oven with a pizza stone or baking steel to its highest setting (500°F / 260°C) for at least 45 minutes.',
            timerMinutes: 45,
          },
          {
            stepNumber: 2,
            text: 'Gently stretch each dough ball by hand on a semolina-dusted counter into a 12-inch round, keeping the outer crust pillowy and airy.',
            timerMinutes: 5,
          },
          {
            stepNumber: 3,
            text: 'Ladle crushed San Marzano tomatoes evenly across the dough, leaving a 1-inch border. Scatter torn mozzarella slices.',
            timerMinutes: 3,
          },
          {
            stepNumber: 4,
            text: 'Slide onto the preheated stone and bake for 8 to 10 minutes until the crust blisters with leopard spots and the cheese bubbles with golden peaks.',
            timerMinutes: 9,
          },
          {
            stepNumber: 5,
            text: 'Finish with fresh basil leaves and a generous swirl of extra virgin olive oil before slicing.',
            timerMinutes: 1,
          },
        ],
        likes: [kasun._id, maya._id],
        ratings: [
          { user: kasun._id, rating: 5, createdAt: new Date() },
          { user: maya._id, rating: 5, createdAt: new Date() },
        ],
        comments: [
          {
            user: { _id: kasun._id, name: kasun.name, avatar: kasun.avatar },
            text: 'Incredible blistering on that cornicione! Masterclass in dough fermentation.',
            createdAt: new Date(Date.now() - 3600000 * 12),
          },
        ],
      },
      {
        title: 'Creamy Coconut Dal & Fresh Pol Sambol',
        description:
          'Comfort in a bowl: split red lentils simmered in coconut milk, fresh turmeric, and tempered mustard seeds, accompanied by freshly grated spicy coconut relish with lime and chili.',
        prepTime: 15,
        cookTime: 20,
        servings: 4,
        difficulty: 'Easy',
        cuisine: 'Sri Lankan',
        category: ['Vegan', 'Sri Lankan', 'Curry', 'Quick & Easy'],
        imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=900&auto=format&fit=crop&q=80',
        author: kasun._id,
        ingredients: [
          { name: 'Red lentils (washed)', amount: 200, unit: 'g' },
          { name: 'Coconut milk', amount: 400, unit: 'ml' },
          { name: 'Ground turmeric', amount: 0.5, unit: 'tsp' },
          { name: 'Fenugreek seeds', amount: 0.5, unit: 'tsp' },
          { name: 'Curry leaves & green chilies', amount: 2, unit: 'sprigs' },
          { name: 'Freshly grated coconut (for sambol)', amount: 150, unit: 'g' },
          { name: 'Kashmiri chili powder', amount: 1, unit: 'tbsp' },
          { name: 'Shallots & fresh lime juice', amount: 2, unit: 'tbsp' },
        ],
        instructions: [
          {
            stepNumber: 1,
            text: 'Rinse red lentils until water runs clear. In a saucepan, simmer lentils with turmeric, fenugreek, sliced green chilies, and 1.5 cups of water for 12 minutes.',
            timerMinutes: 12,
          },
          {
            stepNumber: 2,
            text: 'Pour in thick coconut milk, season with salt, and simmer gently for another 8 minutes until creamy and luscious.',
            timerMinutes: 8,
          },
          {
            stepNumber: 3,
            text: 'For the Pol Sambol: in a mortar and pestle, grind shallots, chili powder, and salt into a paste. Fold in freshly grated coconut and squeeze generous lime juice.',
            timerMinutes: 5,
          },
          {
            stepNumber: 4,
            text: 'Serve hot dal crowned with fresh pol sambol, accompanied by warm roti or crusty bread.',
            timerMinutes: 1,
          },
        ],
        likes: [maya._id],
        ratings: [{ user: maya._id, rating: 5, createdAt: new Date() }],
        comments: [
          {
            user: { _id: maya._id, name: maya.name, avatar: maya.avatar },
            text: 'My absolute favorite comfort food! Creamy, nourishing, and vibrant.',
            createdAt: new Date(Date.now() - 3600000 * 6),
          },
        ],
      },
      {
        title: 'Ceremonial Matcha Green Tea Tiramisu',
        description:
          'An ethereal Japanese-Italian crossover: savoiardi ladyfingers soaked in ceremonial Uji matcha tea, layered between velvety mascarpone custard and finished with a dusting of emerald matcha.',
        prepTime: 25,
        cookTime: 0,
        servings: 6,
        difficulty: 'Medium',
        cuisine: 'Japanese',
        category: ['Dessert', 'Matcha', 'Vegetarian', 'Sweet'],
        imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=900&auto=format&fit=crop&q=80',
        author: sofia._id,
        ingredients: [
          { name: 'Ceremonial Uji matcha powder', amount: 3, unit: 'tbsp' },
          { name: 'Mascarpone cheese', amount: 450, unit: 'g' },
          { name: 'Heavy whipping cream', amount: 240, unit: 'ml' },
          { name: 'Powdered sugar', amount: 90, unit: 'g' },
          { name: 'Italian ladyfingers (savoiardi)', amount: 24, unit: 'pieces' },
          { name: 'Warm water (for whisking matcha)', amount: 250, unit: 'ml' },
          { name: 'Pure vanilla extract', amount: 1, unit: 'tsp' },
        ],
        instructions: [
          {
            stepNumber: 1,
            text: 'Whisk 2 tablespoons of matcha powder with warm water using a bamboo chasen until frothy and clump-free. Let cool.',
            timerMinutes: 4,
          },
          {
            stepNumber: 2,
            text: 'Whip heavy cream, powdered sugar, and vanilla extract until medium peaks form. Gently fold in mascarpone until silky and homogeneous.',
            timerMinutes: 5,
          },
          {
            stepNumber: 3,
            text: 'Quickly dip each ladyfinger into the cooled matcha tea for 1-2 seconds and arrange tightly in the base of your serving dish.',
            timerMinutes: 4,
          },
          {
            stepNumber: 4,
            text: 'Spread half the mascarpone cream over the ladyfingers. Repeat with a second soaked ladyfinger layer and top with remaining cream.',
            timerMinutes: 4,
          },
          {
            stepNumber: 5,
            text: 'Refrigerate for at least 4 hours (or overnight) to set. Dust generously with remaining matcha powder right before serving.',
            timerMinutes: 240,
          },
        ],
        likes: [kasun._id],
        ratings: [{ user: kasun._id, rating: 5, createdAt: new Date() }],
        comments: [],
      },
      {
        title: 'Golden Crispy Herb Falafel Mezze Bowl',
        description:
          'Crispy emerald-green falafels packed with fresh cilantro, parsley, cumin, and coriander, served over fluffy quinoa, pickled red onions, cucumber ribbons, and creamy garlic tahini.',
        prepTime: 25,
        cookTime: 15,
        servings: 3,
        difficulty: 'Easy',
        cuisine: 'Mediterranean',
        category: ['Vegan', 'Healthy', 'Lunch', 'Mediterranean'],
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&auto=format&fit=crop&q=80',
        author: maya._id,
        ingredients: [
          { name: 'Dry chickpeas (soaked overnight)', amount: 300, unit: 'g' },
          { name: 'Fresh parsley & cilantro leaves', amount: 1, unit: 'cup' },
          { name: 'Garlic cloves', amount: 4, unit: 'cloves' },
          { name: 'Ground cumin & coriander', amount: 2, unit: 'tsp' },
          { name: 'Baking soda', amount: 0.5, unit: 'tsp' },
          { name: 'Sesame tahini paste', amount: 4, unit: 'tbsp' },
          { name: 'Cooked quinoa or warm pita', amount: 200, unit: 'g' },
          { name: 'Pickled sumac onions & cucumbers', amount: 1, unit: 'cup' },
        ],
        instructions: [
          {
            stepNumber: 1,
            text: 'Pulse soaked chickpeas, fresh herbs, garlic, spices, and salt in a food processor until finely minced like coarse sand (do not puree). Chill dough for 30 minutes.',
            timerMinutes: 30,
          },
          {
            stepNumber: 2,
            text: 'Stir in baking soda. Shape dough into small patties or balls using a cookie scoop.',
            timerMinutes: 5,
          },
          {
            stepNumber: 3,
            text: 'Pan-fry or deep fry in hot oil (375°F / 190°C) for 4 minutes until deeply golden brown and crisp on the outside.',
            timerMinutes: 4,
          },
          {
            stepNumber: 4,
            text: 'Whisk tahini with lemon juice, minced garlic, and cold water until silky smooth.',
            timerMinutes: 3,
          },
          {
            stepNumber: 5,
            text: 'Assemble bowls with warm quinoa, crunchy falafel, pickled veggies, and drizzle tahini generously.',
            timerMinutes: 2,
          },
        ],
        likes: [kasun._id, sofia._id],
        ratings: [
          { user: kasun._id, rating: 5, createdAt: new Date() },
          { user: sofia._id, rating: 5, createdAt: new Date() },
        ],
        comments: [],
      },
      {
        title: 'Street-Style Sri Lankan Vegetable Kothu Roti',
        description:
          'The ultimate street-food symphony: warm godamba roti hand-chopped on a smoking hot griddle with shredded cabbage, leeks, carrots, farm eggs, and a punchy roasted curry sauce.',
        prepTime: 15,
        cookTime: 15,
        servings: 2,
        difficulty: 'Easy',
        cuisine: 'Sri Lankan',
        category: ['Street Food', 'Sri Lankan', 'Quick & Easy', 'Dinner'],
        imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=900&auto=format&fit=crop&q=80',
        author: kasun._id,
        ingredients: [
          { name: 'Sri Lankan godamba roti (cut into ribbons)', amount: 4, unit: 'sheets' },
          { name: 'Eggs (lightly beaten)', amount: 2, unit: 'large' },
          { name: 'Finely shredded cabbage & carrots', amount: 2, unit: 'cups' },
          { name: 'Leeks (sliced diagonally)', amount: 1, unit: 'cup' },
          { name: 'Red onion & green chilies', amount: 1, unit: 'cup' },
          { name: 'Spicy curry gravy', amount: 0.5, unit: 'cup' },
          { name: 'Curry powder & black pepper', amount: 1, unit: 'tsp' },
        ],
        instructions: [
          {
            stepNumber: 1,
            text: 'Heat 2 tablespoons of oil in a wide wok or flat griddle over high heat. Sauté onions, green chilies, and leeks for 2 minutes.',
            timerMinutes: 2,
          },
          {
            stepNumber: 2,
            text: 'Push veggies aside, crack in the eggs and scramble quickly until just set.',
            timerMinutes: 2,
          },
          {
            stepNumber: 3,
            text: 'Add shredded roti strips, cabbage, carrots, curry powder, and black pepper. Stir-fry vigorously using two metal spatulas in a rhythmic chopping motion.',
            timerMinutes: 5,
          },
          {
            stepNumber: 4,
            text: 'Pour the hot curry gravy over the roti and toss everything together until steam escapes and all flavors are locked in. Serve immediately with a lime wedge.',
            timerMinutes: 3,
          },
        ],
        likes: [maya._id],
        ratings: [{ user: maya._id, rating: 5, createdAt: new Date() }],
        comments: [],
      },
    ];

    const createdRecipes = await Recipe.create(recipesData);

    // Save bookmarks for users
    kasun.savedRecipes.push(createdRecipes[1]._id, createdRecipes[3]._id);
    await kasun.save();

    sofia.savedRecipes.push(createdRecipes[0]._id, createdRecipes[2]._id);
    await sofia.save();

    maya.savedRecipes.push(createdRecipes[2]._id, createdRecipes[4]._id);
    await maya.save();

    console.log(`[Seed] Successfully seeded ${createdRecipes.length} recipes and 3 demo foodies!`);
    console.log('Demo Credentials:');
    console.log(' - Chef Kasun: kasun@flavorfeed.com | password123');
    console.log(' - Chef Sofia: sofia@flavorfeed.com | password123');
    console.log(' - Maya Lin:   maya@flavorfeed.com  | password123');

    await closeDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
};

seed();
