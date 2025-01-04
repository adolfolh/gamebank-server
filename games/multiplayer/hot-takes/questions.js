const questions = [
    "Pineapple belongs on pizza 🍕",
    "Mobile games are better than console games 🎮",
    "Cats are better than dogs 🐱",
    "Summer is the worst season ☀️",
    "Breakfast food is good at any time of day 🍳",
    "Movie theaters should allow texting 📱",
    "Superhero movies are overrated 🦸‍♂️",
    "Remote work is better than office work 💻",
    "Books are better than their movie adaptations 📚",
    "Coffee is overrated ☕",
    "Mint chocolate is delicious 🍫",
    "Videogame DLC should be free 🎮",
    "Reality TV shows are scripted 📺",
    "Dark mode should be the default 🌙",
    "Emojis in professional emails are okay ✉️",
    "AI will replace programmers 🤖",
    "Physical books are better than e-books 📖",
    "Jump scares don't make a movie scary 🎬",
    "Vertical videos are acceptable 📱",
    "Hot drinks in summer make sense 🫖",
    "Listening to audiobooks counts as reading 🎧",
    "Spoilers don't ruin stories 🗣️",
    "Browser games were the golden age of gaming 🕹️",
    "Keyboards should make clicky sounds ⌨️",
    "Open offices improve productivity 🏢"
  ];
  
  function getRandomQuestion(usedQuestions = []) {
    const availableQuestions = questions.filter(q => !usedQuestions.includes(q));
    if (availableQuestions.length === 0) return questions[0];
    
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    return availableQuestions[randomIndex];
  }
  
  function isValidQuestion(question) {
    return questions.includes(question);
  }
  
  module.exports = {
    questions,
    getRandomQuestion,
    isValidQuestion
  };