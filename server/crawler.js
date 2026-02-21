import fetch from 'node-fetch';
import cheerio from 'cheerio';

// Crawler for fetching data from external websites
export const crawlWebsite = async (url, selectors = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const data = {
      url,
      title: $('title').text() || '',
      description: $('meta[name="description"]').attr('content') || '',
      image: $('meta[property="og:image"]').attr('content') || '',
      fetched_at: new Date().toISOString(),
      sections: {}
    };

    // Custom selectors for specific data extraction
    Object.entries(selectors).forEach(([key, selector]) => {
      data.sections[key] = [];
      $(selector.item).each((index, element) => {
        if (index < (selector.limit || 10)) {
          const item = {};
          Object.entries(selector.fields || {}).forEach(([fieldName, fieldSelector]) => {
            item[fieldName] = $(element).find(fieldSelector).text().trim();
          });
          data.sections[key].push(item);
        }
      });
    });

    return data;
  } catch (error) {
    console.error(`Crawl error for ${url}:`, error);
    throw error;
  }
};

// Crawl GIOE website for opportunities/updates
export const crawlGIOE = async () => {
  const selectors = {
    announcements: {
      item: '.announcement-item, .news-item, .update-item',
      limit: 10,
      fields: {
        title: '.title, h3, .heading',
        description: '.description, p, .content',
        date: '.date, .posted-date, time',
        link: 'a'
      }
    },
    opportunities: {
      item: '.opportunity, .job, .opening',
      limit: 5,
      fields: {
        title: '.title, h4, .job-title',
        company: '.company, .organization',
        description: '.description, p',
        link: 'a'
      }
    },
    events: {
      item: '.event, .webinar, .workshop',
      limit: 5,
      fields: {
        title: '.title, h4, .event-name',
        date: '.date, .event-date',
        time: '.time, .event-time',
        location: '.location, .venue',
        link: 'a'
      }
    }
  };

  try {
    return await crawlWebsite('https://gioe.netlify.app/', selectors);
  } catch (error) {
    console.error('GIOE crawl failed:', error);
    return { error: 'Failed to crawl GIOE website' };
  }
};

// Extract links from a page
export const extractLinks = async (url) => {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const links = [];
    $('a').each((index, element) => {
      const href = $(element).attr('href');
      const text = $(element).text().trim();
      if (href && text) {
        links.push({
          text,
          url: new URL(href, url).href,
          title: $(element).attr('title') || text
        });
      }
    });

    return links;
  } catch (error) {
    console.error('Extract links error:', error);
    return [];
  }
};

// Cache crawled data
let crawlCache = {
  gioe: {
    data: null,
    timestamp: null,
    ttl: 6 * 60 * 60 * 1000 // 6 hours
  }
};

export const getCachedGIOEData = async () => {
  const now = Date.now();
  const cached = crawlCache.gioe;

  // Return cached data if still valid
  if (cached.data && (now - cached.timestamp) < cached.ttl) {
    return cached.data;
  }

  // Fetch new data
  const data = await crawlGIOE();
  crawlCache.gioe = {
    data,
    timestamp: now,
    ttl: 6 * 60 * 60 * 1000
  };

  return data;
};

export default {
  crawlWebsite,
  crawlGIOE,
  extractLinks,
  getCachedGIOEData
};
