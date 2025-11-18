import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Snackbar,
  Alert,
  Divider,
  Link,
  IconButton,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import { FiUploadCloud } from "react-icons/fi";

// Pulse animation for drop zone border
const dropZoneStyle = (isDragging) => ({
  border: `2.5px dashed ${isDragging ? "#36d399" : "#22d3ee"}`,
  borderRadius: 14,
  padding: "1.5rem 1.2rem",
  marginBottom: "1.1rem",
  background: isDragging
    ? "rgba(34, 211, 238, 0.06)"
    : "rgba(31, 41, 55, 0.86)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 2,
  transition: "border 0.2s, background 0.2s",
  animation: isDragging ? "pulse-border 0.7s infinite" : "none",
  position: "relative",
});

// For the background (Haikei SVG)
const pageBgStyle = {
  minHeight: "100vh",
  background: `
    linear-gradient(135deg, #1a2236 0%, #1f2a38 100%),
    url('/images/haikei-bg.svg') repeat
  `,
  backgroundSize: "cover",
  backgroundBlendMode: "overlay",
  paddingBottom: "3vh",
};

export default function ResumeParser() {
  const MAX_FILES = 10;
  const [step, setStep] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const [parsedResumes, setParsedResumes] = useState([]);
  const [filterQuery, setFilterQuery] = useState("");
  const [filterMatches, setFilterMatches] = useState([]);

  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingFilter, setLoadingFilter] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);

  const showError = (msg) => {
    setErrorMessage(msg);
    setSnackbarOpen(true);
  };

  // File selection/drag-drop
  const handleFileSelection = (evt) => {
    const filesArray = Array.from(evt.target.files);
    const filtered = filesArray.filter((f) => {
      const n = f.name.toLowerCase();
      return n.endsWith(".pdf") || n.endsWith(".zip");
    });
    if (filtered.length === 0) {
      showError("Please select at least one PDF or ZIP (or drop a folder).");
      return;
    }
    if (selectedFiles.length + filtered.length > MAX_FILES) {
      showError(`You can only select up to ${MAX_FILES} files. Remove some to add more.`);
      return;
    }
    setSelectedFiles((prev) => [...prev, ...filtered]);
  };

  const onDragOver = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    setIsDragging(false);
    const dtFiles = Array.from(evt.dataTransfer.files);
    const filtered = dtFiles.filter((f) => {
      const n = f.name.toLowerCase();
      return n.endsWith(".pdf") || n.endsWith(".zip");
    });
    if (filtered.length === 0) {
      showError("Drop only PDF files or a ZIP. Make sure the folder contains PDFs.");
      return;
    }
    if (selectedFiles.length + filtered.length > MAX_FILES) {
      showError(`You can only select up to ${MAX_FILES} files. Remove some to add more.`);
      return;
    }
    setSelectedFiles((prev) => [...prev, ...filtered]);
  };

  // Remove a single file by index
  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    if (parsedResumes.length > 0) setParsedResumes([]);
  };
  // Clear all selected files
  const clearFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setParsedResumes([]);
    setFilterMatches([]);
    setStep(1);
  };

  // Step 1: Upload & Parse
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      showError("Please select at least one PDF or ZIP (or drop a folder).");
      return;
    }
    setLoadingUpload(true);
    setErrorMessage("");
    setParsedResumes([]);
    const formData = new FormData();
    if (
      selectedFiles.length === 1 &&
      selectedFiles[0].name.toLowerCase().endsWith(".zip")
    ) {
      formData.append("files", selectedFiles[0]);
    } else {
      selectedFiles.forEach((file) => {
        const name = file.name.toLowerCase();
        if (name.endsWith(".pdf")) {
          formData.append("files", file);
        }
      });
    }
    try {
      const resp = await fetch("http://localhost:5001/upload-resumes", {
        method: "POST",
        body: formData,
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Upload/Parse failed");
      }
      const data = await resp.json();
      setParsedResumes(data.parsed_resumes || []);
      setStep(2);
    } catch (err) {
      showError(`Upload failed: ${err.message}`);
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleReset = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setParsedResumes([]);
    setFilterQuery("");
    setFilterMatches([]);
    setStep(1);
  };

  // Step 2: Filter
  const handleFilter = async () => {
    if (!filterQuery.trim()) {
      showError("Please type your filter query (e.g. “I want Arabic skills”).");
      return;
    }
    if (parsedResumes.length === 0) {
      showError("No parsed resumes available. Please upload/parse first.");
      return;
    }
    setLoadingFilter(true);
    setErrorMessage("");
    setFilterMatches([]);
    try {
      const resp = await fetch("http://localhost:5001/filter-parsed-resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filter_query: filterQuery,
          parsed_resumes: parsedResumes,
        }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Filtering failed");
      }
      const data = await resp.json();
      setFilterMatches(data.matches || []);
    } catch (err) {
      showError(`Filter failed: ${err.message}`);
    } finally {
      setLoadingFilter(false);
    }
  };

  return (
    <Box sx={pageBgStyle}>
      {/* Animated Keyframes for Pulse */}
      <style>
        {`
        @keyframes pulse-border {
          0% { box-shadow: 0 0 0 0 #36d39944; }
          60% { box-shadow: 0 0 0 10px #36d39922; }
          100% { box-shadow: 0 0 0 0 #36d39944; }
        }
        `}
      </style>
      {/* HEADER */}
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{
          fontWeight: 700,
          color: "#ede9fe",
          mt: 5,
          letterSpacing: "-.01em",
        }}
      >
        <span role="img" aria-label="search" style={{ marginRight: 7 }}>
          <FiUploadCloud size={30} style={{ color: "#a78bfa", marginBottom: "-5px" }} />
        </span>
        AI Resume Parser
      </Typography>
      <Typography
        variant="subtitle1"
        align="center"
        sx={{ mb: 4, color: "#a0aec0" }}
      >
        Upload a batch of resumes (PDFs/ZIP), then let our AI shortlist those that match your requirements.
      </Typography>
      {/* Steps Indicator */}
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <span style={{
            display: "inline-block",
            width: 26, height: 26,
            background: "linear-gradient(90deg,#38bdf8 60%,#a78bfa 100%)",
            borderRadius: "50%",
            color: "#fff",
            fontWeight: 700,
            fontSize: 17,
            textAlign: "center",
            lineHeight: "26px",
            marginRight: 7,
          }}>1</span>
          <span style={{
            color: "#38bdf8", // More visible blue
            fontWeight: 600,
            fontSize: "1.09rem",
            letterSpacing: ".03em"
          }}>Upload</span>
        </Box>
        <div style={{
          width: 44, height: 3, borderRadius: 2, background: "linear-gradient(90deg,#a78bfa,#38bdf8 90%)"
        }} />
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <span style={{
            display: "inline-block",
            width: 26, height: 26,
            background: "#232e44",
            borderRadius: "50%",
            color: "#94a3b8",
            fontWeight: 700,
            fontSize: 17,
            textAlign: "center",
            lineHeight: "26px",
            marginRight: 7,
          }}>2</span>
          <span style={{
            color: "#6b7280",
            fontWeight: 600,
            fontSize: "1.09rem"
          }}>Filter</span>
        </Box>
      </Box>

      {/* STEP 1: UPLOAD */}
      {step === 1 && (
        <Paper
          elevation={6}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          sx={{
            maxWidth: 520,
            mx: "auto",
            p: { xs: 2, md: 3 },
            bgcolor: "rgba(34,43,60,0.96)",
            borderRadius: 5,
            boxShadow: "0 6px 36px 0 #22d3ee11",
            mt: 3,
            mb: 3,
            position: "relative"
          }}
        >
          {/* --- Animated Drop Zone --- */}
          <div style={dropZoneStyle(isDragging)}>
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadFileIcon />}
              sx={{
                bgcolor: "#2563eb",
                px: 2.7,
                py: 1.1,
                fontWeight: 700,
                fontSize: "1.06rem",
                letterSpacing: ".01em",
                boxShadow: "0 2px 16px #2563eb18",
                mr: 2
              }}
            >
              CHOOSE FILES/FOLDER
              <input
                ref={fileInputRef}
                type="file"
                hidden
                multiple
                accept=".pdf,.zip"
                webkitdirectory=""
                directory=""
                onChange={handleFileSelection}
              />
            </Button>
            <Typography variant="body2" sx={{ color: "#8ef4c7", fontStyle: "italic", mr: 1 }}>
              or drop PDFs/ZIP/folder here
              <span style={{ color: "#65e5be", marginLeft: 4, fontSize: "0.98em" }}>
                (max {MAX_FILES} files)
              </span>
            </Typography>
          </div>
          {/* Icon/Illustration below drop zone */}
          <div style={{ width: "100%", textAlign: "center", margin: "22px 0 0 0" }}>
            <FiUploadCloud size={42} style={{ color: "#a78bfa", opacity: 0.92 }} />
            <Typography sx={{ color: "#b1b7c3", mt: 1, fontSize: "1.01rem" }}>
              Drop your resumes or click to select files.
            </Typography>
          </div>
          {/* File list, error, and rest stays the same */}
          {selectedFiles.length > 0 && (
            <Box sx={{ mb: 1.5, mt: 2 }}>
              <Typography variant="subtitle2" sx={{ color: "#e1e8f0", mb: 1 }}>
                Selected Files:
              </Typography>
              <List
                sx={{
                  maxHeight: 140,
                  overflowY: "auto",
                  bgcolor: "#232e44",
                  borderRadius: 1,
                  border: "1px solid #334c6b",
                }}
              >
                {selectedFiles.map((file, idx) => (
                  <ListItem
                    key={idx}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => removeFile(idx)}
                      >
                        <CloseIcon sx={{ color: "#cbd5e1" }} fontSize="small" />
                      </IconButton>
                    }
                    sx={{
                      py: 0.5,
                      px: 1,
                      "&:hover": { bgcolor: "#273a49" },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography sx={{ color: "#f1f5f9", fontSize: "0.95rem" }}>
                          {file.name}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <Button
                size="small"
                onClick={clearFiles}
                sx={{
                  mt: 1,
                  color: "#e1e8f0",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#273a49" },
                }}
              >
                Clear All
              </Button>
            </Box>
          )}

          {/* UPLOAD button */}
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={
                loadingUpload ||
                (selectedFiles.length === 0 &&
                  fileInputRef.current &&
                  !fileInputRef.current.value)
              }
              sx={{
                bgcolor: "#a78bfa",
                color: "#1a2236",
                fontWeight: 700,
                px: 5,
                py: 1.2,
                fontSize: "1.11rem",
                boxShadow: "0 2px 16px #a78bfa28",
                "&:hover": { bgcolor: "#8b5cf6" },
              }}
            >
              {loadingUpload ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "UPLOAD & PARSE"
              )}
            </Button>
          </Box>

          {!parsedResumes.length && (
            <Typography
              variant="body2"
              sx={{ color: "#7c8ea9", mt: 2, textAlign: "center" }}
            >
              No resumés parsed yet. After uploading, you’ll see them listed here.
            </Typography>
          )}
        </Paper>
      )}

      {/* STEP 2: FILTER */}
      {step === 2 && (
        <Paper
          elevation={6}
          sx={{
            maxWidth: 600,
            mx: "auto",
            p: { xs: 2, md: 3 },
            bgcolor: "rgba(34,43,60,0.96)",
            borderRadius: 5,
            boxShadow: "0 6px 36px 0 #a78bfa19",
            mt: 4,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: "#e1e8f0" }}>
            Step 2: Enter Your Filter Query
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder={`e.g. “I want a senior software engineer who knows Arabic.”`}
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            sx={{
              bgcolor: "#1f3456",
              borderRadius: 1,
              input: { color: "#f1f5f9" },
              textarea: { color: "#f1f5f9" },
              mb: 2,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#334c6b",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4d668b",
              },
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: "#a78bfa",
                },
            }}
          />

          <Box sx={{ textAlign: "right", mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleReset}
              sx={{
                mr: 2,
                borderColor: "#cbd5e1",
                color: "#cbd5e1",
                "&:hover": { borderColor: "#e1e8f0", color: "#e1e8f0" },
              }}
            >
              Back to Upload
            </Button>
            <Button
              variant="contained"
              startIcon={<FilterListIcon />}
              onClick={handleFilter}
              disabled={loadingFilter || !filterQuery.trim()}
              sx={{
                bgcolor: "#38bdf8",
                color: "#101827",
                fontWeight: 700,
                boxShadow: "0 2px 12px #38bdf855",
                "&:hover": { bgcolor: "#2563eb", color: "#fff" },
              }}
            >
              {loadingFilter ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Filter"
              )}
            </Button>
          </Box>

          <Divider sx={{ bgcolor: "#334c6b", my: 2 }} />

          {filterMatches.length > 0 ? (
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ color: "#e1e8f0" }}>
                Matching Resumes ({filterMatches.length})
              </Typography>
              <List
                sx={{
                  maxHeight: 300,
                  overflowY: "auto",
                  bgcolor: "#232e44",
                  borderRadius: 1,
                }}
              >
                {filterMatches.map((fname, idx) => (
                  <React.Fragment key={idx}>
                    <ListItem sx={{ py: 1, px: 2 }}>
                      <ListItemText
                        primary={
                          <Link
                            href={`http://localhost:5001/resume-file/${encodeURIComponent(
                              fname
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                            sx={{
                              fontWeight: 500,
                              fontSize: "1rem",
                              color: "#a78bfa",
                            }}
                          >
                            {fname}
                          </Link>
                        }
                      />
                    </ListItem>
                    {idx < filterMatches.length - 1 && (
                      <Divider component="li" sx={{ bgcolor: "#334c6b" }} />
                    )}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          ) : loadingFilter ? (
            <Typography
              variant="body2"
              sx={{ color: "#94a3b8", mt: 2, textAlign: "center" }}
            >
              Filtering… please wait.
            </Typography>
          ) : (
            <Typography
              variant="body2"
              sx={{ color: "#94a3b8", mt: 2, textAlign: "center" }}
            >
              No matches yet. Type a query and hit “Filter” to see them.
            </Typography>
          )}
        </Paper>
      )}

      {/* Snackbar for any errors */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
