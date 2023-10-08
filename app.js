require('dotenv').config();

const OpenAIApi = require('openai');

const openai = new OpenAIApi({
	apiKey: process.env.OPENAI_API_KEY,
}); 

const modifiers = {
  "perform": `Craft titles that trigger a strong fear of missing out. Engage the reader's curiosity with hints of uncovered secrets or little-known facts. Infuse a sense of urgency or potential regret. Feel free to structure titles as listicles that promise exclusive insights.`,
  "educate": `Design titles that stand as a beacon of knowledge. They should convey clarity, authority, and trustworthiness. Let the reader know they're about to embark on an enlightening journey that'll enrich their understanding.`,
  "tutorial": `The titles should be an inviting gateway to hands-on learning. Explicitly mention the end goal of the tutorial, emphasizing the ease and simplicity of the process. E.g., "Build a Chat App in Just 10 Minutes: Step-by-Step Guide!"`,
  "review": `Craft titles that are teeming with intrigue about the product or service under review. Tease shocking discoveries or unexpected outcomes. E.g., "Reviewing the Newest Smartphone: Here's Why Everyone's Stunned!"`,
  "list": `Listicle titles should be direct and enticing. They should highlight the value of the list's content and what the reader stands to gain. E.g., "7 Life-Changing Habits of Successful People: Number 5 Will Surprise You!"`,
  "comparison": `Titles should spotlight the products or ideas being compared while arousing extreme curiosity. Hint at unexpected revelations or shocking disparities. E.g., "Comparing the Top 3 Fitness Watches: One Clearly Stands Above the Rest!"`,
}

function GeneratePrompt(niche, topic, avatar, goal, listicles) {
  niche = niche.toUpperCase();
  return `Please generate me ten high performing video ideas and titles in the ${niche} niche.
  The topic I am focusing on in this video is ${topic}. The audience I am trying to reach is ${avatar}.

  Modifiers: ${modifiers[goal]}
  ${listicles ? `You may include listicles` : 'Please do not use listicles.'}`
}

const express = require('express');
const path = require('path');
const app = express();

// Point express to the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/generate', async (req, res, next) => {
  console.log("prompt received")
  const niche = req.query.niche;
  const topic = req.query.topic;
  const avatar = req.query.avatar;
  const goal = req.query.goal;
  const listicles = req.query.listicles;

  console.log(niche, topic, avatar, goal, listicles)
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: GeneratePrompt(niche, topic, avatar, goal, listicles) }],
    model: 'gpt-3.5-turbo',
  });
  let titleString = chatCompletion.choices[0].message.content;
  try {
    const matches = titleString.match(/"(.*?)"/g);
    const titlesJson = matches.map(title => title.replace(/"/g, ''));
    console.log(titlesJson)
    res.status(200).json(titlesJson);
  } catch (error) {
    console.log(error)
    res.status(500).json({error: error})
  }

})

