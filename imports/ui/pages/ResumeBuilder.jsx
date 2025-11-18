// imports/ui/pages/ResumeBuilder.jsx
import React, { useState, useRef } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  IconButton,
  CircularProgress,
  Stack,
  Chip,
  Snackbar,
  Alert,
  Avatar,
} from '@mui/material';
import { Add, Remove, Edit, Download, PhotoCamera, Delete } from '@mui/icons-material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// --- Section Header with Icon ---
function Section({ heading, icon, children, showIcon = true }) {
  return (
    <Box mb={3}>
      <Typography
        variant="h5"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          textTransform: 'uppercase',
          borderBottom: '2px solid #3b82f6',
          pb: 0.5,
          mb: 2,
        }}
      >
        {showIcon && icon && <span style={{ fontSize: 26 }}>{icon}</span>} {heading}
      </Typography>
      {children}
    </Box>
  );
}

export default function ResumeBuilder() {
  // --- UI State ---
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState('classic'); // 'classic' | 'elegant'

  // --- Info States ---
  const [info, setInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
  });
  const [avatar, setAvatar] = useState(null); // ✅ optional photo (data URL)
  const [work, setWork] = useState([
    { company: '', title: '', location: '', start: '', end: '', bullets: '' },
  ]);
  const [education, setEducation] = useState([
    { institution: '', degree: '', field: '', start: '', end: '' },
  ]);
  const [skills, setSkills] = useState('');
  const [projects, setProjects] = useState('');
  const [certifications, setCertifications] = useState('');
  const [languages, setLanguages] = useState('');

  // --- Validation/Error States ---
  const [error, setError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  // --- AI Summary (optional) ---
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  // --- PDF Preview ---
  const [preview, setPreview] = useState(false);
  const previewRef = useRef();

  // --- Helpers ---
  const validWork = work.filter((w) => w.title || w.company || w.bullets);
  const validEdu = education.filter((e) => e.degree || e.institution);
  const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean);
  const displayedSkills = skillList.slice(0, 5);

  // --- Handlers ---
  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setInfo((i) => ({ ...i, [name]: value }));
  };
  const handleWorkChange = (idx, field) => (e) => {
    const v = e.target.value;
    setWork((w) => {
      const a = [...w];
      a[idx] = { ...a[idx], [field]: v };
      return a;
    });
  };
  const addWork = () =>
    setWork((w) => [
      ...w,
      { company: '', title: '', location: '', start: '', end: '', bullets: '' },
    ]);
  const removeWork = (idx) => setWork((w) => w.filter((_, i) => i !== idx));
  const handleEduChange = (idx, field) => (e) => {
    const v = e.target.value;
    setEducation((ea) => {
      const a = [...ea];
      a[idx] = { ...a[idx], [field]: v };
      return a;
    });
  };
  const addEdu = () =>
    setEducation((ea) => [
      ...ea,
      { institution: '', degree: '', field: '', start: '', end: '' },
    ]);
  const removeEdu = (idx) => setEducation((ea) => ea.filter((_, i) => i !== idx));

  // --- Avatar upload/remove ---
  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      setError('Please upload a PNG, JPG, or WEBP image.');
      setShowSnackbar(true);
      return;
    }
    // Optional: 3MB size cap
    if (file.size > 3 * 1024 * 1024) {
      setError('Image is too large. Please keep it under 3MB.');
      setShowSnackbar(true);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };
  const clearAvatar = () => setAvatar(null);

  // --- Validation on Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Basic validation
    if (!info.fullName || !info.email || !info.phone) {
      setError('Full name, email, and phone are required.');
      setShowSnackbar(true);
      return;
    }
    if (work.length === 0 || !work[0].title || !work[0].company) {
      setError('Please enter at least one job with title and company.');
      setShowSnackbar(true);
      return;
    }
    setLoading(true);
    try {
      setStep(2);
      setPreview(true);
    } catch (err) {
      setError('Something went wrong. Try again.');
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // --- PDF Download ---
  const downloadPDF = async () => {
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 300));
    const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true });
    const img = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(img, 'PNG', 0, 0, w, h);
    pdf.save('resume.pdf');
  };

  // ---------- PREVIEW ----------
  if (preview) {
    return (
      <Container
        maxWidth="md"
        sx={{
          py: 6,
          background: 'linear-gradient(120deg, #f8fafc, #e0e7ff 60%)',
          minHeight: '100vh',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
            🖨️ Resume Preview
          </Typography>
          <Typography variant="body1" sx={{ color: '#374151', mb: 0.5 }}>
            Template: <b>{template === 'classic' ? 'Classic' : 'Elegant'}</b>
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 1.5 }}>
            <Button
              size="small"
              variant={template === 'classic' ? 'contained' : 'outlined'}
              onClick={() => setTemplate('classic')}
            >
              Classic
            </Button>
            <Button
              size="small"
              variant={template === 'elegant' ? 'contained' : 'outlined'}
              onClick={() => setTemplate('elegant')}
            >
              Elegant
            </Button>
          </Box>
          <Typography variant="body1" sx={{ color: '#374151' }}>
            Review your resume. Click <b>Edit</b> to make changes or <b>Download</b> as PDF.
          </Typography>
        </Box>

        {/* ==== CLASSIC (UNCHANGED) ==== */}
        {template === 'classic' ? (
          <Paper
            ref={previewRef}
            elevation={6}
            sx={{
              p: 4,
              pb: 10,
              mt: 0,
              pt: 0,
              background: '#fff',
              borderRadius: 5,
              boxShadow: '0 8px 40px #0002',
              maxWidth: 900,
              minHeight: 'auto',
              mx: 'auto',
            }}
          >
            {/* HEADER */}
            <Typography variant="h3" fontWeight="bold" color="#1e293b">
              {info.fullName}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {info.email} • {info.phone}
              {info.linkedin && <> • LinkedIn: {info.linkedin}</>}
              {info.github && <> • GitHub: {info.github}</>}
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {/* CAREER SUMMARY */}
            <Section heading="Career Summary" icon="💡" showIcon={false}>
              {summary && (
                <Typography sx={{ mb: 1, color: '#334155' }}>{summary}</Typography>
              )}
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {work[0].title && <Chip label={work[0].title} color="primary" />}
                {work[0].start && (
                  <Chip label={`${work[0].start}–${work[0].end}`} color="secondary" />
                )}
                {displayedSkills.map((s, i) => (
                  <Chip key={i} label={s} variant="outlined" />
                ))}
                {skillList.length > 5 && (
                  <Chip
                    label={`+${skillList.length - 5} more`}
                    variant="outlined"
                    sx={{ fontStyle: 'italic' }}
                  />
                )}
              </Stack>
            </Section>

            {/* EXPERIENCE */}
            {validWork.length > 0 && (
              <Section heading="Experience" icon="💼" showIcon={false}>
                {validWork.map((w, i) => (
                  <Box key={i} mb={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" fontWeight="medium">
                        {w.company}
                      </Typography>
                      {w.location && (
                        <Typography variant="body1" fontWeight="bold" color="text.secondary">
                          {w.location}
                        </Typography>
                      )}
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="subtitle1">{w.title}</Typography>
                      {w.start && (
                        <Typography variant="body1" fontWeight="bold" color="text.secondary">
                          {w.start} – {w.end}
                        </Typography>
                      )}
                    </Box>
                    <Box
                      component="ul"
                      sx={{ pl: 3, m: 0, listStyleType: 'disc', color: '#1e293b' }}
                    >
                      {w.bullets
                        .split(';')
                        .map((b, j) => b.trim() && <li key={j}>{b.trim()}</li>)}
                    </Box>
                  </Box>
                ))}
              </Section>
            )}

            {/* EDUCATION */}
            {validEdu.length > 0 && (
              <Section heading="Education" icon="🎓" showIcon={false}>
                {validEdu.map((e, i) => (
                  <Box key={i} mb={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Box>
                        <Typography variant="h6" fontWeight="medium">
                          {e.degree}
                          {e.field ? `, ${e.field}` : ''}
                        </Typography>
                        <Typography variant="subtitle2" color="primary">
                          {e.institution}
                        </Typography>
                      </Box>
                      {e.start && (
                        <Typography variant="body1" fontWeight="bold" color="text.secondary">
                          {e.start} – {e.end}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Section>
            )}

            {/* SKILLS */}
            {skillList.length > 0 && (
              <Section heading="Skills" icon="🏷️" showIcon={false}>
                <Stack direction="row" flexWrap="wrap" spacing={1}>
                  {skillList.map((s, i) => (
                    <Chip key={i} label={s} variant="outlined" />
                  ))}
                </Stack>
              </Section>
            )}

            {/* PROJECTS */}
            {projects.trim() && (
              <Section heading="Projects" icon="🚀" showIcon={false}>
                <Box
                  component="ul"
                  sx={{ pl: 3, m: 0, listStyleType: 'disc', color: '#1e293b' }}
                >
                  {projects
                    .split('\n')
                    .map((p, i) => p.trim() && <li key={i}>{p.trim()}</li>)}
                </Box>
              </Section>
            )}

            {/* CERTIFICATIONS */}
            {certifications.trim() && (
              <Section heading="Certifications" icon="📜" showIcon={false}>
                <Box
                  component="ul"
                  sx={{ pl: 3, m: 0, listStyleType: 'disc', color: '#1e293b' }}
                >
                  {certifications
                    .split('\n')
                    .map((c, i) => c.trim() && <li key={i}>{c.trim()}</li>)}
                </Box>
              </Section>
            )}

            {/* LANGUAGES */}
            {languages.trim() && (
              <Section heading="Languages" icon="🌍" showIcon={false}>
                <Typography>{languages}</Typography>
              </Section>
            )}
            <Box height={64} />
          </Paper>
        ) : (
          /* ==== ELEGANT (new template with optional avatar) ==== */
          <Paper
            ref={previewRef}
            elevation={6}
            sx={{
              background: '#ffffff',
              borderRadius: 5,
              overflow: 'hidden',
              boxShadow: '0 8px 40px #0002',
              maxWidth: 900,
              mx: 'auto',
            }}
          >
            {/* Top banner */}
            <Box
              sx={{
                background: 'linear-gradient(180deg,#1e3a8a 0%, #1e40af 100%)',
                color: '#fff',
                px: 4,
                py: 3,
                display: 'grid',
                gridTemplateColumns: avatar ? '1fr 120px' : '1fr',
                alignItems: 'center',
                gap: 2,
              }}
            >
              {/* Left side: name + contacts */}
              <Box>
                <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: 1 }}>
                  {info.fullName || 'YOUR NAME'}
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.95, mt: 0.5 }}>
                  {work[0]?.title || 'Your Headline / Role'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1.2 }}>
                  {info.email} • {info.phone}
                  {info.linkedin && <> • {info.linkedin}</>}
                  {info.github && <> • {info.github}</>}
                </Typography>
              </Box>

              {/* Right side: optional avatar */}
              {avatar && (
                <Box sx={{ display: 'flex', justifyContent: 'end' }}>
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      border: '4px solid #ffffff',
                      boxShadow: '0 0 0 3px rgba(255,255,255,0.25)',
                      overflow: 'hidden',
                      background: '#fff',
                    }}
                  >
                    {/* Using img ensures html2canvas captures it perfectly */}
                    <img
                      src={avatar}
                      alt="Profile"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                </Box>
              )}
            </Box>

            {/* Content grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 3, p: 4 }}>
              {/* Left column – Experience & Projects */}
              <Box>
                {/* Experience */}
                {validWork.length > 0 && (
                  <Box mb={3}>
                    <Typography
                      variant="h5"
                      sx={{
                        color: '#1f2937',
                        fontWeight: 700,
                        mb: 1,
                        borderBottom: '3px solid #1e40af',
                        display: 'inline-block',
                        pr: 1,
                      }}
                    >
                      EXPERIENCE
                    </Typography>
                    {validWork.map((w, i) => (
                      <Box key={i} sx={{ mb: 2.5 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                          }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            {w.company}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: '#475569', fontWeight: 600 }}
                          >
                            {w.start}
                            {w.start && (w.end ? ` – ${w.end}` : ' – Present')}
                          </Typography>
                        </Box>
                        <Typography variant="subtitle1" sx={{ color: '#1f2937', fontWeight: 600 }}>
                          {w.title}
                          {w.location ? ` • ${w.location}` : ''}
                        </Typography>
                        <Box
                          component="ul"
                          sx={{ pl: 3, m: 0, mt: 0.5, listStyleType: '"•  "', color: '#334155' }}
                        >
                          {w.bullets
                            .split(';')
                            .map((b, j) => b.trim() && (
                              <li key={j} style={{ marginBottom: 4 }}>{b.trim()}</li>
                            ))}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Projects */}
                {projects.trim() && (
                  <Box mb={3}>
                    <Typography
                      variant="h5"
                      sx={{
                        color: '#1f2937',
                        fontWeight: 700,
                        mb: 1,
                        borderBottom: '3px solid #1e40af',
                        display: 'inline-block',
                        pr: 1,
                      }}
                    >
                      PROJECTS
                    </Typography>
                    <Box
                      component="ul"
                      sx={{ pl: 3, m: 0, listStyleType: '"•  "', color: '#334155' }}
                    >
                      {projects
                        .split('\n')
                        .map((p, i) => p.trim() && (
                          <li key={i} style={{ marginBottom: 4 }}>{p.trim()}</li>
                        ))}
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Right column – Summary, Skills, Education, Certifications, Languages */}
              <Box>
                {/* Summary */}
                {(summary || work[0].title) && (
                  <Box
                    mb={3}
                    sx={{
                      background: '#eff6ff',
                      borderLeft: '4px solid #1d4ed8',
                      p: 2,
                      borderRadius: 1.5,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1d4ed8', mb: 0.5 }}>
                      SUMMARY
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#0f172a' }}>
                      {summary ||
                        `Experienced ${work[0].title || 'professional'} with a track record of delivering results.`}
                    </Typography>
                  </Box>
                )}

                {/* Strengths */}
                {skillList.length > 0 && (
                  <Box mb={3}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>
                      STRENGTHS
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {skillList.map((s, i) => (
                        <Chip
                          key={i}
                          label={s}
                          size="small"
                          sx={{ background: '#e2e8f0', color: '#0f172a', fontWeight: 600 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Education */}
                {validEdu.length > 0 && (
                  <Box mb={3}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>
                      EDUCATION
                    </Typography>
                    {validEdu.map((e, i) => (
                      <Box key={i} sx={{ mb: 1.2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                          {e.institution}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#334155' }}>
                          {e.degree}
                          {e.field ? `, ${e.field}` : ''}{' '}
                          {e.start && ` • ${e.start} – ${e.end || 'Present'}`}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Certifications */}
                {certifications.trim() && (
                  <Box mb={3}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>
                      CERTIFICATIONS
                    </Typography>
                    <Box
                      component="ul"
                      sx={{ pl: 3, m: 0, listStyleType: '"•  "', color: '#334155' }}
                    >
                      {certifications
                        .split('\n')
                        .map((c, i) => c.trim() && (
                          <li key={i} style={{ marginBottom: 4 }}>{c.trim()}</li>
                        ))}
                    </Box>
                  </Box>
                )}

                {/* Languages */}
                {languages.trim() && (
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>
                      LANGUAGES
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#0f172a' }}>
                      {languages}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Paper>
        )}

        {/* Sticky Buttons */}
        <Box
          mt={4}
          display="flex"
          justifyContent="center"
          gap={2}
          position="sticky"
          bottom={16}
          zIndex={100}
        >
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => {
              setPreview(false);
              setStep(1);
            }}
          >
            Edit
          </Button>
          <Button variant="contained" startIcon={<Download />} onClick={downloadPDF}>
            Download PDF
          </Button>
        </Box>
      </Container>
    );
  }

  // ---------- MAIN FORM ----------
  return (
    <Container
      maxWidth="md"
      sx={{ py: 6, background: 'linear-gradient(120deg, #e0e7ff, #f8fafc 60%)', minHeight: '100vh' }}
    >
      {/* --- Modern Header Block --- */}
      <Box
        sx={{
          textAlign: 'center',
          mb: 4,
          background: 'linear-gradient(90deg, #c3dafe 0%, #e0e7ff 100%)',
          borderRadius: 4,
          py: 4,
          px: { xs: 2, sm: 6 },
          boxShadow: '0 4px 20px #0001',
        }}
      >
        <Typography variant="h3" fontWeight="bold" color="#3b3663" gutterBottom>
          🛠️ Resume Builder
        </Typography>
        <Typography variant="h6" color="#4736c7">
          Create a beautiful resume in minutes. Just add your experience, we’ll help with the rest!
        </Typography>
        <Typography variant="body2" sx={{ color: '#5f6c9e', mt: 1 }}>
          <b>Step 1:</b> Enter your details → <b>Step 2:</b> Preview & Download PDF
        </Typography>

        {/* --- Template Picker (NEW) --- */}
        <Box sx={{ mt: 2, display: 'inline-flex', gap: 1, background: '#eef2ff', borderRadius: 999, p: 0.5 }}>
          <Button size="small" variant={template === 'classic' ? 'contained' : 'text'} onClick={() => setTemplate('classic')}>
            Classic
          </Button>
          <Button size="small" variant={template === 'elegant' ? 'contained' : 'text'} onClick={() => setTemplate('elegant')}>
            Elegant
          </Button>
        </Box>
      </Box>

      {/* --- Main Form --- */}
      <Paper elevation={3} sx={{ p: 4, backgroundColor: '#fafaff', borderRadius: 4 }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
          {/* --- Personal Info --- */}
          <Section heading="Profile" icon="👤">
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
              <TextField
                label="Full Name"
                name="fullName"
                value={info.fullName}
                onChange={handleInfoChange}
                required
                fullWidth
              />
              <TextField
                label="Email"
                name="email"
                value={info.email}
                onChange={handleInfoChange}
                required
                fullWidth
                type="email"
              />
              <TextField
                label="Phone Number"
                name="phone"
                value={info.phone}
                onChange={handleInfoChange}
                required
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} sx={{ mt: 2 }}>
              <TextField
                label="LinkedIn (text/URL)"
                name="linkedin"
                value={info.linkedin}
                onChange={handleInfoChange}
                fullWidth
                helperText="Paste just your username or a full URL."
              />
              <TextField
                label="GitHub (text/URL)"
                name="github"
                value={info.github}
                onChange={handleInfoChange}
                fullWidth
                helperText="Paste just your username or a full URL."
              />
            </Stack>

            {/* ✅ Optional photo upload (used by Elegant template) */}
            <Box
              sx={{
                mt: 2,
                p: 2,
                border: '1px dashed #c7cbe9',
                borderRadius: 2,
                background: '#eef2ff',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Avatar
                src={avatar || undefined}
                alt="Avatar preview"
                sx={{ width: 72, height: 72, border: '2px solid #fff', boxShadow: '0 0 0 2px #c7d2fe' }}
              />
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <input id="avatar-input" type="file" accept="image/*" hidden onChange={onAvatarChange} />
                <label htmlFor="avatar-input">
                  <Button component="span" variant="outlined" size="small" startIcon={<PhotoCamera />}>
                    {avatar ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                </label>
                {avatar && (
                  <Button variant="text" color="error" size="small" startIcon={<Delete />} onClick={clearAvatar}>
                    Remove
                  </Button>
                )}
              </Box>
              <Typography variant="caption" sx={{ color: '#5b5f86' }}>
                Optional. JPG/PNG/WEBP • up to 3MB. Appears in the Elegant template header.
              </Typography>
            </Box>
          </Section>

          {/* --- Work Experience --- */}
          <Section heading="Experience" icon="💼">
            {work.map((w, i) => (
              <Paper key={i} sx={{ p: 2, mb: 2, position: 'relative', background: '#e7eefd' }} elevation={1}>
                {work.length > 1 && (
                  <IconButton
                    size="small"
                    onClick={() => removeWork(i)}
                    sx={{ position: 'absolute', top: 4, right: 4, color: '#7c3aed' }}
                  >
                    <Remove />
                  </IconButton>
                )}
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
                  <TextField label="Company" value={w.company} onChange={handleWorkChange(i, 'company')} fullWidth />
                  <TextField label="Job Title" value={w.title} onChange={handleWorkChange(i, 'title')} fullWidth />
                  <TextField
                    label="Location (City, State)"
                    value={w.location}
                    onChange={handleWorkChange(i, 'location')}
                    fullWidth
                  />
                </Stack>
                <Stack direction="row" gap={2} sx={{ mt: 2 }}>
                  <TextField label="Start (e.g. Oct 2020)" value={w.start} onChange={handleWorkChange(i, 'start')} fullWidth />
                  <TextField
                    label="End (e.g. Mar 2021 or Present)"
                    value={w.end}
                    onChange={handleWorkChange(i, 'end')}
                    fullWidth
                  />
                </Stack>
                <TextField
                  label="Bullets (separate with ; )"
                  value={w.bullets}
                  onChange={handleWorkChange(i, 'bullets')}
                  fullWidth
                  multiline
                  rows={2}
                  sx={{ mt: 2 }}
                  helperText="Example: Led migration to cloud; Trained team; Improved uptime by 20%."
                />
              </Paper>
            ))}
            <Button startIcon={<Add />} onClick={addWork} sx={{ mt: 1 }}>
              Add Job
            </Button>
          </Section>

          {/* --- Education --- */}
          <Section heading="Education" icon="🎓">
            {education.map((e, i) => (
              <Paper key={i} sx={{ p: 2, mb: 2, position: 'relative', background: '#e7eefd' }} elevation={1}>
                {education.length > 1 && (
                  <IconButton
                    size="small"
                    onClick={() => removeEdu(i)}
                    sx={{ position: 'absolute', top: 4, right: 4, color: '#7c3aed' }}
                  >
                    <Remove />
                  </IconButton>
                )}
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
                  <TextField label="Degree" value={e.degree} onChange={handleEduChange(i, 'degree')} fullWidth />
                  <TextField label="Field of Study / Major" value={e.field} onChange={handleEduChange(i, 'field')} fullWidth />
                  <TextField label="Institution" value={e.institution} onChange={handleEduChange(i, 'institution')} fullWidth />
                </Stack>
                <Stack direction="row" gap={2} sx={{ mt: 2 }}>
                  <TextField label="Start (e.g. Aug 2017)" value={e.start} onChange={handleEduChange(i, 'start')} fullWidth />
                  <TextField
                    label="End (e.g. May 2021 or Present)"
                    value={e.end}
                    onChange={handleEduChange(i, 'end')}
                    fullWidth
                  />
                </Stack>
              </Paper>
            ))}
            <Button startIcon={<Add />} onClick={addEdu} sx={{ mt: 1 }}>
              Add Education
            </Button>
          </Section>

          {/* --- Skills --- */}
          <Section heading="Skills" icon="🏷️">
            <TextField
              label="Skills (comma separated)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              fullWidth
              multiline
              rows={1}
              helperText="Example: Python, SQL, Machine Learning, Leadership"
            />
          </Section>

          {/* --- Projects --- */}
          <Section heading="Projects" icon="🚀">
            <TextField
              label="Projects (each on its own line)"
              value={projects}
              onChange={(e) => setProjects(e.target.value)}
              fullWidth
              multiline
              rows={3}
              helperText="List major projects, each on a separate line."
            />
          </Section>

          {/* --- Certifications --- */}
          <Section heading="Certifications" icon="📜">
            <TextField
              label="Certifications (each on its own line)"
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
              fullWidth
              multiline
              rows={2}
              helperText="Example: AWS Certified Solutions Architect"
            />
          </Section>

          {/* --- Languages --- */}
          <Section heading="Languages" icon="🌍">
            <TextField
              label="Languages"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              fullWidth
              multiline
              rows={2}
              helperText="Example: English (fluent), Arabic (native), Malay (intermediate)"
            />
          </Section>

          {/* --- Submit --- */}
          <Box textAlign="center" mt={2}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Download />}
              sx={{ px: 4 }}
            >
              {loading ? 'Generating…' : 'Continue to Preview'}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* --- Error Snackbar --- */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setShowSnackbar(false)} sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}
