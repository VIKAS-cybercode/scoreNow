import React, { useState, useEffect } from 'react';
import './News.css';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/cricket-news');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Handle both success and fallback cases
        if (data.news && data.news.length > 0) {
          setNews(data.news);
        } else {
          throw new Error('No news articles found');
        }
        
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        // Set temporary fallback data
        setNews([{
          title: 'Latest Cricket Updates',
          summary: 'Stay tuned for breaking cricket news and updates.',
          url: '#',
          image: 'https://via.placeholder.com/300',
          date: new Date().toISOString(),
          source: 'Cricket News'
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Date unavailable';
    }
  };

  if (loading) {
    return <div className="loading">Loading cricket news...</div>;
  }

  return (
    <div className="news-container">
      <h1 className="news-heading">Latest Cricket News</h1>
      {error && <div className="error-message">{error}</div>}
      
      <div className="news-grid">
        {news.map((article, index) => (
          <article key={index} className="news-card">
            <div className="image-container">
              <img
                src={article.image}
                alt={article.title}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300';
                }}
              />
            </div>
            <div className="content">
              <h2 className="article-title">{article.title}</h2>
              <p className="summary">{article.summary}</p>
              <div className="meta-data">
                <span className="source">{article.source}</span>
                <span className="date">{formatDate(article.date)}</span>
              </div>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="read-more"
              >
                Read Full Article →
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default News;