import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button
} from '@mui/material';
import { FiLayers } from 'react-icons/fi';

// THEME BACKGROUND CSS (adjust SVG path as needed)
const pageBgStyle = {
  minHeight: '100vh',
  background: `
    linear-gradient(135deg, #1a2236 0%, #1f2a38 100%),
    url('/images/bg-pattern-tech.svg') repeat
  `,
  backgroundSize: 'cover',
  backgroundBlendMode: 'overlay',
};

const RESOURCES = {
  Blogs: [
    {
      title: 'Career Hacking for Developers',
      description: 'Strategic tips for breaking into your dream developer job successfully.',
      tags: ['Coding', 'Career'],
      link: 'https://dev.to/ashiqu_ali/career-hacking-for-developers-find-the-backdoor-to-your-dream-job-4pbi',
      thumbnail: 'https://img.freepik.com/free-photo/close-up-hand-young-hacker-who-is-typing-computer-keyboard_616370-1882.jpg?w=2000'
    },
    {
      title: 'Why I Love Programming Again',
      description: 'Reflection on rediscovering passion for software development.',
      tags: ['Inspiration', 'Software'],
      link: 'https://dev.to/razielrodrigues/i-know-why-i-love-programming-again-49fg',
      thumbnail: 'https://thumbs.dreamstime.com/b/happy-man-coder-glasses-office-portrait-website-development-software-engineering-screen-mature-programmer-smile-346087084.jpg'
    },
    {
      title: 'Career Reflections from Developer',
      description: 'Personal reflections on career growth and lessons from experience.',
      tags: ['Growth', 'Personal'],
      link: 'https://dev.to/deeheber/career-reflections-1joh',
      thumbnail: 'https://img.freepik.com/premium-photo/lightbulb-man-thinking-ideas-vision-goals-innovation-studio-grey-background-businessman-graphic-thoughtful-person-with-insight-entrepreneurship-problem-solving-solution_590464-180233.jpg?w=2000'
    },
    {
      title: 'Straightforward Developer Career Tips',
      description: 'Practical advice on using tools wisely in your programming career.',
      tags: ['Tools', 'Advice'],
      link: 'https://dev.to/cacilhas/career-tips-242a',
      thumbnail: 'https://static.vecteezy.com/system/resources/previews/002/213/988/original/flat-design-concept-programmer-coding-program-illustrate-free-vector.jpg'
    },
    {
      title: 'Importance of Career Laddering',
      description: 'How mapping expectations across roles boosts career clarity and growth.',
      tags: ['Career', 'Growth'],
      link: 'https://css-tricks.com/the-importance-of-career-laddering/',
      thumbnail: 'https://powerslides.com/wp-content/uploads/2021/01/Career-Path-Template-4.png'
    },
    {
      title: 'Technical Resume Writing Advice',
      description: 'Resume formatting tips to keep your technical profile clean and effective.',
      tags: ['Resume', 'Tips'],
      link: 'https://css-tricks.com/advice-for-writing-a-technical-resume/',
      thumbnail: 'https://as2.ftcdn.net/v2/jpg/04/78/87/25/1000_F_478872545_o6Cv6pq28O29PJHwwVG1h57ub1wWCjEH.jpg'
    },
    {
      title: 'How to Negotiate a Salary Offer',
      description: 'Step-by-step strategies to maximize your compensation.',
      tags: ['Salary', 'Negotiation'],
      link: 'https://www.indeed.com/career-advice/pay-salary/how-to-negotiate-salary',
      thumbnail: 'https://www.thebalancemoney.com/thmb/Mmw9ihohCyQP6bSEDLi0kGQU9MI=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/salary-negotiation-tips-how-to-get-a-better-offer-2063439-final-98a2eb6672294a8b822ec9bbe889e9ce.png'
    },
    {
      title: 'How to Land Your First Tech Job',
      description: 'Essential advice for aspiring tech professionals.',
      tags: ['Career', 'Tech'],
      link: 'https://www.careeraddict.com/land-first-job',
      thumbnail: 'https://lifedesignbyamy.com/wp-content/uploads/2020/07/first-job.png'
    }
  ],

  Videos: [
    {
      title: 'How to Find a Career You Genuinely Love',
      tags: ['Career', 'Love'],
      url: 'https://www.youtube.com/watch?v=O3m14PVOq_g',
      thumbnail: 'https://img.youtube.com/vi/O3m14PVOq_g/maxresdefault.jpg'
    },
    {
      title: 'How to Find Your Purpose',
      tags: ['Purpose', 'Growth'],
      url: 'https://www.youtube.com/watch?v=WzrALzUnZ0g',
      thumbnail: 'https://img.youtube.com/vi/WzrALzUnZ0g/maxresdefault.jpg'
    },
    {
      title: 'Career Advice When Feeling Stuck',
      tags: ['Advice', 'Motivation'],
      url: 'https://www.youtube.com/watch?v=_5ecgEXLoCA',
      thumbnail: 'https://img.youtube.com/vi/_5ecgEXLoCA/maxresdefault.jpg'
    },
    {
      title: 'How To Negotiate Salary After Job Offer',
      tags: ['Salary', 'Negotiation'],
      url: 'https://www.youtube.com/watch?v=J30wmYgzVXM&ab_channel=JeffSu',
      thumbnail: 'https://img.youtube.com/vi/J30wmYgzVXM/maxresdefault.jpg'
    },
    {
      title: '5 Resume Tips That Will Get You Hired',
      tags: ['Resume', 'Tips'],
      url: 'https://www.youtube.com/watch?v=8xdEvDzvDrI&ab_channel=WorkItDaily',
      thumbnail: 'https://img.youtube.com/vi/8xdEvDzvDrI/maxresdefault.jpg'
    },
    {
      title: 'AI for Your Career – Hype or Reality?',
      tags: ['AI', 'Career'],
      url: 'https://www.youtube.com/watch?v=6HV7PVKXQTo&ab_channel=DonGeorgevich',
      thumbnail: 'https://img.youtube.com/vi/6HV7PVKXQTo/maxresdefault.jpg'
    }
  ],

  Articles: [
    {
      title: 'Difference You Can Make in Grads’ Career',
      paragraphs: [
        'Discussing gaps between college training and workplace needs:',
        '• Speaking up in meetings',
        '• Collaborating with managers',
        '• Effective onboarding and mentorship'
      ],
      tags: ['Mentoring', 'Career'],
      link: 'https://hbr.org/podcast/2025/04/the-difference-you-can-make-in-a-recent-grads-career',
      thumbnail: 'https://s3.amazonaws.com/utep-uploads/wp-content/uploads/unr/2022/07/07060421/youth-mentoring-programs.jpg'
    },
    {
      title: 'Why Career Counselling Matters Now',
      paragraphs: [
        '• Examining increased demand for guidance amid uncertain job markets,',
        '• emphasizing personalized career planning and counseling benefits.'
      ],
      tags: ['Counseling', 'Advice'],
      link: 'https://theconversation.com/why-career-counselling-is-more-valuable-now-than-ever-before-62231',
      thumbnail: 'https://th.bing.com/th/id/OIP.KPb9oIK1h9uDVtY1yMxEmgHaE8?rs=1&pid=ImgDetMain'
    },
    {
      title: 'What’s Next for AI and Math?',
      paragraphs: [
        '• Exploring AI’s future role in mathematical discovery and reasoning,',
        '• tracing intersections with formal theorem proving and education.'
      ],
      tags: ['AI', 'Math'],
      link: 'https://www.technologyreview.com/2025/06/04/1117753/whats-next-for-ai-and-math/',
      thumbnail: 'https://www.shutterstock.com/image-vector/set-mathematical-neural-network-related-260nw-2167501489.jpg'
    },
    {
      title: 'The Ultimate Guide to Resume Formats',
      paragraphs: [
        '• Explains the differences between chronological, functional, and hybrid resumes.',
        '• Tips to choose the best format for your career stage.',
      ],
      tags: ['Resume', 'Guide'],
      link: 'https://www.zety.com/blog/resume-formats',
      thumbnail: 'https://i.pinimg.com/originals/d8/2b/c6/d82bc6b4cf0888e4a1eb760701d59a45.jpg'
    }
  ]
};

