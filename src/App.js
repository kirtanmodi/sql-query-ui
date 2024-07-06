import React, { useState } from "react";
import axios from "axios";
import moment from "moment-timezone";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  CssBaseline,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#007AFF",
    },
    background: {
      default: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
    h4: {
      fontWeight: 700,
      fontSize: "2rem",
    },
    h6: {
      fontWeight: 500,
      fontSize: "1.25rem",
    },
    body1: {
      fontSize: "1rem",
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: "1rem",
          color: "#333",
          fontFamily: "Roboto, sans-serif",
          padding: "8px",
        },
        head: {
          fontWeight: 700,
          fontFamily: "Arial, sans-serif",
        },
        body: {
          fontWeight: 500,
          fontFamily: "Arial, sans-serif",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          fontSize: "1rem",
          color: "#333",
          fontFamily: "Roboto, sans-serif",
        },
      },
    },
  },
});

function App() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState([]);
  const [sqlQuery, setSqlQuery] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    setErrorMessage("");
    setSqlQuery("");
    try {
      console.log("question", question);
      const response = await axios.post("http://localhost:11000/query", { question });
      const data = response.data;
      const convertedResult = data.result.map((row) => {
        if (row.OrderIssueDate) {
          row.OrderIssueDate = moment(row.OrderIssueDate).tz("America/Chicago").format("YYYY-MM-DD HH:mm:ss");
        }
        if (row.RequestedShipByDate) {
          row.RequestedShipByDate = moment(row.RequestedShipByDate).tz("America/Chicago").format("YYYY-MM-DD HH:mm:ss");
        }
        return row;
      });
      setResult(convertedResult);
      setSqlQuery(data.sqlQuery);
    } catch (error) {
      setResult([]);
      setError(true);
      setErrorMessage(error.message);
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError(false);
  };

  const renderTableHeader = () => {
    if (result.length > 0) {
      const keys = Object.keys(result[0]);
      return (
        <TableHead>
          <TableRow>
            {keys.map((key) => (
              <TableCell key={key}>{key}</TableCell>
            ))}
          </TableRow>
        </TableHead>
      );
    }
    return null;
  };

  const renderTableBody = () => {
    if (result.length > 0) {
      const keys = Object.keys(result[0]);
      return (
        <TableBody>
          {result.map((row, index) => (
            <TableRow key={index}>
              {keys.map((key) => (
                <TableCell key={key}>{typeof row[key] === "number" ? row[key].toFixed(2) : row[key] ? row[key] : "N/A"}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      );
    }
    return null;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
        <Card
          variant="outlined"
          sx={{
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
            borderRadius: 4,
            p: 4,
            backgroundColor: "#fff",
          }}
        >
          <CardContent>
            <Typography variant="h4" gutterBottom align="center" sx={{ color: "#000", fontWeight: 600 }}>
              TOC Middleware - LOU EDW DEV{" "}
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Ask a question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                variant="outlined"
                margin="normal"
                InputProps={{
                  style: { fontSize: "1.5rem", fontWeight: 700 },
                }}
                InputLabelProps={{
                  style: { fontSize: "1.2rem", fontWeight: 600 },
                }}
                sx={{ mb: 3, borderRadius: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{
                  borderRadius: 4,
                  textTransform: "none",
                  boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  },
                  py: 2,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                }}
              >
                {loading ? <CircularProgress size={24} /> : "Submit"}
              </Button>
            </form>
            {sqlQuery && (
              <Box mt={4}>
                <Typography variant="h6" sx={{ color: "#007BFF" }}>
                  Generated SQL Query:
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    backgroundColor: "#f0f0f0",
                    p: 2,
                    borderRadius: 2,
                    overflow: "auto",
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                  }}
                >
                  {sqlQuery}
                </Box>
              </Box>
            )}
            {result.length > 0 && (
              <Box mt={4}>
                <Typography variant="h6" sx={{ color: "#007BFF" }}>
                  Result:
                </Typography>
                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
                  <Table sx={{ minWidth: 650 }} aria-label="result table">
                    {renderTableHeader()}
                    {renderTableBody()}
                  </Table>
                </TableContainer>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
      <Snackbar open={error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: "100%", fontWeight: 600, fontSize: "1.2rem" }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
