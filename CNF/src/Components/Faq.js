import React, { useState } from 'react';
import './Faq.css';

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqData = [
    {
      question: "How do I create my own team?",
      answer: "Navigate to 'My Teams' in your profile dashboard and click 'Create New Team'. You can add players, set team name, and upload your team logo."
    },
    {
      question: "How to add players to my team?",
      answer: "Go to your team management page, click 'Add Player', and search registered users. You can send join requests or add directly if you have their player ID."
    },
    {
      question: "How do I register a new tournament?",
      answer: "Go to 'Tournaments' in your dashboard and click 'Create Tournament'. Fill in details like format, dates, and rules. Submit for admin approval if required."
    },
    {
      question: "How to add teams to my cricket tournament?",
      answer: "In your tournament management panel, use 'Add Teams' option. You can invite existing teams from the platform or allow open registrations with a unique tournament code."
    },
    {
      question: "How do I start a scheduled match?",
      answer: "Navigate to your tournament's 'Matches' section, select the scheduled match, and click 'Start Match'. Ensure both teams have confirmed their squads first."
    },
    {
      question: "How does live scoring work during matches?",
      answer: "Use our scoring interface in the 'Live Matches' section. Designated scorers/umpires can input ball-by-ball data which updates leaderboards in real-time."
    },
    {
      question: "How do I check my personal stats?",
      answer: "Your personal performance stats are automatically tracked in your profile. Visit 'My Stats' section to view detailed batting/bowling analytics."
    },
    {
      question: "Why do I need to login to submit scores?",
      answer: "Login ensures score submissions are authenticated and linked to your profile. This maintains integrity of our competitive leaderboards."
    },
    {
      question: "How can I join an existing team?",
      answer: "Search teams in 'Community' section and send join requests. Team admins will need to approve your request before you're added."
    },
    {
      question: "How to post in the community blog?",
      answer: "Verified users can click 'Create Post' in Community section. Share team updates, player searches, or cricket insights with our community."
    },
    {
      question: "Can I recruit players through this platform?",
      answer: "Yes! Use 'Player Search' with filters for skills/position, or post in 'Team Recruitment' blog category to find potential players."
    },
    {
      question: "How to contact coaches listed on the platform?",
      answer: "Premium members can directly message verified coaches through our secure messaging system. Free users can send connection requests."
    },
    {
      question: "What verification is needed to coach?",
      answer: "Coaches must submit certification documents through our verification portal. Allow 3-5 business days for approval."
    },
    {
      question: "How are skill ratings calculated?",
      answer: "Our AI system analyzes match performance, peer ratings, and coach evaluations to generate dynamic skill ratings updated weekly."
    },
    {
      question: "Can I organize private matches?",
      answer: "Yes! Use 'Create Match' feature in Events section. Set privacy levels, invite specific teams, or open it to public registration."
    },
    {
      question: "How to reset my password?",
      answer: "Go to Account Settings > Security. You'll receive a password reset link via registered email. Contact support if issues persist."
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <div className="faq-header">
        <h1>Cricket Platform FAQs</h1>
        <p>Everything you need to know about teams, tournaments, and scoring</p>
      </div>
      
      <div className="faq-grid">
        {faqData.map((item, index) => (
          <div 
            className={`faq-card ${activeIndex === index ? 'active' : ''}`}
            key={index}
          >
            <div 
              className="faq-card-header"
              onClick={() => toggleFAQ(index)}
            >
              <div className="faq-icon">
                {activeIndex === index ? '−' : '+'}
              </div>
              <h3>{item.question}</h3>
            </div>
            <div className="faq-card-body">
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faq;