export default function Resources() {
  const [tab, setTab] = useState(0);
  const categories = Object.keys(RESOURCES);

  return (
    <Box sx={{ ...pageBgStyle, p: { xs: 2, md: 4 } }}>
      {/* Compact & Modern Header */}
      <Paper
        elevation={3}
        sx={{
          mb: 2,
          p: { xs: 2, sm: 3 },
          textAlign: 'center',
          background: 'rgba(25,30,44,0.92)',
          color: '#f1f5f9',
          borderRadius: 3,
          maxWidth: 900,
          margin: '0 auto',
          boxShadow: '0 6px 32px 0 rgba(16,185,129,0.12)',
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0 }}>
          <span style={{
            display: 'inline-flex',
            background: 'linear-gradient(90deg,#2563eb,#10b981 90%)',
            borderRadius: '16px',
            padding: '12px',
            marginRight: 18,
            boxShadow: '0 2px 10px #10b98130',
            fontSize: 0,
          }}>
            <FiLayers size={30} color="#fff" />
          </span>
          <Typography variant="h4" sx={{
            fontWeight: 700,
            fontSize: { xs: '1.5rem', md: '2rem' },
            background: 'linear-gradient(90deg, #38bdf8, #10b981 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block',
            letterSpacing: '.02em',
            mr: 2
          }}>
            Resources
          </Typography>
        </Box>
        <Typography
          variant="subtitle2"
          sx={{
            color: '#94a3b8',
            fontWeight: 400,
            fontSize: { xs: '1.02rem', md: '1.12rem' },
            mt: 1,
            mb: 0,
          }}
        >
          Curated blogs, videos, and articles to boost your career journey.
        </Typography>
        <div style={{
          margin: '0 auto', marginTop: 8, width: 70, height: 3, borderRadius: 8,
          background: 'linear-gradient(90deg, #10b981 20%, #3b82f6 90%)',
          boxShadow: '0 2px 12px #10b98150'
        }} />
      </Paper>

      {/* Modern Tabs */}
      <Tabs
        value={tab}
        onChange={(_, idx) => setTab(idx)}
        centered
        sx={{
          mb: 3,
          '& .MuiTab-root': {
            color: '#cbd5e1',
            fontWeight: 500,
            borderRadius: 99,
            minWidth: 130,
            px: 3,
            transition: 'all 0.17s'
          },
          '& .Mui-selected': {
            background: 'linear-gradient(90deg,#2563eb 60%,#10b981 100%)',
            color: '#fff',
            fontWeight: 700,
            boxShadow: '0 2px 18px #10b98133'
          },
          '& .MuiTabs-indicator': {
            display: 'none'
          }
        }}
      >
        {categories.map((c) => (
          <Tab key={c} label={c.toUpperCase()} />
        ))}
      </Tabs>

      {/* Cards Grid */}
      {categories.map((cat, i) => (
        <Box key={cat} hidden={tab !== i}>
          <Grid container spacing={3} alignItems="stretch" justifyContent="center">
            {RESOURCES[cat].map((item, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx} sx={{ display: 'flex' }}>
                <Card sx={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  bgcolor: '#1e293b',
                  color: '#f1f5f9',
                  flexGrow: 1,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.03)',
                    boxShadow: '0 8px 32px rgba(16,185,129,0.16)',
                  }
                }}>
                  <CardMedia
                    component="img"
                    image={item.thumbnail}
                    alt={item.title}
                    sx={{ height: 200, width: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = '/images/fallback.png'; }}
                  />
                  <CardContent sx={{ flexGrow: 1, px: 2, py: 2 }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1 }}>
                      {item.title}
                    </Typography>
                    {/* Tags */}
                    {item.tags && (
                      <Box sx={{ mb: 1 }}>
                        {item.tags.map((tag, tagIdx) => (
                          <span key={tagIdx} style={{
                            display: 'inline-block',
                            background: '#222e3a',
                            color: '#0ea5e9',
                            borderRadius: 999,
                            padding: '3px 14px',
                            marginRight: 8,
                            fontSize: 13,
                            fontWeight: 500,
                            marginBottom: 4,
                            boxShadow: '0 1px 3px #10b98111'
                          }}>{tag}</span>
                        ))}
                      </Box>
                    )}
                    {/* Description or Paragraphs */}
                    {cat === 'Articles' ? (
                      item.paragraphs.map((p, pi) => (
                        <Typography key={pi} variant="body2" sx={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
                          {p}
                        </Typography>
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
                        {item.description}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      href={item.link || item.url}
                      target="_blank"
                      rel="noreferrer"
                      sx={{
                        color: '#10b981',
                        borderColor: '#10b981',
                        '&:hover': {
                          backgroundColor: 'rgba(16,185,129,0.1)',
                          borderColor: '#10b981'
                        }
                      }}
                    >
                      {cat === 'Videos' ? 'WATCH' : 'VIEW'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
}
