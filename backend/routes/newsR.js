import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

const getFallbackNews = () => [{
  title: 'Live Cricket Updates',
  summary: 'Stay tuned for real-time match updates and breaking news',
  url: '#',
  image: 'https://images.unsplash.com/photo-1613771404724-40f261e1dabb',
  date: new Date().toISOString(),
  source: 'Cricket Live'
}];

router.get('/', async (req, res) => {
  try {
    const apiKey = process.env.NEWSDATA_API_KEY;
    //console.log(apiKey);
    if (!apiKey) {
      console.log('Using fallback news data (missing API key)');
      return res.json({ success: true, news: getFallbackNews() });
    }

    const response = await fetch(
      `https://newsdata.io/api/1/news?apikey=${apiKey}&q=cricket&language=en&category=sports`
    );

    if (!response.ok) {
      throw new Error(`News API responded with ${response.status}`);
    }

    const data = await response.json();
    
    const news = (data.results || []).map((article, index) => ({
      id: `news-${index}-${Date.now()}`,
      title: article.title || 'Cricket Update',
      summary: article.description || 'Click to read full story',
      url: article.link || '#',
      image: article.image_url || 'https://images.unsplash.com/photo-1589481734519-1e7f1d722b9d',
      date: article.pubDate ? new Date(article.pubDate).toISOString() : new Date().toISOString(),
      source: article.source_id || 'Cricket News Network'
    }));

    res.json({
      success: true,
      news: news.slice(0, 10)
    });

  } catch (error) {
    console.error('News API Error:', error.message);
    res.status(200).json({
      success: true,
      news: getFallbackNews()
    });
  }
});

export default router;