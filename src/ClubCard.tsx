import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { ClubListing, openClubOnTerpLink } from "./Club";
import './ClubCard.css';

type ClubCardProps = {
  club: ClubListing;
  showActions?: boolean;
};

export const ClubCard: React.FC<ClubCardProps> = ({ club, showActions }) => {
    const theme = useTheme();
  return (
    <Card key={"card-" + club.key}>
      <CardContent>
        <Stack spacing={1.5}>
          <Box display={"flex"} justifyContent="space-between" alignItems="center">
            <Stack spacing={0.5}>
                <Typography variant="h5" fontWeight={"bold"}>
                    {club.name}
                </Typography>
                <Typography>{club.totalMembers} members</Typography>
            </Stack>
            {club.icon ? (
                <Box
                height={60}
                display="flex"
                alignItems="start"
                className="club-icon"
                >
                <img src={club.icon} style={{backgroundColor: theme.palette.primary.main}} />
                </Box>
            ) : null}
          </Box>
          <Divider />
          <Typography>{club.summary}</Typography>
          <Box display="flex" flexWrap={"wrap"}>
            {club.categories.map((cat) => (
              <Chip
                key={club.key + "-" + cat}
                label={cat}
                sx={{ marginBottom: 0.5, marginRight: 0.5 }}
              />
            ))}
          </Box>
        </Stack>
      </CardContent>
      {showActions ?? true ? (
        <CardActions>
          <Button size="small" onClick={() => openClubOnTerpLink(club)}>
            View on TerpLink
          </Button>
        </CardActions>
      ) : null}
    </Card>
  );
};
