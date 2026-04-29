import { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  TextField, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Typography, 
  Box, 
  Paper,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
  createTheme,
  ThemeProvider,
  CssBaseline,
  BottomNavigation,
  BottomNavigationAction,
  Button
} from '@mui/material';
import { Search as SearchIcon, ListMusic, Plus, Music2, Clock } from 'lucide-react';
import axios from 'axios';

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverArtUrl?: string;
}

interface QueueItem {
  queueId: string;
  song: Song;
  addedAt: number;
}

const theme = createTheme({
  palette: {
    primary: { main: '#6366f1' },
    background: { default: '#f8fafc' },
    secondary: { main: '#64748b' }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 16 }
});

const api = axios.create({
  baseURL: window.location.origin
});

const COOLDOWN_MS = 30000; // 30 seconds

function App() {
  const [tab, setTab] = useState(0); // 0 = Search, 1 = Queue
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const cooldownTimer = useRef<number | null>(null);

  useEffect(() => {
    checkCooldown();
    return () => { if (cooldownTimer.current) clearInterval(cooldownTimer.current); };
  }, []);

  const checkCooldown = () => {
    const lastAdded = parseInt(localStorage.getItem('jukebox_last_added') || '0');
    const now = Date.now();
    const diff = now - lastAdded;

    if (diff < COOLDOWN_MS) {
      setCooldownRemaining(Math.ceil((COOLDOWN_MS - diff) / 1000));
      if (!cooldownTimer.current) {
        cooldownTimer.current = window.setInterval(() => {
          checkCooldown();
        }, 1000);
      }
    } else {
      setCooldownRemaining(0);
      if (cooldownTimer.current) {
        clearInterval(cooldownTimer.current);
        cooldownTimer.current = null;
      }
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length > 2) searchSongs();
      else setResults([]);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    if (tab === 1) fetchQueue();
  }, [tab]);

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

  const fetchQueue = async () => {
    try {
      const response = await api.get('/queue');
      setQueue(response.data);
    } catch (error) {
      console.error('Failed to fetch queue', error);
    }
  };

  const addToQueue = async (song: Song) => {
    if (cooldownRemaining > 0) return;

    try {
      await api.post('/queue/add', song);
      localStorage.setItem('jukebox_last_added', Date.now().toString());
      checkCooldown();
      setMessage({ text: `Added "${song.title}" to queue!`, type: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to add to queue.', type: 'error' });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ pb: 8, pt: 2 }}>
        <Container maxWidth="sm">
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }} color="primary">JUKEBOX</Typography>
          </Box>

          {tab === 0 ? (
            <Box>
              <Paper elevation={0} sx={{ p: 0.5, mb: 3, border: '1px solid', borderColor: 'divider' }}>
                <TextField
                  fullWidth
                  placeholder="Search artist or song..."
                  variant="standard"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  slotProps={{
                    input: {
                      disableUnderline: true,
                      startAdornment: (
                        <InputAdornment position="start" sx={{ pl: 2 }}>
                          <SearchIcon size={20} />
                        </InputAdornment>
                      ),
                      endAdornment: loading && (
                        <InputAdornment position="end" sx={{ pr: 2 }}>
                          <CircularProgress size={20} />
                        </InputAdornment>
                      ),
                      sx: { height: 56 }
                    }
                  }}
                />
              </Paper>

              {cooldownRemaining > 0 && (
                <Alert icon={<Clock size={20}/>} severity="info" sx={{ mb: 2, borderRadius: 3 }}>
                  Cooldown active: wait {cooldownRemaining}s to add another.
                </Alert>
              )}

              <List sx={{ width: '100%' }}>
                {results.map((song) => (
                  <ListItem
                    key={song.id}
                    sx={{ mb: 1, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: 4 }}
                    secondaryAction={
                      <Button 
                        variant={cooldownRemaining > 0 ? "outlined" : "contained"}
                        disabled={cooldownRemaining > 0}
                        onClick={() => addToQueue(song)}
                        sx={{ minWidth: 48, borderRadius: 3 }}
                      >
                        <Plus size={20} />
                      </Button>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar variant="rounded" src={song.coverArtUrl} sx={{ width: 50, height: 50 }}>
                        <Music2 size={24} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={song.title}
                      secondary={song.artist}
                      slotProps={{
                        primary: { sx: { fontWeight: '600' }, noWrap: true },
                        secondary: { noWrap: true }
                      }}
                      sx={{ pr: 2 }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, px: 1 }}>Current Queue</Typography>
              <List>
                {queue.length === 0 ? (
                  <Typography sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>Queue is empty</Typography>
                ) : (
                  queue.map((item, index) => (
                    <ListItem
                      key={item.queueId}
                      sx={{ mb: 1, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: 4 }}
                    >
                      <ListItemAvatar>
                        <Avatar variant="rounded" src={item.song.coverArtUrl} sx={{ width: 50, height: 50 }}>
                          <Music2 size={24} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.song.title}
                        secondary={item.song.artist}
                        slotProps={{
                          primary: { sx: { fontWeight: '600' }, noWrap: true },
                          secondary: { noWrap: true }
                        }}
                      />
                      <Typography variant="caption" sx={{ opacity: 0.5 }}>#{index + 1}</Typography>
                    </ListItem>
                  ))
                )}
              </List>
            </Box>
          )}
        </Container>
      </Box>

      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }} elevation={3}>
        <BottomNavigation
          showLabels
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
        >
          <BottomNavigationAction label="Search" icon={<SearchIcon size={24} />} />
          <BottomNavigationAction label="Queue" icon={<ListMusic size={24} />} />
        </BottomNavigation>
      </Paper>

      <Snackbar open={!!message} autoHideDuration={3000} onClose={() => setMessage(null)}>
        {message ? <Alert severity={message.type} variant="filled">{message.text}</Alert> : undefined}
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
