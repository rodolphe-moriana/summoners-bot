// index.js — Enhanced version with visible links, type-based emojis, and footer date
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { token, channelId } = require('./config');

// Base URLs for different content types
const HIVE_EVENT_URL = 'https://www.withhive.com/event/game/313';
const HIVE_NOTICE_URL = 'https://www.withhive.com/notice/game/313';
const HIVE_EVENT_DETAIL_URL = 'https://www.withhive.com/event/313/';
const HIVE_NOTICE_DETAIL_URL = 'https://www.withhive.com/notice/313/';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// Store IDs of already posted articles
let postedLinks = [];

// Load previously posted article IDs from file
function loadPosted() {
  try {
    if (fs.existsSync('./posted.json')) {
      const content = fs.readFileSync('./posted.json', 'utf8');
      console.log('📄 Content of posted.json:', content);
      postedLinks = JSON.parse(content);
    } else {
      console.log('⚠️ posted.json does not exist, creating with empty array');
      savePosted();
    }
  } catch (error) {
    console.error('❌ Error loading posted.json:', error);
    postedLinks = [];
  }
}

// Save posted article IDs to file
function savePosted() {
  try {
    fs.writeFileSync('./posted.json', JSON.stringify(postedLinks, null, 2), 'utf8');
    console.log('💾 Successfully saved posted.json with', postedLinks.length, 'articles');
  } catch (error) {
    console.error('❌ Error saving posted.json:', error);
  }
}

// Fetch event links from the events page
async function getEventLinks(page) {
  console.log('🌐 Fetching events...');
  await page.goto(HIVE_EVENT_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  const html = await page.content();
  const $ = cheerio.load(html);
  const events = [];

  // Find all event items
  $('li.event').each((_, el) => {
    const $el = $(el);
    const backgroundDiv = $el.find('[class^="background"]');
    const backgroundStyle = backgroundDiv.attr('style') || '';
    const imageMatch = backgroundStyle.match(/background-image:url\((.*?)\)/);
    const image = imageMatch ? imageMatch[1] : null;
    
    // Add https: protocol if URL starts with //
    const imageUrl = image ? (image.startsWith('//') ? `https:${image}` : image) : null;
    
    const onclick = $el.find('a').attr('onclick') || '';
    const idMatch = onclick.match(/\$notice\.goDetailUrlView\((\d+)\)/);
    const id = idMatch ? idMatch[1] : null;
    
    // Extract title and create event object if not already posted
    const title = $el.find('.title').text().trim();
    if (id && title && !postedLinks.includes(id)) {
      const url = `${HIVE_EVENT_DETAIL_URL}${id}`;
      events.push({ url, title, image: imageUrl, category: 'event', id });
      console.log(`📰 [EVENT] Found new event: ${title} (ID: ${id})`);
    }
  });

  return events;
}

// Fetch notice links from the notices page
async function getNoticeLinks(page) {
  console.log('🌐 Fetching notices...');
  await page.goto(HIVE_NOTICE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  const html = await page.content();
  const $ = cheerio.load(html);
  const notices = [];

  // Find all notice items
  $('#notice_list_ul li.row').each((_, el) => {
    const $el = $(el);
    // Find the link in the column
    const $col = $el.find('div.col');
    const $link = $col.find('a');
    const onclick = $link.attr('onclick') || '';
    const idMatch = onclick.match(/\$notice\.goDetailUrlView\((\d+)\)/);
    const id = idMatch ? idMatch[1] : null;

    // Get title from link text
    const title = $link.text().trim();
    
    console.log('Notice analyzed:', {
      title,
      id,
      onclick,
      alreadyPosted: postedLinks.includes(id),
      elementHTML: $el.html()
    });
    
    if (id && title && !postedLinks.includes(id)) {
      const url = `${HIVE_NOTICE_DETAIL_URL}${id}`;
      notices.push({ url, title, category: 'update', id });
      console.log(`📰 [NOTICE] Found new notice: ${title} (ID: ${id})`);
    }
  });

  console.log(`📊 Total notices found: ${notices.length}`);
  return notices;
}

// Fetch all new articles (events and notices)
async function getAllArticles() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    const events = await getEventLinks(page);
    const notices = await getNoticeLinks(page);
    await browser.close();
    return [...events, ...notices];
  } catch (error) {
    console.error('❌ Error fetching articles:', error);
    await browser.close();
    return [];
  }
}

// Post new articles to Discord
async function postNewArticles() {
  console.log('🔄 Starting check for new articles...');
  const articles = await getAllArticles();
  if (!articles.length) {
    console.log('📭 No new articles found.');
    return;
  }

  console.log(`📝 Found ${articles.length} new articles to post`);
  
  try {
    const channel = await client.channels.fetch(channelId);
    console.log(`✅ Discord channel found: ${channel.name}`);
  } catch (error) {
    console.error('❌ Error fetching Discord channel:', error);
    return;
  }

  for (const { url, title, category, image, id } of articles) {
    try {
      console.log(`📤 Attempting to send article: ${title}`);
      const emoji = category === 'event' ? '🎉' : '🛠️';
      const now = new Date();
      const dateStr = now.toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      // Create description based on content type
      const description = category === 'event' 
        ? `🆕 New event: Click the link below to see the details.\n\n🔗 ${url}`
        : `🆕 New update: Click the link below to see the details.\n\n🔗 ${url}`;

      const embed = new EmbedBuilder()
        .setTitle(`${emoji} [${category.toUpperCase()}] ${title}`)
        .setURL(url)
        .setDescription(description)
        .setColor(category === 'event' ? 0xffa500 : 0x1e90ff)
        .setFooter({ text: `📅 ${dateStr} • Summoners War • Hive` });

      if (image) {
        embed.setImage(image);
      }

      const channel = await client.channels.fetch(channelId);
      await channel.send({ embeds: [embed] });
      console.log(`✅ Article successfully posted: ${title}`);
      
      if (!postedLinks.includes(id)) {
        postedLinks.push(id);
        savePosted();
      }
    } catch (err) {
      console.error(`❌ Error sending article ${title}:`, err);
      console.error('Error details:', err.stack);
    }
  }
}

// Bot initialization
client.once('ready', () => {
  console.log(`✅ Bot connected as ${client.user.tag}`);
  console.log(`📊 Channel ID configured: ${channelId}`);
  loadPosted();
  postNewArticles();  // Initial check
  setInterval(postNewArticles, 10 * 60 * 1000);  // Check every 10 minutes
});

// Error handling for Discord client
client.on('error', (error) => {
  console.error('❌ Discord error:', error);
});

// Start the bot
client.login(token).catch(error => {
  console.error('❌ Discord login error:', error);
});
