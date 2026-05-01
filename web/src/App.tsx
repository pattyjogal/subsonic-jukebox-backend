import { useState, useEffect, useRef } from 'react';
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
  CssBaseline,
  BottomNavigation,
  BottomNavigationAction,
  Button,
  Chip
} from '@mui/material';
import { Search as SearchIcon, ListMusic, Plus, Music2, Clock, ThumbsUp } from 'lucide-react';
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
  upvotes: number;
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

const COOLDOWN_MS = 5000;

function App() {
  const [tab, setTab] = useState(0); 
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const cooldownTimer = useRef<number | null>(null);
  const [votedItems, setVotedItems] = useState<string[]>([]);

  // 1. Unified Real-time Queue Listener (SSE)
  useEffect(() => {
    const eventSource = new EventSource('/queue/events');
    
    eventSource.addEventListener('queue-update', (event) => {
      try {
        const updatedQueue = JSON.parse(event.data);
        setQueue(updatedQueue);
      } catch (e) {
        console.error("Failed to parse queue update", e);
      }
    });

    eventSource.onerror = (err) => {
      console.error("SSE Connection failed", err);
      eventSource.close();
    };

    return () => eventSource.close();
  }, []);

  // 2. Cooldown and Local Storage Logic
  useEffect(() => {
    checkCooldown();
    const savedVotes = JSON.parse(localStorage.getItem('jukebox_votes') || '[]');
    setVotedItems(savedVotes);
    return () => { if (cooldownTimer.current) clearInterval(cooldownTimer.current); };
  }, []);

  const checkCooldown = () => {
    const lastAdded = parseInt(localStorage.getItem('jukebox_last_added') || '0');
    const diff = Date.now() - lastAdded;
    if (diff < COOLDOWN_MS) {
      setCooldownRemaining(Math.ceil((COOLDOWN_MS - diff) / 1000));
      if (!cooldownTimer.current) {
        cooldownTimer.current = window.setInterval(checkCooldown, 1000);
      }
    } else {
      setCooldownRemaining(0);
      if (cooldownTimer.current) { clearInterval(cooldownTimer.current); cooldownTimer.current = null; }
    }
  };

  // 3. Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length > 2) searchSongs();
      else setResults([]);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const searchSongs = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
      setResults(response.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const addToQueue = async (song: Song) => {
    if (cooldownRemaining > 0) return;
    try {
      await api.post('/queue/add', song);
      localStorage.setItem('jukebox_last_added', Date.now().toString());
      checkCooldown();
      setMessage({ text: `Added "${song.title}"`, type: 'success' });
    } catch (e) { setMessage({ text: 'Failed to add.', type: 'error' }); }
  };

  const upvote = async (queueId: string) => {
    if (votedItems.includes(queueId)) return;
    try {
      await api.post(`/queue/upvote/${queueId}`);
      const newVotes = [...votedItems, queueId];
      setVotedItems(newVotes);
      localStorage.setItem('jukebox_votes', JSON.stringify(newVotes));
      // No need to manually fetchQueue() because SSE will push the update!
    } catch (e) { console.error(e); }
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
                  Wait {cooldownRemaining}s to add another.
                </Alert>
              )}
              <List>
                {results.map((song) => (
                  <ListItem
                    key={song.id}
                    sx={{ mb: 1, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: 4 }}
                    secondaryAction={
                      <Button variant={cooldownRemaining > 0 ? "outlined" : "contained"} disabled={cooldownRemaining > 0} onClick={() => addToQueue(song)} sx={{ minWidth: 48, borderRadius: 3 }}>
                        <Plus size={20} />
                      </Button>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar variant="rounded" src={song.coverArtUrl} sx={{ width: 50, height: 50 }}><Music2 size={24} /></Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={song.title} secondary={song.artist} slotProps={{ primary: { sx: { fontWeight: '600' }, noWrap: true }, secondary: { noWrap: true } }} sx={{ pr: 2 }} />
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
                  queue.map((item) => (
                    <ListItem
                      key={item.queueId}
                      sx={{ mb: 1, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: 4 }}
                      secondaryAction={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {item.upvotes > 0 && <Chip label={item.upvotes} size="small" color="primary" variant="outlined" sx={{ fontWeight: 'bold' }} />}
                          <IconButton 
                            color={votedItems.includes(item.queueId) ? "primary" : "default"}
                            disabled={votedItems.includes(item.queueId)}
                            onClick={() => upvote(item.queueId)}
                          >
                            <ThumbsUp size={20} />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar variant="rounded" src={item.song.coverArtUrl} sx={{ width: 50, height: 50 }}><Music2 size={24} /></Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={item.song.title} secondary={item.song.artist} slotProps={{ primary: { sx: { fontWeight: '600' }, noWrap: true }, secondary: { noWrap: true } }} sx={{ pr: 2 }} />
                    </ListItem>
                  ))
                )}
              </List>
            </Box>
          )}
        </Container>
      </Box>
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }} elevation={3}>
        <BottomNavigation showLabels value={tab} onChange={(_, v) => setTab(v)}>
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
