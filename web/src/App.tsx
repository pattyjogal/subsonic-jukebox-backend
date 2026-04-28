import { useState, useEffect } from 'react';
import { 
  Container, 
  TextField, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  IconButton, 
  Typography, 
  Box, 
  Paper,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
  createTheme,
  ThemeProvider,
  CssBaseline
} from '@mui/material';
import { Search, Plus, Music2 } from 'lucide-react';
import axios from 'axios';

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverArtUrl?: string;
}

const theme = createTheme({
  palette: {
    primary: { main: '#6366f1' },
    background: { default: '#f8fafc' }
  },
  shape: { borderRadius: 12 }
});

const api = axios.create({
  baseURL: window.location.origin
});

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length > 2) {
        searchSongs();
      } else {
        setResults([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const searchSongs = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
      setResults(response.data);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
    }
  };

  const addToQueue = async (song: Song) => {
    try {
      await api.post('/queue/add', song);
      setMessage({ text: `Added "${song.title}" to queue!`, type: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to add to queue.', type: 'error' });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }} color="primary" gutterBottom>
            Jukebox
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Guest Search
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ p: 1, borderRadius: 4, bgcolor: 'background.paper', mb: 3, border: '1px solid', borderColor: 'divider' }}>
          <TextField
            fullWidth
            placeholder="Search for a song..."
            variant="standard"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            slotProps={{
              input: {
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start" sx={{ pl: 2 }}>
                    <Search size={20} />
                  </InputAdornment>
                ),
                endAdornment: loading && (
                  <InputAdornment position="end" sx={{ pr: 2 }}>
                    <CircularProgress size={20} />
                  </InputAdornment>
                ),
                sx: { height: 56, fontSize: '1.1rem' }
              }
            }}
          />
        </Paper>

        <List sx={{ width: '100%' }}>
          {results.map((song) => (
            <ListItem
              key={song.id}
              sx={{ 
                mb: 1, 
                borderRadius: 3, 
                border: '1px solid', 
                borderColor: 'divider',
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'action.hover' }
              }}
              secondaryAction={
                <IconButton edge="end" color="primary" onClick={() => addToQueue(song)}>
                  <Plus size={24} />
                </IconButton>
              }
            >
              <ListItemAvatar>
                <Avatar variant="rounded" src={song.coverArtUrl} sx={{ width: 48, height: 48 }}>
                  <Music2 size={24} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={song.title}
                secondary={`${song.artist} • ${song.album}`}
                sx={{ pr: 4 }}
                slotProps={{
                  primary: { sx: { fontWeight: 'medium' }, noWrap: true },
                  secondary: { noWrap: true }
                }}
              />
            </ListItem>
          ))}
        </List>

        <Snackbar 
          open={!!message} 
          autoHideDuration={3000} 
          onClose={() => setMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          {message ? (
            <Alert severity={message.type} variant="filled" sx={{ width: '100%', borderRadius: 3 }}>
              {message.text}
            </Alert>
          ) : undefined}
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default App;
