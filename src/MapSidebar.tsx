import {
  Card,
  Box,
  TextField,
  Stack,
  CardContent,
  Divider,
  Typography,
  useTheme,
  MenuItem,
  Select,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import "./MapSidebar.css";
import { ClubCard } from "./ClubCard";
import { ClubListing } from "./Club";

type MapSidebarProps = {
  clubs: ClubListing[];
};

type ClubSortMethod = "name" | "members"

/**
 * The map sidebar shows a list of all the clubs within the map and allows you
 * to search through them.
 */
export const MapSidebar: React.FC<MapSidebarProps> = ({ clubs }) => {
  const [clubFilter, setClubFilter] = useState<string>("");
  const [clubSortMethod, setClubSortMethod] = useState<ClubSortMethod>("name");
  const theme = useTheme();

  const clubCards = useMemo(() => {
    return clubs.map((c) => ({ club: c, card: <ClubCard club={c} /> }));
  }, [clubs]);

  const processedClubCards = useMemo(() => {
    let clubFilterLowerCase = clubFilter.toLowerCase();
    return clubCards
      .filter(({ club }) => club.name.toLowerCase().includes(clubFilterLowerCase))
      .sort((ca, cb) => {
        let a = ca.club;
        let b = cb.club;
        switch (clubSortMethod) {
            case "name":
                return a.name.localeCompare(b.name)

            case "members":
                return b.totalMembers - a.totalMembers;
        }
      })
      .map(({ card }) => card);
  }, [clubs, clubFilter, clubSortMethod])

  return (
    <Box id="map-sidebar" sx={{ backgroundColor: theme.palette.primary.main }}>
      <Stack spacing={2}>
        <Typography variant="h3" fontWeight={"bold"}>
          TerpMap
        </Typography>
        <Stack direction={"row"}>
            <TextField
            sx={{flex: 3}}
            variant="outlined"
            value={clubFilter}
            color="secondary"
            onChange={(e) => setClubFilter(e.target.value)}
            label="Search for a Club..."
            />

            <Select
                value={clubSortMethod}
                onChange={e => setClubSortMethod(e.target.value as ClubSortMethod)}
            >
                <MenuItem value={"name"}>Name</MenuItem>
                <MenuItem value={"members"}>Members</MenuItem>
            </Select>
        </Stack>
      </Stack>
      <Box className="club-list">
          <Stack spacing={1}>{processedClubCards}</Stack>
        </Box>
    </Box>
  );
};
